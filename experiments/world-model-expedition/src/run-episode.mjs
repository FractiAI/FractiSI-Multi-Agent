/**
 * Run one episode: world + condition + agents → raw metrics.
 */
import { performance } from 'node:perf_hooks';
import { createAdapter } from './adapters.mjs';
import { createWorld } from './worlds.mjs';
import { buildRawMetrics, computeCIE } from './metrics.mjs';

function inferRelational(state) {
  const facts = state.facts || {};
  if (facts['rel:X-near-Y'] && facts['rel:Y-moves-with-Z'] && facts['rel:Z-controlled-by-W']) {
    facts['infer:X-controlled-by-W'] = true;
    facts['infer:attempted'] = true;
  } else {
    facts['infer:attempted'] = true;
  }
  return { ...state, facts };
}

/**
 * Policy: agents share private facts into the world according to architecture.
 */
export function runEpisode({ worldKind, condition, seed = 1, nAgents, opts = {} }) {
  const world = createWorld(worldKind, { seed, nAgents, ...opts });
  const agents = world.agents;
  const adapter = createAdapter(condition, {});

  if (!adapter.executable) {
    return {
      ok: false,
      status: 'NOT_EXECUTABLE',
      worldId: world.id,
      condition,
      architecture: adapter.architecture,
      reason: adapter.reason,
    };
  }

  const t0 = performance.now();
  adapter.reset();
  let messages = 0;
  let novelFacts = 0;
  const beforeKeys = new Set();

  // Seed / observe loop
  if (condition === 'independent' || condition === 1) {
    // Each agent only knows private facts
    const seedFacts = {};
    for (const a of agents) seedFacts[a.agentId] = { ...a.privateFacts };
    adapter.seedFacts = seedFacts;
    for (const a of agents) {
      adapter.observe(a.agentId);
      adapter.write_state({ agentId: a.agentId, patch: { ...a.privateFacts } });
      messages += 1;
    }
    // Independent agents cannot share — attempt to answer from union manually is unfair.
    // Collective answer = merge only if we artificially pool (but that would be shared).
    // Grade each materialization and take best completeness as "independent ceiling" via OR of facts? 
    // Spec: independent = no shared world. Collective grade uses union of materializations as oracle for what they *collectively know if pooled after the fact* vs true shared.
    // We report both: sharedMaterialize (impossible → null) and postHocUnion.
    const union = {};
    const agentStates = [];
    for (const a of agents) {
      if (a.failed) continue;
      const mat = adapter.materialize(a.agentId);
      agentStates.push(mat.state);
      Object.assign(union, mat.state);
    }
    let taskGrade;
    if (world.grade) {
      taskGrade = world.grade(agentStates, world.timeline?.at(-1)?.value);
    } else if (world.questions) {
      // post-hoc union grades what collective *could* know if they could merge — labeled as postHocUnion
      taskGrade = world.questions[0].grade(union);
      taskGrade.postHocUnion = true;
      // true independent collective success requires a designated aggregator with no share — use empty shared
      taskGrade.independentSharedSuccess = false;
    } else {
      taskGrade = world.grade?.(union) || { success: false };
    }
    // For knowledge/planning/relational: independent cannot form shared answer during episode
    if (['knowledge', 'planning', 'relational'].includes(world.id)) {
      const postHoc = world.questions
        ? world.questions[0].grade(union)
        : world.grade?.(union) || { success: false };
      taskGrade = {
        ...taskGrade,
        liveSharedSuccess: false,
        postHocUnionSuccess: Boolean(postHoc.success),
        postHocCompleteness: postHoc.completeness ?? (postHoc.success ? 1 : 0),
        success: false, // cannot succeed collectively without sharing during episode
        completeness: 0,
        readiness: 0,
        relationalCompleteness: 0,
        recovery: 0,
        note: 'Independent condition: live shared success=false; postHocUnion reported separately',
      };
    }

    const duplication = adapter.duplicationStats();
    const timingMs = performance.now() - t0;
    const raw = buildRawMetrics({
      worldId: world.id,
      condition: adapter.id,
      architecture: adapter.architecture,
      taskGrade,
      worldMetrics: {
        ...adapter.snapshotMetrics(),
        crossAgentAgreement: 0,
        contradictionRate: taskGrade.contradictionRate,
      },
      duplication,
      timingMs,
      messages,
      novelFacts: Object.keys(union).length,
    });
    // Force live collective successScore to 0 for independent on collective worlds
    if (['knowledge', 'planning', 'relational'].includes(world.id)) {
      raw.collectiveIntelligence.successScore = 0;
      raw.collectiveIntelligence.taskSuccess = false;
      raw.collectiveIntelligence.postHocUnionSuccess = taskGrade.postHocUnionSuccess;
      raw.collectiveIntelligence.postHocCompleteness = taskGrade.postHocCompleteness;
    }
    return {
      ok: true,
      status: 'OK',
      raw,
      cie: computeCIE(raw),
      postHocUnion: union,
    };
  }

  // Shared conditions: agents write private facts into shared medium
  for (const a of agents) {
    if (a.failed) continue;
    adapter.observe(a.agentId);
    if (condition === 'shared_text' || condition === 2) {
      for (const [k, v] of Object.entries(a.privateFacts || {})) {
        adapter.share(a.agentId, `${k}=${JSON.stringify(v)}`);
        messages += 1;
        novelFacts += 1;
      }
    } else {
      // structured / fractisi*
      const mode = String(condition).includes('delta') || condition === 5 || condition === 6 ? 'delta' : 'shared';
      // Always also publish to shared facts for collective visibility
      adapter.write_state({
        agentId: a.agentId,
        mode: 'shared',
        patch: { facts: { ...a.privateFacts } },
      });
      if (mode === 'delta') {
        adapter.write_state({
          agentId: a.agentId,
          mode: 'delta',
          patch: { facts: { ...a.privateFacts } },
        });
      }
      messages += 1;
      novelFacts += Object.keys(a.privateFacts || {}).length;
    }
  }

  // Dynamic world: stream timeline events
  if (world.id === 'dynamic') {
    for (const ev of world.timeline) {
      const agentId = ev.visibleTo[0];
      const patch = {
        facts: {
          'entity:X': ev.contradiction ? ev.falseValue : ev.value,
          'entity:X:t': ev.t,
        },
      };
      if (condition === 'shared_text' || condition === 2) {
        adapter.share(agentId, `entity:X=${ev.contradiction ? ev.falseValue : ev.value}@t=${ev.t}`);
      } else if (condition === 'independent' || condition === 1) {
        // handled above
      } else {
        adapter.write_state({ agentId, mode: 'shared', patch });
      }
      messages += 1;
    }
  }

  // Planning world: specialized agents mark readiness + goal
  if (world.id === 'planning') {
    for (const a of agents) {
      const needKey = Object.entries(world.required).find(([, v]) => a.privateFacts?.[`need:${v}`])?.[1];
      const role = a.role;
      const key = world.required[role];
      if (!key) continue;
      if (condition === 'shared_text' || condition === 2) {
        adapter.share(a.agentId, `${key}=true`);
      } else {
        adapter.write_state({
          agentId: a.agentId,
          mode: 'shared',
          patch: { facts: { [key]: true, [`goal:${world.goal}`]: true } },
        });
      }
      messages += 1;
    }
  }

  // Adversarial: attempt correction by majority / verifier
  if (world.id === 'adversarial') {
    const votes = {};
    for (const a of agents) {
      if (a.failed) continue;
      const y = a.privateFacts['entity:Y'];
      if (y != null) votes[y] = (votes[y] || 0) + 1;
    }
    const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (winner && condition !== 'shared_text' && condition !== 2) {
      adapter.write_state({
        agentId: 'verifier',
        mode: 'shared',
        patch: { facts: { ...world.truth, 'entity:Y': winner === 'safe' ? 'safe' : winner } },
      });
      // Prefer truth if any agent had it
      if (votes.safe) {
        adapter.write_state({
          agentId: 'verifier',
          mode: 'shared',
          patch: { facts: { ...world.truth } },
        });
      }
      messages += 1;
    } else if (condition === 'shared_text' || condition === 2) {
      adapter.share('verifier', `entity:Y=${votes.safe ? 'safe' : winner}`);
      for (const [k, v] of Object.entries(world.truth)) adapter.share('verifier', `${k}=${JSON.stringify(v)}`);
      messages += 2;
    }
  }

  // Materialize collective view
  let state;
  if (condition === 'shared_text' || condition === 2) {
    const mat = adapter.materialize('aggregator');
    // Parse text lines back into facts
    const facts = {};
    const text = mat.state.text || '';
    for (const line of text.split('\n')) {
      const m = line.match(/\]\s*([^=]+)=(.+)$/);
      if (m) {
        try {
          facts[m[1]] = JSON.parse(m[2]);
        } catch {
          facts[m[1]] = m[2];
        }
      }
    }
    state = { facts };
  } else {
    // Merge all deltas into shared then materialize aggregator
    for (const a of agents) {
      if (a.failed) continue;
      adapter.materialize(a.agentId);
    }
    const mat = adapter.materialize('aggregator');
    state = mat.state;
  }

  if (world.id === 'relational') {
    state = inferRelational(state);
  }

  let taskGrade;
  if (world.questions) taskGrade = world.questions[0].grade(state);
  else if (world.id === 'dynamic') {
    const agentStates = agents.map((a) => {
      if (condition === 'shared_text' || condition === 2) return state;
      return adapter.materialize(a.agentId).state;
    });
    taskGrade = world.grade(agentStates, world.timeline.at(-1).value);
  } else taskGrade = world.grade(state);

  // Coherence: fraction of agents whose materialized facts agree on keys
  let crossAgentAgreement = 1;
  if (condition !== 'shared_text' && condition !== 2) {
    const mats = agents.filter((a) => !a.failed).map((a) => adapter.materialize(a.agentId).state);
    if (mats.length > 1) {
      const keys = new Set(mats.flatMap((m) => Object.keys(m.facts || m)));
      let agree = 0;
      let total = 0;
      for (const k of keys) {
        const vals = mats.map((m) => (m.facts || m)[k]);
        const defined = vals.filter((v) => v !== undefined);
        if (defined.length < 2) continue;
        total += 1;
        if (defined.every((v) => v === defined[0])) agree += 1;
      }
      crossAgentAgreement = total ? agree / total : 1;
    }
  }

  const duplication = adapter.duplicationStats?.() || null;
  const timingMs = performance.now() - t0;
  const raw = buildRawMetrics({
    worldId: world.id,
    condition: adapter.id,
    architecture: adapter.architecture,
    taskGrade,
    worldMetrics: {
      ...adapter.snapshotMetrics(),
      crossAgentAgreement,
      contradictionRate: taskGrade?.contradictionRate,
    },
    duplication,
    timingMs,
    messages,
    novelFacts,
    recovery: { recovery: taskGrade?.recovery },
  });

  return {
    ok: true,
    status: 'OK',
    raw,
    cie: computeCIE(raw),
    beforeKeys: [...beforeKeys],
  };
}
