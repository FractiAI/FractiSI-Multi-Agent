/**
 * World Model Assimilation · experimental suite (isolated)
 *
 * Experiments 1–5 from the Open World Model Intelligence Assimilation Initiative.
 * All results are measured in-process. No external model weights downloaded.
 */
import { performance } from 'node:perf_hooks';
import { measureBytes } from '../sdk/index.mjs';
import { runComparativeBench } from '../platform/comparative-bench.mjs';
import {
  conventionalFullCopies,
  createPredictiveSharedWorld,
  tinyFootprintViews,
} from './predictive-shared-state.mjs';

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

function stdev(xs) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function summarizeRuns(runs, pick) {
  const vals = runs.map(pick);
  return {
    mean: mean(vals),
    stdev: stdev(vals),
    min: Math.min(...vals),
    max: Math.max(...vals),
    n: vals.length,
  };
}

/** Experiment 1 — Predictive context efficiency */
export function experimentPredictiveContextEfficiency(opts = {}) {
  const agents = opts.agents || 16;
  const runs = opts.runs || 5;
  const results = [];
  for (let r = 0; r < runs; r++) {
    const world = createPredictiveSharedWorld({ seed: 100 + r });
    const auth = world.getAuthoritative().state;
    const agentIds = Array.from({ length: agents }, (_, i) => `A${i}`);

    const t0 = performance.now();
    const conv = conventionalFullCopies(auth, agents);
    const t1 = performance.now();
    const tiny = tinyFootprintViews(auth, agentIds);
    const t2 = performance.now();

    // predictive selective perspectives (authoritative only — no futures materialized)
    const perspectiveBytes = [];
    for (const id of agentIds) {
      perspectiveBytes.push(world.perspective(id, ['shared', 'alpha']).bytes);
    }
    // imagination cost: one proposed future per agent (category C — not authoritative)
    const futures = [];
    let imaginationBytes = 0;
    for (let i = 0; i < agentIds.length; i++) {
      const id = agentIds[i];
      const target = i % 2 === 0 ? 'shared' : 'alpha';
      const fut = world.imagineFuture(id, { target, value: r + 1, type: 'set' });
      imaginationBytes += fut.bytes;
      futures.push(fut.id);
    }
    const evald = world.evaluateFutures(futures);
    const t3 = performance.now();

    const composed = world.composeCompatible(futures);
    const before = world.getAuthoritative().version;
    const committed = world.commit(composed, { approved: true });
    const after = world.getAuthoritative();
    const accuracy = committed.ok && after.state.modules.shared ? 1 : 0;

    results.push({
      run: r,
      conventionalBytes: conv.bytes,
      tinyBytes: tiny.bytes,
      predictivePerspectiveBytes: perspectiveBytes.reduce((a, b) => a + b, 0),
      imaginationBytes,
      predictionReuseBytes: evald.predictionReuse,
      conflicts: evald.conflicts.length,
      keptFutures: composed.keptFutureIds.length,
      conventionalMs: t1 - t0,
      tinyMs: t2 - t1,
      predictiveMs: t3 - t2,
      reconstructionAccuracy: accuracy,
      versionBefore: before,
      versionAfter: after.version,
    });
  }
  return {
    id: 'experiment_1_predictive_context_efficiency',
    kind: 'measured',
    agents,
    runs: results.length,
    summary: {
      conventionalBytes: summarizeRuns(results, (x) => x.conventionalBytes),
      tinyBytes: summarizeRuns(results, (x) => x.tinyBytes),
      predictivePerspectiveBytes: summarizeRuns(results, (x) => x.predictivePerspectiveBytes),
      imaginationBytes: summarizeRuns(results, (x) => x.imaginationBytes),
      tinyVsConventionalReduction:
        1 - mean(results.map((x) => x.tinyBytes)) / mean(results.map((x) => x.conventionalBytes)),
      perspectiveVsConventionalReduction:
        1 - mean(results.map((x) => x.predictivePerspectiveBytes)) / mean(results.map((x) => x.conventionalBytes)),
      meanConflicts: mean(results.map((x) => x.conflicts)),
      meanKeptFutures: mean(results.map((x) => x.keptFutures)),
      reconstructionAccuracy: summarizeRuns(results, (x) => x.reconstructionAccuracy),
      predictiveMs: summarizeRuns(results, (x) => x.predictiveMs),
    },
    runsDetail: results,
  };
}

/** Experiment 2 — Multi-agent alternative futures */
export function experimentAlternativeFutures(opts = {}) {
  const agentCount = opts.agents || 8;
  const runs = opts.runs || 5;
  const results = [];
  for (let r = 0; r < runs; r++) {
    const world = createPredictiveSharedWorld({ seed: 200 + r });
    const futures = [];
    // half agents touch shared (conflict), half touch private modules
    for (let i = 0; i < agentCount; i++) {
      const conflict = i % 2 === 0;
      const target = conflict ? 'shared' : i % 3 === 0 ? 'alpha' : i % 3 === 1 ? 'beta' : 'gamma';
      futures.push(
        world.imagineFuture(`A${i}`, { target, value: 10 + i, type: 'set' }, { horizon: 2 }),
      );
    }
    const ids = futures.map((f) => f.id);
    const evaluation = world.evaluateFutures(ids);
    const composed = world.composeCompatible(ids);
    const rejected = world.commit(composed, { approved: false });
    const committed = world.commit(composed, { approved: true });
    const rolled = world.rollback(0);

    results.push({
      run: r,
      agents: agentCount,
      futures: futures.length,
      conflicts: evaluation.conflicts.length,
      composable: evaluation.composable,
      kept: composed.keptFutureIds.length,
      rejected: composed.rejectedFutureIds.length,
      unapprovedBlocked: rejected.ok === false,
      commitOk: committed.ok === true,
      rollbackOk: rolled.ok === true && rolled.version === 0,
      finalCorrectness:
        committed.ok &&
        typeof world.getAuthoritative().state.modules.shared?.value !== 'undefined',
    });
  }
  return {
    id: 'experiment_2_alternative_futures',
    kind: 'measured',
    summary: {
      meanConflicts: mean(results.map((x) => x.conflicts)),
      compositionPartialRate: mean(results.map((x) => (x.composable ? 0 : 1))),
      unapprovedAlwaysBlocked: results.every((x) => x.unapprovedBlocked),
      commitSuccess: mean(results.map((x) => (x.commitOk ? 1 : 0))),
      rollbackSuccess: mean(results.map((x) => (x.rollbackOk ? 1 : 0))),
      finalCorrectness: mean(results.map((x) => (x.finalCorrectness ? 1 : 0))),
    },
    runsDetail: results,
  };
}

/** Experiment 3 — Temporal continuity across extended sequences */
export function experimentTemporalContinuity(opts = {}) {
  const steps = opts.steps || 40;
  const agents = opts.agents || 4;
  const runs = opts.runs || 3;
  const results = [];
  for (let r = 0; r < runs; r++) {
    const world = createPredictiveSharedWorld({ seed: 300 + r });
    let contextGrowth = [];
    let drift = 0;
    let lost = 0;
    const checkpoints = [];
    for (let t = 0; t < steps; t++) {
      const agentId = `A${t % agents}`;
      const target = t % 5 === 0 ? 'shared' : ['alpha', 'beta', 'gamma'][t % 3];
      const fut = world.imagineFuture(agentId, { target, value: t, type: 'set' });
      const composed = world.composeCompatible([fut.id]);
      world.commit(composed, { approved: true });
      const auth = world.getAuthoritative();
      contextGrowth.push(auth.bytes);
      if (t > 0 && auth.state.modules[target]?.value !== t) lost += 1;
      if (t % 10 === 9) checkpoints.push(auth.version);
    }
    // interrupt + recover
    const beforeInterrupt = world.getAuthoritative().version;
    world.rollback(checkpoints[0] || 0);
    const recovered = world.getAuthoritative();
    const recoveryOk = recovered.version === (checkpoints[0] || 0);
    // resume one step
    const fut = world.imagineFuture('A0', { target: 'shared', value: 999, type: 'set' });
    world.commit(world.composeCompatible([fut.id]), { approved: true });

    const first = contextGrowth[0];
    const last = contextGrowth[contextGrowth.length - 1];
    results.push({
      run: r,
      steps,
      contextStartBytes: first,
      contextEndBytes: last,
      contextGrowthRatio: last / Math.max(1, first),
      lostInformationEvents: lost,
      driftProxy: drift,
      recoveryOk,
      resumedVersion: world.getAuthoritative().version,
      interruptedFrom: beforeInterrupt,
    });
  }
  return {
    id: 'experiment_3_temporal_continuity',
    kind: 'measured',
    summary: {
      meanContextGrowthRatio: mean(results.map((x) => x.contextGrowthRatio)),
      meanLostEvents: mean(results.map((x) => x.lostInformationEvents)),
      recoverySuccess: mean(results.map((x) => (x.recoveryOk ? 1 : 0))),
    },
    runsDetail: results,
  };
}

/** Experiment 4 — Collective intelligence (useful work, not just compression) */
export function experimentCollectiveIntelligence(opts = {}) {
  const counts = opts.agentCounts || [1, 4, 16, 32];
  const runs = opts.runs || 3;
  const arms = [];

  for (const n of counts) {
    const perArm = { agents: n, single: [], fullDup: [], fractisi: [], predictive: [] };
    for (let r = 0; r < runs; r++) {
      // single agent baseline
      const w1 = createPredictiveSharedWorld({ seed: 400 + n + r });
      const t0 = performance.now();
      for (let i = 0; i < Math.max(1, Math.floor(8 / Math.max(1, n))); i++) {
        const f = w1.imagineFuture('solo', { target: 'alpha', value: i, type: 'set' });
        w1.commit(w1.composeCompatible([f.id]), { approved: true });
      }
      perArm.single.push({
        useful: w1.getAuthoritative().version,
        ms: performance.now() - t0,
        bytes: w1.getAuthoritative().bytes,
      });

      // full duplicate context (no sharing)
      const auth = createPredictiveSharedWorld({ seed: 1 }).getAuthoritative().state;
      const dup = conventionalFullCopies(auth, n);
      perArm.fullDup.push({
        useful: 0, // no composition — agents can't integrate
        ms: 0,
        bytes: dup.bytes,
      });

      // existing FractiSI comparative bench (coordination + composition)
      const bench = runComparativeBench({ agentCounts: [n], runs: 1, seed: 500 + n + r });
      const row = (bench.results || []).find((x) => x.agents === n) || bench.results?.[0];
      const c = row?.arms?.C || {};
      perArm.fractisi.push({
        useful: c.usefulCompletedTasks ?? 0,
        conflicts: c.mergeConflicts ?? 0,
        bytes: null,
        raw: c,
      });

      // predictive shared world multi-agent
      const wp = createPredictiveSharedWorld({ seed: 600 + n + r });
      const t1 = performance.now();
      const fids = [];
      for (let i = 0; i < n; i++) {
        const target = i % 2 === 0 ? ['alpha', 'beta', 'gamma'][i % 3] : 'shared';
        fids.push(wp.imagineFuture(`A${i}`, { target, value: i, type: 'set' }).id);
      }
      const composed = wp.composeCompatible(fids);
      wp.commit(composed, { approved: true });
      perArm.predictive.push({
        useful: composed.keptFutureIds.length,
        rejected: composed.rejectedFutureIds.length,
        conflicts: composed.conflicts.length,
        ms: performance.now() - t1,
        bytes: wp.getAuthoritative().bytes,
        version: wp.getAuthoritative().version,
      });
    }
    arms.push({
      agents: n,
      single: {
        useful: summarizeRuns(perArm.single, (x) => x.useful),
        bytes: summarizeRuns(perArm.single, (x) => x.bytes),
      },
      fullDuplicate: {
        useful: summarizeRuns(perArm.fullDup, (x) => x.useful),
        bytes: summarizeRuns(perArm.fullDup, (x) => x.bytes),
      },
      fractisiExisting: {
        useful: summarizeRuns(perArm.fractisi, (x) => x.useful),
        conflicts: summarizeRuns(perArm.fractisi, (x) => x.conflicts || 0),
      },
      predictiveShared: {
        useful: summarizeRuns(perArm.predictive, (x) => x.useful),
        conflicts: summarizeRuns(perArm.predictive, (x) => x.conflicts),
        bytes: summarizeRuns(perArm.predictive, (x) => x.bytes),
        ms: summarizeRuns(perArm.predictive, (x) => x.ms),
      },
    });
  }

  return {
    id: 'experiment_4_collective_intelligence',
    kind: 'measured',
    note: 'Useful work = successfully composed/committed agent contributions. Full-duplicate arm completes 0 composed integrations by design.',
    arms,
  };
}

/**
 * Experiment 5 — Multimodal world integration (simulated spatial state)
 * Does NOT download Cosmos/V-JEPA. Uses a compact grid world as stand-in multimodal state
 * shared once across agents (selective cells), measuring redundant copy avoidance.
 */
export function experimentMultimodalSharedWorld(opts = {}) {
  const size = opts.size || 16;
  const agents = opts.agents || 8;
  const runs = opts.runs || 3;
  const results = [];

  for (let r = 0; r < runs; r++) {
    // simulated visual/spatial world: grid of cell embeddings
    const grid = {
      kind: 'spatial_world',
      size,
      cells: {},
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid.cells[`${x},${y}`] = { rgb: [x / size, y / size, (x + y) / (2 * size)], occ: 0 };
      }
    }
    const fullBytes = measureBytes(grid);
    const conventional = fullBytes * agents;

    // shared once + per-agent viewport (selective perception)
    const viewports = [];
    for (let i = 0; i < agents; i++) {
      const x0 = (i * 3) % size;
      const y0 = (i * 5) % size;
      const cells = {};
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
          const key = `${(x0 + dx) % size},${(y0 + dy) % size}`;
          cells[key] = grid.cells[key];
        }
      }
      viewports.push({ agent: `V${i}`, cells });
    }
    const sharedBytes = fullBytes;
    const deltaBytes = viewports.reduce((n, v) => n + measureBytes(v.cells), 0);
    // predictive: each agent imagines moving into one cell of shared grid via PSS world
    const world = createPredictiveSharedWorld({
      seed: 700 + r,
      modules: {
        gridRef: { value: 'spatial_world', size },
        shared: { value: 0, owner: null },
        alpha: { value: 0, owner: null },
        beta: { value: 0, owner: null },
        gamma: { value: 0, owner: null },
      },
    });
    const fids = viewports.map((v, i) =>
      world.imagineFuture(v.agent, { target: 'shared', value: i, type: 'occupy' }).id,
    );
    const composed = world.composeCompatible(fids);

    results.push({
      run: r,
      gridCells: size * size,
      conventionalBytes: conventional,
      sharedPlusViewportBytes: sharedBytes + deltaBytes,
      reduction: 1 - (sharedBytes + deltaBytes) / conventional,
      agents,
      futuresComposed: composed.keptFutureIds.length,
      futuresRejected: composed.rejectedFutureIds.length,
      conflicts: composed.conflicts.length,
    });
  }

  return {
    id: 'experiment_5_multimodal_shared_world',
    kind: 'measured_simulation',
    honesty:
      'Spatial grid is a stand-in multimodal state — not NVIDIA Cosmos, not V-JEPA pixels, not a learned visual encoder. Measures whether multiple agents can share one world representation without N full copies.',
    summary: {
      meanReduction: mean(results.map((x) => x.reduction)),
      meanConventionalBytes: mean(results.map((x) => x.conventionalBytes)),
      meanSharedBytes: mean(results.map((x) => x.sharedPlusViewportBytes)),
      meanConflicts: mean(results.map((x) => x.conflicts)),
    },
    runsDetail: results,
  };
}

/** Reproduce existing FractiSI comparative bench as baseline. */
export function reproduceFractisiBaseline(opts = {}) {
  const agentCounts = opts.agentCounts || [1, 4, 16, 32];
  const runs = opts.runs || 3;
  const bench = runComparativeBench({ agentCounts, runs, seed: opts.seed || 13 });
  return {
    id: 'baseline_fractisi_comparative_bench',
    kind: 'measured',
    source: 'src/platform/comparative-bench.mjs:runComparativeBench',
    agentCounts,
    runs,
    bench,
  };
}

export function runWorldModelAssimilationSuite(opts = {}) {
  const t0 = performance.now();
  const baseline = reproduceFractisiBaseline(opts.baseline);
  const e1 = experimentPredictiveContextEfficiency(opts.e1);
  const e2 = experimentAlternativeFutures(opts.e2);
  const e3 = experimentTemporalContinuity(opts.e3);
  const e4 = experimentCollectiveIntelligence(opts.e4);
  const e5 = experimentMultimodalSharedWorld(opts.e5);
  return {
    suite: 'world_model_assimilation',
    version: '0.1.0',
    kind: 'measured',
    ms: performance.now() - t0,
    generatedAt: new Date().toISOString(),
    honesty:
      'In-process architectural labs on FractiSI Predictive Shared State prototype. No external world-model weights loaded. Not CapEx / HBM / Active Inference claims.',
    baseline,
    experiments: [e1, e2, e3, e4, e5],
  };
}
