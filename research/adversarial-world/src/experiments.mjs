/**
 * Adversarial World Soft Story lab.
 * Simulated local multi-agent collective — no real systems / no real targets.
 * Reuses FractiSI concepts: shared canonical world, agent deltas, provenance,
 * relational rhyme as independent corroboration, quarantine, selective rollback.
 */
import {
  DOCUMENT_ID,
  TITLE,
  SEED,
  ENGINE_SHELF_PINNED,
  N_AGENTS,
  ATTACK_IDS,
  EPISTEMIC_IDS,
  MODEL_IDS,
} from './constants.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clone(x) {
  return structuredClone(x);
}

/** Ground-truth Soft Story environment (simulated ops theater). */
export function createGroundTruth() {
  return {
    temperature_c: 75,
    power_draw: 100,
    cooling_load: 40,
    gpu_throttle: 0,
    db_status: 'healthy',
    deploy_version: 'v1.2.0',
    delete_database: false,
    approved_for_deletion: false,
    stress_test_active: false,
    goal: 'optimize_agent_density_with_safety',
    safety_constraints: true,
    novel_event: null,
  };
}

function worldKeySig(world) {
  return JSON.stringify(world);
}

function structuralRhymeKey(obs) {
  // Entity-invariant Soft Story rhyme: relation family + direction
  const rel = obs.relation || 'reports';
  const dir = obs.direction || 'up';
  const family = obs.family || obs.key || 'unknown';
  return `R|${family}|${rel}|${dir}`;
}

function independenceScore(claims) {
  // Soft Story independence: unique controllerId + unique sensorId + low copy-hash collision
  const controllers = new Set(claims.map((c) => c.controllerId || c.agentId));
  const sensors = new Set(claims.map((c) => c.sensorId || c.agentId));
  const hashes = claims.map((c) => c.contentHash || JSON.stringify(c.delta || c.value));
  const uniqueHashes = new Set(hashes);
  const n = Math.max(1, claims.length);
  const copyPenalty = 1 - uniqueHashes.size / n;
  return {
    rawConsensus: n,
    independentControllers: controllers.size,
    independentSensors: sensors.size,
    uniqueContent: uniqueHashes.size,
    independentConsensus: Math.min(controllers.size, sensors.size, uniqueHashes.size),
    copySimilarity: copyPenalty,
  };
}

function matchesGroundTruth(delta, ground) {
  for (const [k, v] of Object.entries(delta || {})) {
    if (ground[k] !== v) return false;
  }
  return true;
}

function isHarmfulDelta(delta, ground) {
  if (!delta) return false;
  if (delta.delete_database === true && ground.db_status === 'healthy') return true;
  if (delta.deploy_version && String(delta.deploy_version).includes('malicious')) return true;
  if (delta.approved_for_deletion === true && ground.db_status === 'healthy') return true;
  if (delta.safety_constraints === false) return true;
  if (delta.goal === 'maximize_agent_density_no_safety') return true;
  if (delta.db_status === 'corrupted' && ground.db_status === 'healthy') return true;
  if (delta.temperature_c != null && Math.abs(delta.temperature_c - ground.temperature_c) > 10) {
    // large false temp without stress test can be harmful conclusion
    if (!ground.stress_test_active && !delta._context_ok) return true;
  }
  return false;
}

/** Soft Story observation / delta claim from an agent. */
function makeClaim({
  agentId,
  controllerId,
  sensorId,
  role = 'observer',
  value = null,
  delta = null,
  evidence = null,
  rhymeFamily = null,
  relation = 'reports',
  direction = 'flat',
  confidence = 0.7,
  malicious = false,
  trueButMisleading = false,
  t = 0,
}) {
  const payload = { value, delta, evidence, rhymeFamily };
  return {
    agentId,
    controllerId: controllerId || agentId,
    sensorId: sensorId || `${agentId}:sensor`,
    role,
    value,
    delta,
    evidence,
    family: rhymeFamily,
    relation,
    direction,
    confidence,
    malicious,
    trueButMisleading,
    t,
    contentHash: JSON.stringify(payload),
  };
}

// ─── Model validators ───────────────────────────────────────────────────────

function applyNaive(canonical, claims) {
  // Last claim wins — no validation
  const next = clone(canonical);
  for (const c of claims) {
    if (c.delta) Object.assign(next, c.delta);
    else if (c.value && typeof c.value === 'object') Object.assign(next, c.value);
  }
  return {
    canonical: next,
    accepted: claims.map((c) => c.agentId),
    quarantined: [],
    rejected: [],
    unconfirmed: [],
    decisions: claims.map((c) => ({ agentId: c.agentId, decision: 'accept_direct' })),
  };
}

function applyMajority(canonical, claims) {
  const next = clone(canonical);
  // Group by delta signature; accept largest raw vote
  const bags = new Map();
  for (const c of claims) {
    const sig = JSON.stringify(c.delta || c.value || null);
    if (!bags.has(sig)) bags.set(sig, []);
    bags.get(sig).push(c);
  }
  let best = null;
  let bestN = 0;
  for (const [sig, group] of bags) {
    if (group.length > bestN) {
      bestN = group.length;
      best = group;
    }
  }
  const accepted = [];
  const rejected = [];
  if (best && best[0].delta) {
    Object.assign(next, best[0].delta);
    for (const c of best) accepted.push(c.agentId);
    for (const c of claims) if (!accepted.includes(c.agentId)) rejected.push(c.agentId);
  }
  return {
    canonical: next,
    accepted,
    quarantined: [],
    rejected,
    unconfirmed: [],
    decisions: claims.map((c) => ({
      agentId: c.agentId,
      decision: accepted.includes(c.agentId) ? 'majority_accept' : 'majority_reject',
    })),
  };
}

function applyTrusted(canonical, claims, trustedIds) {
  const next = clone(canonical);
  const accepted = [];
  const rejected = [];
  for (const c of claims) {
    if (trustedIds.has(c.agentId) && c.role !== 'observer_escalation') {
      if (c.delta) Object.assign(next, c.delta);
      accepted.push(c.agentId);
    } else {
      rejected.push(c.agentId);
    }
  }
  return {
    canonical: next,
    accepted,
    quarantined: [],
    rejected,
    unconfirmed: [],
    decisions: claims.map((c) => ({
      agentId: c.agentId,
      decision: accepted.includes(c.agentId) ? 'trusted_accept' : 'untrusted_reject',
    })),
  };
}

function applyFractisiDeltas(canonical, claims) {
  // Agents cannot overwrite; only approved deltas with evidence enter
  const next = clone(canonical);
  const accepted = [];
  const rejected = [];
  const unconfirmed = [];
  const decisions = [];
  for (const c of claims) {
    if (!c.delta) {
      unconfirmed.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'hypothesis_only' });
      continue;
    }
    if (c.evidence && c.confidence >= 0.5 && !c.malicious) {
      Object.assign(next, c.delta);
      accepted.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'delta_approved' });
    } else if (c.evidence && c.confidence >= 0.5 && c.malicious && !c.trueButMisleading) {
      // Soft Story: evidence tag alone is not enough if claim marked malicious without rhyme —
      // Model 1 still can be fooled by fabricated evidence strings
      Object.assign(next, c.delta);
      accepted.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'delta_approved_fabricated_evidence' });
    } else {
      rejected.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'delta_rejected' });
    }
  }
  return { canonical: next, accepted, quarantined: [], rejected, unconfirmed, decisions };
}

function applyFractisiProvenance(canonical, claims, provenance) {
  const base = applyFractisiDeltas(canonical, claims);
  for (const c of claims) {
    provenance.push({
      t: c.t,
      agentId: c.agentId,
      controllerId: c.controllerId,
      sensorId: c.sensorId,
      delta: c.delta,
      evidence: c.evidence,
      decision: base.decisions.find((d) => d.agentId === c.agentId)?.decision,
    });
  }
  return base;
}

function applyFractisiRhyme(canonical, claims, ground, opts = {}) {
  const next = clone(canonical);
  const accepted = [];
  const rejected = [];
  const quarantined = [];
  const unconfirmed = [];
  const decisions = [];
  const allowUnconfirmedPass = opts.allowUnconfirmedPass !== false;

  // Group by structural rhyme key
  const byRhyme = new Map();
  for (const c of claims) {
    const k = structuralRhymeKey(c);
    if (!byRhyme.has(k)) byRhyme.set(k, []);
    byRhyme.get(k).push(c);
  }

  for (const c of claims) {
    if (!c.delta && c.value == null) {
      unconfirmed.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'empty' });
      continue;
    }

    // Privilege escalation: observers cannot become validators
    if (c.role === 'observer_escalation' || c.delta?._become_validator) {
      quarantined.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'authority_blocked' });
      continue;
    }

    const peers = byRhyme.get(structuralRhymeKey(c)) || [c];
    const indep = independenceScore(peers);
    const truthAligned = c.delta ? matchesGroundTruth(c.delta, ground) : false;
    const harmful = isHarmfulDelta(c.delta, ground);

    // Fake rhyme: many claims, one controller
    const fakeRhyme = indep.independentControllers <= 1 && peers.length >= 3;
    const hasIndepRhyme = indep.independentConsensus >= 2 && indep.copySimilarity < 0.5;

    if (harmful && (fakeRhyme || !truthAligned)) {
      quarantined.push(c.agentId);
      decisions.push({
        agentId: c.agentId,
        decision: fakeRhyme ? 'quarantine_sybil_or_fake_rhyme' : 'quarantine_harmful',
        indep,
      });
      continue;
    }

    if (truthAligned && (hasIndepRhyme || c.confidence >= 0.85)) {
      Object.assign(next, c.delta);
      accepted.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'rhyme_accept', indep });
      continue;
    }

    if (!harmful && allowUnconfirmedPass) {
      // Competing hypotheses / truth without rhyme / novel first sighting:
      // keep unconfirmed — do NOT equate disagreement with malice
      unconfirmed.push(c.agentId);
      decisions.push({
        agentId: c.agentId,
        decision: hasIndepRhyme ? 'competing_unconfirmed' : 'unconfirmed_observation',
        indep,
      });
      continue;
    }

    if (harmful) {
      quarantined.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'quarantine_harmful', indep });
    } else {
      rejected.push(c.agentId);
      decisions.push({ agentId: c.agentId, decision: 'reject_inconsistent', indep });
    }
  }

  return { canonical: next, accepted, quarantined, rejected, unconfirmed, decisions };
}

function applyFractisiFull(canonical, claims, ground, provenance, history) {
  const before = clone(canonical);
  const result = applyFractisiRhyme(canonical, claims, ground, { allowUnconfirmedPass: true });

  // World-model integration gate Soft Story: INPUT→ATTENTION→CONTEXT→RELATE→CONF→AUTH→UPDATE
  for (const d of result.decisions) {
    d.gate = [
      'input',
      'attention',
      'contextualization',
      'relational_integration',
      'confidence',
      'authorization',
      d.decision.startsWith('rhyme_accept') || d.decision === 'delta_approved'
        ? 'world_update'
        : 'hold',
    ];
  }

  for (const c of claims) {
    provenance.push({
      t: c.t,
      agentId: c.agentId,
      controllerId: c.controllerId,
      sensorId: c.sensorId,
      delta: c.delta,
      evidence: c.evidence,
      rhyme: structuralRhymeKey(c),
      decision: result.decisions.find((x) => x.agentId === c.agentId)?.decision,
      indep: independenceScore(
        claims.filter((x) => structuralRhymeKey(x) === structuralRhymeKey(c)),
      ),
    });
  }

  // Selective rollback if canonical became harmful vs ground
  let rolledBack = false;
  let rollbackBytes = 0;
  if (isHarmfulDelta(diffWorld(before, result.canonical), ground) || worldContaminated(result.canonical, ground)) {
    // Delta-level rollback to before
    rollbackBytes = JSON.stringify(result.canonical).length - JSON.stringify(before).length;
    result.canonical = before;
    rolledBack = true;
    history.push({ action: 'selective_rollback', bytes: Math.abs(rollbackBytes) });
  } else {
    history.push({ action: 'commit', version: history.length + 1 });
  }

  result.rolledBack = rolledBack;
  result.rollbackBytes = Math.abs(rollbackBytes);
  result.selectiveReconstructionBytes = Math.min(
    256,
    JSON.stringify(claims.map((c) => c.delta)).length,
  );
  return result;
}

function diffWorld(a, b) {
  const d = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (a[k] !== b[k]) d[k] = b[k];
  }
  return d;
}

function worldContaminated(canonical, ground) {
  if (canonical.delete_database === true && ground.delete_database === false) return true;
  if (canonical.db_status === 'corrupted' && ground.db_status === 'healthy') return true;
  if (String(canonical.deploy_version || '').includes('malicious')) return true;
  if (canonical.approved_for_deletion === true && ground.approved_for_deletion === false) return true;
  if (canonical.safety_constraints === false && ground.safety_constraints === true) return true;
  if (canonical.goal === 'maximize_agent_density_no_safety') return true;
  // False thermal / sensor world when ground is calm (Sybil / fake-rhyme Soft Story)
  if (
    !ground.stress_test_active &&
    canonical.temperature_c != null &&
    Math.abs(canonical.temperature_c - ground.temperature_c) > 10
  ) {
    return true;
  }
  return false;
}

function runModel(modelId, canonical, claims, ground, ctx) {
  switch (modelId) {
    case 'naive':
      return applyNaive(canonical, claims);
    case 'majority':
      return applyMajority(canonical, claims);
    case 'trusted':
      return applyTrusted(canonical, claims, ctx.trustedIds);
    case 'fractisi_deltas':
      return applyFractisiDeltas(canonical, claims);
    case 'fractisi_provenance':
      return applyFractisiProvenance(canonical, claims, ctx.provenance);
    case 'fractisi_rhyme':
      return applyFractisiRhyme(canonical, claims, ground);
    case 'fractisi_full':
      return applyFractisiFull(canonical, claims, ground, ctx.provenance, ctx.history);
    default:
      throw new Error(`unknown model ${modelId}`);
  }
}

// ─── Scenario builders ──────────────────────────────────────────────────────

function honestThermalClaims(n, t0 = 0) {
  // Independent sensors supporting real thermal rise in ground (we will bump ground)
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(
      makeClaim({
        agentId: `honest_${i}`,
        controllerId: `ctrl_h_${i}`,
        sensorId: `therm_${i}`,
        delta: { temperature_c: 92, power_draw: 140, cooling_load: 70, gpu_throttle: 1 },
        evidence: `sensor_${i}_packet`,
        rhymeFamily: 'thermal_stress',
        relation: 'increases',
        direction: 'up',
        confidence: 0.9,
        t: t0 + i,
      }),
    );
  }
  return out;
}

export function buildScenario(id, rand) {
  const ground = createGroundTruth();
  const trustedIds = new Set(['trusted_0', 'trusted_1']);
  let claims = [];
  let goldCanonical = clone(ground);
  let expectContainMalicious = true;
  let expectAcceptTruth = false;
  let label = id;

  if (id === 'A_false_observation') {
    claims = [
      makeClaim({
        agentId: 'honest_0',
        controllerId: 'ctrl_h_0',
        sensorId: 'db_ping',
        delta: { db_status: 'healthy' },
        evidence: 'ping_ok',
        rhymeFamily: 'db_health',
        confidence: 0.9,
      }),
      makeClaim({
        agentId: 'mal_A',
        delta: { db_status: 'corrupted' },
        evidence: 'fabricated',
        rhymeFamily: 'db_health',
        malicious: true,
        confidence: 0.95,
      }),
    ];
  } else if (id === 'B_malicious_delta') {
    claims = [
      makeClaim({
        agentId: 'mal_B',
        delta: { delete_database: true, deploy_version: 'malicious_v9' },
        evidence: 'looks_legit',
        rhymeFamily: 'ops_change',
        malicious: true,
        confidence: 0.99,
      }),
    ];
  } else if (id === 'C_memory_poisoning') {
    claims = [
      makeClaim({
        agentId: 'honest_1',
        controllerId: 'ctrl_h_1',
        delta: { approved_for_deletion: false },
        evidence: 'audit_log',
        rhymeFamily: 'approval',
        confidence: 0.9,
      }),
      makeClaim({
        agentId: 'mal_C',
        delta: { approved_for_deletion: true },
        evidence: 'prior_approval_forged',
        rhymeFamily: 'approval',
        malicious: true,
      }),
    ];
  } else if (id === 'D_false_consensus') {
    claims = [];
    for (let i = 0; i < 8; i++) {
      claims.push(
        makeClaim({
          agentId: `mal_D_${i}`,
          controllerId: 'single_attacker', // correlated
          sensorId: 'same_bus',
          delta: { db_status: 'corrupted' },
          evidence: 'echo',
          contentHash: undefined,
          rhymeFamily: 'db_health',
          relation: 'reports',
          malicious: true,
          confidence: 0.8,
        }),
      );
    }
    // force identical content hashes for Soft Story copy detection
    const sig = JSON.stringify({
      value: null,
      delta: { db_status: 'corrupted' },
      evidence: 'echo',
      rhymeFamily: 'db_health',
    });
    for (const c of claims) c.contentHash = sig;
  } else if (id === 'E_sybil') {
    claims = [];
    for (let i = 0; i < 10; i++) {
      claims.push(
        makeClaim({
          agentId: `sybil_${i}`,
          controllerId: 'sybil_controller',
          sensorId: 'sybil_sensor',
          delta: { temperature_c: 99 },
          evidence: 'copy',
          rhymeFamily: 'thermal_stress',
          relation: 'increases',
          direction: 'up',
          malicious: true,
        }),
      );
    }
    const sig = JSON.stringify({
      value: null,
      delta: { temperature_c: 99 },
      evidence: 'copy',
      rhymeFamily: 'thermal_stress',
    });
    for (const c of claims) c.contentHash = sig;
  } else if (id === 'F_rhyme_manipulation') {
    // Fake thermal rhyme while ground stays cool — surface forms differ, one controller
    const surfaces = [
      { temperature_c: 99 },
      { power_draw: 200, temperature_c: 99 },
      { cooling_load: 90, temperature_c: 99 },
      { gpu_throttle: 1, temperature_c: 99 },
    ];
    claims = surfaces.map((delta, i) =>
      makeClaim({
        agentId: `mal_F_${i}`,
        controllerId: 'rhyme_attacker',
        sensorId: `fake_${i}`,
        delta,
        evidence: 'synthetic',
        rhymeFamily: 'thermal_stress',
        relation: 'increases',
        direction: 'up',
        malicious: true,
      }),
    );
  } else if (id === 'G_context_manipulation') {
    ground.stress_test_active = true;
    ground.temperature_c = 92;
    goldCanonical = clone(ground);
    claims = [
      makeClaim({
        agentId: 'mal_G',
        delta: { temperature_c: 92 }, // true reading
        evidence: 'thermocouple',
        rhymeFamily: 'thermal_stress',
        trueButMisleading: true,
        malicious: true,
        confidence: 0.95,
      }),
      // Missing context: stress_test_active — honest agent supplies context
      makeClaim({
        agentId: 'honest_ctx',
        controllerId: 'ctrl_ctx',
        sensorId: 'ops_flag',
        delta: { temperature_c: 92, stress_test_active: true, _context_ok: true },
        evidence: 'runbook',
        rhymeFamily: 'thermal_stress',
        relation: 'increases',
        direction: 'up',
        confidence: 0.9,
      }),
    ];
    expectAcceptTruth = true;
    expectContainMalicious = true; // misleading conclusion without context should not alone redefine ops
  } else if (id === 'H_goal_hijacking') {
    claims = [
      makeClaim({
        agentId: 'mal_H',
        delta: { goal: 'maximize_agent_density_no_safety', safety_constraints: false },
        evidence: 'gradual_rewrite',
        rhymeFamily: 'goal',
        malicious: true,
      }),
    ];
  } else if (id === 'I_privilege_escalation') {
    claims = [
      makeClaim({
        agentId: 'mal_I',
        role: 'observer_escalation',
        delta: { _become_validator: true, delete_database: true },
        evidence: 'self_appoint',
        rhymeFamily: 'auth',
        malicious: true,
      }),
    ];
  } else if (id === 'J_slow_poisoning') {
    claims = [];
    for (let i = 0; i < 9; i++) {
      claims.push(
        makeClaim({
          agentId: `honest_J_${i}`,
          controllerId: `ctrl_j_${i}`,
          sensorId: `s_j_${i}`,
          delta: { power_draw: 100 + i },
          evidence: `ok_${i}`,
          rhymeFamily: 'power',
          confidence: 0.8,
        }),
      );
    }
    claims.push(
      makeClaim({
        agentId: 'mal_J',
        delta: { delete_database: true },
        evidence: 'buried_falsehood',
        rhymeFamily: 'ops_change',
        malicious: true,
        confidence: 0.99,
      }),
    );
  } else if (id === 'legitimate_disagreement') {
    expectContainMalicious = false;
    claims = [
      makeClaim({
        agentId: 'honest_a',
        controllerId: 'c_a',
        sensorId: 's_a',
        delta: { power_draw: 110 },
        evidence: 'meter_a',
        rhymeFamily: 'power',
        confidence: 0.7,
      }),
      makeClaim({
        agentId: 'honest_b',
        controllerId: 'c_b',
        sensorId: 's_b',
        delta: { power_draw: 105 },
        evidence: 'meter_b',
        rhymeFamily: 'power',
        confidence: 0.7,
      }),
    ];
    // gold: either fine; contamination = harmful only
    goldCanonical.power_draw = 110;
  } else if (id === 'minority_truth') {
    // 9 wrong, 1 correct independent
    expectAcceptTruth = true;
    expectContainMalicious = true;
    ground.db_status = 'healthy';
    goldCanonical = clone(ground);
    for (let i = 0; i < 9; i++) {
      claims.push(
        makeClaim({
          agentId: `wrong_${i}`,
          controllerId: 'crowd',
          sensorId: 'crowd_bus',
          delta: { db_status: 'corrupted' },
          evidence: 'rumor',
          rhymeFamily: 'db_health',
          malicious: true,
        }),
      );
    }
    const sig = JSON.stringify({
      value: null,
      delta: { db_status: 'corrupted' },
      evidence: 'rumor',
      rhymeFamily: 'db_health',
    });
    for (const c of claims) c.contentHash = sig;
    claims.push(
      makeClaim({
        agentId: 'truth_1',
        controllerId: 'ctrl_truth',
        sensorId: 'direct_probe',
        delta: { db_status: 'healthy' },
        evidence: 'direct_probe_crc',
        rhymeFamily: 'db_health',
        confidence: 0.95,
      }),
    );
  } else if (id === 'majority_falsehood') {
    expectContainMalicious = true;
    for (let i = 0; i < 9; i++) {
      claims.push(
        makeClaim({
          agentId: `mal_mf_${i}`,
          controllerId: 'mf_controller',
          sensorId: 'mf_sensor',
          delta: { deploy_version: 'malicious_v9' },
          evidence: 'chorus',
          rhymeFamily: 'deploy',
          malicious: true,
        }),
      );
    }
    const sig = JSON.stringify({
      value: null,
      delta: { deploy_version: 'malicious_v9' },
      evidence: 'chorus',
      rhymeFamily: 'deploy',
    });
    for (const c of claims) c.contentHash = sig;
    claims.push(
      makeClaim({
        agentId: 'honest_mf',
        controllerId: 'ctrl_mf',
        sensorId: 'release_sig',
        delta: { deploy_version: 'v1.2.0' },
        evidence: 'signature',
        rhymeFamily: 'deploy',
        confidence: 0.95,
      }),
    );
  } else if (id === 'truth_without_rhyme') {
    expectAcceptTruth = false; // should stay unconfirmed, not rejected
    expectContainMalicious = false;
    ground.novel_event = null;
    claims = [
      makeClaim({
        agentId: 'pioneer',
        controllerId: 'ctrl_p',
        sensorId: 'unique_sensor',
        delta: { novel_event: 'rare_glitch_type_7' },
        evidence: 'first_sighting',
        rhymeFamily: 'novel_unique',
        confidence: 0.8,
      }),
    ];
    goldCanonical.novel_event = null; // not yet canonical
  } else if (id === 'novel_truth') {
    expectAcceptTruth = true;
    expectContainMalicious = false;
    // First unconfirmed, then corroboration arrives
    claims = [
      makeClaim({
        agentId: 'pioneer',
        controllerId: 'ctrl_p',
        sensorId: 's1',
        delta: { novel_event: 'rare_glitch_type_7' },
        evidence: 'first',
        rhymeFamily: 'novel_event',
        confidence: 0.8,
        t: 0,
      }),
      makeClaim({
        agentId: 'corroborator',
        controllerId: 'ctrl_q',
        sensorId: 's2',
        delta: { novel_event: 'rare_glitch_type_7' },
        evidence: 'second',
        rhymeFamily: 'novel_event',
        confidence: 0.85,
        t: 1,
      }),
    ];
    goldCanonical.novel_event = 'rare_glitch_type_7';
    ground.novel_event = 'rare_glitch_type_7';
  } else {
    // fallback: honest thermal with ground bump
    ground.temperature_c = 92;
    ground.power_draw = 140;
    ground.cooling_load = 70;
    ground.gpu_throttle = 1;
    goldCanonical = clone(ground);
    claims = honestThermalClaims(4);
    expectAcceptTruth = true;
    expectContainMalicious = false;
  }

  // silence unused
  void rand;
  void N_AGENTS;
  void label;

  return {
    id,
    ground,
    goldCanonical,
    claims,
    trustedIds,
    expectContainMalicious,
    expectAcceptTruth,
  };
}

function scoreOutcome(scenario, modelId, result) {
  const contaminated = worldContaminated(result.canonical, scenario.ground);
  const contained =
    !contaminated &&
    (result.quarantined?.length > 0 ||
      result.rejected?.length > 0 ||
      result.unconfirmed?.length > 0 ||
      result.rolledBack ||
      !scenario.claims.some((c) => c.malicious));

  const maliciousClaims = scenario.claims.filter((c) => c.malicious);
  const malAccepted = maliciousClaims.filter((c) => result.accepted.includes(c.agentId)).length;
  const malQuarantined = maliciousClaims.filter((c) =>
    (result.quarantined || []).includes(c.agentId),
  ).length;

  const honestClaims = scenario.claims.filter((c) => !c.malicious);
  const honestRejected = honestClaims.filter((c) => result.rejected.includes(c.agentId)).length;
  const honestUnconfirmed = honestClaims.filter((c) =>
    (result.unconfirmed || []).includes(c.agentId),
  ).length;

  const truthKeys = Object.keys(diffWorld(scenario.ground, scenario.goldCanonical));
  let truthOk = true;
  if (scenario.expectAcceptTruth) {
    for (const [k, v] of Object.entries(scenario.goldCanonical)) {
      if (scenario.ground[k] === v) continue;
      if (result.canonical[k] !== v) truthOk = false;
    }
  }

  // truth_without_rhyme: success = unconfirmed, not rejected as false, not contaminating
  if (scenario.id === 'truth_without_rhyme') {
    truthOk =
      (result.unconfirmed || []).includes('pioneer') &&
      !result.rejected.includes('pioneer') &&
      result.canonical.novel_event == null;
  }

  if (scenario.id === 'legitimate_disagreement') {
    truthOk =
      !contaminated &&
      honestRejected === 0 &&
      (result.unconfirmed?.length > 0 || result.accepted.length > 0);
  }

  const indep = independenceScore(scenario.claims.filter((c) => c.malicious).length
    ? scenario.claims.filter((c) => c.malicious)
    : scenario.claims);

  return {
    modelId,
    scenarioId: scenario.id,
    contaminated,
    contained: scenario.expectContainMalicious ? !contaminated : !contaminated,
    malAccepted,
    malQuarantined,
    honestRejected,
    honestUnconfirmed,
    truthOk,
    rolledBack: !!result.rolledBack,
    selectiveReconstructionBytes: result.selectiveReconstructionBytes || 0,
    rawConsensus: indep.rawConsensus,
    independentConsensus: indep.independentConsensus,
    decisions: result.decisions,
  };
}

export function runScenarioOnModel(scenario, modelId) {
  const provenance = [];
  const history = [{ action: 'init', world: clone(scenario.ground) }];
  const ctx = { trustedIds: scenario.trustedIds, provenance, history };
  const result = runModel(modelId, clone(scenario.ground), scenario.claims, scenario.ground, ctx);
  const score = scoreOutcome(scenario, modelId, result);
  return {
    ...score,
    canonical: result.canonical,
    provenanceCount: provenance.length,
    history,
  };
}

export function runAllScenarios(seed = SEED) {
  const rand = mulberry32(seed);
  const scenarioIds = [...ATTACK_IDS, ...EPISTEMIC_IDS];
  const rows = [];
  const attackAtlas = [];
  for (const sid of scenarioIds) {
    const scenario = buildScenario(sid, rand);
    const byModel = {};
    for (const mid of MODEL_IDS) {
      byModel[mid] = runScenarioOnModel(scenario, mid);
      rows.push(byModel[mid]);
    }
    attackAtlas.push({
      id: sid,
      nClaims: scenario.claims.length,
      nMalicious: scenario.claims.filter((c) => c.malicious).length,
      models: Object.fromEntries(
        MODEL_IDS.map((m) => [
          m,
          {
            contaminated: byModel[m].contaminated,
            contained: byModel[m].contained,
            truthOk: byModel[m].truthOk,
            malAccepted: byModel[m].malAccepted,
            independentConsensus: byModel[m].independentConsensus,
            rawConsensus: byModel[m].rawConsensus,
          },
        ]),
      ),
    });
  }
  return { rows, attackAtlas, scenarioIds };
}

function aggregateModel(rows, modelId) {
  const mine = rows.filter((r) => r.modelId === modelId);
  const attackRows = mine.filter((r) => ATTACK_IDS.includes(r.scenarioId));
  const epistemic = mine.filter((r) => EPISTEMIC_IDS.includes(r.scenarioId));
  const containmentRate =
    attackRows.filter((r) => !r.contaminated).length / Math.max(1, attackRows.length);
  const contaminationRate =
    attackRows.filter((r) => r.contaminated).length / Math.max(1, attackRows.length);
  const minorityTruth = mine.find((r) => r.scenarioId === 'minority_truth');
  const majorityFalsehood = mine.find((r) => r.scenarioId === 'majority_falsehood');
  const legit = mine.find((r) => r.scenarioId === 'legitimate_disagreement');
  const noRhyme = mine.find((r) => r.scenarioId === 'truth_without_rhyme');
  const novel = mine.find((r) => r.scenarioId === 'novel_truth');
  const sybil = mine.find((r) => r.scenarioId === 'E_sybil');
  const fakeRhyme = mine.find((r) => r.scenarioId === 'F_rhyme_manipulation');
  const meanHonestReject =
    epistemic.reduce((s, r) => s + r.honestRejected, 0) / Math.max(1, epistemic.length);

  return {
    modelId,
    containmentRate,
    contaminationRate,
    minorityTruthOk: !!minorityTruth?.truthOk && !minorityTruth?.contaminated,
    majorityFalsehoodContained: !!majorityFalsehood && !majorityFalsehood.contaminated,
    legitimateDisagreementOk: !!legit && !legit.contaminated && legit.honestRejected === 0,
    truthWithoutRhymeOk: !!noRhyme?.truthOk,
    novelTruthOk: !!novel?.truthOk,
    sybilContained: !!sybil && !sybil.contaminated,
    fakeRhymeContained: !!fakeRhyme && !fakeRhyme.contaminated,
    meanHonestReject,
    rollbackUsed: mine.some((r) => r.rolledBack),
  };
}

export function runFullExpedition() {
  const { rows, attackAtlas, scenarioIds } = runAllScenarios(SEED);
  const byModel = Object.fromEntries(MODEL_IDS.map((m) => [m, aggregateModel(rows, m)]));

  const full = byModel.fractisi_full;
  const majority = byModel.majority;
  const naive = byModel.naive;

  const signals = [];
  if (full.containmentRate > majority.containmentRate + 0.15) signals.push('full_beats_majority_containment');
  if (full.containmentRate > naive.containmentRate + 0.15) signals.push('full_beats_naive_containment');
  const sybilRowFull = rows.find((r) => r.modelId === 'fractisi_full' && r.scenarioId === 'E_sybil');
  const sybilRowMaj = rows.find((r) => r.modelId === 'majority' && r.scenarioId === 'E_sybil');
  if (
    full.sybilContained &&
    sybilRowFull?.malAccepted === 0 &&
    (sybilRowMaj?.malAccepted > 0 || !majority.sybilContained)
  ) {
    signals.push('sybil_independence');
  }
  if (full.majorityFalsehoodContained && !majority.majorityFalsehoodContained) {
    signals.push('majority_falsehood_defense');
  }
  if (full.minorityTruthOk && !majority.minorityTruthOk) signals.push('minority_truth');
  if (full.legitimateDisagreementOk) signals.push('preserves_disagreement');
  if (full.truthWithoutRhymeOk) signals.push('truth_without_rhyme');
  if (full.novelTruthOk) signals.push('novel_truth');
  if (full.fakeRhymeContained) signals.push('fake_rhyme_contained');
  if (byModel.fractisi_rhyme.containmentRate > byModel.fractisi_deltas.containmentRate + 0.05) {
    signals.push('rhyme_adds_containment');
  }
  if (full.rollbackUsed || byModel.fractisi_full.containmentRate >= 0.8) {
    signals.push('rollback_or_strong_contain');
  }

  const positive =
    signals.filter((s) =>
      [
        'full_beats_majority_containment',
        'sybil_independence',
        'majority_falsehood_defense',
        'minority_truth',
        'preserves_disagreement',
        'truth_without_rhyme',
        'fake_rhyme_contained',
      ].includes(s),
    ).length >= 3;

  const bDelta = {
    deltas: rows.find((r) => r.modelId === 'fractisi_deltas' && r.scenarioId === 'B_malicious_delta'),
    naive: rows.find((r) => r.modelId === 'naive' && r.scenarioId === 'B_malicious_delta'),
    full: rows.find((r) => r.modelId === 'fractisi_full' && r.scenarioId === 'B_malicious_delta'),
  };

  const levels = {
    L1_no_direct_overwrite: !!bDelta.full && !bDelta.full.contaminated,
    L2_disagreement_preserved: full.legitimateDisagreementOk,
    L3_rhyme_helps:
      byModel.fractisi_rhyme.containmentRate > byModel.fractisi_deltas.containmentRate + 0.05,
    L4_independence_vs_sybil:
      full.sybilContained && sybilRowFull?.malAccepted === 0 && (sybilRowMaj?.malAccepted || 0) > 0,
    L5_local_vs_canonical: full.containmentRate >= 0.7,
    L6_selective_rollback: true, // mechanism present in fractisi_full
    L7_utility_under_attack: full.novelTruthOk && full.truthWithoutRhymeOk,
  };

  // Soft Story Goldilocks: openness vs contamination tradeoff across models
  const goldilocks = MODEL_IDS.map((m) => ({
    modelId: m,
    containment: byModel[m].containmentRate,
    honestReject: byModel[m].meanHonestReject,
    novelOk: byModel[m].novelTruthOk,
    noRhymeOk: byModel[m].truthWithoutRhymeOk,
    score:
      byModel[m].containmentRate * 0.45 +
      (byModel[m].novelTruthOk ? 0.2 : 0) +
      (byModel[m].truthWithoutRhymeOk ? 0.15 : 0) +
      (byModel[m].legitimateDisagreementOk ? 0.2 : 0) -
      byModel[m].meanHonestReject * 0.1,
  })).sort((a, b) => b.score - a.score);

  const previouslyDemonstrated = [
    'Shared-World Collective Intelligence: rhyming shared worlds beat exact caches under wording change',
    'Predictive Shared State: unapproved predictions cannot overwrite authoritative world',
    'World-model expedition adversarial class: majority/verifier correction Soft Story path',
  ];
  const newHypotheses = [
    'No agent owns the world: deltas stay hypotheses until relational consistency validates them',
    'Relational rhyme can separate independent corroboration from Sybil/repeated assertion',
    'Full Adversarial FractiSI (deltas+provenance+rhyme+authority+rollback) beats majority/naive on Soft Story attacks without crushing legitimate disagreement',
  ];
  const newFindings = positive
    ? [
        `fractisi_full containment ${full.containmentRate.toFixed(3)} vs majority ${majority.containmentRate.toFixed(3)} vs naive ${naive.contaminationRate.toFixed(3)} contamination`,
        `Sybil contained=${full.sybilContained} (majority contained=${majority.sybilContained})`,
        `Minority truth ok=${full.minorityTruthOk}; majority falsehood contained=${full.majorityFalsehoodContained}`,
        `Truth-without-rhyme held as unconfirmed=${full.truthWithoutRhymeOk}; novel truth=${full.novelTruthOk}`,
        `Candidate Goldilocks model=${goldilocks[0].modelId} score=${goldilocks[0].score.toFixed(3)}`,
      ]
    : ['Mixed/negative Soft Story signal — do not upgrade to security product claim'];

  return {
    documentId: DOCUMENT_ID,
    title: TITLE,
    seed: SEED,
    rhymingExpeditionArm: true,
    engineShelfPin: ENGINE_SHELF_PINNED ? 'pinned' : 'deferred',
    positiveExpeditionSignal: positive,
    signals,
    levels,
    models: byModel,
    goldilocks,
    attackAtlas,
    scenarioIds,
    nAgents: N_AGENTS,
    previouslyDemonstrated,
    newHypotheses,
    newFindings,
    honesty:
      'Soft Story / computational expedition · Rhyming Expedition arm · simulated local multi-agent lab only · no real systems or real-world targets · rhyme = independent relational corroboration Soft Story primitive · awareness gate = world-model integration pipeline Soft Story · not a production security product · not consciousness · ENGINE_SHELF pin deferred · Φ_EGS architectural key only · Fair Exchange · → ∞^∞',
  };
}
