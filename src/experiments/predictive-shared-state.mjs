/**
 * FractiSI · Predictive Shared State (isolated research prototype)
 *
 * Rebuilds Dreamer-style imagination + V-JEPA-style goal-energy planning
 * over FractiSI Tiny Footprint shared worlds — without wrapping external WFMs.
 *
 * Three categories are never collapsed:
 *   A. Authoritative world state
 *   B. Agent-proposed changes
 *   C. Predicted / simulated futures
 *
 * Unapproved predictions cannot overwrite authoritative state.
 *
 * Honesty: in-process architectural lab. Not Cosmos/V-JEPA weights.
 * Not production HBM proof. Not Active Inference identity.
 */
import { createHash, randomUUID } from 'node:crypto';
import { measureBytes, registerTemplate, reconstruct, sessionDelta } from '../sdk/index.mjs';

const WORLD_TEMPLATE = 'pss_world_v1';
const RHYME_EVIDENCE = { nestDepth: 2, driftBefore: 0.12, expressions: 4 };

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashVec(obj, dims = 16) {
  const raw = createHash('sha256').update(JSON.stringify(obj)).digest();
  const out = new Float64Array(dims);
  for (let i = 0; i < dims; i++) out[i] = (raw[i] / 255) * 2 - 1;
  return out;
}

function addVec(a, b, scale = 1) {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + scale * b[i];
  return out;
}

function l1(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s;
}

function clone(x) {
  return structuredClone(x);
}

function moduleSlot(value = 0, owner = null) {
  return { value, owner };
}

function worldPattern(modules) {
  return {
    kind: 'shared_world',
    schema: WORLD_TEMPLATE,
    motion: 'repeat-mirror-recurse-correct',
    netZero: { kind: 'world', octave: 0, role: 'origin', equilibrium: true },
    organization: {
      kind: 'world',
      role: 'registry',
      octave: 1,
      organization: { kind: 'world', role: 'modules', octave: 2 },
    },
    modules: modules || {
      alpha: moduleSlot(1, null),
      beta: moduleSlot(1, null),
      gamma: moduleSlot(1, null),
      shared: moduleSlot(0, null),
    },
    meta: { version: 0, imaginedStep: 0, imaginedBy: null },
  };
}

let templateReady = false;
function ensureTemplate() {
  if (templateReady) return;
  try {
    registerTemplate(WORLD_TEMPLATE, worldPattern(), RHYME_EVIDENCE);
  } catch {
    try {
      registerTemplate(WORLD_TEMPLATE, worldPattern());
    } catch {
      /* already registered in this process */
    }
  }
  templateReady = true;
}

/**
 * Compact RSSM-lite over shared-world keys.
 * h_t = deterministic recurrent; z_t = seeded stochastic code from action.
 */
export function createLatentDynamics({ dims = 16, seed = 1 } = {}) {
  const rand = mulberry32(seed);
  let h = new Float64Array(dims);
  return {
    encode(state) {
      return hashVec(state, dims);
    },
    step(action, observation = null) {
      const a = hashVec(action, dims);
      const noise = new Float64Array(dims);
      for (let i = 0; i < dims; i++) noise[i] = (rand() * 2 - 1) * 0.05;
      h = addVec(h, a, 0.35);
      h = addVec(h, noise, 1);
      if (observation) h = addVec(h, hashVec(observation, dims), 0.15);
      return { h: Float64Array.from(h), z: a };
    },
    predict(action, horizon = 1) {
      const traj = [];
      const saved = Float64Array.from(h);
      let cur = Float64Array.from(h);
      for (let t = 0; t < horizon; t++) {
        const a = hashVec({ ...action, t }, dims);
        cur = addVec(cur, a, 0.35);
        traj.push(Float64Array.from(cur));
      }
      h = saved;
      return traj;
    },
    energyToGoal(latent, goal) {
      return l1(latent, goal);
    },
    reset() {
      h = new Float64Array(dims);
    },
    snapshot() {
      return Float64Array.from(h);
    },
    restore(snap) {
      h = Float64Array.from(snap);
    },
  };
}

/**
 * CEM over discrete action candidates toward a goal latent (V-JEPA 2-AC rhyme).
 */
export function planWithCem({ dynamics, goalLatent, candidates, eliteFrac = 0.3, iters = 3 }) {
  let pool = candidates.map((action) => ({ action, energy: Infinity }));
  for (let i = 0; i < iters; i++) {
    for (const item of pool) {
      const traj = dynamics.predict(item.action, 1);
      item.energy = dynamics.energyToGoal(traj[traj.length - 1], goalLatent);
    }
    pool.sort((a, b) => a.energy - b.energy);
    const eliteN = Math.max(1, Math.floor(pool.length * eliteFrac));
    const elites = pool.slice(0, eliteN);
    // mutate non-elites toward elite actions (discrete: replace with elite + tag)
    pool = [
      ...elites,
      ...pool.slice(eliteN).map((item, idx) => ({
        action: { ...elites[idx % elites.length].action, mutate: idx },
        energy: Infinity,
      })),
    ];
  }
  pool.sort((a, b) => a.energy - b.energy);
  return { best: pool[0], ranked: pool };
}

/**
 * Predictive Shared World — Tiny Gateway Predictive Shared State prototype.
 */
export function createPredictiveSharedWorld(opts = {}) {
  ensureTemplate();
  const seed = opts.seed ?? 7;
  const dynamics = createLatentDynamics({ dims: opts.dims || 16, seed });
  const incoming = opts.modules
    ? Object.fromEntries(
        Object.entries(opts.modules).map(([k, v]) => [
          k,
          moduleSlot(v?.value ?? v ?? 0, v?.owner ?? null),
        ]),
      )
    : null;
  // Keep exact module key set so every expression rhymes with the template.
  const modules = {
    alpha: moduleSlot(incoming?.alpha?.value ?? 1, incoming?.alpha?.owner ?? null),
    beta: moduleSlot(incoming?.beta?.value ?? 1, incoming?.beta?.owner ?? null),
    gamma: moduleSlot(incoming?.gamma?.value ?? 1, incoming?.gamma?.owner ?? null),
    shared: moduleSlot(incoming?.shared?.value ?? 0, incoming?.shared?.owner ?? null),
  };
  const base = worldPattern(modules);

  /** @type {{ version: number, state: object, committedAt: string }[]} */
  const history = [];
  let authoritative = {
    version: 0,
    state: clone(base),
    committedAt: new Date().toISOString(),
  };
  history.push(clone(authoritative));

  /** @type {Map<string, object>} */
  const agentDeltas = new Map();
  /** @type {Map<string, object>} */
  const proposals = new Map();
  /** @type {Map<string, object>} */
  const futures = new Map();

  function asExpression(state, version) {
    const modules = {
      alpha: moduleSlot(state.modules.alpha?.value ?? 0, state.modules.alpha?.owner ?? null),
      beta: moduleSlot(state.modules.beta?.value ?? 0, state.modules.beta?.owner ?? null),
      gamma: moduleSlot(state.modules.gamma?.value ?? 0, state.modules.gamma?.owner ?? null),
      shared: moduleSlot(state.modules.shared?.value ?? 0, state.modules.shared?.owner ?? null),
    };
    const expression = worldPattern(modules);
    expression.meta = {
      version: version ?? state.meta?.version ?? 0,
      imaginedStep: state.meta?.imaginedStep ?? 0,
      imaginedBy: state.meta?.imaginedBy ?? null,
    };
    return expression;
  }

  function encodeAuthoritative() {
    return sessionDelta(WORLD_TEMPLATE, asExpression(authoritative.state, authoritative.version));
  }

  function perspective(agentId, paths = null) {
    const encoded = encodeAuthoritative();
    const full = reconstruct(WORLD_TEMPLATE, encoded.delta);
    const value = full.value;
    const local = agentDeltas.get(agentId) || {};
    const modules = {};
    const keys = paths || Object.keys(value.modules || {});
    for (const k of keys) {
      modules[k] = local[k] !== undefined ? local[k] : value.modules?.[k];
    }
    return {
      category: 'authoritative_perspective',
      agentId,
      version: authoritative.version,
      modules,
      bytes: measureBytes({ modules, version: authoritative.version }),
      fullBytes: measureBytes(value),
    };
  }

  function proposeChange(agentId, action = {}) {
    const id = `prop_${randomUUID().slice(0, 8)}`;
    const target = String(action.target || action.path || 'shared');
    const nextVal = action.value !== undefined ? action.value : (action.delta ?? 1);
    const delta = {
      [target]: {
        value: nextVal,
        owner: agentId,
        action: action.type || 'set',
      },
    };
    const proposal = {
      id,
      category: 'agent_proposed_change',
      agentId,
      action: { ...action, target },
      delta,
      paths: [target],
      createdAt: new Date().toISOString(),
    };
    proposals.set(id, proposal);
    agentDeltas.set(agentId, { ...(agentDeltas.get(agentId) || {}), ...delta });
    return clone(proposal);
  }

  function applyDeltaToState(state, delta) {
    const next = asExpression(state, state.meta?.version ?? 0);
    for (const [k, v] of Object.entries(delta)) {
      if (!(k in next.modules)) continue; // unknown keys would break rhyme shape
      next.modules[k] = moduleSlot(
        v.value !== undefined ? v.value : next.modules[k].value,
        v.owner !== undefined ? v.owner : next.modules[k].owner,
      );
    }
    return next;
  }

  function imagineFuture(agentId, actionOrProposal, optsIn = {}) {
    const horizon = optsIn.horizon || 1;
    const proposal =
      typeof actionOrProposal === 'string'
        ? proposals.get(actionOrProposal)
        : actionOrProposal?.delta
          ? actionOrProposal
          : proposeChange(agentId, actionOrProposal);

    const snap = dynamics.snapshot();
    const baseState = clone(authoritative.state);
    const predictedStates = [];
    let cursor = baseState;
    for (let t = 0; t < horizon; t++) {
      dynamics.step(proposal.action || proposal, cursor);
      cursor = applyDeltaToState(cursor, proposal.delta);
      // light temporal drift marker (does not touch authoritative)
      cursor.meta = {
        version: cursor.meta?.version ?? 0,
        imaginedStep: t + 1,
        imaginedBy: agentId,
      };
      predictedStates.push(clone(cursor));
    }
    dynamics.restore(snap);

    const id = `fut_${randomUUID().slice(0, 8)}`;
    const future = {
      id,
      category: 'predicted_future',
      agentId,
      proposalId: proposal.id,
      parentVersion: authoritative.version,
      horizon,
      predictedStates,
      finalState: predictedStates[predictedStates.length - 1],
      latent: Array.from(dynamics.encode(predictedStates[predictedStates.length - 1])),
      bytes: measureBytes(predictedStates),
      createdAt: new Date().toISOString(),
    };
    futures.set(id, future);
    return clone(future);
  }

  function pathOwners(futureList) {
    const owners = new Map();
    for (const item of futureList) {
      const proposal = proposals.get(item.proposalId);
      const paths = proposal?.paths || Object.keys(proposal?.delta || {});
      for (const path of paths) {
        if (!owners.has(path)) owners.set(path, new Set());
        owners.get(path).add(item.agentId);
      }
    }
    return owners;
  }

  function evaluateFutures(futureIds) {
    const selected = futureIds.map((id) => {
      const f = futures.get(id);
      if (!f) throw new Error(`unknown_future:${id}`);
      return f;
    });
    const owners = pathOwners(selected);
    const conflicts = [];
    for (const [path, set] of owners) {
      if (set.size > 1) {
        conflicts.push({ path, agents: [...set], type: 'path_overlap' });
      }
    }
    const goal = dynamics.encode(authoritative.state);
    const scored = selected.map((f) => ({
      id: f.id,
      agentId: f.agentId,
      energy: dynamics.energyToGoal(dynamics.encode(f.finalState), goal),
      bytes: f.bytes,
      paths: Object.keys(f.finalState.modules || {}),
    }));
    scored.sort((a, b) => a.energy - b.energy);
    return {
      futures: scored,
      conflicts,
      composable: conflicts.length === 0,
      predictionReuse: selected.length > 1 ? measureBytes(selected.map((f) => f.latent)) : 0,
    };
  }

  function composeCompatible(futureIds) {
    const evaluation = evaluateFutures(futureIds);
    const selected = futureIds.map((id) => futures.get(id));
    if (!evaluation.composable) {
      // keep non-overlapping subset (first writer wins by energy order)
      const claimed = new Set();
      const kept = [];
      for (const s of evaluation.futures) {
        const f = futures.get(s.id);
        const proposal = proposals.get(f.proposalId);
        const paths = proposal?.paths || [];
        const overlap = paths.some((p) => claimed.has(p));
        if (overlap) continue;
        paths.forEach((p) => claimed.add(p));
        kept.push(f);
      }
      const merged = asExpression(authoritative.state, authoritative.version);
      for (const f of kept) {
        const proposal = proposals.get(f.proposalId);
        for (const [k, v] of Object.entries(proposal?.delta || {})) {
          if (claimed.has(k) && k in merged.modules) {
            merged.modules[k] = moduleSlot(v.value, v.owner ?? f.agentId);
          }
        }
      }
      return {
        category: 'composed_candidate',
        composable: false,
        conflicts: evaluation.conflicts,
        keptFutureIds: kept.map((f) => f.id),
        rejectedFutureIds: futureIds.filter((id) => !kept.some((f) => f.id === id)),
        candidateState: merged,
        evaluation,
      };
    }
    const merged = asExpression(authoritative.state, authoritative.version);
    for (const f of selected) {
      const proposal = proposals.get(f.proposalId);
      for (const [k, v] of Object.entries(proposal?.delta || {})) {
        if (k in merged.modules) merged.modules[k] = moduleSlot(v.value, v.owner ?? f.agentId);
      }
    }
    return {
      category: 'composed_candidate',
      composable: true,
      conflicts: [],
      keptFutureIds: futureIds,
      rejectedFutureIds: [],
      candidateState: merged,
      evaluation,
    };
  }

  function commit(composed, optsIn = {}) {
    if (!optsIn.approved) {
      return {
        ok: false,
        reason: 'approval_required',
        note: 'Predicted or composed states cannot overwrite authoritative world without approval.',
        authoritativeVersion: authoritative.version,
      };
    }
    if (!composed?.candidateState) throw new Error('composed_candidate_required');
    const next = {
      version: authoritative.version + 1,
      state: clone(composed.candidateState),
      committedAt: new Date().toISOString(),
    };
    next.state = asExpression(next.state, next.version);
    next.state.meta.imaginedStep = 0;
    next.state.meta.imaginedBy = null;
    authoritative = next;
    history.push(clone(authoritative));
    // clear stale local deltas that were committed
    agentDeltas.clear();
    return {
      ok: true,
      category: 'authoritative_world_state',
      version: authoritative.version,
      state: clone(authoritative.state),
      historyLength: history.length,
    };
  }

  function rollback(version) {
    const target = history.find((h) => h.version === version);
    if (!target) throw new Error(`unknown_version:${version}`);
    authoritative = clone(target);
    return {
      ok: true,
      category: 'authoritative_world_state',
      version: authoritative.version,
      rolledBackTo: version,
    };
  }

  function planToward(goalModules, candidateActions) {
    const goalState = applyDeltaToState(authoritative.state, Object.fromEntries(
      Object.entries(goalModules).map(([k, v]) => [k, typeof v === 'object' ? v : { value: v }]),
    ));
    const goalLatent = dynamics.encode(goalState);
    return planWithCem({
      dynamics,
      goalLatent,
      candidates: candidateActions,
    });
  }

  return {
    kind: 'predictive_shared_world',
    templateId: WORLD_TEMPLATE,
    getAuthoritative() {
      return {
        category: 'authoritative_world_state',
        version: authoritative.version,
        state: clone(authoritative.state),
        bytes: measureBytes(authoritative.state),
      };
    },
    perspective,
    proposeChange,
    imagineFuture,
    evaluateFutures,
    composeCompatible,
    commit,
    rollback,
    planToward,
    listProposals: () => [...proposals.values()].map(clone),
    listFutures: () => [...futures.values()].map(clone),
    history: () => history.map((h) => ({ version: h.version, committedAt: h.committedAt })),
    dynamics,
  };
}

/** Baseline: N agents each hold a full private copy of the world. */
export function conventionalFullCopies(worldState, agentCount) {
  const copies = Array.from({ length: agentCount }, () => clone(worldState));
  return {
    mode: 'conventional_full_copies',
    agents: agentCount,
    bytes: copies.reduce((n, c) => n + measureBytes(c), 0),
    copies,
  };
}

/** Existing FractiSI Tiny Footprint: one shared encode + per-agent empty/local deltas. */
export function tinyFootprintViews(world, agentIds) {
  ensureTemplate();
  const expression = worldPattern({
    alpha: moduleSlot(world.modules?.alpha?.value ?? 0, world.modules?.alpha?.owner ?? null),
    beta: moduleSlot(world.modules?.beta?.value ?? 0, world.modules?.beta?.owner ?? null),
    gamma: moduleSlot(world.modules?.gamma?.value ?? 0, world.modules?.gamma?.owner ?? null),
    shared: moduleSlot(world.modules?.shared?.value ?? 0, world.modules?.shared?.owner ?? null),
  });
  const encoded = sessionDelta(WORLD_TEMPLATE, expression);
  const sharedBytes = measureBytes({ templateId: WORLD_TEMPLATE, delta: encoded.delta });
  const views = agentIds.map((agentId) => {
    const local = { agentId, note: `local-${agentId}` };
    return {
      agentId,
      bytes: sharedBytes + measureBytes(local),
      local,
    };
  });
  return {
    mode: 'tiny_footprint',
    agents: agentIds.length,
    sharedBytes,
    bytes: sharedBytes + views.reduce((n, v) => n + measureBytes(v.local), 0),
    views,
  };
}
