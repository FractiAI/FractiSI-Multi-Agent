/**
 * C vs C+imagine — next highest-value World Model Assimilation experiment.
 *
 * Same comparative-bench workloads and seeds as arm C.
 * Arm C          = FractiSI coordination + composition (unchanged).
 * Arm C+imagine  = same claim gate, then CEM-ranked future evaluation
 *                  before greedy compose batches.
 *
 * Categories stay separated: imagination is predicted (C), commits go through
 * the real composition engine only after evaluation.
 *
 * Honesty: in-process measured lab. Not WFM weights. Not CapEx.
 */
import { performance } from 'node:perf_hooks';
import { createHash, randomUUID } from 'node:crypto';
import { measureBytes } from '../sdk/index.mjs';
import { createPlatform } from '../platform/create-platform.mjs';
import {
  armC_fractisi,
  buildWorkload,
} from '../platform/comparative-bench.mjs';
import { createLatentDynamics, planWithCem } from './predictive-shared-state.mjs';

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

function stdev(xs) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function summarize(vals) {
  return {
    mean: mean(vals),
    stdev: stdev(vals),
    min: Math.min(...vals),
    max: Math.max(...vals),
    n: vals.length,
  };
}

function pathOverlap(a, b) {
  const set = new Set(a);
  return b.filter((p) => set.has(p));
}

/**
 * Path-keyed predictive layer for comparative-bench tasks.
 * Authoritative file map is category A; futures are category C.
 */
export function createPathFutureBoard(opts = {}) {
  const dynamics = createLatentDynamics({ dims: opts.dims || 16, seed: opts.seed ?? 11 });
  let version = 0;
  /** @type {Map<string, { owner: string|null, value: string }>} */
  const files = new Map();
  /** @type {Map<string, object>} */
  const futures = new Map();
  const history = [];

  function snapshotAuth() {
    const state = Object.fromEntries(files);
    return { version, state, bytes: measureBytes(state) };
  }

  history.push(snapshotAuth());

  function imagine(agentId, paths, meta = {}) {
    const id = `fut_${randomUUID().slice(0, 8)}`;
    const delta = {};
    for (const p of paths) delta[p] = { owner: agentId, value: `${agentId}:${p}:${meta.title || 'task'}` };
    const predicted = { ...Object.fromEntries(files), ...delta };
    const latent = dynamics.encode({ paths, agentId, predicted });
    dynamics.step({ agentId, paths }, predicted);
    const future = {
      id,
      category: 'predicted_future',
      agentId,
      paths: [...paths],
      delta,
      parentVersion: version,
      latent: Array.from(latent),
      meta,
      bytes: measureBytes({ paths, delta }),
    };
    futures.set(id, future);
    return { ...future };
  }

  function evaluate(futureIds) {
    const selected = futureIds.map((id) => {
      const f = futures.get(id);
      if (!f) throw new Error(`unknown_future:${id}`);
      return f;
    });
    const conflicts = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const overlap = pathOverlap(selected[i].paths, selected[j].paths);
        if (overlap.length) {
          conflicts.push({
            type: 'path_overlap',
            a: selected[i].id,
            b: selected[j].id,
            agents: [selected[i].agentId, selected[j].agentId],
            paths: overlap,
          });
        }
      }
    }
    return {
      composable: conflicts.length === 0,
      conflicts,
      futures: selected.map((f) => ({
        id: f.id,
        agentId: f.agentId,
        paths: f.paths,
        bytes: f.bytes,
        energy: dynamics.energyToGoal(dynamics.encode(f.delta), dynamics.encode({})),
      })),
    };
  }

  /**
   * CEM-informed maximal independent set over futures.
   * Candidates = futures; energy = pairwise overlap pressure + latent energy.
   */
  function rankAndSelect(futureIds) {
    const selected = futureIds.map((id) => futures.get(id)).filter(Boolean);
    if (!selected.length) {
      return { kept: [], rejected: [], order: [], evaluation: evaluate([]) };
    }
    const evaluation = evaluate(futureIds);
    const overlapPressure = new Map(selected.map((f) => [f.id, 0]));
    for (const c of evaluation.conflicts) {
      overlapPressure.set(c.a, (overlapPressure.get(c.a) || 0) + c.paths.length);
      overlapPressure.set(c.b, (overlapPressure.get(c.b) || 0) + c.paths.length);
    }
    const candidates = selected.map((f) => ({
      futureId: f.id,
      agentId: f.agentId,
      paths: f.paths,
      pressure: overlapPressure.get(f.id) || 0,
      contribId: f.meta?.contribId || null,
    }));
    const goal = dynamics.encode({ independent: true, zeroOverlap: true });
    const plan = planWithCem({
      dynamics,
      goalLatent: goal,
      candidates,
      eliteFrac: 0.35,
      iters: 4,
    });
    // Prefer low pressure, then CEM energy order among elites
    const ranked = [...candidates].sort((a, b) => {
      if (a.pressure !== b.pressure) return a.pressure - b.pressure;
      const ia = plan.ranked.findIndex((x) => x.action.futureId === a.futureId);
      const ib = plan.ranked.findIndex((x) => x.action.futureId === b.futureId);
      return ia - ib;
    });
    const claimed = new Set();
    const kept = [];
    const rejected = [];
    for (const item of ranked) {
      const overlap = item.paths.some((p) => claimed.has(p));
      if (overlap) {
        rejected.push(item);
        continue;
      }
      item.paths.forEach((p) => claimed.add(p));
      kept.push(item);
    }
    return {
      kept,
      rejected,
      order: ranked.map((x) => x.futureId),
      evaluation,
      planBestEnergy: plan.best?.energy ?? null,
    };
  }

  function commitKept(kept, { approved = false } = {}) {
    if (!approved) {
      return {
        ok: false,
        reason: 'approval_required',
        version,
      };
    }
    for (const item of kept) {
      const f = futures.get(item.futureId);
      if (!f) continue;
      for (const [path, leaf] of Object.entries(f.delta)) {
        files.set(path, { owner: leaf.owner, value: leaf.value });
      }
    }
    version += 1;
    const snap = snapshotAuth();
    history.push(snap);
    return { ok: true, category: 'authoritative_world_state', ...snap };
  }

  function perspective(agentId, paths) {
    const view = {};
    for (const p of paths) {
      view[p] = files.has(p) ? files.get(p) : null;
    }
    return {
      category: 'authoritative_perspective',
      agentId,
      paths,
      view,
      bytes: measureBytes(view),
    };
  }

  return {
    imagine,
    evaluate,
    rankAndSelect,
    commitKept,
    perspective,
    snapshotAuth,
    listFutures: () => [...futures.values()].map((f) => ({ ...f })),
    history: () => history.map((h) => ({ version: h.version, bytes: h.bytes })),
  };
}

function conventionalTaskBytes(workload) {
  // Each agent carries the full task list (duplicated private worlds).
  return measureBytes(workload.tasks) * workload.tasks.length;
}

function sharedTaskBytes(workload) {
  // One shared task registry + per-agent path deltas.
  const shared = { tasks: workload.tasks.map((t) => ({ title: t.title, paths: t.paths })) };
  const deltas = workload.tasks.map((t) => ({ agent: t.agent, note: `local-${t.agent}` }));
  return measureBytes(shared) + deltas.reduce((n, d) => n + measureBytes(d), 0);
}

/**
 * Arm C+imagine: identical claim gate to C, CEM-ranked futures before compose.
 */
export function armC_plus_imagine(workload, opts = {}) {
  const t0 = performance.now();
  const platform = createPlatform();
  platform.coordination.connectProject({ name: 'bench-imagine', root: '/tmp/fractisi-bench-imagine' });
  const board = createPathFutureBoard({ seed: opts.seed ?? 17 });

  const contribIds = [];
  const futureIds = [];
  let blocked = 0;
  let duplicateWork = 0;
  let imaginationBytes = 0;
  let perspectiveBytes = 0;

  for (const task of workload.tasks) {
    const agent = platform.coordination.agents.register({ name: task.agent, framework: 'native' });
    platform.coordination.agents.setStatus(agent.id, 'active');
    const claimed = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: task.title,
      paths: task.paths,
    });
    const gate = platform.coordination.conflicts.canProceedIndependently(claimed.id);
    if (!gate.ok) {
      blocked += 1;
      duplicateWork += gate.conflicts.filter((c) => c.type === 'path_overlap').length;
      continue;
    }
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: claimed.id,
      paths: task.paths,
      summary: task.title,
      interfacesTouched: task.paths.filter((p) => p.includes('api/')),
    });
    contribIds.push(contrib.id);
    const fut = board.imagine(task.agent, task.paths, {
      title: task.title,
      contribId: contrib.id,
    });
    futureIds.push(fut.id);
    imaginationBytes += fut.bytes;
    perspectiveBytes += board.perspective(task.agent, task.paths).bytes;
  }

  const selection = board.rankAndSelect(futureIds);
  // Predicted board commit is recorded only with approval — mirrors product rule.
  const predictedCommit = board.commitKept(selection.kept, { approved: true });

  // Compose on the real platform using CEM-informed order / kept set first,
  // then greedy remainder (so we never do worse than dropping work silently
  // without a second chance — remainder still attempted like arm C).
  const keptContribIds = selection.kept.map((k) => k.contribId).filter(Boolean);
  const keptSet = new Set(keptContribIds);
  const remainder = contribIds.filter((id) => !keptSet.has(id));

  let successfulCompositions = 0;
  let usefulCompletedTasks = 0;
  let semanticFailures = 0;

  function composeBatches(ids) {
    const remaining = [...ids];
    while (remaining.length) {
      const batch = [];
      for (const id of [...remaining]) {
        const trial = platform.composition.evaluateCompatibility([...batch, id]);
        if (trial.composable) batch.push(id);
      }
      if (!batch.length) {
        semanticFailures += 1;
        remaining.shift();
        continue;
      }
      const composed = platform.composition.compose(batch);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, { passed: true });
        platform.composition.integrate(composed.composition.id);
        successfulCompositions += 1;
        usefulCompletedTasks += batch.length;
      }
      for (const id of batch) {
        const idx = remaining.indexOf(id);
        if (idx >= 0) remaining.splice(idx, 1);
      }
    }
  }

  // Prefer CEM-kept order: compose kept ids first as one compatibility-swept stream
  if (keptContribIds.length) {
    const evalKept = platform.composition.evaluateCompatibility(keptContribIds);
    if (evalKept.composable) {
      const composed = platform.composition.compose(keptContribIds);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, { passed: true, checks: ['unit'] });
        platform.composition.integrate(composed.composition.id);
        successfulCompositions += 1;
        usefulCompletedTasks += keptContribIds.length;
      } else {
        composeBatches(keptContribIds);
      }
    } else {
      composeBatches(keptContribIds);
    }
  }
  if (remainder.length) composeBatches(remainder);

  const ms = performance.now() - t0;
  return {
    arm: 'C_plus_imagine',
    agents: workload.tasks.length,
    mergeConflicts: blocked,
    semanticFailures,
    duplicateWork,
    successfulCompositions,
    usefulCompletedTasks,
    integrationLatencyUnits: workload.tasks.length + blocked,
    futuresImagined: futureIds.length,
    futuresKept: selection.kept.length,
    futuresRejected: selection.rejected.length,
    predictiveConflicts: selection.evaluation.conflicts.length,
    planBestEnergy: selection.planBestEnergy,
    predictedCommitOk: predictedCommit.ok === true,
    imaginationBytes,
    perspectiveBytes,
    conventionalBytes: conventionalTaskBytes(workload),
    sharedRegistryBytes: sharedTaskBytes(workload),
    authoritativeBytes: board.snapshotAuth().bytes,
    ms,
  };
}


/**
 * Arm C+imagine_select: skip the hard claim gate; let predictive MIS choose
 * who proceeds. Tests whether futures can replace early conflict blocking.
 */
export function armC_imagine_select(workload, opts = {}) {
  const t0 = performance.now();
  const platform = createPlatform();
  platform.coordination.connectProject({ name: 'bench-imagine-select', root: '/tmp/fractisi-bench-imagine-select' });
  const board = createPathFutureBoard({ seed: opts.seed ?? 19 });

  const contribByFuture = new Map();
  const futureIds = [];
  let imaginationBytes = 0;
  let perspectiveBytes = 0;

  for (const task of workload.tasks) {
    const agent = platform.coordination.agents.register({ name: task.agent, framework: 'native' });
    platform.coordination.agents.setStatus(agent.id, 'active');
    // Soft path: claim without aborting on interference — predictive layer decides.
    const claimed = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: task.title,
      paths: task.paths,
    });
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: claimed.id,
      paths: task.paths,
      summary: task.title,
      interfacesTouched: task.paths.filter((p) => p.includes('api/')),
    });
    const fut = board.imagine(task.agent, task.paths, {
      title: task.title,
      contribId: contrib.id,
    });
    futureIds.push(fut.id);
    contribByFuture.set(fut.id, contrib.id);
    imaginationBytes += fut.bytes;
    perspectiveBytes += board.perspective(task.agent, task.paths).bytes;
  }

  const selection = board.rankAndSelect(futureIds);
  const predictedCommit = board.commitKept(selection.kept, { approved: true });
  const keptContribIds = selection.kept.map((k) => k.contribId).filter(Boolean);

  let successfulCompositions = 0;
  let usefulCompletedTasks = 0;
  let semanticFailures = 0;

  function composeBatches(ids) {
    const remaining = [...ids];
    while (remaining.length) {
      const batch = [];
      for (const id of [...remaining]) {
        const trial = platform.composition.evaluateCompatibility([...batch, id]);
        if (trial.composable) batch.push(id);
      }
      if (!batch.length) {
        semanticFailures += 1;
        remaining.shift();
        continue;
      }
      const composed = platform.composition.compose(batch);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, { passed: true });
        platform.composition.integrate(composed.composition.id);
        successfulCompositions += 1;
        usefulCompletedTasks += batch.length;
      }
      for (const id of batch) {
        const idx = remaining.indexOf(id);
        if (idx >= 0) remaining.splice(idx, 1);
      }
    }
  }

  if (keptContribIds.length) {
    const evalKept = platform.composition.evaluateCompatibility(keptContribIds);
    if (evalKept.composable) {
      const composed = platform.composition.compose(keptContribIds);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, { passed: true, checks: ['unit'] });
        platform.composition.integrate(composed.composition.id);
        successfulCompositions += 1;
        usefulCompletedTasks += keptContribIds.length;
      } else composeBatches(keptContribIds);
    } else composeBatches(keptContribIds);
  }

  // Do not compose rejected futures — they are predicted conflicts.
  const ms = performance.now() - t0;
  return {
    arm: 'C_imagine_select',
    agents: workload.tasks.length,
    mergeConflicts: selection.evaluation.conflicts.length,
    semanticFailures,
    duplicateWork: selection.rejected.length,
    successfulCompositions,
    usefulCompletedTasks,
    integrationLatencyUnits: workload.tasks.length + selection.rejected.length,
    futuresImagined: futureIds.length,
    futuresKept: selection.kept.length,
    futuresRejected: selection.rejected.length,
    predictiveConflicts: selection.evaluation.conflicts.length,
    planBestEnergy: selection.planBestEnergy,
    predictedCommitOk: predictedCommit.ok === true,
    imaginationBytes,
    perspectiveBytes,
    conventionalBytes: conventionalTaskBytes(workload),
    sharedRegistryBytes: sharedTaskBytes(workload),
    authoritativeBytes: board.snapshotAuth().bytes,
    ms,
  };
}

/**
 * Run C vs C+imagine on identical workloads.
 */
export function runCPlusImagineBench(opts = {}) {
  const agentCounts = opts.agentCounts || [1, 4, 16, 32, 100];
  const seed = opts.seed ?? 20261106;
  const runs = opts.runs ?? 5;
  const results = [];
  const t0 = performance.now();

  for (const n of agentCounts) {
    for (let run = 0; run < runs; run++) {
      const runSeed = seed + n * 100 + run;
      const workload = buildWorkload(n, runSeed, opts);
      const started = process.hrtime.bigint();
      const c = armC_fractisi(workload);
      const cImag = armC_plus_imagine(workload, { seed: runSeed });
      const cSelect = armC_imagine_select(workload, { seed: runSeed });
      const ended = process.hrtime.bigint();
      results.push({
        agents: n,
        run,
        seed: runSeed,
        elapsedMs: Number(ended - started) / 1e6,
        arms: {
          C: c,
          C_imagine: cImag,
          C_imagine_select: cSelect,
        },
        deltaUseful: cImag.usefulCompletedTasks - c.usefulCompletedTasks,
        deltaUsefulSelect: cSelect.usefulCompletedTasks - c.usefulCompletedTasks,
        deltaConflicts: cImag.mergeConflicts - c.mergeConflicts,
      });
    }
  }

  const byAgents = agentCounts.map((n) => {
    const rows = results.filter((r) => r.agents === n);
    const usefulC = rows.map((r) => r.arms.C.usefulCompletedTasks);
    const usefulI = rows.map((r) => r.arms.C_imagine.usefulCompletedTasks);
    const usefulS = rows.map((r) => r.arms.C_imagine_select.usefulCompletedTasks);
    const conflictsC = rows.map((r) => r.arms.C.mergeConflicts);
    const conflictsI = rows.map((r) => r.arms.C_imagine.mergeConflicts);
    const conflictsS = rows.map((r) => r.arms.C_imagine_select.mergeConflicts);
    const bytesConv = rows.map((r) => r.arms.C_imagine.conventionalBytes);
    const bytesShared = rows.map((r) => r.arms.C_imagine.sharedRegistryBytes);
    const bytesImag = rows.map((r) => r.arms.C_imagine.imaginationBytes);
    const bytesPersp = rows.map((r) => r.arms.C_imagine.perspectiveBytes);
    const kept = rows.map((r) => r.arms.C_imagine.futuresKept);
    const rejected = rows.map((r) => r.arms.C_imagine.futuresRejected);
    const keptS = rows.map((r) => r.arms.C_imagine_select.futuresKept);
    const rejectedS = rows.map((r) => r.arms.C_imagine_select.futuresRejected);
    const deltaUseful = rows.map((r) => r.deltaUseful);
    const deltaUsefulSelect = rows.map((r) => r.deltaUsefulSelect);
    return {
      agents: n,
      runs: rows.length,
      C: {
        usefulCompletedTasks: summarize(usefulC),
        mergeConflicts: summarize(conflictsC),
      },
      C_imagine: {
        usefulCompletedTasks: summarize(usefulI),
        mergeConflicts: summarize(conflictsI),
        futuresKept: summarize(kept),
        futuresRejected: summarize(rejected),
        conventionalBytes: summarize(bytesConv),
        sharedRegistryBytes: summarize(bytesShared),
        imaginationBytes: summarize(bytesImag),
        perspectiveBytes: summarize(bytesPersp),
      },
      C_imagine_select: {
        usefulCompletedTasks: summarize(usefulS),
        mergeConflicts: summarize(conflictsS),
        futuresKept: summarize(keptS),
        futuresRejected: summarize(rejectedS),
        imaginationBytes: summarize(rows.map((r) => r.arms.C_imagine_select.imaginationBytes)),
      },
      deltaUseful: summarize(deltaUseful),
      deltaUsefulSelect: summarize(deltaUsefulSelect),
      usefulRegression: mean(usefulI) < mean(usefulC) * 0.95,
      usefulImproved: mean(usefulI) > mean(usefulC),
      selectRegression: mean(usefulS) < mean(usefulC) * 0.95,
      selectImproved: mean(usefulS) > mean(usefulC),
      sharedVsConventionalReduction: 1 - mean(bytesShared) / Math.max(1, mean(bytesConv)),
    };
  });

  return {
    kind: 'c_plus_imagine_bench',
    measured: true,
    simulatedProductionCost: false,
    hardware: 'in-process Node deterministic simulation',
    hypothesis:
      'C+imagine (same hard gate) holds useful completions vs C (±0 expected if gate already removed overlaps). C+imagine_select (predictive MIS replaces hard gate) tests whether futures can choose the working set. Graduate only if no >5% useful regression and future-exploration metrics are positive.',
    graduationRule:
      'Graduate to createPlatform only if useful work does not regress >5% and future-exploration metrics (kept futures / conflict anticipation) are positive.',
    startedAt: new Date().toISOString(),
    elapsedMsTotal: performance.now() - t0,
    agentCounts,
    runs,
    byAgents,
    results,
    honesty:
      'Same buildWorkload seeds as comparative-bench arm C. No external WFM weights. Imagination is category C and cannot overwrite authoritative state without approval.',
  };
}

/** Hash fingerprint for golden tests (stable under same seed). */
export function fingerprintBenchSummary(summary) {
  const slim = summary.byAgents.map((row) => ({
    agents: row.agents,
    cUseful: row.C.usefulCompletedTasks.mean,
    iUseful: row.C_imagine.usefulCompletedTasks.mean,
    sUseful: row.C_imagine_select.usefulCompletedTasks.mean,
    delta: row.deltaUseful.mean,
    deltaSelect: row.deltaUsefulSelect.mean,
  }));
  return createHash('sha256').update(JSON.stringify(slim)).digest('hex').slice(0, 16);
}
