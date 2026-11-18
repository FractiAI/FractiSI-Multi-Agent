/**
 * Real / pinned available data loaders for Shared World Models v2.
 * Prefer committed fixtures over invented synthetic chains.
 */
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FRACTISI_ROOT = join(HERE, '../../..');
const SING13_CANDIDATES = [
  join(FRACTISI_ROOT, '../psw.vibelandia.sing13'),
  '/agent/repos/psw.vibelandia.sing13',
];

function findSing13() {
  for (const p of SING13_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function resolveDataPaths() {
  const sing13 = findSing13();
  return {
    sing13,
    e9:
      (sing13 &&
        join(
          sing13,
          'research/synthobs-nvidia-goldilocks-awareness-expedition/data/e9_real/scenarios.json',
        )) ||
      join(FRACTISI_ROOT, 'research/nvidia-goldilocks-lab/data/e9_real/scenarios.json'),
    e12:
      sing13 &&
      join(
        sing13,
        'research/synthobs-nvidia-goldilocks-awareness-expedition/data/e12_collab/scenarios.json',
      ),
    movebank:
      sing13 && join(sing13, 'research/geomagnetic-herbivore/data/trajectories.csv'),
    kp:
      sing13 && join(sing13, 'research/geomagnetic-herbivore/data/kp_3hourly.csv'),
    wmap:
      join(FRACTISI_ROOT, 'research/cosmic-rhyme-expedition/fixtures/wmap_tt_spectrum_9yr.txt'),
  };
}

/** Load E9 PDB+Pfam real scenarios (16 chains). */
export function loadE9Scenarios(limit = 16) {
  const paths = resolveDataPaths();
  if (!existsSync(paths.e9)) {
    return { ok: false, reason: `E9 scenarios missing at ${paths.e9}`, scenarios: [] };
  }
  const all = JSON.parse(readFileSync(paths.e9, 'utf8'));
  const scenarios = all.slice(0, limit).map((s) => ({
    id: s.id,
    pdb_id: s.pdb_id,
    chain: s.chain,
    pfam: s.pfam,
    qi: s.qi,
    gold: s.gold,
    gold_0: s.gold_0,
    seq: s.seq,
    question: s.question,
    n_msa: s.n_msa,
    msa_match_identity: s.msa_match_identity,
    dump_rows: (s.dump_rows || []).slice(0, 8),
    involving: (s.involving || []).slice(0, 8),
    top_global: (s.top_global || []).slice(0, 6),
    struct_contact_count: s.struct_contact_count,
    cohort: s.cohort,
  }));
  return { ok: true, path: paths.e9, scenarios, n: scenarios.length };
}

/**
 * Split one E9 scenario so NO single agent holds the gold pair string.
 * Gold is always involving[0] in this fixture — strip it from all private views.
 *
 * - query agent: knows query residue number (from gold left side / qi+1)
 * - partner agent: knows ranked partner residues (right-hand sides) WITHOUT pairing to query
 * - context agent: MSA / seq window context only
 *
 * Collective success requires merging query residue + top partner → "Q-P" === gold.
 */
export function splitE9Observations(scenario) {
  const qi = scenario.qi ?? 0;
  const seq = scenario.seq || '';
  const localWindow = seq.slice(Math.max(0, qi - 5), Math.min(seq.length, qi + 6));
  const gold = String(scenario.gold || '');
  const [qRes, pRes] = gold.split('-').map((x) => Number(x));

  const involving = scenario.involving || [];
  // Remove gold pair from every private contact list
  const withoutGold = involving.filter((row) => {
    const pair = Array.isArray(row) ? row[0] : row;
    return String(pair) !== gold;
  });

  // Partner candidates = right-hand residues from involving (including gold partner),
  // but NEVER as a prejoined "43-50" string in private facts.
  const partnerCandidates = [];
  for (const row of involving) {
    const pair = String(Array.isArray(row) ? row[0] : row);
    const score = Array.isArray(row) ? row[1] : null;
    const parts = pair.split('-').map(Number);
    if (parts.length !== 2) continue;
    const other = parts[0] === qRes ? parts[1] : parts[1] === qRes ? parts[0] : null;
    if (other != null) partnerCandidates.push({ residue: other, score, via: pair === gold ? 'gold_hidden' : 'other' });
  }
  // Sort by score descending; keep residue numbers only in private partner view
  partnerCandidates.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return {
    query: {
      agentId: 'query',
      role: 'query_residue',
      facts: {
        pdb_id: scenario.pdb_id,
        chain: scenario.chain,
        query_residue: qRes,
        qi,
        localWindow,
      },
    },
    partner: {
      agentId: 'partner',
      role: 'partner_candidates',
      facts: {
        pdb_id: scenario.pdb_id,
        // residues only — no "43-50" string
        partner_residues: partnerCandidates.map((c) => c.residue),
        partner_scores: partnerCandidates.map((c) => c.score),
        n_candidates: partnerCandidates.length,
      },
    },
    context: {
      agentId: 'context',
      role: 'msa_context',
      facts: {
        pdb_id: scenario.pdb_id,
        n_msa: scenario.n_msa,
        msa_match_identity: scenario.msa_match_identity,
        struct_contact_count: scenario.struct_contact_count,
        distractor_pairs: withoutGold.slice(0, 6),
      },
    },
    gold,
    query_residue: qRes,
    partner_residue: pRes,
    question: scenario.question,
  };
}

/**
 * Grade E9 partner recovery.
 * Accepts either explicit gold string in facts OR reconstructed pair from
 * query_residue + selected partner_residue / top partner_residues[0].
 */
export function gradeE9Recovery(facts, gold, opts = {}) {
  const hay = JSON.stringify(facts || {});
  if (gold && hay.includes(String(gold))) {
    return {
      success: true,
      gold,
      successScore: 1,
      note: 'gold contact pair present in collective facts',
    };
  }
  const [qRes, pRes] = String(gold || '').split('-').map(Number);
  const query = facts?.query_residue ?? facts?.qi_residue;
  let partner = facts?.selected_partner ?? facts?.partner_residue;
  if (partner == null && Array.isArray(facts?.partner_residues) && facts.partner_residues.length) {
    partner = facts.partner_residues[0];
  }
  // Shared-world policy: if both query and ranked partners present, take top partner
  if (query != null && partner == null && Array.isArray(facts?.partner_residues)) {
    partner = facts.partner_residues[0];
  }
  const reconstructed = query != null && partner != null ? `${query}-${partner}` : null;
  const hit = reconstructed === gold || (query === qRes && partner === pRes);
  return {
    success: Boolean(hit),
    gold,
    reconstructed,
    successScore: hit ? 1 : 0,
    note: hit
      ? 'reconstructed query+partner match gold'
      : 'could not reconstruct gold from split observations',
  };
}

/**
 * Load a bounded Movebank window (real GPS) without reading the full 20MB file into memory twice.
 */
export async function loadMovebankSample({ maxRows = 4000, maxIndividuals = 4 } = {}) {
  const paths = resolveDataPaths();
  if (!paths.movebank || !existsSync(paths.movebank)) {
    return { ok: false, reason: 'Movebank trajectories.csv not found', rows: [], individuals: [] };
  }
  const rows = [];
  const counts = new Map();
  const rl = createInterface({ input: createReadStream(paths.movebank), crlfDelay: Infinity });
  let header = null;
  for await (const line of rl) {
    if (!header) {
      header = line.split(',');
      continue;
    }
    if (rows.length >= maxRows) break;
    const cols = line.split(',');
    const obj = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = cols[i];
    const id = obj.individual_id;
    if (!id) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
    rows.push({
      individual_id: id,
      timestamp: obj.timestamp,
      lat: Number(obj.lat),
      lon: Number(obj.lon),
      step_km: Number(obj.step_km) || 0,
      speed_kmh: Number(obj.speed_kmh) || 0,
      taxon: obj.taxon,
    });
  }
  const individuals = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxIndividuals)
    .map(([id, n]) => ({ id, n }));
  const keep = new Set(individuals.map((x) => x.id));
  const filtered = rows.filter((r) => keep.has(r.individual_id));
  return {
    ok: true,
    path: paths.movebank,
    rows: filtered,
    individuals,
    nRows: filtered.length,
    source: 'Movebank study 2548892515 (Snowy Range Moose) — committed public GPS',
  };
}

/**
 * Turn Movebank rows into rhyming-shaped observation records.
 * Must match FractiSI four-pillar session shape (same organization kinds/roles pattern
 * as rhyme-vs-cache RHYME_PATTERN); vary ONLY utterance so exact-cache fails.
 */
export function movebankToRhymingObservations(sample, perAgent = 20) {
  const out = [];
  let i = 0;
  for (const ind of sample.individuals) {
    const mine = sample.rows.filter((r) => r.individual_id === ind.id).slice(0, perAgent);
    for (const r of mine) {
      const role1 = i % 9 === 0 ? 'lead' : 'user';
      const role2 = i % 5 === 0 ? 'lead' : 'user';
      const octave1 = (i % 7) + 1;
      const octave2 = Math.min(octave1 + 1, 8);
      out.push({
        kind: 'session',
        schema: 'rhyme_v2',
        motion: 'repeat-mirror-recurse-correct',
        netZero: { kind: 'session', octave: 0, role: 'origin', equilibrium: true },
        organization: {
          kind: 'session',
          role: role1,
          octave: octave1,
          organization: {
            kind: 'session',
            role: role2,
            octave: octave2,
          },
        },
        // Real GPS content lives in utterance — organization rhymes, text does not.
        utterance: `movebank ${r.individual_id} t=${r.timestamp} lat=${r.lat} lon=${r.lon} step=${r.step_km}`,
      });
      i += 1;
    }
  }
  return out;
}

/**
 * Split Movebank by individual agent — collective task: estimate herd centroid.
 */
export function splitMovebankAgents(sample) {
  const agents = sample.individuals.map((ind) => {
    const pts = sample.rows.filter((r) => r.individual_id === ind.id);
    const lat = pts.reduce((a, p) => a + p.lat, 0) / Math.max(1, pts.length);
    const lon = pts.reduce((a, p) => a + p.lon, 0) / Math.max(1, pts.length);
    return {
      agentId: ind.id,
      role: 'tracker',
      privateFacts: {
        individual_id: ind.id,
        n: pts.length,
        mean_lat: lat,
        mean_lon: lon,
        sample_points: pts.slice(0, 5).map((p) => ({ lat: p.lat, lon: p.lon, t: p.timestamp })),
      },
    };
  });
  const allLat = agents.reduce((a, x) => a + x.privateFacts.mean_lat, 0) / Math.max(1, agents.length);
  const allLon = agents.reduce((a, x) => a + x.privateFacts.mean_lon, 0) / Math.max(1, agents.length);
  return { agents, truthCentroid: { lat: allLat, lon: allLon } };
}

export function gradeHerdCentroid(facts, truth, tolDeg = 0.15) {
  const lat = facts.herd_mean_lat ?? facts.mean_lat;
  const lon = facts.herd_mean_lon ?? facts.mean_lon;
  if (lat == null || lon == null) {
    return { success: false, successScore: 0, errorKmApprox: null };
  }
  const dLat = Math.abs(lat - truth.lat);
  const dLon = Math.abs(lon - truth.lon);
  const ok = dLat <= tolDeg && dLon <= tolDeg;
  return {
    success: ok,
    successScore: ok ? 1 : Math.max(0, 1 - (dLat + dLon) / (2 * tolDeg)),
    dLat,
    dLon,
    estimated: { lat, lon },
    truth,
  };
}
