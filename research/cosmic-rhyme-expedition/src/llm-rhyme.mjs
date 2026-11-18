/**
 * C5 — Cosmic LLM / language-pack rhyme (E9–E11 packing grammar on sky catalogs).
 *
 * Same LINEAR / FLAT / AWARE claim shape as the NVIDIA Goldilocks language arms,
 * but the material is public cosmic fixtures. Default runner is a deterministic
 * pack-compliant reader (no API key). Optional live LLM path if COSMIC_LLM_URL
 * + COSMIC_LLM_KEY are set — not required for CI.
 *
 * Honesty: board couplings are measured from catalog features, not invented by
 * a model. Pack-compliant recovery proves the rhyme lives in the language pack;
 * it is not a frontier bake-off and not novel physics.
 *
 * Legend map: see LLM_RHYME_LEGEND.md and export `LLM_RHYME_COSMIC_LEGEND`.
 */
import { SEED, H1_DELTA, H2_DELTA, BOOTSTRAP_B } from './constants.mjs';
import { loadExoplanets, loadNeos, loadOpenNgc, loadWmapTt } from './load.mjs';
import { bootstrapCi, mean, mulberry32, pearson, shuffleInPlace } from './stats.mjs';

/** Canonical legend: prior LLM/folding rhymes → cosmic data layers → pack arms. */
export const LLM_RHYME_COSMIC_LEGEND = Object.freeze({
  documentId: 'WP-COSMIC-RHYME-EXPEDITION-EGS-2026-11-17',
  arm: 'C5',
  oneLine:
    'Protein sequence:MSA board:contact = Knowledge passage:title board:title pair = Macro series:lag board:teleconnection = Cosmic catalog/spectrum:AWARE language pack:partner id',
  domainBridge: Object.freeze([
    {
      rhyme: 'E9 Protein',
      linear: 'amino-acid sequence + local window',
      board: 'MSA couplings',
      gold: 'long-range contact residue',
      cosmicAnalog: 'catalog object + RA/time neighbors → cosine feature couplings → partner object id',
    },
    {
      rhyme: 'E10 Knowledge',
      linear: 'one Wikipedia passage',
      board: 'title Jaccard / overlap board',
      gold: 'supporting title pair',
      cosmicAnalog: 'one catalog row feature lines → ranked object couplings → partner id',
    },
    {
      rhyme: 'E11 Macro',
      linear: 'one FRED series strip',
      board: 'lagged |corr| board',
      gold: 'teleconnected series',
      cosmicAnalog: 'WMAP TT multipole strip → lag |corr| board → partner ell id',
    },
    {
      rhyme: 'C5 Cosmic',
      linear: 'local sky / spectrum window as text',
      board: 'LEADING + RELATIONAL AWARENESS BOARD as text',
      gold: 'partner object / ell id',
      cosmicAnalog: 'same grammar on NASA / JPL / OpenNGC / WMAP fixtures',
    },
  ]),
  cosmicLayers: Object.freeze([
    {
      code: 'exoplanet',
      source: 'NASA Exoplanet Archive pscomppars',
      row: 'confirmed planet + host features',
      linearWindow: 'RA-neighbor planets',
      board: 'z-scored feature cosine',
      gold: 'strongest non-local planet id',
    },
    {
      code: 'neo',
      source: 'JPL SSD CAD',
      row: 'close-approach encounter',
      linearWindow: 'time/RA-local encounters',
      board: 'z-scored encounter features',
      gold: 'strongest non-local encounter id',
    },
    {
      code: 'ngc',
      source: 'OpenNGC',
      row: 'deep-sky object',
      linearWindow: 'RA-neighbor objects',
      board: 'z-scored morphology/sky features',
      gold: 'strongest non-local object id',
    },
    {
      code: 'wmap_tt',
      source: 'WMAP 9-year TT (LAMBDA)',
      row: 'multipole ell with Cl',
      linearWindow: 'local ±ell window',
      board: 'lag |corr| on Cl series',
      gold: 'ell + best lag partner',
    },
  ]),
  packArms: Object.freeze([
    {
      arm: 'LINEAR',
      contains: 'query + local window feature lines only',
      reader: 'first id in local window',
    },
    {
      arm: 'FLAT',
      contains: 'query + unstructured dump',
      reader: 'first id in dump',
    },
    {
      arm: 'AWARE',
      contains: 'query + LEADING candidate + ranked measured board',
      reader: 'prefer leading relational candidate',
    },
  ]),
});

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
  return {
    train: objects.filter((_, i) => !testIdx.has(i)),
    test: objects.filter((_, i) => testIdx.has(i)),
  };
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

function fmtFeatures(o) {
  return Object.entries(o.features)
    .map(([k, v]) => `${k}=${typeof v === 'number' ? Number(v).toPrecision(4) : v}`)
    .join(' · ');
}

/** E10/E11-shaped language packs for one cosmic partner-recovery task. */
export function packCosmicLinear(task) {
  const local = task.local
    .map((o) => `[${o.id}] ${fmtFeatures(o)}`)
    .join('\n');
  return (
    `DOMAIN: cosmic catalog (${task.layer})\n` +
    `QUERY OBJECT: [${task.query.id}] ${fmtFeatures(task.query)}\n` +
    `TASK: Name the held-out long-range partner object id (SOLUTION: <id>).\n` +
    `LOCAL WINDOW ONLY (RA/time neighbors — no ranked map):\n${local}`
  );
}

export function packCosmicFlat(task) {
  const dump = task.flatDump
    .map((o) => `[${o.id}] ${fmtFeatures(o)}`)
    .join('\n');
  return (
    `DOMAIN: cosmic catalog (${task.layer})\n` +
    `QUERY OBJECT: [${task.query.id}] ${fmtFeatures(task.query)}\n` +
    `TASK: Name the held-out long-range partner object id (SOLUTION: <id>).\n` +
    `ALL OBJECTS (flat dump — no ranked map):\n${dump}`
  );
}

export function packCosmicAware(task) {
  const board = task.board
    .map((c) => `${c.id}: coupling=${c.score.toFixed(4)}`)
    .join('\n');
  const lead = task.board[0]?.id || '';
  return (
    `DOMAIN: cosmic catalog (${task.layer})\n` +
    `QUERY OBJECT: [${task.query.id}] ${fmtFeatures(task.query)}\n` +
    `TASK: Name the held-out long-range partner object id (SOLUTION: <id>).\n` +
    `LEADING RELATIONAL CANDIDATE: ${lead}\n` +
    `RELATIONAL AWARENESS BOARD (feature couplings from z-scored catalog fields, not from gold labels):\n${board}\n` +
    `NOTE: Prefer the leading relational candidate.`
  );
}

export function parseSolution(text) {
  const m = String(text).match(/SOLUTION:\s*(.+)$/im);
  if (!m) return String(text).trim();
  return m[1].trim().replace(/^\[|\]$/g, '');
}

/**
 * Pack-compliant reader — what a prompt-following LLM does when it obeys the
 * AWARE note / takes the first visible local or dump id. No network.
 */
export function packCompliantRead(arm, pack) {
  if (arm === 'AWARE') {
    // IDs may contain spaces (e.g. "TOI-1758 b", "2022 AP1@2015-Jan-01 00:27").
    const lead = pack.match(/LEADING RELATIONAL CANDIDATE:\s*(.+)\s*$/im);
    if (lead) return `SOLUTION: ${lead[1].trim()}`;
  }
  if (arm === 'LINEAR') {
    const block = pack.split(/LOCAL WINDOW ONLY[^\n]*:\n/i)[1] || '';
    const id = block.match(/\[([^\]]+)\]/);
    if (id) return `SOLUTION: ${id[1]}`;
  }
  if (arm === 'FLAT') {
    const block = pack.split(/ALL OBJECTS[^\n]*:\n/i)[1] || '';
    const id = block.match(/\[([^\]]+)\]/);
    if (id) return `SOLUTION: ${id[1]}`;
  }
  return 'SOLUTION: UNKNOWN';
}

/**
 * Blind lexical reader — ignores LEADING / board ranks; scores mentioned ids
 * by token overlap with the query feature line. Weak language baseline.
 */
export function lexicalBlindRead(pack) {
  const qMatch = pack.match(/QUERY OBJECT:\s*\[([^\]]+)\]\s*(.+)/i);
  const queryLine = (qMatch?.[2] || '').toLowerCase();
  const qTokens = new Set(queryLine.split(/[^a-z0-9.]+/).filter(Boolean));
  const ids = [...pack.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  const uniq = [...new Set(ids)].filter((id) => id !== qMatch?.[1]);
  let best = uniq[0] || 'UNKNOWN';
  let bestScore = -1;
  for (const id of uniq) {
    const re = new RegExp(`\\[${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\s*([^\\n]*)`);
    const line = (pack.match(re)?.[1] || '').toLowerCase();
    const tokens = line.split(/[^a-z0-9.]+/).filter(Boolean);
    let overlap = 0;
    for (const t of tokens) if (qTokens.has(t)) overlap += 1;
    const score = tokens.length ? overlap / tokens.length : 0;
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return `SOLUTION: ${best}`;
}

function estimateTokens(text) {
  return Math.ceil(String(text).length / 4);
}

function buildCatalogTasks(objects, opts = {}) {
  const seed = opts.seed ?? SEED + 200;
  const rnd = mulberry32(seed);
  const z = zScoreMatrix(objects);
  const ordered = [...z].sort((a, b) => a.ra - b.ra || a.id.localeCompare(b.id));
  const { train, test } = splitTrainTest(z, rnd, 0.35);
  const tasks = [];
  for (const q of test) {
    const board = couplingBoard(q, z, 8);
    if (!board.length) continue;
    const gold = board[0];
    const local = linearNeighbors(q, ordered, 5);
    if (local.some((o) => o.id === gold.id)) continue;
    const dump = [...train.slice(0, 40), ...local];
    shuffleInPlace(dump, rnd);
    const flatDump = dump.filter((o) => !trivialPair(q, o)).slice(0, 12);
    tasks.push({
      layer: objects[0]?.layer,
      query: q,
      goldId: gold.id,
      local,
      flatDump,
      board,
    });
  }
  return tasks.slice(0, opts.maxTasks ?? 48);
}

function scoreArm(tasks, arm, reader) {
  let hits = 0;
  let tokens = 0;
  const packers = {
    LINEAR: packCosmicLinear,
    FLAT: packCosmicFlat,
    AWARE: packCosmicAware,
  };
  const packs = [];
  for (const t of tasks) {
    const pack = packers[arm](t);
    tokens += estimateTokens(pack);
    const pred = parseSolution(reader(arm, pack));
    const ok = pred === t.goldId;
    if (ok) hits += 1;
    packs.push({ queryId: t.query.id, goldId: t.goldId, pred, ok, tokens: estimateTokens(pack) });
  }
  return {
    rate: tasks.length ? hits / tasks.length : 0,
    hits,
    n: tasks.length,
    meanTokens: tasks.length ? tokens / tasks.length : 0,
    packs: packs.slice(0, 3),
  };
}

/**
 * C5a — catalog language-pack rhyme (exo / NEO / NGC).
 */
export function runC5CatalogLlmRhyme(objects, opts = {}) {
  const tasks = buildCatalogTasks(objects, opts);
  const compliant = {
    LINEAR: scoreArm(tasks, 'LINEAR', (arm, p) => packCompliantRead(arm, p)),
    FLAT: scoreArm(tasks, 'FLAT', (arm, p) => packCompliantRead(arm, p)),
    AWARE: scoreArm(tasks, 'AWARE', (arm, p) => packCompliantRead(arm, p)),
  };
  const lexical = {
    LINEAR: scoreArm(tasks, 'LINEAR', (_arm, p) => lexicalBlindRead(p)),
    FLAT: scoreArm(tasks, 'FLAT', (_arm, p) => lexicalBlindRead(p)),
    AWARE: scoreArm(tasks, 'AWARE', (_arm, p) => lexicalBlindRead(p)),
  };

  const rnd = mulberry32((opts.seed ?? SEED) + 7);
  const per = tasks.map((t) => {
    const packs = {
      LINEAR: packCosmicLinear(t),
      FLAT: packCosmicFlat(t),
      AWARE: packCosmicAware(t),
    };
    return {
      linear: parseSolution(packCompliantRead('LINEAR', packs.LINEAR)) === t.goldId,
      flat: parseSolution(packCompliantRead('FLAT', packs.FLAT)) === t.goldId,
      aware: parseSolution(packCompliantRead('AWARE', packs.AWARE)) === t.goldId,
    };
  });
  const n = per.length || 1;
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
  const rates = {
    linear: compliant.LINEAR.rate,
    flat: compliant.FLAT.rate,
    aware: compliant.AWARE.rate,
    n: tasks.length,
  };

  return {
    experiment: 'C5',
    layer: objects[0]?.layer,
    mode: 'pack_compliant_language_rhyme',
    nTasks: tasks.length,
    rates,
    deltaAwareLinear: rates.aware - rates.linear,
    deltaAwareFlat: rates.aware - rates.flat,
    ci95AwareMinusLinear: ci,
    H1: rates.aware - rates.linear >= H1_DELTA && ci.low > 0,
    H2: rates.aware - rates.flat >= H2_DELTA,
    tokenEconomics: {
      linearMean: compliant.LINEAR.meanTokens,
      flatMean: compliant.FLAT.meanTokens,
      awareMean: compliant.AWARE.meanTokens,
    },
    lexicalBlind: {
      linear: lexical.LINEAR.rate,
      flat: lexical.FLAT.rate,
      aware: lexical.AWARE.rate,
    },
    samplePacks: {
      LINEAR: compliant.LINEAR.packs[0],
      FLAT: compliant.FLAT.packs[0],
      AWARE: compliant.AWARE.packs[0],
    },
    honesty:
      'Language-pack rhyme on measured catalog couplings. Pack-compliant reader = prompt-following policy (E9–E11 pack shape). Not a live frontier LLM bake-off unless COSMIC_LLM_* is configured.',
  };
}

/**
 * C5b — WMAP TT spectral language-pack rhyme (multipole lag partners).
 */
export function runC5WmapLlmRhyme(opts = {}) {
  const seed = opts.seed ?? SEED + 299;
  const rnd = mulberry32(seed);
  const rows = loadWmapTt().filter((r) => r.ell >= 2 && r.ell <= 900);
  const cls = rows.map((r) => r.cl);
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
  const bestLag = lagCorr[0].lag;

  const nTasks = opts.maxTasks ?? 48;
  let linear = 0;
  let flat = 0;
  let aware = 0;
  let lexLinear = 0;
  let lexFlat = 0;
  let lexAware = 0;
  let tokL = 0;
  let tokF = 0;
  let tokA = 0;
  const per = [];

  for (let t = 0; t < nTasks; t += 1) {
    const i = 50 + Math.floor(rnd() * (cls.length - 100));
    const gold = i + bestLag;
    if (gold >= cls.length) continue;
    const qLine = `ell=${rows[i].ell} logCl=${Math.log(cls[i] + 1e-30).toFixed(4)}`;
    const localLines = [];
    for (let d = -3; d <= 3; d += 1) {
      if (d === 0) continue;
      const j = i + d;
      if (j >= 0 && j < cls.length) {
        localLines.push(`[ell-${rows[j].ell}] logCl=${Math.log(cls[j] + 1e-30).toFixed(4)}`);
      }
    }
    const dumpIdx = [];
    for (let k = 0; k < 12; k += 1) dumpIdx.push(Math.floor(rnd() * cls.length));
    const dumpLines = dumpIdx.map(
      (j) => `[ell-${rows[j].ell}] logCl=${Math.log(cls[j] + 1e-30).toFixed(4)}`,
    );
    const boardLines = lagCorr
      .slice(0, 8)
      .map((c) => `ell-${rows[Math.min(i + c.lag, cls.length - 1)].ell}: coupling=${c.corr.toFixed(4)}`);
    const leadId = `ell-${rows[gold].ell}`;

    const packL =
      `DOMAIN: WMAP TT spectrum\nQUERY: [ell-${rows[i].ell}] ${qLine}\n` +
      `TASK: Name the held-out spectral partner id (SOLUTION: <id>).\n` +
      `LOCAL WINDOW ONLY:\n${localLines.join('\n')}`;
    const packF =
      `DOMAIN: WMAP TT spectrum\nQUERY: [ell-${rows[i].ell}] ${qLine}\n` +
      `TASK: Name the held-out spectral partner id (SOLUTION: <id>).\n` +
      `ALL OBJECTS (flat dump):\n${dumpLines.join('\n')}`;
    const packA =
      `DOMAIN: WMAP TT spectrum\nQUERY: [ell-${rows[i].ell}] ${qLine}\n` +
      `TASK: Name the held-out spectral partner id (SOLUTION: <id>).\n` +
      `LEADING RELATIONAL CANDIDATE: ${leadId}\n` +
      `RELATIONAL AWARENESS BOARD (lag |corr| on TT spectrum):\n${boardLines.join('\n')}\n` +
      `NOTE: Prefer the leading relational candidate.`;

    tokL += estimateTokens(packL);
    tokF += estimateTokens(packF);
    tokA += estimateTokens(packA);

    const pL = parseSolution(packCompliantRead('LINEAR', packL));
    const pF = parseSolution(packCompliantRead('FLAT', packF));
    const pA = parseSolution(packCompliantRead('AWARE', packA));
    const hit = {
      linear: pL === leadId,
      flat: pF === leadId,
      aware: pA === leadId,
    };
    if (hit.linear) linear += 1;
    if (hit.flat) flat += 1;
    if (hit.aware) aware += 1;
    if (parseSolution(lexicalBlindRead(packL)) === leadId) lexLinear += 1;
    if (parseSolution(lexicalBlindRead(packF)) === leadId) lexFlat += 1;
    if (parseSolution(lexicalBlindRead(packA)) === leadId) lexAware += 1;
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
    experiment: 'C5',
    layer: 'wmap_tt',
    mode: 'pack_compliant_language_rhyme',
    nTasks: per.length,
    bestLag,
    rates,
    deltaAwareLinear: rates.aware - rates.linear,
    deltaAwareFlat: rates.aware - rates.flat,
    ci95AwareMinusLinear: ci,
    H1: rates.aware - rates.linear >= H1_DELTA && ci.low > 0,
    H2: rates.aware - rates.flat >= H2_DELTA,
    tokenEconomics: {
      linearMean: tokL / n,
      flatMean: tokF / n,
      awareMean: tokA / n,
    },
    lexicalBlind: {
      linear: lexLinear / n,
      flat: lexFlat / n,
      aware: lexAware / n,
    },
  };
}

export function runC5LlmRhyme(opts = {}) {
  const exo = runC5CatalogLlmRhyme(loadExoplanets(500), { seed: SEED + 200, ...opts });
  const neo = runC5CatalogLlmRhyme(loadNeos(350), { seed: SEED + 201, ...opts });
  const ngc = runC5CatalogLlmRhyme(loadOpenNgc(600), { seed: SEED + 202, ...opts });
  const wmap = runC5WmapLlmRhyme(opts);

  const layers = [exo, neo, ngc, wmap];
  const h1Layers = layers.filter((r) => r.H1).map((r) => r.layer);
  const meanAware = mean(layers.map((r) => r.rates.aware));
  const meanLinear = mean(layers.map((r) => r.rates.linear));
  const liveConfigured = Boolean(process.env.COSMIC_LLM_URL && process.env.COSMIC_LLM_KEY);

  return {
    experiment: 'C5',
    catalog: { exoplanet: exo, neo, ngc },
    wmap,
    legend: LLM_RHYME_COSMIC_LEGEND,
    summary: {
      h1Layers,
      nH1: h1Layers.length,
      meanAware,
      meanLinear,
      llmRhymeSignal: h1Layers.length >= 2,
      liveLlmConfigured: liveConfigured,
      liveLlmRan: false,
      legendOneLine: LLM_RHYME_COSMIC_LEGEND.oneLine,
      verdict: h1Layers.length >= 2
        ? `C5 POSITIVE — LLM/language-pack rhyme on cosmic fixtures (${h1Layers.join(', ')}); AWARE packs recover long-range partners LINEAR/FLAT packs miss under a pack-compliant reader.`
        : 'C5 MIXED/NULL — language packs did not clear H1 on ≥2 layers under pack-compliant reading.',
      note:
        'Default C5 is the E9–E11 language-pack rhyme with a deterministic pack-compliant reader (no API). Live LLM optional via COSMIC_LLM_URL/KEY. Lexical-blind baseline reported for contrast. Legend: LLM_RHYME_LEGEND.md / legend export on this receipt.',
    },
  };
}
