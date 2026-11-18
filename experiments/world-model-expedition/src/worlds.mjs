/**
 * Experimental worlds A–D + relational intelligence world.
 * Environments are deterministic fixtures — regenerable, seedable.
 */

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** World A — Shared Knowledge World (chain A+B+C+D+E) */
export function createKnowledgeWorld(opts = {}) {
  const chain = opts.chain || ['A', 'B', 'C', 'D', 'E'];
  const nAgents = opts.nAgents || Math.max(2, chain.length - 1);
  const overlapping = [];
  for (let i = 0; i < nAgents; i++) {
    const left = chain[i % (chain.length - 1)];
    const right = chain[(i % (chain.length - 1)) + 1];
    overlapping.push({
      agentId: `agent_${i}`,
      role: i % 2 === 0 ? 'researcher' : 'verifier',
      privateFacts: {
        [`pair:${left}+${right}`]: true,
        [`frag:${left}`]: left,
        [`frag:${right}`]: right,
      },
    });
  }
  const target = chain.join('+');
  return {
    id: 'knowledge',
    class: 'A',
    title: 'Shared Knowledge World',
    chain,
    target,
    agents: overlapping,
    questions: [
      {
        id: 'q_full_chain',
        ask: `Reconstruct the full chain`,
        grade: (state) => {
          const facts = state.facts || state;
          const frags = chain.filter((c) => facts[`frag:${c}`] === c || facts[`frag:${c}`] === true);
          const pairs = [];
          for (let i = 0; i < chain.length - 1; i++) {
            const k = `pair:${chain[i]}+${chain[i + 1]}`;
            if (facts[k]) pairs.push(k);
          }
          const complete = frags.length === chain.length && pairs.length === chain.length - 1;
          return {
            success: complete,
            completeness: (frags.length + pairs.length) / (chain.length + chain.length - 1),
            frags: frags.length,
            pairs: pairs.length,
            target,
          };
        },
      },
    ],
  };
}

/** World B — Dynamic World */
export function createDynamicWorld(opts = {}) {
  const steps = opts.steps || 8;
  const nAgents = opts.nAgents || 4;
  const rnd = mulberry32(opts.seed ?? 42);
  const timeline = [];
  let value = 0;
  for (let t = 0; t < steps; t++) {
    const delta = Math.floor(rnd() * 5) - 2;
    value += delta;
    const event = {
      t,
      entity: 'X',
      value,
      delta,
      visibleTo: [`agent_${Math.floor(rnd() * nAgents)}`],
      contradiction: rnd() < (opts.contradictionRate || 0.15),
    };
    if (event.contradiction) {
      event.falseValue = value + 10;
    }
    timeline.push(event);
  }
  return {
    id: 'dynamic',
    class: 'B',
    title: 'Dynamic World',
    nAgents,
    timeline,
    agents: Array.from({ length: nAgents }, (_, i) => ({
      agentId: `agent_${i}`,
      role: 'observer',
    })),
    grade: (agentStates, lastTruth) => {
      let stale = 0;
      let contradictions = 0;
      let fresh = 0;
      for (const st of agentStates) {
        const v = st.facts?.['entity:X'] ?? st['entity:X'];
        if (v === lastTruth) fresh += 1;
        else if (v == null) stale += 1;
        else contradictions += 1;
      }
      return {
        success: fresh === agentStates.length,
        stateFreshness: agentStates.length ? fresh / agentStates.length : 0,
        staleStateRate: agentStates.length ? stale / agentStates.length : 0,
        contradictionRate: agentStates.length ? contradictions / agentStates.length : 0,
        lastTruth,
      };
    },
  };
}

/** World C — Multi-Agent Planning World */
export function createPlanningWorld(opts = {}) {
  const nAgents = opts.nAgents || 5;
  const roles = ['planner', 'researcher', 'executor', 'critic', 'verifier'];
  const goal = opts.goal || 'ship_release';
  const required = {
    planner: 'plan:ready',
    researcher: 'research:ready',
    executor: 'exec:ready',
    critic: 'critique:ready',
    verifier: 'verify:ready',
  };
  const agents = Array.from({ length: nAgents }, (_, i) => ({
    agentId: `agent_${i}`,
    role: roles[i % roles.length],
    privateFacts: {
      [`capability:${roles[i % roles.length]}`]: true,
      [`need:${required[roles[i % roles.length]]}`]: true,
    },
  }));
  return {
    id: 'planning',
    class: 'C',
    title: 'Multi-Agent Planning World',
    goal,
    required,
    agents,
    grade: (state) => {
      const facts = state.facts || state;
      const hits = Object.values(required).filter((k) => facts[k]);
      const success = hits.length === Object.keys(required).length && facts[`goal:${goal}`] === true;
      return {
        success,
        readiness: hits.length / Object.keys(required).length,
        hits: hits.length,
        goalSet: facts[`goal:${goal}`] === true,
      };
    },
  };
}

/** World D — Adversarial / Perturbed World */
export function createAdversarialWorld(opts = {}) {
  const nAgents = opts.nAgents || 6;
  const rnd = mulberry32(opts.seed ?? 99);
  const truth = { 'entity:Y': 'safe', 'rel:Y-Z': 'coupled', 'control:Z-W': true };
  const agents = Array.from({ length: nAgents }, (_, i) => {
    const noise = rnd() < 0.35;
    const fail = rnd() < (opts.failRate || 0.2);
    return {
      agentId: `agent_${i}`,
      role: fail ? 'failed' : 'worker',
      failed: fail,
      privateFacts: noise
        ? { 'entity:Y': 'unsafe', 'noise:injected': true }
        : { [`slice:${i}`]: true, ...(i % 3 === 0 ? { 'entity:Y': 'safe' } : {}), ...(i % 3 === 1 ? { 'rel:Y-Z': 'coupled' } : {}), ...(i % 3 === 2 ? { 'control:Z-W': true } : {}) },
    };
  });
  return {
    id: 'adversarial',
    class: 'D',
    title: 'Adversarial / Perturbed World',
    truth,
    agents,
    grade: (state) => {
      const facts = state.facts || state;
      let correct = 0;
      let wrong = 0;
      for (const [k, v] of Object.entries(truth)) {
        if (facts[k] === v) correct += 1;
        else if (facts[k] !== undefined) wrong += 1;
      }
      return {
        success: correct === Object.keys(truth).length && facts['entity:Y'] !== 'unsafe',
        correct,
        wrong,
        corrupted: facts['entity:Y'] === 'unsafe',
        recovery: correct / Object.keys(truth).length,
      };
    },
  };
}

/** Relational intelligence world — answer requires multi-agent relational structure */
export function createRelationalWorld(opts = {}) {
  const nAgents = opts.nAgents || 3;
  const agents = [
    {
      agentId: 'agent_0',
      role: 'perception',
      privateFacts: { 'rel:X-near-Y': true, 'entity:X': 'present', 'entity:Y': 'present' },
    },
    {
      agentId: 'agent_1',
      role: 'dynamics',
      privateFacts: { 'rel:Y-moves-with-Z': true, 'entity:Z': 'present' },
    },
    {
      agentId: 'agent_2',
      role: 'control',
      privateFacts: { 'rel:Z-controlled-by-W': true, 'entity:W': 'controller' },
    },
  ].slice(0, nAgents);
  // Pad if more agents
  while (agents.length < nAgents) {
    const i = agents.length;
    agents.push({
      agentId: `agent_${i}`,
      role: 'explorer',
      privateFacts: { [`noise:${i}`]: true },
    });
  }
  return {
    id: 'relational',
    class: 'relational',
    title: 'Relational Intelligence World',
    question: 'Is X indirectly controlled by W?',
    answer: true,
    agents,
    grade: (state) => {
      const facts = state.facts || state;
      const has =
        facts['rel:X-near-Y'] && facts['rel:Y-moves-with-Z'] && facts['rel:Z-controlled-by-W'];
      const inferred = facts['infer:X-controlled-by-W'] === true || (has && facts['infer:attempted']);
      return {
        success: Boolean(has && (facts['infer:X-controlled-by-W'] === true)),
        relationalCompleteness:
          [facts['rel:X-near-Y'], facts['rel:Y-moves-with-Z'], facts['rel:Z-controlled-by-W']].filter(
            Boolean,
          ).length / 3,
        inferred: Boolean(inferred),
        hasFullChain: Boolean(has),
      };
    },
  };
}

export function createWorld(kind, opts = {}) {
  switch (kind) {
    case 'knowledge':
    case 'A':
      return createKnowledgeWorld(opts);
    case 'dynamic':
    case 'B':
      return createDynamicWorld(opts);
    case 'planning':
    case 'C':
      return createPlanningWorld(opts);
    case 'adversarial':
    case 'D':
      return createAdversarialWorld(opts);
    case 'relational':
      return createRelationalWorld(opts);
    default:
      throw new Error(`Unknown world: ${kind}`);
  }
}
