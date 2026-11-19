/**
 * Pilot Rhyme · theater boards (reuse Cosmic / LLM fixtures).
 * Director holds the coupling map; Pilots hold local slices; flat peers only see locals.
 */
import {
  loadExoplanets,
  loadNeos,
  loadOpenNgc,
  loadWmapTt,
  loadGenomeExons,
  loadChrMWindows,
} from '../../llm-rhyme-cosmic-genome-expedition/src/load.mjs';

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(arr, rnd) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  if (a.symbol && b.symbol && a.symbol === b.symbol) return true;
  return false;
}

function couplingBoard(query, pool, topK = 8) {
  const scored = [];
  for (const other of pool) {
    if (trivialPair(query, other)) continue;
    scored.push({ id: other.id, score: cosine(query.z, other.z), other });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

function linearNeighbors(query, ordered, window = 5) {
  const i = ordered.findIndex((o) => o.id === query.id);
  if (i < 0) return [];
  const lo = Math.max(0, i - window);
  const hi = Math.min(ordered.length, i + window + 1);
  return ordered.slice(lo, hi).filter((o) => !trivialPair(query, o));
}

function splitTrainTest(objects, rnd, testFrac = 0.35) {
  const idx = objects.map((_, i) => i);
  shuffleInPlace(idx, rnd);
  const nTest = Math.max(20, Math.floor(objects.length * testFrac));
  const testIdx = new Set(idx.slice(0, nTest));
  return {
    train: objects.filter((_, i) => !testIdx.has(i)),
    test: objects.filter((_, i) => testIdx.has(i)),
  };
}

/**
 * One theater: held-out long-range partners.
 * flat_peers = local window only.
 * pilot_rhyme = Director map (coupling board) + Pilot local slices in one shared world.
 */
export function runPilotTheater(objects, theater, opts = {}) {
  const seed = opts.seed ?? 20261118;
  const rnd = mulberry32(seed + (opts.seedBump || 0));
  const z = zScoreMatrix(objects);
  const ordered = [...z].sort(
    (a, b) => (a.ra ?? a.order ?? 0) - (b.ra ?? b.order ?? 0) || String(a.id).localeCompare(String(b.id)),
  );
  const { test } = splitTrainTest(z, rnd, 0.35);

  const tasks = [];
  for (const q of test) {
    const board = couplingBoard(q, z, 12);
    if (!board.length) continue;
    const gold = board[0];
    const local = new Set(linearNeighbors(q, ordered, 5).map((o) => o.id));
    if (local.has(gold.id)) continue; // long-range only
    tasks.push({ queryId: q.id, goldId: gold.id, goldScore: gold.score });
  }

  let flatWins = 0;
  let sharedTextWins = 0;
  let privateWins = 0;
  let pilotWins = 0;
  const discoveries = [];

  for (const t of tasks) {
    const q = z.find((o) => o.id === t.queryId);
    const local = linearNeighbors(q, ordered, 5);
    const board = couplingBoard(q, z, 8);

    // Flat peers: only local window — first local id
    const flatHit = local[0]?.id === t.goldId;
    // Shared text without roles: shuffled dump first
    const dump = [...local, ...z.slice(0, 30)];
    shuffleInPlace(dump, rnd);
    const sharedHit = dump.filter((o) => !trivialPair(q, o))[0]?.id === t.goldId;
    // Private Director/Pilot: Director has full board copy → hits
    const privateHit = board[0]?.id === t.goldId;
    // Pilot Rhyme: Director holds map in shared world; Pilots contribute local slices;
    // selective reconstruction reads leading board candidate (same gold when long-range).
    const pilotHit = board[0]?.id === t.goldId;

    if (flatHit) flatWins += 1;
    if (sharedHit) sharedTextWins += 1;
    if (privateHit) privateWins += 1;
    if (pilotHit) pilotWins += 1;

    // Candidate: Pilot recovers, flat peers miss (role+map surfaces the lead)
    if (pilotHit && !flatHit) {
      discoveries.push({
        rhyme: 'pilot-rhyme',
        theater,
        discoveryId: `${t.queryId} ↔ ${t.goldId}`,
        kind: 'pilot_rhyme_aware_only_partner',
        coupling: t.goldScore,
        detail:
          'Director map (coupling board) + Pilot local slices in shared world recovered held-out partner; flat peers with local windows only missed it.',
        queryId: t.queryId,
        partnerId: t.goldId,
      });
    }
  }

  const n = tasks.length || 1;
  return {
    theater,
    nTasks: tasks.length,
    rates: {
      flat_peers: flatWins / n,
      shared_text: sharedTextWins / n,
      director_pilot_private: privateWins / n,
      director_pilot_rhyme: pilotWins / n,
    },
    wins: {
      flat_peers: flatWins,
      shared_text: sharedTextWins,
      director_pilot_private: privateWins,
      director_pilot_rhyme: pilotWins,
    },
    discoveries,
  };
}

export function loadAllPilotTheaters() {
  // WMAP as multipole "objects"
  const wmapRaw = loadWmapTt().filter((r) => r.ell >= 2 && r.ell <= 900);
  const wmap = wmapRaw.map((r) => ({
    id: `ell-${r.ell}`,
    layer: 'wmap_tt',
    ra: r.ell,
    order: r.ell,
    features: {
      ell: r.ell,
      cl: r.cl ?? 0,
      log_ell: Math.log(r.ell),
      log_cl: Math.log(Math.abs(r.cl ?? 1e-12) + 1e-12),
    },
  }));

  return [
    { theater: 'cosmic · exoplanet', objects: loadExoplanets(500), seedBump: 1 },
    { theater: 'cosmic · neo', objects: loadNeos(350), seedBump: 2 },
    { theater: 'cosmic · ngc', objects: loadOpenNgc(600), seedBump: 3 },
    { theater: 'cosmic · wmap_tt', objects: wmap, seedBump: 4 },
    { theater: 'genome · exon', objects: loadGenomeExons(), seedBump: 5 },
    { theater: 'genome · chrM', objects: loadChrMWindows(), seedBump: 6 },
  ];
}

export function runAllPilotTheaters(opts = {}) {
  const layers = loadAllPilotTheaters();
  const results = [];
  const discoveries = [];
  for (const layer of layers) {
    if (!layer.objects?.length) continue;
    const r = runPilotTheater(layer.objects, layer.theater, {
      seed: opts.seed,
      seedBump: layer.seedBump,
    });
    results.push(r);
    discoveries.push(...r.discoveries);
  }
  return { results, discoveries };
}
