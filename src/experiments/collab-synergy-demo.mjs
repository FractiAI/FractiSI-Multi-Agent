/**
 * Collaboration synergy demo — whole > sum of parts (architecture control).
 * Mirrors E12 deterministic complementarity for Test Drive visitors.
 * Honesty: regenerable join rule — not a live HotpotQA LLM re-run.
 */

export const COLLAB_DEMO_SEED = 20261117;
export const COLLAB_DEMO_N = 100;

/**
 * Each item: part A holds TOKEN-A, part B holds TOKEN-B.
 * Joint product = TOKEN-A+TOKEN-B. Solos cannot form it; OR cannot;
 * wrong silo join cannot; shared awareness join can.
 */
export function runCollabSynergyDemo(opts = {}) {
  const n = opts.n ?? COLLAB_DEMO_N;
  const seed = opts.seed ?? COLLAB_DEMO_SEED;
  let soloA = 0;
  let soloB = 0;
  let independentOr = 0;
  let siloTeam = 0;
  let collabAware = 0;

  for (let i = 0; i < n; i += 1) {
    const tokenA = `TOKEN-A-${seed}-${i}`;
    const tokenB = `TOKEN-B-${seed}-${i}`;
    const joint = `${tokenA}+${tokenB}`;

    const soloAOut = tokenA;
    const soloBOut = tokenB;
    const orOut = soloAOut || soloBOut; // never joint
    const siloOut = `${tokenA}|${tokenB}`; // wrong join rule
    const collabOut = `${tokenA}+${tokenB}`; // shared join rule

    if (soloAOut === joint) soloA += 1;
    if (soloBOut === joint) soloB += 1;
    if (orOut === joint) independentOr += 1;
    if (siloOut === joint) siloTeam += 1;
    if (collabOut === joint) collabAware += 1;
  }

  return {
    seed,
    n,
    soloA,
    soloB,
    independentOr,
    siloTeam,
    collabAware,
    soloARate: soloA / n,
    soloBRate: soloB / n,
    orRate: independentOr / n,
    siloRate: siloTeam / n,
    collabRate: collabAware / n,
    synergyWholeGtSumParts: collabAware / n > independentOr / n,
    honesty:
      'Deterministic complementarity control (E12 architecture peer): solos/OR/wrong-join cannot form the joint token; shared join rule can. Not a live HotpotQA LLM synthesizer bake-off.',
  };
}
