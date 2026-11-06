/**
 * Comparative multi-agent coordination benchmark (deterministic, in-process).
 * Arms:
 *   A — conventional branch/worktree simulation (isolated path sets, merge at end)
 *   B — Tiny Footprint shared world only (deltas; no coordination)
 *   C — FractiSI coordination + composition
 *
 * Reports measured counters from the simulation — not projected production figures.
 */
import { createPlatform } from './create-platform.mjs';

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWorkload(agentCount, seed, opts = {}) {
  const rand = mulberry32(seed);
  const sharedFiles = Array.from({ length: opts.sharedFiles || 20 }, (_, i) => `src/shared/module_${i}.mjs`);
  const tasks = [];
  for (let a = 0; a < agentCount; a++) {
    const independent = rand() > (opts.interdependFraction ?? 0.35);
    const paths = independent
      ? [`src/agents/agent_${a}/feature.mjs`, `src/agents/agent_${a}/test.mjs`]
      : [sharedFiles[Math.floor(rand() * sharedFiles.length)], `src/agents/agent_${a}/hook.mjs`];
    if (!independent && rand() > 0.5) paths.push('src/api/router.mjs');
    tasks.push({
      agent: `A${a}`,
      title: `task_${a}`,
      paths,
      independent,
    });
  }
  return { sharedFiles, tasks };
}

function armA_conventional(workload) {
  const branches = new Map();
  let mergeConflicts = 0;
  let duplicateWork = 0;
  let useful = 0;
  const claimed = new Map();
  for (const task of workload.tasks) {
    branches.set(task.agent, new Set(task.paths));
    for (const p of task.paths) {
      if (!claimed.has(p)) claimed.set(p, task.agent);
      else if (claimed.get(p) !== task.agent) {
        mergeConflicts += 1;
        duplicateWork += 1;
      }
    }
  }
  // merge simulation: any path claimed by >1 agent is a conflict
  const owners = new Map();
  for (const [, paths] of branches) {
    for (const p of paths) owners.set(p, (owners.get(p) || 0) + 1);
  }
  mergeConflicts = [...owners.values()].filter((n) => n > 1).length;
  useful = workload.tasks.filter((t) => t.paths.every((p) => owners.get(p) === 1)).length;
  return {
    arm: 'A_conventional_branches',
    agents: workload.tasks.length,
    mergeConflicts,
    semanticFailures: mergeConflicts,
    duplicateWork,
    successfulCompositions: useful,
    usefulCompletedTasks: useful,
    integrationLatencyUnits: workload.tasks.length + mergeConflicts * 2,
  };
}

function armB_tinyFootprintOnly(workload) {
  // Shared world once + per-agent path deltas (Tiny Footprint memory model).
  // No coordination/composition gate — agents can write overlapping paths.
  const sharedWorld = { meta: 'shared', files: {} };
  const agentDeltas = new Map();
  let useful = 0;
  let duplicateWork = 0;
  const pathOwners = new Map();
  for (const task of workload.tasks) {
    const delta = {};
    for (const p of task.paths) {
      delta[p] = `${task.agent}:${p}`;
      sharedWorld.files[p] = sharedWorld.files[p] ?? null; // registered once
      if (pathOwners.has(p)) duplicateWork += 1;
      else pathOwners.set(p, task.agent);
    }
    agentDeltas.set(task.agent, delta);
    useful += 1; // local reconstruct succeeds; interference undetected
  }
  const conflicts = workload.tasks.filter((t) =>
    t.paths.some((p) => workload.tasks.some((o) => o.agent !== t.agent && o.paths.includes(p))),
  ).length;
  return {
    arm: 'B_tiny_footprint_only',
    agents: workload.tasks.length,
    sharedWorldFiles: Object.keys(sharedWorld.files).length,
    agentDeltaCount: agentDeltas.size,
    mergeConflicts: 0,
    semanticFailures: conflicts,
    duplicateWork,
    successfulCompositions: 0,
    usefulCompletedTasks: useful,
    integrationLatencyUnits: workload.tasks.length,
    note: 'Shared-world memory only — no composition/conflict gate',
  };
}

function armC_fractisi(workload) {
  const platform = createPlatform();
  platform.coordination.connectProject({ name: 'bench', root: '/tmp/fractisi-bench' });
  const contribIds = [];
  let blocked = 0;
  let duplicateWork = 0;
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
  }
  const evaluation = platform.composition.evaluateCompatibility(contribIds);
  let successfulCompositions = 0;
  let usefulCompletedTasks = 0;
  let semanticFailures = 0;
  if (evaluation.composable && contribIds.length) {
    const composed = platform.composition.compose(contribIds);
    if (composed.ok) {
      platform.composition.validate(composed.composition.id, { passed: true, checks: ['unit'] });
      platform.composition.integrate(composed.composition.id);
      successfulCompositions = 1;
      usefulCompletedTasks = contribIds.length;
    }
  } else {
    // compose maximal independent subsets greedily
    const remaining = [...contribIds];
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
  return {
    arm: 'C_fractisi_coordination',
    agents: workload.tasks.length,
    mergeConflicts: blocked,
    semanticFailures,
    duplicateWork,
    successfulCompositions,
    usefulCompletedTasks,
    integrationLatencyUnits: workload.tasks.length + blocked,
    composableBatch: evaluation.composable,
  };
}

export function runComparativeBench(opts = {}) {
  const agentCounts = opts.agentCounts || [5, 10, 25];
  const seed = opts.seed ?? 20261106;
  const runs = opts.runs ?? 3;
  const results = [];
  const t0 = Date.now();
  for (const n of agentCounts) {
    for (let run = 0; run < runs; run++) {
      const workload = buildWorkload(n, seed + n * 100 + run, opts);
      const started = process.hrtime.bigint();
      const a = armA_conventional(workload);
      const b = armB_tinyFootprintOnly(workload);
      const c = armC_fractisi(workload);
      const ended = process.hrtime.bigint();
      results.push({
        agents: n,
        run,
        seed: seed + n * 100 + run,
        elapsedMs: Number(ended - started) / 1e6,
        arms: { A: a, B: b, C: c },
      });
    }
  }
  return {
    kind: 'fractisi_comparative_bench',
    measured: true,
    simulatedProductionCost: false,
    hardware: 'in-process Node deterministic simulation',
    startedAt: new Date(t0).toISOString(),
    elapsedMsTotal: Date.now() - t0,
    agentCounts,
    runs,
    results,
  };
}
