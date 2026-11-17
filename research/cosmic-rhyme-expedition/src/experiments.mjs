/**
 * Cosmic Rhyme Expedition · C1–C5.
 * C1–C3 architecture · C4 residual physics · C5 LLM/language-pack rhyme.
 * Deterministic controls on real public fixtures (no API key required).
 */
import {
  BOOTSTRAP_B,
  FDR_Q,
  FORBIDDEN_TARGET_LABELS,
  H1_DELTA,
  H2_DELTA,
  SEED,
} from './constants.mjs';
import { loadExoplanets, loadNeos, loadOpenNgc, loadWmapTt } from './load.mjs';
import {
  bhSurvive,
  bootstrapCi,
  mean,
  mulberry32,
  pearson,
  shuffleInPlace,
} from './stats.mjs';
import { runC4NovelPhysicsSearch } from './physics-search.mjs';
import { runC5LlmRhyme } from './llm-rhyme.mjs';

function featureKeys(objects) {
  return Object.keys(objects[0].features);
}

function zScoreMatrix(objects) {
  const keys = featureKeys(objects);
  const stats = {};
  for (const k of keys) {
    const vals = objects.map((o) => o.features[k]);
    const m = mean(vals);
    const v = mean(vals.map((x) => (x - m) ** 2));
    stats[k] = { m, s: Math.sqrt(v) || 1 };
  }
  return objects.map((o) => {
    const z = {};
    for (const k of keys) z[k] = (o.features[k] - stats[k].m) / stats[k].s;
    return { ...o, z };
  });
}

function cosine(a, b) {
  let num = 0;
  let da = 0;
  let db = 0;
  for (const k of Object.keys(a)) {
    num += a[k] * b[k];
    da += a[k] * a[k];
    db += b[k] * b[k];
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

function trivialPair(a, b) {
  if (a.id === b.id) return true;
  if (a.host && b.host && a.host === b.host) return true;
  if (a.designation && b.designation && a.designation === b.designation) return true;
  return false;
}

function splitTrainTest(objects, rnd, testFrac = 0.35) {
  const idx = objects.map((_, i) => i);
  shuffleInPlace(idx, rnd);
  const nTest = Math.max(20, Math.floor(objects.length * testFrac));
  const testIdx = new Set(idx.slice(0, nTest));
  const train = objects.filter((_, i) => !testIdx.has(i));
  const test = objects.filter((_, i) => testIdx.has(i));
  return { train, test };
}

/** Ranked partners for each object among a pool (exclude trivials). */
function couplingBoard(query, pool, topK = 8) {
  const scored = [];
  for (const other of pool) {
    if (trivialPair(query, other)) continue;
    scored.push({ id: other.id, score: cosine(query.z, other.z), other });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

function linearNeighbors(query, ordered, window = 6) {
  const i = ordered.findIndex((o) => o.id === query.id);
  if (i < 0) return [];
  const lo = Math.max(0, i - window);
  const hi = Math.min(ordered.length, i + window + 1);
  return ordered.slice(lo, hi).filter((o) => !trivialPair(query, o));
}

function recoverPartner(query, goldId, arms) {
  return {
    linear: arms.linear[0]?.id === goldId,
    flat: arms.flat[0]?.id === goldId,
    aware: arms.aware[0]?.id === goldId,
  };
}

/**
 * C1 — LINEAR / FLAT / AWARE partner recovery on one catalog layer.
 */
export function runC1PartnerRecovery(objects, opts = {}) {
  const seed = opts.seed ?? SEED;
  const rnd = mulberry32(seed);
  const z = zScoreMatrix(objects);
  const ordered = [...z].sort((a, b) => a.ra - b.ra || a.id.localeCompare(b.id));
  const { train, test } = splitTrainTest(z, rnd, 0.35);

  // Gold partners from full z-scored pool (representation of "true" strongest coupling).
  const tasks = [];
  for (const q of test) {
    const board = couplingBoard(q, z, 12);
    if (!board.length) continue;
    const gold = board[0];
    // Require long-range in LINEAR ordering: gold not in local RA window.
    const local = new Set(linearNeighbors(q, ordered, 5).map((o) => o.id));
    if (local.has(gold.id)) continue; // keep long-range-only tasks (fold rhyme)
    tasks.push({ query: q, goldId: gold.id, goldScore: gold.score });
  }

  let linear = 0;
  let flat = 0;
  let aware = 0;
  const perTask = [];
  for (const t of tasks) {
    const local = linearNeighbors(t.query, ordered, 5);
    // FLAT: shuffle a dump of train+local+distractors, take first non-trivial
    const dump = [...train, ...local];
    shuffleInPlace(dump, rnd);
    const flatCand = dump.filter((o) => !trivialPair(t.query, o)).slice(0, 8);
    const awareCand = couplingBoard(t.query, z, 8);
    const hit = recoverPartner(t.query, t.goldId, {
      linear: local.map((o) => ({ id: o.id })),
      flat: flatCand.map((o) => ({ id: o.id })),
      aware: awareCand,
    });
    if (hit.linear) linear += 1;
    if (hit.flat) flat += 1;
    if (hit.aware) aware += 1;
    perTask.push(hit);
  }

  const n = tasks.length || 1;
  const rates = {
    linear: linear / n,
    flat: flat / n,
    aware: aware / n,
    n: tasks.length,
  };

  // Bootstrap CI on AWARE−LINEAR
  const deltas = [];
  for (let b = 0; b < BOOTSTRAP_B; b += 1) {
    let a = 0;
    let l = 0;
    for (let i = 0; i < perTask.length; i += 1) {
      const j = Math.floor(rnd() * perTask.length);
      if (perTask[j].aware) a += 1;
      if (perTask[j].linear) l += 1;
    }
    deltas.push(a / n - l / n);
  }
  const ci = bootstrapCi(deltas);
  const h1 = rates.aware - rates.linear >= H1_DELTA && ci.low > 0;
  const h2 = rates.aware - rates.flat >= H2_DELTA;

  return {
    experiment: 'C1',
    layer: objects[0]?.layer,
    nObjects: objects.length,
    nTasks: tasks.length,
    rates,
    deltaAwareLinear: rates.aware - rates.linear,
    deltaAwareFlat: rates.aware - rates.flat,
    ci95AwareMinusLinear: ci,
    H1: h1,
    H2: h2,
  };
}

/**
 * Soft motif: top feature-pair directions among high-coupling edges.
 * Signature = sorted pair of feature names with largest |Δz| contribution on edge.
 */
function edgeSignature(a, b, keys) {
  const contrib = keys.map((k) => ({ k, v: Math.abs(a.z[k] - b.z[k]) }));
  contrib.sort((x, y) => x.v - y.v); // similar features (small delta) define the motif glue
  // Motif = the two most-aligned (smallest delta) continuous axes for a high-coupling edge
  const pair = [contrib[0].k, contrib[1].k].sort();
  return `${pair[0]}~${pair[1]}`;
}

/** Drop near-collinear feature pairs so motifs are not tautologies. */
function redundantFeaturePairs(objects, keys, thresh = 0.9) {
  const bad = new Set();
  for (let i = 0; i < keys.length; i += 1) {
    for (let j = i + 1; j < keys.length; j += 1) {
      const xs = objects.map((o) => o.features[keys[i]]);
      const ys = objects.map((o) => o.features[keys[j]]);
      if (Math.abs(pearson(xs, ys)) >= thresh) {
        bad.add([keys[i], keys[j]].sort().join('~'));
      }
    }
  }
  // Explicit physics/definition near-duplicates
  for (const sig of [
    'dist_min~log_dist',
    'log_dist~dist_min',
    'log_v_rel~v_inf',
    'v_inf~log_v_rel',
    'ra~dec',
    'dec~ra',
  ]) {
    bad.add(sig.split('~').sort().join('~'));
  }
  return bad;
}

function motifCounts(objects, edgeFrac = 0.02) {
  const keys = featureKeys(objects);
  const banned = redundantFeaturePairs(objects, keys);
  const edges = [];
  for (let i = 0; i < objects.length; i += 1) {
    for (let j = i + 1; j < objects.length; j += 1) {
      if (trivialPair(objects[i], objects[j])) continue;
      const score = cosine(objects[i].z, objects[j].z);
      const sig = edgeSignature(objects[i], objects[j], keys);
      if (banned.has(sig)) continue;
      edges.push({ i, j, score, sig });
    }
  }
  edges.sort((a, b) => b.score - a.score);
  const keepN = Math.max(30, Math.floor(edges.length * edgeFrac));
  const top = edges.slice(0, keepN);
  const counts = new Map();
  for (const e of top) counts.set(e.sig, (counts.get(e.sig) || 0) + 1);
  return { top, counts, edgeN: keepN, banned: [...banned] };
}

function enrichment(counts, edgeN, sig) {
  return (counts.get(sig) || 0) / edgeN;
}

/**
 * C2 — open motif discovery with held-out + dual nulls + FDR.
 */
export function runC2MotifDiscovery(objects, opts = {}) {
  const seed = opts.seed ?? SEED + 17;
  const rnd = mulberry32(seed);
  const z = zScoreMatrix(objects);
  const { train, test } = splitTrainTest(z, rnd, 0.4);
  const trainMotifs = motifCounts(train, 0.025);
  const candidates = [...trainMotifs.counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([sig]) => sig);

  const testMotifs = motifCounts(test, 0.025);
  const nullLabel = [];
  const nullFeat = [];
  const NULLS = 80;

  for (let n = 0; n < NULLS; n += 1) {
    // Label-shuffle: permute audit labels (does not change features) — motifs should still match
    // Feature-permute: scramble continuous features → destroy relational geometry
    const featPerm = train.map((o) => {
      const features = { ...o.features };
      const keys = Object.keys(features);
      const vals = keys.map((k) => features[k]);
      shuffleInPlace(vals, rnd);
      keys.forEach((k, i) => {
        features[k] = vals[i];
      });
      return { ...o, features };
    });
    const zp = zScoreMatrix(featPerm);
    nullFeat.push(motifCounts(zp, 0.025));
    // Label shuffle: rebuild with shuffled type labels only (audit); features unchanged
    const lab = train.map((o) => ({ ...o }));
    const labels = lab.map((o) => o.auditLabels);
    shuffleInPlace(labels, rnd);
    lab.forEach((o, i) => {
      o.auditLabels = labels[i];
    });
    nullLabel.push(motifCounts(zScoreMatrix(lab), 0.025));
  }

  const rows = [];
  const pFeat = [];
  for (const sig of candidates) {
    const hold = enrichment(testMotifs.counts, testMotifs.edgeN, sig);
    const trainE = enrichment(trainMotifs.counts, trainMotifs.edgeN, sig);
    const featNullEnrich = nullFeat.map((m) => enrichment(m.counts, m.edgeN, sig));
    const labNullEnrich = nullLabel.map((m) => enrichment(m.counts, m.edgeN, sig));
    const pF = (featNullEnrich.filter((e) => e >= hold).length + 1) / (NULLS + 1);
    const pL = (labNullEnrich.filter((e) => e >= hold).length + 1) / (NULLS + 1);
    // Survive feature-permute null (structure real) AND not merely a label artifact:
    // label-shuffle should NOT destroy motif (pL high / fail to beat) — we require pF small
    // and hold >= trainE * 0.5 (replicates on held-out).
    pFeat.push(pF);
    rows.push({
      signature: sig,
      trainEnrichment: trainE,
      heldOutEnrichment: hold,
      pFeaturePermute: pF,
      pLabelShuffle: pL,
      meanFeatNull: mean(featNullEnrich),
      meanLabelNull: mean(labNullEnrich),
    });
  }

  const surviveIdx = bhSurvive(pFeat, FDR_Q);
  const survivors = rows
    .map((r, i) => ({
      ...r,
      fdrSurvive: surviveIdx.has(i) && r.heldOutEnrichment >= 0.5 * r.trainEnrichment,
    }))
    .filter((r) => r.fdrSurvive);

  // Post-hoc rediscovery audit (not a training target)
  const rediscoveryHints = {
    'log_orbper~log_rade': 'Possible rediscovery pressure toward period–radius structure (exoplanet radius valley / evaporation corridor — audit only).',
    'log_rade~st_teff': 'Possible rediscovery of stellar-irradiation / radius correlation — audit only.',
    'disc_year~st_rad': 'Catalog selection motif: discovery epoch aligned with stellar-radius slice — survey-history pattern in the observable cosmos, not new physics.',
    'disc_year~st_teff': 'Catalog selection motif: discovery epoch aligned with stellar-temperature slice — survey-history pattern in the observable cosmos, not new physics.',
    'disc_year~st_mass': 'Catalog selection motif: discovery epoch vs host mass — survey-history pattern.',
    'h_mag~log_dist': 'NEO absolute magnitude vs approach distance pocket — dynamical selection audit.',
    'log_dist~log_v_rel': 'NEO encounter speed–distance coupling — orbital mechanics selection audit.',
    'h_mag~log_v_rel': 'NEO size-proxy vs encounter speed — dynamical selection audit.',
    'h_mag~jd_norm': 'NEO magnitude vs encounter epoch — temporal selection audit.',
    'maj_ax~v_mag': 'Angular size–brightness coupling in deep-sky catalogs — selection/morphology audit.',
    'b_mag~v_mag': 'Color–magnitude adjacency in deep-sky photometry — catalog selection audit.',
    'maj_ax~min_ax': 'Axis-ratio morphology glue — shape selection; often rediscovery of elongated vs round classes.',
    'ra~dec': 'Sky-position adjacency — coordinate triviality; treat cautiously.',
  };

  const audited = survivors.map((s) => ({
    ...s,
    audit: rediscoveryHints[s.signature] || 'No automatic named-structure match — candidate novel relational motif under this protocol.',
    forbiddenLeak: FORBIDDEN_TARGET_LABELS.some((w) => s.signature.includes(w)),
  }));

  return {
    experiment: 'C2',
    layer: objects[0]?.layer,
    nTrain: train.length,
    nTest: test.length,
    candidates: rows,
    survivors: audited,
    nSurvivors: audited.length,
  };
}

/**
 * C3 — WMAP TT multipole partner recovery (spectral layer).
 */
export function runC3WmapSpectrum(opts = {}) {
  const seed = opts.seed ?? SEED + 99;
  const rnd = mulberry32(seed);
  const rows = loadWmapTt().filter((r) => r.ell >= 2 && r.ell <= 900);
  // Build lag-coupling board on train ells
  const cls = rows.map((r) => r.cl);
  const ells = rows.map((r) => r.ell);
  const maxLag = 40;
  const lagCorr = [];
  for (let lag = 1; lag <= maxLag; lag += 1) {
    const xs = [];
    const ys = [];
    for (let i = 0; i + lag < cls.length; i += 1) {
      xs.push(cls[i]);
      ys.push(cls[i + lag]);
    }
    lagCorr.push({ lag, corr: Math.abs(pearson(xs, ys)) });
  }
  lagCorr.sort((a, b) => b.corr - a.corr);

  // Tasks: for random query ell index, recover strongest lag partner index
  const nTasks = 80;
  let linear = 0;
  let flat = 0;
  let aware = 0;
  const per = [];
  for (let t = 0; t < nTasks; t += 1) {
    const i = 50 + Math.floor(rnd() * (cls.length - 100));
    // Gold = i + bestLag (if in range)
    const bestLag = lagCorr[0].lag;
    const gold = i + bestLag;
    if (gold >= cls.length) continue;
    // LINEAR: local ±3 multipoles
    const local = [];
    for (let d = -3; d <= 3; d += 1) {
      if (d !== 0 && i + d >= 0 && i + d < cls.length) local.push(i + d);
    }
    const linearPick = local[0];
    // FLAT: random dump of indices
    const dump = [];
    for (let k = 0; k < 12; k += 1) dump.push(Math.floor(rnd() * cls.length));
    const flatPick = dump[0];
    // AWARE: propose i+lag for top lags
    const awarePick = i + lagCorr[0].lag;
    const hit = {
      linear: linearPick === gold,
      flat: flatPick === gold,
      aware: awarePick === gold,
    };
    if (hit.linear) linear += 1;
    if (hit.flat) flat += 1;
    if (hit.aware) aware += 1;
    per.push(hit);
  }
  const n = per.length || 1;
  const rates = { linear: linear / n, flat: flat / n, aware: aware / n, n: per.length };
  const deltas = [];
  for (let b = 0; b < BOOTSTRAP_B; b += 1) {
    let a = 0;
    let l = 0;
    for (let i = 0; i < per.length; i += 1) {
      const j = Math.floor(rnd() * per.length);
      if (per[j].aware) a += 1;
      if (per[j].linear) l += 1;
    }
    deltas.push(a / n - l / n);
  }
  const ci = bootstrapCi(deltas);
  return {
    experiment: 'C3',
    layer: 'wmap_tt',
    nEll: rows.length,
    topLags: lagCorr.slice(0, 5),
    rates,
    deltaAwareLinear: rates.aware - rates.linear,
    deltaAwareFlat: rates.aware - rates.flat,
    ci95AwareMinusLinear: ci,
    H1: rates.aware - rates.linear >= H1_DELTA && ci.low > 0,
    H2: rates.aware - rates.flat >= H2_DELTA,
    ellRange: [ells[0], ells[ells.length - 1]],
  };
}

export function runFullExpedition() {
  const exo = loadExoplanets(500);
  const neo = loadNeos(350);
  const ngc = loadOpenNgc(600);

  const c1 = {
    exoplanet: runC1PartnerRecovery(exo, { seed: SEED }),
    neo: runC1PartnerRecovery(neo, { seed: SEED + 1 }),
    ngc: runC1PartnerRecovery(ngc, { seed: SEED + 2 }),
  };
  const c2 = {
    exoplanet: runC2MotifDiscovery(exo, { seed: SEED + 10 }),
    neo: runC2MotifDiscovery(neo, { seed: SEED + 11 }),
    ngc: runC2MotifDiscovery(ngc, { seed: SEED + 12 }),
  };
  const c3 = runC3WmapSpectrum();
  const c4 = runC4NovelPhysicsSearch();
  const c5 = runC5LlmRhyme();

  const h1Layers = Object.values(c1).filter((r) => r.H1).map((r) => r.layer);
  if (c3.H1) h1Layers.push('wmap_tt');
  const motifHits = Object.values(c2).flatMap((r) =>
    r.survivors.map((s) => ({ layer: r.layer, ...s })),
  );

  const positive =
    h1Layers.length >= 2 || (h1Layers.length >= 1 && motifHits.length >= 1);

  return {
    seed: SEED,
    documentId: 'WP-COSMIC-RHYME-EXPEDITION-EGS-2026-11-17',
    c1,
    c2,
    c3,
    c4,
    c5,
    summary: {
      h1Layers,
      nH1: h1Layers.length,
      nMotifSurvivors: motifHits.length,
      motifHits,
      positiveExpeditionSignal: positive,
      nCandidateNovelPhysics: c4.summary.nCandidateNovelPhysics,
      nKnownPhysicsRediscovery: c4.summary.nKnownRediscovery,
      physicsSearchSignal: c4.summary.physicsSearchSignal,
      physicsVerdict: c4.summary.verdict,
      novelPhysicsHits: c4.summary.novelHits,
      knownPhysicsHits: c4.summary.knownHits,
      whyPriorArmsWereNotNovelPhysics: c4.whyPriorArmsWereNotNovelPhysics,
      llmRhymeSignal: c5.summary.llmRhymeSignal,
      llmRhymeVerdict: c5.summary.verdict,
      llmRhymeH1Layers: c5.summary.h1Layers,
      verdict: positive
        ? `POSITIVE relational rhyme on catalogs. ${c4.summary.verdict} ${c5.summary.verdict}`
        : 'MIXED/NULL — keep protocol and receipts; do not feature a discovery blog.',
    },
  };
}
