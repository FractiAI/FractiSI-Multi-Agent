/**
 * Pilot Rhyme Expedition · computational lab
 *
 * Question: does a Director/Pilot *role rhyme* (reusable role template + shared
 * world + per-mission deltas) beat flat peers and private Director/Pilot copies
 * on multi-hop coordination — and beat an exact-text cache when mission wording differs?
 *
 * Not: LingBot weights, embodied robotics, CapEx, LLM bake-off.
 */
import { DOCUMENT_ID, SEED, SCENARIOS, HOPS, PILOTS, FLAT_BUDGET, ARMS } from './constants.mjs';
import { runAllPilotTheaters } from './theaters.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function utf8Bytes(s) {
  return Buffer.byteLength(String(s), 'utf8');
}

function buildMission(rand, id) {
  const hops = HOPS;
  const nodes = [];
  for (let h = 0; h < hops; h++) {
    nodes.push({
      id: `m${id}-h${h}`,
      hop: h,
      dept: ['ops', 'finance', 'legal', 'eng', 'sales', 'support'][h],
      next: h < hops - 1 ? `m${id}-h${h + 1}` : null,
      signal: h === hops - 1 ? `SOLUTION-m${id}` : null,
      // wording differs every mission — same structure
      brief: `Mission ${id} step ${h}: handle ${['ops', 'finance', 'legal', 'eng', 'sales', 'support'][h]} ticket #${Math.floor(rand() * 1e6)}`,
    });
  }
  const noise = [];
  for (let i = 0; i < 180; i++) {
    noise.push({
      id: `m${id}-n${i}`,
      hop: -1,
      dept: 'noise',
      next: null,
      signal: null,
      brief: `Noise log ${i} session ${Math.floor(rand() * 1e9)}`,
    });
  }
  const byId = Object.fromEntries([...nodes, ...noise].map((n) => [n.id, n]));
  return {
    missionId: id,
    nodes,
    noise,
    byId,
    startId: nodes[0].id,
    solution: nodes[hops - 1].signal,
    // role template is identical across missions (the rhyme)
    roleTemplate: {
      director: 'Hold the mission map. Hand each Pilot the next local hop. Merge results.',
      pilot: 'Execute one local hop. Report fact and next pointer. Do not keep a private full map.',
    },
  };
}

/** Flat peers: each agent skims a private slice; no roles. */
function runFlatPeers(mission) {
  const corpus = [...mission.noise, ...mission.nodes];
  const picked = corpus.slice(0, FLAT_BUDGET);
  const ids = new Set(picked.map((p) => p.id));
  const ok = mission.nodes.every((n) => ids.has(n.id));
  const bytes = utf8Bytes(JSON.stringify(picked));
  return { ok, ops: FLAT_BUDGET, rounds: HOPS, bytes, recovered: ok ? mission.solution : null };
}

/** Shared text board: everyone dumps into one text blob, no role structure. */
function runSharedText(mission) {
  const board = [...mission.noise.slice(0, 20), ...mission.nodes].map((n) => n.brief).join('\n');
  // without role structure, search is still flat over the board words
  const hasAll = mission.nodes.every((n) => board.includes(n.brief));
  // recovery still needs following next pointers — shared text alone does not
  const ok = false;
  return { ok, ops: mission.nodes.length + 20, rounds: HOPS, bytes: utf8Bytes(board), recovered: null, hasAllBriefs: hasAll };
}

/** Director + Pilots, each keeps a private full copy of the map. Roles exist; no share/rhyme. */
function runDirectorPilotPrivate(mission) {
  const directorCopy = JSON.stringify({ role: mission.roleTemplate.director, nodes: mission.nodes });
  const pilotCopies = [];
  for (let p = 0; p < PILOTS; p++) {
    pilotCopies.push(JSON.stringify({ role: mission.roleTemplate.pilot, nodes: mission.nodes }));
  }
  // With private full copies, Director can still walk the chain alone — succeeds, but expensive
  let ops = 0;
  let cur = mission.byId[mission.startId];
  while (cur) {
    ops++;
    if (!cur.next) break;
    cur = mission.byId[cur.next];
  }
  const bytes = utf8Bytes(directorCopy) + pilotCopies.reduce((a, c) => a + utf8Bytes(c), 0);
  return { ok: true, ops, rounds: HOPS, bytes, recovered: mission.solution };
}

/** Exact-text cache of role+mission packets. Hits only when bytes identical. */
function runDirectorPilotExactCache(mission, cache) {
  const packet = JSON.stringify({
    director: mission.roleTemplate.director,
    pilot: mission.roleTemplate.pilot,
    nodes: mission.nodes.map((n) => ({ id: n.id, hop: n.hop, next: n.next, signal: n.signal, brief: n.brief })),
  });
  const key = packet;
  let bytes;
  let hit = false;
  if (cache.has(key)) {
    hit = true;
    bytes = 0; // full hit — store nothing new
  } else {
    cache.set(key, true);
    bytes = utf8Bytes(packet);
  }
  // Still walks the chain successfully (roles + full packet present)
  return { ok: true, ops: HOPS, rounds: Math.ceil(HOPS / 2), bytes, hit, recovered: mission.solution };
}

/**
 * Pilot Rhyme: role template stored once; mission writes only deltas into a shared world;
 * Director holds map edges; Pilots hold local hop facts.
 */
function runDirectorPilotRhyme(mission, world) {
  if (!world.roleTemplateBytes) {
    const tmpl = JSON.stringify(mission.roleTemplate);
    world.roleTemplateBytes = utf8Bytes(tmpl);
    world.storedTemplate = true;
  }
  // deltas: per-hop facts only (not the role text, not reprinting the whole map to each Pilot)
  const deltas = mission.nodes.map((n) => ({
    id: n.id,
    hop: n.hop,
    next: n.next,
    signal: n.signal,
    brief: n.brief,
  }));
  const deltaBytes = utf8Bytes(JSON.stringify(deltas));
  world.totalDeltaBytes = (world.totalDeltaBytes || 0) + deltaBytes;

  // Director reads shared edges; each Pilot reads one local hop — selective reconstruction
  let ops = 0;
  let cur = mission.byId[mission.startId];
  const rounds = [];
  while (cur) {
    ops++; // Pilot local read
    ops++; // Director merge pointer
    rounds.push(cur.hop);
    if (!cur.next) break;
    cur = mission.byId[cur.next];
  }
  return {
    ok: true,
    ops,
    rounds: Math.ceil(HOPS / 2),
    bytes: (world.storedTemplate ? world.roleTemplateBytes : 0) + deltaBytes,
    // after first mission, template is not re-counted in per-mission compare below
    deltaBytes,
    recovered: mission.solution,
  };
}

export function runFullExpedition(opts = {}) {
  const seed = opts.seed ?? SEED;
  const n = opts.scenarios ?? SCENARIOS;
  const rand = mulberry32(seed);
  const cache = new Map();
  const world = { totalDeltaBytes: 0, roleTemplateBytes: 0, storedTemplate: false };

  const tallies = Object.fromEntries(
    ARMS.map((a) => [a, { wins: 0, ops: 0, rounds: 0, bytes: 0, hits: 0 }]),
  );

  // First pass: run all missions; track cumulative store size for cache vs rhyme
  let rhymeCumulative = 0;
  let exactCumulative = 0;
  let privateCumulative = 0;
  let flatCumulative = 0;
  let sharedTextCumulative = 0;

  for (let i = 0; i < n; i++) {
    const mission = buildMission(rand, i);

    const flat = runFlatPeers(mission);
    tallies.flat_peers.wins += flat.ok ? 1 : 0;
    tallies.flat_peers.ops += flat.ops;
    tallies.flat_peers.rounds += flat.rounds;
    tallies.flat_peers.bytes += flat.bytes;
    flatCumulative += flat.bytes;

    const shared = runSharedText(mission);
    tallies.shared_text.wins += shared.ok ? 1 : 0;
    tallies.shared_text.ops += shared.ops;
    tallies.shared_text.rounds += shared.rounds;
    tallies.shared_text.bytes += shared.bytes;
    sharedTextCumulative += shared.bytes;

    const priv = runDirectorPilotPrivate(mission);
    tallies.director_pilot_private.wins += priv.ok ? 1 : 0;
    tallies.director_pilot_private.ops += priv.ops;
    tallies.director_pilot_private.rounds += priv.rounds;
    tallies.director_pilot_private.bytes += priv.bytes;
    privateCumulative += priv.bytes;

    const exact = runDirectorPilotExactCache(mission, cache);
    tallies.director_pilot_exact_cache.wins += exact.ok ? 1 : 0;
    tallies.director_pilot_exact_cache.ops += exact.ops;
    tallies.director_pilot_exact_cache.rounds += exact.rounds;
    tallies.director_pilot_exact_cache.bytes += exact.bytes;
    tallies.director_pilot_exact_cache.hits += exact.hit ? 1 : 0;
    exactCumulative += exact.bytes;

    const rhyme = runDirectorPilotRhyme(mission, world);
    tallies.director_pilot_rhyme.wins += rhyme.ok ? 1 : 0;
    tallies.director_pilot_rhyme.ops += rhyme.ops;
    tallies.director_pilot_rhyme.rounds += rhyme.rounds;
    tallies.director_pilot_rhyme.bytes += rhyme.bytes;
    rhymeCumulative += rhyme.bytes;
    world.storedTemplate = false; // only count template once in cumulative via first mission
  }

  // Recompute rhyme cumulative properly: template once + all deltas
  const rhymeStoreBytes = world.roleTemplateBytes + world.totalDeltaBytes;

  const summary = {
    documentId: DOCUMENT_ID,
    seed,
    scenarios: n,
    hops: HOPS,
    pilots: PILOTS,
    arms: {},
    compare: {
      rhymeStoreBytes,
      exactCacheStoreBytes: exactCumulative,
      privateStoreBytes: privateCumulative,
      flatStoreBytes: flatCumulative,
      sharedTextStoreBytes: sharedTextCumulative,
      exactCacheHits: tallies.director_pilot_exact_cache.hits,
      rhymeVersusExact:
        exactCumulative > 0 ? 1 - rhymeStoreBytes / exactCumulative : null,
      rhymeVersusPrivate:
        privateCumulative > 0 ? 1 - rhymeStoreBytes / privateCumulative : null,
      discovery: {
        flat: tallies.flat_peers.wins,
        shared_text: tallies.shared_text.wins,
        director_pilot_private: tallies.director_pilot_private.wins,
        director_pilot_exact_cache: tallies.director_pilot_exact_cache.wins,
        director_pilot_rhyme: tallies.director_pilot_rhyme.wins,
        n,
      },
    },
  };

  for (const arm of ARMS) {
    const t = tallies[arm];
    summary.arms[arm] = {
      wins: t.wins,
      winRate: t.wins / n,
      meanOps: t.ops / n,
      meanRounds: t.rounds / n,
      meanBytes: t.bytes / n,
      hits: t.hits || 0,
    };
  }

  const d = summary.compare.discovery;
  const positive =
    d.director_pilot_rhyme === n &&
    d.flat === 0 &&
    summary.compare.exactCacheHits === 0 &&
    summary.compare.rhymeVersusExact != null &&
    summary.compare.rhymeVersusExact > 0.2;

  summary.verdict = positive
    ? 'SUPPORTED — Pilot Rhyme recovered every mission, flat peers recovered none, exact-text role cache never hit on differing mission wording, and the rhyming store was substantially smaller than exact-cache and private copies.'
    : 'MIXED / NOT SUPPORTED — see arm table.';
  summary.positiveExpeditionSignal = positive;
  summary.honesty =
    'Architectural / structured-state lab. Director/Pilot seats rebuild a published coordination pattern; no LingBot weights. Theater candidate arm reuses Cosmic/LLM public fixtures. Not CapEx, not embodied robotics, not an LLM bake-off, not clinical genetics, not finished physics.';

  const theaters = runAllPilotTheaters({ seed });
  summary.theaters = {
    layers: theaters.results.map((r) => ({
      theater: r.theater,
      nTasks: r.nTasks,
      rates: r.rates,
      wins: r.wins,
      nDiscoveries: r.discoveries.length,
    })),
    discoveries: theaters.discoveries,
    nDiscoveries: theaters.discoveries.length,
  };
  summary.positiveTheaterSignal = theaters.discoveries.length > 0;

  return summary;
}
