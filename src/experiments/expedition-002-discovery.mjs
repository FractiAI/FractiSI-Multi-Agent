/**
 * Expedition 002 · E2 discovery + convergence lab (architectural).
 * Flat skim vs relationship-guided reconstruction under a fixed budget.
 * Not an LLM-agent bake-off.
 */
export const EXP002_SEED = 20261105;
export const EXP002_DISCOVERY = Object.freeze({
  scenarios: 100,
  hops: 6,
  flatBudget: 40,
});

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildScenario(rand, scenarioId) {
  const hops = EXP002_DISCOVERY.hops;
  const nodes = [];
  for (let h = 0; h < hops; h++) {
    nodes.push({
      id: `${scenarioId}-h${h}`,
      hop: h,
      dept: ['ops', 'finance', 'legal', 'eng', 'sales', 'support'][h],
      next: h < hops - 1 ? `${scenarioId}-h${h + 1}` : null,
      signal: h === hops - 1 ? `SOLUTION-${scenarioId}` : null,
      noise: Math.floor(rand() * 1e9),
    });
  }
  const fillers = [];
  for (let i = 0; i < 200; i++) {
    fillers.push({
      id: `${scenarioId}-f${i}`,
      hop: -1,
      dept: 'noise',
      next: null,
      signal: null,
      noise: Math.floor(rand() * 1e9),
    });
  }
  const byId = Object.fromEntries([...nodes, ...fillers].map((n) => [n.id, n]));
  return {
    scenarioId,
    nodes,
    fillers,
    byId,
    startId: nodes[0].id,
    solution: nodes[hops - 1].signal,
  };
}

function flatRetrieve(scenario, budget) {
  const corpus = [...scenario.fillers, ...scenario.nodes];
  const picked = corpus.slice(0, budget);
  const ids = new Set(picked.map((p) => p.id));
  const chainComplete = scenario.nodes.every((n) => ids.has(n.id));
  return {
    ops: budget,
    chainComplete,
    solution: chainComplete ? scenario.solution : null,
  };
}

function relationshipGuided(scenario) {
  let ops = 0;
  let cur = scenario.byId[scenario.startId];
  const seen = [];
  while (cur) {
    seen.push(cur);
    ops++;
    if (!cur.next) break;
    cur = scenario.byId[cur.next];
  }
  const chainComplete = seen.length === EXP002_DISCOVERY.hops;
  return {
    ops,
    chainComplete,
    solution: chainComplete ? scenario.solution : null,
    rounds: Math.ceil(EXP002_DISCOVERY.hops / 2),
  };
}

/** E2 — discovery + architectural convergence under fixed budget. */
export function runDiscoveryConvergenceBenchmark(seed = EXP002_SEED + 1) {
  const rand = mulberry32(seed);
  const { scenarios, hops, flatBudget } = EXP002_DISCOVERY;
  let flatWins = 0;
  let guidedWins = 0;
  let flatOps = 0;
  let guidedOps = 0;
  const roundsFlat = hops;
  const roundsGuided = Math.ceil(hops / 2);

  for (let s = 0; s < scenarios; s++) {
    const scenario = buildScenario(rand, s);
    const flat = flatRetrieve(scenario, flatBudget);
    const guided = relationshipGuided(scenario);
    flatOps += flat.ops;
    guidedOps += guided.ops;
    if (flat.chainComplete && flat.solution === scenario.solution) flatWins++;
    if (guided.chainComplete && guided.solution === scenario.solution) guidedWins++;
  }

  return {
    id: 'E2_discovery_collective',
    pass: guidedWins === scenarios && flatWins === 0,
    scenarios,
    hops,
    flatBudget,
    flat: {
      discoveries: flatWins,
      solutions: flatWins,
      meanOps: flatOps / scenarios,
      propagationRounds: roundsFlat,
    },
    fractisi: {
      discoveries: guidedWins,
      solutions: guidedWins,
      meanOps: guidedOps / scenarios,
      propagationRounds: roundsGuided,
    },
    opsReduction: 1 - guidedOps / flatOps,
    roundsReduction: 1 - roundsGuided / roundsFlat,
  };
}
