/**
 * Relational intelligence demo — LINEAR / FLAT / AWARE architecture control.
 * Mirrors the E9–E11 claim shape for Test Drive visitors (no LLM, no account).
 * Honesty: regenerable synthetic couplings — not a live PDB/Hotpot/FRED re-run.
 */

export const RELATIONAL_DEMO_SEED = 20261117;
export const RELATIONAL_DEMO_N = 24;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build N tasks: each has a true long-range partner among distractors.
 * Couplings board ranks the true partner first for AWARE; LINEAR/FLAT never see ranks.
 */
export function buildRelationalTasks(n = RELATIONAL_DEMO_N, seed = RELATIONAL_DEMO_SEED) {
  const rnd = mulberry32(seed);
  const tasks = [];
  for (let i = 0; i < n; i += 1) {
    const partnerCount = 5;
    const partners = Array.from({ length: partnerCount }, (_, j) => `P${i}-${j}`);
    const trueIdx = Math.floor(rnd() * partnerCount);
    const truePartner = partners[trueIdx];
    const localWindow = [`L${i}-a`, `L${i}-b`, partners[(trueIdx + 1) % partnerCount]];
    const flatBag = [...partners, ...localWindow].sort(() => rnd() - 0.5);
    const couplings = partners
      .map((p) => ({
        id: p,
        score: p === truePartner ? 0.92 + rnd() * 0.07 : rnd() * 0.35,
      }))
      .sort((a, b) => b.score - a.score);
    tasks.push({
      id: `T${i}`,
      truePartner,
      localWindow,
      flatBag,
      couplings,
    });
  }
  return tasks;
}

function recoverLinear(task) {
  // Sequence-local: only sees local window; true partner almost never there.
  const hit = task.localWindow.find((x) => x === task.truePartner);
  return hit || task.localWindow[0];
}

function recoverFlat(task) {
  // Unstructured dump: pick first token — no coupling order.
  return task.flatBag[0];
}

function recoverAware(task) {
  // Relational board: take top coupling.
  return task.couplings[0].id;
}

export function runRelationalIntelligenceDemo(opts = {}) {
  const n = opts.n ?? RELATIONAL_DEMO_N;
  const seed = opts.seed ?? RELATIONAL_DEMO_SEED;
  const tasks = buildRelationalTasks(n, seed);
  let linear = 0;
  let flat = 0;
  let aware = 0;
  for (const task of tasks) {
    if (recoverLinear(task) === task.truePartner) linear += 1;
    if (recoverFlat(task) === task.truePartner) flat += 1;
    if (recoverAware(task) === task.truePartner) aware += 1;
  }
  return {
    seed,
    n,
    linear,
    flat,
    aware,
    linearRate: linear / n,
    flatRate: flat / n,
    awareRate: aware / n,
    honesty:
      'Architecture control on seeded synthetic couplings. Same claim shape as E9–E11 (LINEAR/FLAT/AWARE exact partner recovery). Not a live LLM re-run of PDB, HotpotQA, or FRED.',
  };
}
