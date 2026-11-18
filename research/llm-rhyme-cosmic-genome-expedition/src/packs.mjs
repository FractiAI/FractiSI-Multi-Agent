/**
 * Shared LINEAR / FLAT / AWARE language-pack grammar (E9–E11 shape).
 * Pack-compliant reader by default — no API key.
 */
import { BOOTSTRAP_B, H1_DELTA, H2_DELTA, SEED } from './constants.mjs';
import { bootstrapCi, mean, mulberry32, shuffleInPlace } from './stats.mjs';

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
  if (a.symbol && b.symbol && a.symbol === b.symbol && a.layer === 'genome_exon') {
    // same-gene exons are near-trivial for long-range fold rhyme
    return true;
  }
  return false;
}

function splitTrainTest(objects, rnd, testFrac = 0.35) {
  const idx = objects.map((_, i) => i);
  shuffleInPlace(idx, rnd);
  const nTest = Math.max(12, Math.floor(objects.length * testFrac));
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

export function packLinear(task) {
  const local = task.local.map((o) => `[${o.id}] ${fmtFeatures(o)}`).join('\n');
  return (
    `DOMAIN: ${task.domain}\n` +
    `QUERY OBJECT: [${task.query.id}] ${fmtFeatures(task.query)}\n` +
    `TASK: Name the held-out long-range partner object id (SOLUTION: <id>).\n` +
    `LOCAL WINDOW ONLY (ordered neighbors — no ranked map):\n${local}`
  );
}

export function packFlat(task) {
  const dump = task.flatDump.map((o) => `[${o.id}] ${fmtFeatures(o)}`).join('\n');
  return (
    `DOMAIN: ${task.domain}\n` +
    `QUERY OBJECT: [${task.query.id}] ${fmtFeatures(task.query)}\n` +
    `TASK: Name the held-out long-range partner object id (SOLUTION: <id>).\n` +
    `ALL OBJECTS (flat dump — no ranked map):\n${dump}`
  );
}

export function packAware(task) {
  const board = task.board.map((c) => `${c.id}: coupling=${c.score.toFixed(4)}`).join('\n');
  const lead = task.board[0]?.id || '';
  return (
    `DOMAIN: ${task.domain}\n` +
    `QUERY OBJECT: [${task.query.id}] ${fmtFeatures(task.query)}\n` +
    `TASK: Name the held-out long-range partner object id (SOLUTION: <id>).\n` +
    `LEADING RELATIONAL CANDIDATE: ${lead}\n` +
    `RELATIONAL AWARENESS BOARD (measured couplings, not gold labels):\n${board}\n` +
    `NOTE: Prefer the leading relational candidate.`
  );
}

export function parseSolution(text) {
  const m = String(text).match(/SOLUTION:\s*(.+)$/im);
  if (!m) return String(text).trim();
  return m[1].trim().replace(/^\[|\]$/g, '');
}

export function packCompliantRead(arm, pack) {
  if (arm === 'AWARE') {
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

/**
 * Run pack-compliant LLM rhyme on a catalog of objects with features + order key.
 */
export function runLanguagePackRhyme(objects, opts = {}) {
  const seed = opts.seed ?? SEED;
  const domain = opts.domain || objects[0]?.layer || 'catalog';
  if (!objects?.length) {
    return {
      domain,
      layer: domain,
      nObjects: 0,
      nTasks: 0,
      rates: { linear: 0, flat: 0, aware: 0, n: 0 },
      deltaAwareLinear: 0,
      deltaAwareFlat: 0,
      ci95AwareMinusLinear: { low: 0, high: 0, mean: 0 },
      H1: false,
      H2: false,
      tokenEconomics: { linearMean: 0, flatMean: 0, awareMean: 0 },
      lexicalBlind: { linear: 0, flat: 0, aware: 0 },
    };
  }
  const rnd = mulberry32(seed);
  const z = zScoreMatrix(objects);
  const ordered = [...z].sort((a, b) => (a.order ?? a.ra) - (b.order ?? b.ra) || a.id.localeCompare(b.id));
  const { train, test } = splitTrainTest(z, rnd, opts.testFrac ?? 0.35);
  const tasks = [];
  for (const q of test) {
    const board = couplingBoard(q, z, 8);
    if (!board.length) continue;
    const gold = board[0];
    const local = linearNeighbors(q, ordered, opts.window ?? 5);
    if (local.some((o) => o.id === gold.id)) continue;
    const dump = [...train.slice(0, Math.min(40, train.length)), ...local];
    shuffleInPlace(dump, rnd);
    const flatDump = dump.filter((o) => !trivialPair(q, o)).slice(0, 12);
    if (!flatDump.length || !local.length) continue;
    tasks.push({
      domain,
      query: q,
      goldId: gold.id,
      local,
      flatDump,
      board,
    });
  }
  const capped = tasks.slice(0, opts.maxTasks ?? 48);

  const score = (arm, reader) => {
    let hits = 0;
    let tokens = 0;
    const packers = { LINEAR: packLinear, FLAT: packFlat, AWARE: packAware };
    for (const t of capped) {
      const pack = packers[arm](t);
      tokens += estimateTokens(pack);
      if (parseSolution(reader(arm, pack)) === t.goldId) hits += 1;
    }
    return {
      rate: capped.length ? hits / capped.length : 0,
      hits,
      n: capped.length,
      meanTokens: capped.length ? tokens / capped.length : 0,
    };
  };

  const compliant = {
    LINEAR: score('LINEAR', (arm, p) => packCompliantRead(arm, p)),
    FLAT: score('FLAT', (arm, p) => packCompliantRead(arm, p)),
    AWARE: score('AWARE', (arm, p) => packCompliantRead(arm, p)),
  };
  const lexical = {
    LINEAR: score('LINEAR', (_a, p) => lexicalBlindRead(p)),
    FLAT: score('FLAT', (_a, p) => lexicalBlindRead(p)),
    AWARE: score('AWARE', (_a, p) => lexicalBlindRead(p)),
  };

  const per = capped.map((t) => {
    const linearHit =
      parseSolution(packCompliantRead('LINEAR', packLinear(t))) === t.goldId;
    const flatHit = parseSolution(packCompliantRead('FLAT', packFlat(t))) === t.goldId;
    const awareHit =
      parseSolution(packCompliantRead('AWARE', packAware(t))) === t.goldId;
    return {
      queryId: t.query.id,
      partnerId: t.goldId,
      coupling: t.board[0]?.score ?? 0,
      boardTop: t.board.slice(0, 5).map((c) => ({ id: c.id, score: Number(c.score.toFixed(4)) })),
      features: t.query.features,
      linear: linearHit,
      flat: flatHit,
      aware: awareHit,
      awareOnly: awareHit && !linearHit && !flatHit,
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
    n: capped.length,
  };

  // Discoveries = named awareness findings, not pass/fail alone.
  const pairKey = (a, b) => [a, b].sort().join('||');
  const pairCounts = new Map();
  for (const t of per) {
    if (!t.awareOnly) continue;
    const k = pairKey(t.queryId, t.partnerId);
    const prev = pairCounts.get(k) || { queryId: t.queryId, partnerId: t.partnerId, n: 0, maxCoupling: 0 };
    prev.n += 1;
    prev.maxCoupling = Math.max(prev.maxCoupling, t.coupling);
    pairCounts.set(k, prev);
  }
  const awarenessOnlyPairs = [...pairCounts.values()]
    .sort((a, b) => b.maxCoupling - a.maxCoupling || b.n - a.n)
    .slice(0, 12)
    .map((d) => ({
      id: `${d.queryId} ↔ ${d.partnerId}`,
      queryId: d.queryId,
      partnerId: d.partnerId,
      maxCoupling: Number(d.maxCoupling.toFixed(4)),
      nTasks: d.n,
      kind: 'aware_only_partner_recovery',
    }));

  // Global top couplings across all queries (awareness board surface).
  const globalCoupling = new Map();
  for (const t of capped) {
    for (const c of t.board.slice(0, 3)) {
      const k = pairKey(t.query.id, c.id);
      const prev = globalCoupling.get(k) || {
        a: t.query.id,
        b: c.id,
        maxScore: 0,
        n: 0,
      };
      prev.maxScore = Math.max(prev.maxScore, c.score);
      prev.n += 1;
      globalCoupling.set(k, prev);
    }
  }
  const topBoardCouplings = [...globalCoupling.values()]
    .sort((a, b) => b.maxScore - a.maxScore || b.n - a.n)
    .slice(0, 12)
    .map((d) => ({
      id: `${d.a} ↔ ${d.b}`,
      a: d.a,
      b: d.b,
      maxCoupling: Number(d.maxScore.toFixed(4)),
      nBoardAppearances: d.n,
      kind: 'awareness_board_coupling',
    }));

  const sampleRecoveries = per
    .filter((t) => t.awareOnly)
    .sort((a, b) => b.coupling - a.coupling)
    .slice(0, 8)
    .map((t) => ({
      queryId: t.queryId,
      partnerId: t.partnerId,
      coupling: Number(t.coupling.toFixed(4)),
      boardTop: t.boardTop,
      linearRecovered: t.linear,
      flatRecovered: t.flat,
      awareRecovered: t.aware,
    }));

  return {
    domain,
    layer: objects[0]?.layer,
    nObjects: objects.length,
    nTasks: capped.length,
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
    discoveries: {
      theater: objects[0]?.layer || domain,
      rhyme: 'LLM language-pack (AWARE)',
      nAwareOnlyRecoveries: per.filter((t) => t.awareOnly).length,
      awarenessOnlyPairs,
      topBoardCouplings,
      sampleRecoveries,
    },
  };
}
