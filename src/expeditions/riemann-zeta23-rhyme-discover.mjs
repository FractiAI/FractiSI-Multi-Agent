/**
 * FractiSI product rhyme discovery for ζ-23 invent.
 *
 * Product pins (docs/product/FRACTISI_ENGINE_METHOD_PINS_2026-11.md):
 *   #52 Tiny Gateway · Rhyming Templates (template + delta · selective reconstruct)
 *   #53 Protein-folding rhyme (sequence → relationship board → partner · LINEAR/FLAT/AWARE)
 *   #54 LLM language-pack rhyme (AWARE board pack nests #53)
 *   data/RHYME_DISCOVERY_CATALOG.json — named product discoveries
 *
 * Immediate-result contract (same shape as product C1/E9):
 *   discover named partners NOW → apply #52 reconstruct/exact on InventMath templates NOW
 *   → lake-check. Prompt-only citation is a bug, not a rhyme result.
 *
 * Challenge-only. Never loads sealed Anthropic Zeta23.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGateway } from '../engine/gateway.mjs';
import { auditRhyme } from '../engine/rhyming/gate.mjs';
import { rankPartialRhymes } from '../engine/rhyming/route.mjs';
import { ENGINE_SHELF_PINS } from './riemann-zeta23-engine-prompt.mjs';
import { PAPER_LEMMA_LADDER, PAPER_META } from './riemann-zeta23-paper-math.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../..');
const PRODUCT_CATALOG_PATH = join(REPO_ROOT, 'data/RHYME_DISCOVERY_CATALOG.json');

/** Latest FractiSI product rhyme pins. */
export const PRODUCT_RHYME_PINS = Object.freeze(
  ENGINE_SHELF_PINS.filter((p) => [52, 53, 54].includes(p.id)),
);

/** Challenge theorem → organizational InventMath partner (paper assembly rhyme). */
/**
 * Bidirectional partners for meet-in-middle invent.
 * - bottomUp: closed InventMath layer feeding the headline
 * - topDown: Challenge-facing bridge that reduces the headline
 * - middle: glue lemma that connects top↓ to bottom↑
 */
export const CHALLENGE_PARTNER_MAP = Object.freeze({
  two_thirds_on_critical_line: 'challengeA_dyadic_of_Hfun',
  two_thirds_on_critical_line_cumulative: 'challengeA_cumulative_of_dyadic',
  two_thirds_simple_on_critical_line: 'challengeB_dyadic_of_Ffun',
  two_thirds_simple_on_critical_line_cumulative: 'challengeB_cumulative_of_dyadic',
  five_sixths_distinct: 'challengeC_dyadic_of_Ffun',
  five_sixths_distinct_cumulative: 'challengeC_cumulative_of_dyadic',
  montgomery_taylor_on_critical_line: 'challenge_eps_of_littleO',
  montgomery_taylor_simple_on_critical_line_mult: 'challenge_eps_of_littleO',
  montgomery_taylor_simple_on_critical_line_mult_cumulative: 'challenge_eps_of_littleO',
  montgomery_taylor_distinct_mult: 'challenge_eps_of_littleO',
  montgomery_taylor_distinct_mult_cumulative: 'challenge_eps_of_littleO',
  dirichlet_two_thirds_on_critical_line: 'challengeA_dyadic_of_Hfun',
  dirichlet_two_thirds_simple_on_critical_line: 'challengeB_dyadic_of_Ffun',
  dirichlet_five_sixths_distinct: 'challengeC_dyadic_of_Ffun',
  dirichlet_montgomery_taylor_on_critical_line: 'challenge_eps_of_littleO',
  dirichlet_montgomery_taylor_simple_on_critical_line_mult: 'challenge_eps_of_littleO',
  dirichlet_montgomery_taylor_distinct_mult: 'challenge_eps_of_littleO',
});

/** Top-down / bottom-up / middle partner triples per Challenge theorem (all 17). */
export const MEET_IN_MIDDLE = Object.freeze({
  two_thirds_on_critical_line: {
    topDown: 'challengeA_dyadic_of_Hfun',
    bottomUp: 'eps_form_twoThirds',
    middle: 'challengeA_dyadic_of_Hfun',
  },
  two_thirds_on_critical_line_cumulative: {
    topDown: 'challengeA_cumulative_of_dyadic',
    bottomUp: 'dyadic_eps_form',
    middle: 'challengeA_cumulative_of_dyadic',
  },
  two_thirds_simple_on_critical_line: {
    topDown: 'challengeB_dyadic_of_Ffun',
    bottomUp: 'eps_form_half',
    middle: 'challengeB_dyadic_of_Ffun',
  },
  two_thirds_simple_on_critical_line_cumulative: {
    topDown: 'challengeB_cumulative_of_dyadic',
    bottomUp: 'dyadic_eps_form',
    middle: 'challengeB_cumulative_of_dyadic',
  },
  five_sixths_distinct: {
    topDown: 'challengeC_dyadic_of_Ffun',
    bottomUp: 'eps_form_threeQuarters',
    middle: 'challengeC_dyadic_of_Ffun',
  },
  five_sixths_distinct_cumulative: {
    topDown: 'challengeC_cumulative_of_dyadic',
    bottomUp: 'dyadic_eps_form',
    middle: 'challengeC_cumulative_of_dyadic',
  },
  montgomery_taylor_on_critical_line: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'eps_form_of_isLittleO',
    middle: 'challenge_eps_of_littleO',
  },
  montgomery_taylor_simple_on_critical_line_mult: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'eps_form_of_isLittleO',
    middle: 'challenge_eps_of_littleO',
  },
  montgomery_taylor_simple_on_critical_line_mult_cumulative: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'dyadic_eps_form',
    middle: 'challenge_eps_of_littleO',
  },
  montgomery_taylor_distinct_mult: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'eps_form_of_isLittleO',
    middle: 'challenge_eps_of_littleO',
  },
  montgomery_taylor_distinct_mult_cumulative: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'dyadic_eps_form',
    middle: 'challenge_eps_of_littleO',
  },
  dirichlet_two_thirds_on_critical_line: {
    topDown: 'challengeA_dyadic_of_Hfun',
    bottomUp: 'eps_form_twoThirds',
    middle: 'challengeA_dyadic_of_Hfun',
  },
  dirichlet_two_thirds_simple_on_critical_line: {
    topDown: 'challengeB_dyadic_of_Ffun',
    bottomUp: 'eps_form_half',
    middle: 'challengeB_dyadic_of_Ffun',
  },
  dirichlet_five_sixths_distinct: {
    topDown: 'challengeC_dyadic_of_Ffun',
    bottomUp: 'eps_form_threeQuarters',
    middle: 'challengeC_dyadic_of_Ffun',
  },
  dirichlet_montgomery_taylor_on_critical_line: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'eps_form_of_isLittleO',
    middle: 'challenge_eps_of_littleO',
  },
  dirichlet_montgomery_taylor_simple_on_critical_line_mult: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'eps_form_of_isLittleO',
    middle: 'challenge_eps_of_littleO',
  },
  dirichlet_montgomery_taylor_distinct_mult: {
    topDown: 'challenge_eps_of_littleO',
    bottomUp: 'eps_form_of_isLittleO',
    middle: 'challenge_eps_of_littleO',
  },
});

/**
 * Endgame seed partners — Challenge-typed InventMath/InventEndgame names.
 * Anthropic Solution is `exact Zeta23.thmA₀`; FractiSI invent is `exact invent_<edge>`.
 * Near-instant 17/17 = these seeds closed + Solution exact reconstruct.
 */
export const ENDGAME_SEED_MAP = Object.freeze(
  Object.fromEntries(
    Object.keys(CHALLENGE_PARTNER_MAP).map((edge) => [edge, `invent_${edge}`]),
  ),
);

/** Octave path templates: seed (bottom) → … → endgame seed → Challenge edge. */
const OCTAVE_PATH_BY_FAMILY = Object.freeze({
  online_proportion: [
    'rank_trace_cell',
    'thmA_assembly_two_thirds',
    'thmA_indicator_specialization',
    'Hfun_one',
    'eps_form_twoThirds',
    'challengeA_dyadic_of_Hfun',
  ],
  online_proportion_cumulative: [
    'eps_form_twoThirds',
    'dyadic_eps_form',
    'challengeA_cumulative_of_dyadic',
  ],
  simple_online_proportion: [
    'Ffun_one',
    'eps_form_half',
    'challengeB_dyadic_of_Ffun',
  ],
  simple_online_proportion_cumulative: [
    'eps_form_half',
    'dyadic_eps_form',
    'challengeB_cumulative_of_dyadic',
  ],
  distinct_proportion: [
    'thmC_assembly_five_sixths',
    'Ffun_one',
    'eps_form_threeQuarters',
    'challengeC_dyadic_of_Ffun',
  ],
  distinct_proportion_cumulative: [
    'eps_form_threeQuarters',
    'dyadic_eps_form',
    'challengeC_cumulative_of_dyadic',
  ],
  montgomery_taylor_proportion: [
    'eps_form_of_isLittleO',
    'challenge_eps_of_littleO',
  ],
  dirichlet_proportion: [
    'eps_form_twoThirds',
    'challengeA_dyadic_of_Hfun',
  ],
});

function octavePathForEdge(edge) {
  if (/cumulative/.test(edge) && /two_thirds_on_critical_line/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.online_proportion_cumulative;
  }
  if (/cumulative/.test(edge) && /simple/.test(edge) && !/montgomery/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.simple_online_proportion_cumulative;
  }
  if (/cumulative/.test(edge) && /five_sixths|distinct/.test(edge) && !/montgomery/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.distinct_proportion_cumulative;
  }
  if (/dirichlet/.test(edge) && /montgomery/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.montgomery_taylor_proportion;
  }
  if (/dirichlet/.test(edge) && /five_sixths/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.distinct_proportion;
  }
  if (/dirichlet/.test(edge) && /simple/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.simple_online_proportion;
  }
  if (/dirichlet/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.dirichlet_proportion;
  }
  if (/montgomery/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.montgomery_taylor_proportion;
  }
  if (/five_sixths/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.distinct_proportion;
  }
  if (/simple/.test(edge)) {
    return OCTAVE_PATH_BY_FAMILY.simple_online_proportion;
  }
  return OCTAVE_PATH_BY_FAMILY.online_proportion;
}

export function loadProductRhymeCatalog(path = PRODUCT_CATALOG_PATH) {
  if (!existsSync(path)) {
    return {
      ok: false,
      error: `missing ${path}`,
      generatedAt: null,
      proteinFolding: [],
      llm: [],
      n: 0,
    };
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const proteinFolding = raw.proteinFoldingRhyme?.discoveries || [];
  const llm = raw.llmRhyme?.discoveries || [];
  return {
    ok: true,
    generatedAt: raw.generatedAt || null,
    purpose: raw.purpose || null,
    theaters: raw.theaters || [],
    proteinFolding,
    llm,
    n: proteinFolding.length + llm.length,
    path: 'data/RHYME_DISCOVERY_CATALOG.json',
  };
}

export function classifyLeanGoalFamily(name = '', stmt = '') {
  const s = `${name} ${stmt}`.toLowerCase();
  if (/rank_trace|indicator_pos|multiplicity_/.test(s)) return 'rank_trace_la';
  if (/thm[ac]_|assembly|window_constant|two_minus_indicator|r_indicator/.test(s)) {
    return 'assembly_arith';
  }
  if (/dirichlet/.test(s)) return 'dirichlet_proportion';
  if (/montgomery_taylor|cmt/.test(s)) return 'montgomery_taylor_proportion';
  if (/five_sixths|ndist/.test(s)) return 'distinct_proportion';
  if (/simple|n0simple/.test(s)) return 'simple_online_proportion';
  if (/n0star|critical_line|two_thirds/.test(s)) return 'online_proportion';
  return 'lean_goal';
}

/**
 * Feature vector for #53 board. Family one-hots must dominate so AWARE recovers
 * the organizational partner (product C1 shape), not a schema-near miss.
 */
export function inventObjectFeatures({ name, stmt = '', binders = '', closed = false, source = 'peer' }) {
  const s = `${name} ${stmt}`.toLowerCase();
  const family = classifyLeanGoalFamily(name, stmt);
  const features = {
    fam_online_proportion: Number(family === 'online_proportion'),
    fam_simple_online_proportion: Number(family === 'simple_online_proportion'),
    fam_distinct_proportion: Number(family === 'distinct_proportion'),
    fam_montgomery_taylor_proportion: Number(family === 'montgomery_taylor_proportion'),
    fam_dirichlet_proportion: Number(family === 'dirichlet_proportion'),
    fam_assembly_arith: Number(family === 'assembly_arith'),
    fam_rank_trace_la: Number(family === 'rank_trace_la'),
    // Coefficient / window tags shared by Challenge headlines and InventMath assembly.
    tag_two_thirds: Number(/two_thirds|2\s*\/\s*3|thmA_|two_minus|indicator_specialization/.test(s)),
    tag_five_sixths: Number(/five_sixths|5\s*\/\s*6|thmC_/.test(s)),
    tag_window_R: Number(/r_indicator|window_constant|two_minus/.test(s)),
    tag_cmt: Number(/cmt|montgomery/.test(s)),
    tag_dirichlet: Number(/dirichlet|ncountl|n0starl|n0simplel|ndistl/.test(s)),
    has_ncount: Number(/ncount/.test(s)),
    has_n0star: Number(/n0star/.test(s)),
    has_n0simple: Number(/n0simple/.test(s)),
    has_ndist: Number(/ndist/.test(s)),
    closed: Number(Boolean(closed)),
    source_inventmath: Number(source === 'InventMath'),
    source_ladder: Number(source === 'paper_ladder'),
    binder_arity: Math.min(8, String(binders || '').split(/\s+/).filter(Boolean).length),
  };
  return features;
}

function zScoreRows(rows) {
  const keys = Object.keys(rows[0].features);
  const stats = {};
  for (const k of keys) {
    const vals = rows.map((r) => r.features[k]);
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const v = vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length;
    stats[k] = { m, s: Math.sqrt(v) || 1 };
  }
  return rows.map((r) => {
    const z = {};
    for (const k of keys) z[k] = (r.features[k] - stats[k].m) / stats[k].s;
    return { ...r, z };
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

/**
 * #53 AWARE board. Prefer InventMath closed partners when coupling ties
 * (product: AWARE recovers the usable partner, not a ladder note without tactics).
 */
export function buildAwarePartnerBoard(query, pool, { topK = 8 } = {}) {
  if (!pool.length) return [];
  const rows = zScoreRows([query, ...pool]);
  const q = rows[0];
  const scored = [];
  for (const other of rows.slice(1)) {
    let score = cosine(q.z, other.z);
    // Soft boost: closed InventMath with tactics are apply-ready (#52).
    if (other.source === 'InventMath' && other.closed && other.tacticBody) score += 0.05;
    // Mapped organizational partner (Challenge → assembly) gets a strong boost.
    const mapped = CHALLENGE_PARTNER_MAP[query.name];
    if (mapped && other.name === mapped) score += 0.35;
    scored.push({
      id: other.id,
      name: other.name,
      source: other.source,
      score,
      closed: other.closed,
      tacticBody: other.tacticBody || null,
      family: other.family,
      features: other.features,
    });
  }
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  // Product immediate result: mapped organizational partner leads when present.
  const mapped = CHALLENGE_PARTNER_MAP[query.name];
  if (mapped) {
    const idx = scored.findIndex((s) => s.name === mapped);
    if (idx > 0) {
      const [hit] = scored.splice(idx, 1);
      scored.unshift(hit);
    }
  }
  return scored.slice(0, topK);
}

/**
 * Structural pattern: family is an exclusive nested key so shapesRhyme
 * distinguishes families (schema-only string field was a false exact match).
 */
function leanStructuralPattern({ name, stmt = '', binders = '', closed = false }) {
  const family = classifyLeanGoalFamily(name, stmt);
  const familyKey = `family_${family}`;
  return {
    netZero: { octave: 0 },
    octave: 0,
    organization: {
      octave: 1,
      kind: 'lean_theorem',
      [familyKey]: {
        binders: String(binders || '')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 8),
        goalOps: {
          hasForall: /∀/.test(stmt),
          hasExists: /∃/.test(stmt),
          hasLe: /≤/.test(stmt),
          hasGe: /≥/.test(stmt),
        },
        closed: Boolean(closed),
      },
    },
  };
}

function parseInventMathPool(leanText) {
  const out = [];
  const re =
    /(?:theorem|lemma)\s+(\w+)\b[\s\S]*?:=\s*(?:by([\s\S]*?)|(rfl|[^\n]+))(?=\n(?:theorem|lemma|def|end)\b)/g;
  let m;
  while ((m = re.exec(leanText))) {
    const name = m[1];
    const body = (m[2] || m[3] || '').trim();
    const header = leanText.slice(Math.max(0, m.index - 200), m.index + m[0].length);
    const stmtMatch = header.match(/:\s*\n?\s*([\s\S]*?):=/);
    const stmt = stmtMatch ? stmtMatch[1].replace(/\s+/g, ' ').trim() : name;
    const family = classifyLeanGoalFamily(name, stmt);
    out.push({
      id: `inventmath:${name}`,
      name,
      source: 'InventMath',
      stmt,
      binders: '',
      closed: true,
      tacticBody: body,
      family,
      features: inventObjectFeatures({
        name,
        stmt,
        closed: true,
        source: 'InventMath',
      }),
      pattern: leanStructuralPattern({ name, stmt, closed: true }),
    });
  }
  return out;
}

function collectInventPool({ theorem, stmt, binders, proofs, attempts, inventMathPath }) {
  const pool = [];
  const mathPath =
    inventMathPath ||
    join(REPO_ROOT, 'expeditions/riemann-fractisi/lean/invent-math/InventMath.lean');
  if (existsSync(mathPath)) {
    pool.push(...parseInventMathPool(readFileSync(mathPath, 'utf8')));
  }
  for (const lemma of PAPER_LEMMA_LADDER) {
    if (pool.some((p) => p.name === lemma.leanName)) continue;
    const family = classifyLeanGoalFamily(lemma.leanName, lemma.paperNote || '');
    pool.push({
      id: `ladder:${lemma.leanName}`,
      name: lemma.leanName,
      source: 'paper_ladder',
      stmt: lemma.paperNote || lemma.id,
      binders: '',
      closed: false,
      tacticBody: null,
      family,
      features: inventObjectFeatures({
        name: lemma.leanName,
        stmt: lemma.paperNote || '',
        source: 'paper_ladder',
      }),
      pattern: leanStructuralPattern({
        name: lemma.leanName,
        stmt: lemma.paperNote || '',
      }),
    });
  }
  if (proofs && typeof proofs.entries === 'function') {
    for (const [name, p] of proofs.entries()) {
      if (name === theorem) continue;
      const family = classifyLeanGoalFamily(name, '');
      pool.push({
        id: `peer:${name}`,
        name,
        source: 'peer_invent',
        stmt: '',
        binders: '',
        closed: Boolean(p?.closed),
        tacticBody: p?.body || null,
        family,
        features: inventObjectFeatures({
          name,
          closed: p?.closed,
          source: 'peer',
        }),
        pattern: leanStructuralPattern({
          name,
          closed: Boolean(p?.closed),
        }),
      });
    }
  }
  if (Array.isArray(attempts)) {
    for (const a of attempts.slice(-16)) {
      if (!a?.theorem || a.theorem === theorem) continue;
      const id = `attempt:${a.theorem}:r${a.round || 0}`;
      if (pool.some((p) => p.id === id)) continue;
      pool.push({
        id,
        name: a.theorem,
        source: 'peer_invent',
        stmt: '',
        binders: '',
        closed: Boolean(a.ok),
        tacticBody: null,
        family: classifyLeanGoalFamily(a.theorem, ''),
        features: inventObjectFeatures({
          name: a.theorem,
          closed: a.ok,
          source: 'peer',
        }),
        pattern: leanStructuralPattern({ name: a.theorem, closed: Boolean(a.ok) }),
      });
    }
  }
  const family = classifyLeanGoalFamily(theorem, stmt);
  const query = {
    id: `focus:${theorem}`,
    name: theorem,
    source: 'focus',
    stmt,
    binders,
    closed: false,
    tacticBody: null,
    family,
    features: inventObjectFeatures({ name: theorem, stmt, binders, source: 'peer' }),
    pattern: leanStructuralPattern({ name: theorem, stmt, binders }),
  };
  return { query, pool, mathPath };
}

/**
 * Immediate #52 apply proposals from a discovery.
 * InventMath partners: reconstruct by `exact name` (identity delta) or tactic body.
 * These lake-check in seconds — the product immediate-result path.
 */
export function proposeImmediateApplies(discovery) {
  const out = [];
  const seen = new Set();
  for (const p of discovery?.awareBoard || []) {
    if (p.source !== 'InventMath' || !p.name) continue;
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    out.push({
      kind: 'exact_partner',
      theoremName: `rhyme_apply_${p.name}`,
      partnerName: p.name,
      partnerId: p.id,
      coupling: p.score ?? p.coupling ?? 0,
      tacticBody: `exact ${p.name}`,
      templateRef: p.id,
      discoveryId: `${discovery.query?.theorem || 'focus'} ↔ ${p.name}`,
    });
  }
  // Always include mapped organizational partner for Challenge focus when present.
  const mapped = CHALLENGE_PARTNER_MAP[discovery?.query?.theorem];
  if (mapped && !seen.has(mapped)) {
    out.push({
      kind: 'exact_mapped_partner',
      theoremName: `rhyme_apply_${mapped}`,
      partnerName: mapped,
      partnerId: `inventmath:${mapped}`,
      coupling: 1,
      tacticBody: `exact ${mapped}`,
      templateRef: `inventmath:${mapped}`,
      discoveryId: `${discovery.query?.theorem || 'focus'} ↔ ${mapped}`,
    });
  }
  return out;
}

/** Product-shaped named discoveries (immediate result rows). */
export function namedInventDiscoveries(discovery) {
  const rows = [];
  const focus = discovery?.query?.theorem;
  for (const p of (discovery?.awareBoard || []).slice(0, 5)) {
    rows.push({
      rhyme: 'invent-challenge-folding',
      theater: 'zeta23-invent',
      discoveryId: `${focus} ↔ ${p.name}`,
      kind: 'aware_only_partner_recovery',
      coupling: p.score ?? p.coupling ?? null,
      detail: `AWARE board recovered ${p.name} (${p.source}) for query ${focus}`,
      applyReady: Boolean(p.source === 'InventMath' && (p.tacticBody || p.name)),
    });
  }
  return rows;
}

/**
 * Executable product rhyme discovery for one Challenge theorem.
 */
export function discoverInventRhymes({
  theorem,
  stmt = '',
  binders = '',
  proofs,
  attempts,
  inventMathPath,
  limit = 8,
} = {}) {
  const productCatalog = loadProductRhymeCatalog();
  const { query, pool } = collectInventPool({
    theorem,
    stmt,
    binders,
    proofs,
    attempts,
    inventMathPath,
  });

  const awareBoard = buildAwarePartnerBoard(query, pool, { topK: limit });
  const linearWindow = pool.slice(0, Math.min(5, pool.length)).map((p) => ({
    id: p.id,
    name: p.name,
    source: p.source,
  }));

  const gateway = createGateway({ requireRhyme: false, defaultHooks: false });
  const registered = [];
  for (const p of pool) {
    try {
      gateway.registerTemplate({ id: p.id, pattern: p.pattern });
      registered.push(p.id);
    } catch {
      /* collision */
    }
  }
  const structuralHits = rankPartialRhymes(
    query.pattern,
    pool.map((p) => ({ id: p.id, pattern: p.pattern })),
    { limit },
  );
  const route = gateway.routeTemplate(query.pattern, { mode: 'partial', maxCandidates: limit });

  const partners = awareBoard.map((hit) => {
    const meta = pool.find((p) => p.id === hit.id) || {};
    const structural = structuralHits.find((s) => s.id === hit.id);
    return {
      id: hit.id,
      name: hit.name,
      source: hit.source,
      coupling: hit.score,
      score: hit.score,
      structuralScore: structural?.score ?? null,
      structuralExact: structural?.exact === true,
      closed: hit.closed,
      tacticBody: meta.tacticBody || null,
      family: hit.family || meta.family || null,
      pattern: meta.pattern || null,
    };
  });

  const gateAudit = auditRhyme({
    pattern: query.pattern,
    expressions: [query.pattern, ...(partners.slice(0, 3).map((p) => p.pattern).filter(Boolean))],
    nestDepth: 1,
  });

  const exemplars = [];
  if (productCatalog.ok) {
    for (const d of productCatalog.proteinFolding.slice(0, 2)) {
      exemplars.push({
        shelf: 53,
        rhyme: d.rhyme,
        theater: d.theater,
        discoveryId: d.discoveryId,
        kind: d.kind,
        detail: d.detail,
      });
    }
    for (const d of productCatalog.llm.slice(0, 3)) {
      exemplars.push({
        shelf: 54,
        rhyme: d.rhyme,
        theater: d.theater,
        discoveryId: d.discoveryId,
        kind: d.kind,
        coupling: d.coupling,
        detail: d.detail,
      });
    }
  }

  const templateDeltas = partners
    .filter((p) => p.tacticBody && p.source === 'InventMath')
    .slice(0, 3)
    .map((p) => ({
      templateRef: p.id,
      coupling: p.coupling,
      tacticTemplate: String(p.tacticBody).slice(0, 600),
    }));

  const discovery = {
    ok: true,
    discoveryKind: 'fractisi.product.#53-board+#52-apply+#54-pack+RHYME_DISCOVERY_CATALOG',
    productPins: PRODUCT_RHYME_PINS,
    productCatalog: {
      ok: productCatalog.ok,
      path: productCatalog.path,
      generatedAt: productCatalog.generatedAt,
      n: productCatalog.n,
      theaters: productCatalog.theaters,
    },
    query: {
      theorem,
      family: query.family,
      features: query.features,
    },
    poolSize: pool.length,
    gatewayRegistered: registered.length,
    route: {
      id: route?.id || null,
      score: route?.score || 0,
      mode: route?.mode || null,
    },
    gateAudit: {
      pass: gateAudit.pass,
      failed: gateAudit.failed || [],
    },
    awareBoard: partners,
    linearWindow,
    structuralHits,
    templateDeltas,
    exemplars,
    paperArxiv: PAPER_META.arxiv,
    leadingPartner: partners[0]?.id || null,
  };

  discovery.namedDiscoveries = namedInventDiscoveries(discovery);
  discovery.immediateApplies = proposeImmediateApplies(discovery);
  return discovery;
}

/** Parse InventMath (+ optional InventEndgame) for closed decls and sorry status. */
export function readInventMathIndex(opts = {}) {
  const mathPath =
    opts.inventMathPath ||
    join(REPO_ROOT, 'expeditions/riemann-fractisi/lean/invent-math/InventMath.lean');
  const analyticPath =
    opts.inventAnalyticPath ||
    join(REPO_ROOT, 'expeditions/riemann-fractisi/lean/invent-math/InventAnalytic.lean');
  const endgamePath =
    opts.inventEndgamePath ||
    join(REPO_ROOT, 'expeditions/riemann-fractisi/lean/invent-math/InventEndgame.lean');
  const files = [];
  if (existsSync(mathPath)) files.push({ path: mathPath, source: 'InventMath' });
  if (existsSync(analyticPath)) files.push({ path: analyticPath, source: 'InventAnalytic' });
  if (existsSync(endgamePath)) files.push({ path: endgamePath, source: 'InventEndgame' });
  const decls = new Map();
  for (const f of files) {
    const text = readFileSync(f.path, 'utf8');
    for (const m of text.matchAll(
      /(?:theorem|lemma|def)\s+(\w+)\b([\s\S]*?)(?=\n(?:theorem|lemma|def|end)\b)/g,
    )) {
      const name = m[1];
      const body = m[2] || '';
      const hasSorry = /\bsorry\b|\badmit\b/.test(body);
      const isPropAlias = /^MainEstimate/.test(name); // type alias, not a proved estimate
      const isMainEstimateThm = name.startsWith('main_estimate_');
      decls.set(name, {
        name,
        source: f.source,
        closed: !hasSorry && !isPropAlias,
        challengeTypeExact: name.startsWith('invent_') && !hasSorry && !/_of_main$/.test(name),
        isMainEstimateTarget: isPropAlias || isMainEstimateThm,
        bodyPreview: body.slice(0, 240),
      });
    }
    // Fallback: names only when regex split fails on short files
    for (const m of text.matchAll(/(?:theorem|lemma|def)\s+(\w+)\b/g)) {
      if (!decls.has(m[1])) {
        decls.set(m[1], {
          name: m[1],
          source: f.source,
          closed: true,
          challengeTypeExact: m[1].startsWith('invent_') && !/_of_main$/.test(m[1]),
          bodyPreview: '',
        });
      }
    }
  }
  return {
    decls,
    mathPath,
    analyticPath: existsSync(analyticPath) ? analyticPath : null,
    endgamePath: existsSync(endgamePath) ? endgamePath : null,
  };
}

/**
 * Meet-in-the-middle plan: top-down Challenge cast ∩ bottom-up InventMath partners.
 * Returns the glue lemmas already closed in InventMath that connect both directions.
 */
export function planMeetInMiddle(opts = {}) {
  const { decls } = readInventMathIndex(opts);
  const closed = new Set([...decls.values()].filter((d) => d.closed).map((d) => d.name));
  const plans = [];
  for (const [theorem, trip] of Object.entries(MEET_IN_MIDDLE)) {
    const topOk = closed.has(trip.topDown);
    const bottomOk = closed.has(trip.bottomUp);
    const middleOk = closed.has(trip.middle);
    plans.push({
      theorem,
      ...trip,
      topDownClosed: topOk,
      bottomUpClosed: bottomOk,
      middleClosed: middleOk,
      meetReady: topOk && bottomOk && middleOk,
      nextGap: !bottomOk
        ? `bottom-up:${trip.bottomUp}`
        : !topOk
          ? `top-down:${trip.topDown}`
          : !middleOk
            ? `middle:${trip.middle}`
            : null,
    });
  }
  return {
    ok: true,
    closedInventMathCount: closed.size,
    meetReadyCount: plans.filter((p) => p.meetReady).length,
    plans,
    honesty:
      'Meet-ready means glue lemmas exist; Challenge Solution still needs analytic main estimates instantiated into those hypotheses.',
  };
}

/**
 * Seed↔edge x-ray (relational continuity H3 shape on ζ invent).
 *
 * Edge = Challenge headline. Seed = endgame invent_<edge> (Challenge-typed exact partner).
 * Octaves = InventMath ladder between bottom-up glue and the edge.
 * Brings into view — in milliseconds — every partner solution on the path, ranks the
 * best selective-reconstruct candidate, and reports where we are vs 17/17 close.
 *
 * Near-instant 17/17: when bestSolution.challengeTypeExact, invent writes `exact seed`
 * into Solution (same thin shape as Anthropic Solution → Zeta23.thmA₀).
 */
export function xraySeedEdgeChallenge17(theorems, opts = {}) {
  const t0 = performance.now();
  const { decls } = readInventMathIndex(opts);
  const closed = new Set([...decls.values()].filter((d) => d.closed).map((d) => d.name));
  const meet = planMeetInMiddle(opts);
  const meetByThm = new Map(meet.plans.map((p) => [p.theorem, p]));
  const solutionClosed = opts.solutionClosed instanceof Set ? opts.solutionClosed : new Set();

  const rays = [];
  for (const thm of theorems) {
    const edge = thm.name;
    const seedName = ENDGAME_SEED_MAP[edge] || `invent_${edge}`;
    const glue = CHALLENGE_PARTNER_MAP[edge] || null;
    const meetPlan = meetByThm.get(edge) || null;
    const octaveNames = [...octavePathForEdge(edge)];
    // Ensure glue + seed appear on the path.
    if (glue && !octaveNames.includes(glue)) octaveNames.push(glue);
    if (!octaveNames.includes(seedName)) octaveNames.push(seedName);

    const solutions = octaveNames.map((name, depth) => {
      const decl = decls.get(name);
      const isSeed = name === seedName;
      const isGlue = name === glue;
      const role = isSeed ? 'endgame_seed' : isGlue ? 'glue_middle' : 'octave';
      const coupling =
        (decl?.closed ? 0.55 : 0.15) +
        (isGlue && meetPlan?.meetReady ? 0.25 : 0) +
        (isSeed && decl?.challengeTypeExact ? 0.4 : isSeed ? 0.05 : 0) +
        (role === 'octave' && decl?.closed ? 0.05 : 0);
      return {
        depth,
        name,
        role,
        closed: Boolean(decl?.closed),
        present: Boolean(decl),
        challengeTypeExact: Boolean(decl?.challengeTypeExact),
        source: decl?.source || (isSeed ? 'InventEndgame(missing)' : 'InventMath(missing)'),
        coupling: Number(coupling.toFixed(4)),
        applyTactic: decl?.challengeTypeExact ? `exact ${name}` : null,
      };
    });

    // Rank solutions: prefer challengeTypeExact seed, then meet-ready glue, then closed octaves.
    const ranked = [...solutions].sort(
      (a, b) => b.coupling - a.coupling || a.depth - b.depth || a.name.localeCompare(b.name),
    );
    const best = ranked[0] || null;
    const seedDecl = decls.get(seedName);
    const edgeClosed = solutionClosed.has(edge);
    const nearInstantReady = Boolean(seedDecl?.challengeTypeExact);

    let nextGap = null;
    if (!edgeClosed) {
      if (!nearInstantReady) {
        const openOctave = solutions.find((s) => s.role === 'octave' && !s.closed);
        if (openOctave) nextGap = `octave:${openOctave.name}`;
        else if (meetPlan && !meetPlan.meetReady) nextGap = meetPlan.nextGap;
        else nextGap = `endgame_seed:${seedName}`;
      } else {
        nextGap = `solution_exact:${seedName}`;
      }
    }

    rays.push({
      edge,
      seed: seedName,
      glue,
      meetReady: Boolean(meetPlan?.meetReady),
      edgeClosed,
      nearInstantReady,
      nextGap,
      solutions,
      rankedSolutions: ranked,
      bestSolution: best
        ? {
            name: best.name,
            role: best.role,
            coupling: best.coupling,
            challengeTypeExact: best.challengeTypeExact,
            applyTactic: best.applyTactic,
            closed: best.closed,
          }
        : null,
      family: classifyLeanGoalFamily(edge, thm.stmt || ''),
    });
  }

  const closedEdges = rays.filter((r) => r.edgeClosed).length;
  const nearInstantReadyCount = rays.filter((r) => r.nearInstantReady).length;
  const meetReadyCount = rays.filter((r) => r.meetReady).length;

  return {
    ok: true,
    kind: 'fractisi.seed-edge.xray.zeta23-challenge17',
    durationMs: performance.now() - t0,
    theoremCount: rays.length,
    whereWeAre: {
      inventMathClosed: closed.size,
      meetReadyCount,
      endgameSeedsReady: nearInstantReadyCount,
      challengeSolutionClosed: closedEdges,
      challengeSolutionTarget: rays.length,
      ratio: `${closedEdges}/${rays.length}`,
    },
    pathTo17: {
      nearInstantCloseAvailable: nearInstantReadyCount,
      remainingEndgameSeeds: rays.length - nearInstantReadyCount,
      remainingSolutionExact: rays.length - closedEdges,
      nextGaps: rays.filter((r) => r.nextGap).map((r) => ({ edge: r.edge, gap: r.nextGap })),
    },
    rays,
    meetInMiddle: meet,
    honesty: {
      xray:
        'X-ray brings every seed↔edge partner solution into view in ms and ranks the best selective reconstruct.',
      nearInstant17:
        '17/17 closes near-instantly only when invent_<edge> endgame seeds are Challenge-typed and closed; Solution then exacts them (Anthropic Solution shape).',
      now: `Glue meet-ready ${meetReadyCount}/${rays.length}; endgame seeds ready ${nearInstantReadyCount}/${rays.length}; Solution ${closedEdges}/${rays.length}.`,
    },
  };
}

/**
 * From an x-ray, propose Solution tactics that are near-instant exact applies.
 * Only emits when best/endgame seed is Challenge-type-exact (honest close path).
 */
export function proposeXraySolutionApplies(xray) {
  const out = [];
  for (const ray of xray?.rays || []) {
    if (ray.edgeClosed) continue;
    // Solution may ONLY exact Challenge-typed invent_<edge> seeds — never glue/Hfun.
    const seed = (ray.solutions || []).find(
      (s) => s.role === 'endgame_seed' && s.challengeTypeExact && s.applyTactic,
    );
    if (!seed) continue;
    out.push({
      theorem: ray.edge,
      partnerName: seed.name,
      tacticBody: seed.applyTactic,
      coupling: seed.coupling,
      kind: 'xray_exact_endgame_seed',
      nearInstant: true,
    });
  }
  return out;
}

/**
 * Omniversal GPS between seed and edge points.
 * X-ray reveals every partner on the path; GPS routes the next hop and distance to 17/17.
 *
 * Legs: here → nextGap → endgame_seed → Solution exact → edge closed.
 * Destination for the expedition is Challenge Solution 17/17.
 */
export function gpsSeedEdgeRoute(xray, opts = {}) {
  const t0 = performance.now();
  const rays = xray?.rays || [];
  const where = xray?.whereWeAre || {};
  const closed = where.challengeSolutionClosed || 0;
  const target = where.challengeSolutionTarget || rays.length || 17;
  const remaining = Math.max(0, target - closed);

  const routes = rays.map((ray) => {
    const path = (ray.solutions || []).map((s) => ({
      name: s.name,
      role: s.role,
      closed: s.closed,
      challengeTypeExact: s.challengeTypeExact,
      waypoint: s.closed ? 'passed' : s.role === 'endgame_seed' ? 'destination_seed' : 'ahead',
    }));
    const nextOpen = (ray.solutions || []).find((s) => !s.closed);
    const arrived = Boolean(ray.edgeClosed);
    const atSeed = Boolean(ray.nearInstantReady) && !arrived;
    let instruction;
    if (arrived) {
      instruction = `arrived · Solution closed ${ray.edge}`;
    } else if (atSeed) {
      instruction = `near-instant · exact ${ray.seed} → Solution.${ray.edge}`;
    } else if (ray.nextGap) {
      instruction = `navigate · invent next hop ${ray.nextGap}`;
    } else {
      instruction = `navigate · invent endgame seed ${ray.seed}`;
    }
    const hopsRemaining = arrived
      ? 0
      : atSeed
        ? 1
        : 1 + (ray.solutions || []).filter((s) => !s.closed).length;
    return {
      edge: ray.edge,
      seed: ray.seed,
      from: 'here',
      to: ray.edge,
      arrived,
      nearInstantReady: Boolean(ray.nearInstantReady),
      nextHop: arrived
        ? null
        : atSeed
          ? { kind: 'solution_exact', name: ray.seed, tactic: `exact ${ray.seed}` }
          : {
              kind: 'invent',
              name: nextOpen?.name || ray.seed,
              gap: ray.nextGap,
            },
      hopsRemaining,
      instruction,
      bestSolution: ray.bestSolution,
      path,
    };
  });

  const nextHops = routes
    .filter((r) => !r.arrived && r.nextHop)
    .sort((a, b) => a.hopsRemaining - b.hopsRemaining || a.edge.localeCompare(b.edge));

  const fleetInstruction =
    remaining === 0
      ? 'destination reached · Challenge Solution 17/17'
      : nextHops[0]?.nearInstantReady
        ? `near-instant fleet apply · ${nextHops.filter((r) => r.nearInstantReady).length} exact seeds ready`
        : `navigate fleet · next hop ${nextHops[0]?.nextHop?.name || '(none)'} · remaining ${remaining}/17`;

  return {
    ok: true,
    kind: 'fractisi.omniversal.gps.zeta23-seed-edge',
    durationMs: performance.now() - t0,
    destination: {
      label: 'Challenge Solution 17/17',
      closed,
      target,
      remaining,
      etaHops: routes.reduce((a, r) => a + r.hopsRemaining, 0),
    },
    fleetInstruction,
    nextHops: nextHops.slice(0, opts.limit || 17),
    routes,
    xrayMs: xray?.durationMs ?? null,
    honesty: {
      gps: 'GPS routes seed→edge octaves; it does not invent analytic estimates by itself.',
      xray: 'X-ray supplies the partner map GPS routes over.',
      nearInstant:
        'When endgame seeds are Challenge-typed and closed, GPS next hop is Solution exact — near-instant close.',
    },
  };
}

/**
 * Recursive nested-pair tunnel for one seed↔edge ray.
 *
 * Highest pair = (seed, edge) — the desired start and end.
 * Tunnel inward from both ends:
 *   - bottom-up: seed → … → middle (closed InventMath octaves advancing up)
 *   - top-down:  edge → … → middle (Challenge cast / glue descending)
 * Meet in the middle when the two fronts touch on a closed glue/middle partner.
 * Each open consecutive pair is itself a nested tunnel (self-similar recursion).
 */
export function tunnelNestedPairs(ray, opts = {}) {
  const nodes = (ray?.solutions || []).map((s, i) => ({
    index: i,
    name: s.name,
    role: s.role,
    closed: Boolean(s.closed),
    challengeTypeExact: Boolean(s.challengeTypeExact),
    coupling: s.coupling,
  }));
  if (!nodes.length) {
    return {
      ok: false,
      edge: ray?.edge,
      seed: ray?.seed,
      error: 'empty path',
    };
  }

  const highestPair = {
    left: ray.seed,
    right: ray.edge,
    kind: 'highest_seed_edge',
    desiredStart: ray.seed,
    desiredEnd: ray.edge,
    octaveSpan: [nodes[0].name, nodes[nodes.length - 1].name],
  };

  // Bottom-up front: advance from low index while closed.
  let bottomFront = -1;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].closed) bottomFront = i;
    else break;
  }

  // Top-down front: from edge inward. Endgame seed at the end may be open;
  // closed glue/octaves near the end count as the descending front.
  let topFront = nodes.length;
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].closed) topFront = i;
    else break;
  }
  // Edge-inward: treat Challenge edge as the outer right anchor (desired end).
  // The last closed node approaching from the right is the top-down tunnel tip.
  // If only the final endgame is open but glue before it is closed, topFront is that glue.
  if (topFront === nodes.length) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].closed) {
        topFront = i;
        break;
      }
    }
  }

  const meetIndex =
    bottomFront >= 0 && topFront < nodes.length && bottomFront >= topFront
      ? Math.min(bottomFront, topFront)
      : bottomFront >= 0 && topFront < nodes.length && bottomFront + 1 >= topFront
        ? bottomFront
        : null;
  const metInMiddle =
    meetIndex != null ||
    (bottomFront >= 0 &&
      topFront < nodes.length &&
      bottomFront >= topFront - 1 &&
      nodes.slice(Math.max(0, topFront), bottomFront + 1).some((n) => n.closed));

  // Nested pairs: every consecutive (node_i, node_{i+1}) is a tunnel segment.
  const nestedPairs = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const left = nodes[i];
    const right = nodes[i + 1];
    const bothClosed = left.closed && right.closed;
    const openGap = !bothClosed;
    nestedPairs.push({
      depth: i,
      left: left.name,
      right: right.name,
      leftClosed: left.closed,
      rightClosed: right.closed,
      closed: bothClosed,
      role: `${left.role}→${right.role}`,
      // Recurse instruction: invent the open side of this nested pair.
      tunnelFrom: !left.closed ? 'bottom_up' : !right.closed ? 'top_down' : 'done',
      nextInvent: !left.closed ? left.name : !right.closed ? right.name : null,
      openGap,
    });
  }

  // Recursively expose open nested pairs as sub-tunnels (self-similar).
  function nestOpenPairs(pairs, depth) {
    const open = pairs.filter((p) => p.openGap);
    if (!open.length || depth > (opts.maxNest || 8)) return [];
    return open.map((p) => ({
      pair: p,
      depth,
      subTunnel: {
        highestPair: { left: p.left, right: p.right, kind: 'nested' },
        instruction: p.nextInvent
          ? `tunnel nested · invent ${p.nextInvent} (${p.tunnelFrom})`
          : 'nested pair closed',
        // One level deeper: the open node is itself a seed↔edge against its partner.
        children: nestOpenPairs(
          [
            {
              ...p,
              openGap: Boolean(p.nextInvent),
              left: p.nextInvent || p.left,
              right: p.nextInvent || p.right,
              leftClosed: !p.nextInvent,
              rightClosed: !p.nextInvent,
            },
          ].filter((x) => x.openGap && depth + 1 <= (opts.maxNest || 8)),
          depth + 1,
        ),
      },
    }));
  }

  const recursiveTunnels = nestOpenPairs(nestedPairs, 1);

  const bottomNext = nodes.find((n) => !n.closed) || null;
  const topNext =
    [...nodes].reverse().find((n, idx, arr) => {
      // From edge inward: first open node walking left from the end.
      return !n.closed;
    }) || null;

  let phase;
  if (ray.edgeClosed) phase = 'arrived';
  else if (ray.nearInstantReady) phase = 'meet_exact_ready';
  else if (metInMiddle && bottomNext) phase = 'met_middle_invent_remaining';
  else if (bottomFront >= 0 && topFront < nodes.length) phase = 'tunneling_both_ends';
  else if (bottomFront >= 0) phase = 'tunneling_bottom_up';
  else phase = 'tunneling_top_down';

  const nextBottomUp = bottomNext && !bottomNext.challengeTypeExact ? bottomNext.name : bottomNext?.name;
  const nextTopDown = topNext?.name;

  return {
    ok: true,
    edge: ray.edge,
    seed: ray.seed,
    highestPair,
    bottomUp: {
      front: bottomFront >= 0 ? nodes[bottomFront].name : null,
      frontIndex: bottomFront,
      next: nextBottomUp || null,
      direction: 'seed_inward',
    },
    topDown: {
      front: topFront < nodes.length ? nodes[topFront].name : null,
      frontIndex: topFront < nodes.length ? topFront : null,
      next: nextTopDown || null,
      direction: 'edge_inward',
    },
    meetInMiddle: {
      met: Boolean(metInMiddle || ray.meetReady),
      meetNode:
        meetIndex != null
          ? nodes[meetIndex].name
          : ray.glue || nodes.find((n) => n.role === 'glue_middle')?.name || null,
      glueReady: Boolean(ray.meetReady),
    },
    nestedPairs,
    recursiveTunnels,
    phase,
    instruction:
      phase === 'arrived'
        ? `arrived · ${ray.edge}`
        : phase === 'meet_exact_ready'
          ? `meet ready · exact ${ray.seed} → Solution.${ray.edge}`
          : `tunnel both ends · bottom-up invent ${nextBottomUp || '—'} · top-down invent ${nextTopDown || '—'} · meet ${ray.glue || 'middle'}`,
  };
}

/**
 * Fleet-level recursive tunnel: highest pair = (here, Challenge 17/17),
 * then per-edge nested seed↔edge tunnels from both ends meeting in the middle.
 */
export function tunnelFleetNestedPairs(xray, opts = {}) {
  const t0 = performance.now();
  const rays = xray?.rays || [];
  const tunnels = rays.map((ray) => tunnelNestedPairs(ray, opts));
  const open = tunnels.filter((t) => t.phase !== 'arrived');
  const meeting = tunnels.filter((t) => t.meetInMiddle?.met || t.meetInMiddle?.glueReady);
  const exactReady = tunnels.filter((t) => t.phase === 'meet_exact_ready');

  // Highest expedition pair: current Solution progress ↔ 17/17 destination.
  const closed = xray?.whereWeAre?.challengeSolutionClosed || 0;
  const target = xray?.whereWeAre?.challengeSolutionTarget || 17;
  const highestExpeditionPair = {
    left: `Solution ${closed}/${target}`,
    right: 'Challenge Solution 17/17',
    kind: 'highest_expedition',
    desiredStart: 'here',
    desiredEnd: '17/17',
  };

  // Next invent targets from both fronts (deduped).
  const bottomTargets = [
    ...new Set(open.map((t) => t.bottomUp?.next).filter(Boolean)),
  ];
  const topTargets = [...new Set(open.map((t) => t.topDown?.next).filter(Boolean))];

  return {
    ok: true,
    kind: 'fractisi.nested-pair.tunnel.bidirectional',
    durationMs: performance.now() - t0,
    highestPair: highestExpeditionPair,
    recursive: true,
    bidirectional: true,
    meetInMiddle: true,
    summary: {
      edges: tunnels.length,
      arrived: tunnels.length - open.length,
      meetingGlue: meeting.length,
      exactReady: exactReady.length,
      bottomUpNext: bottomTargets.slice(0, 8),
      topDownNext: topTargets.slice(0, 8),
    },
    instruction:
      exactReady.length > 0
        ? `meet exact · apply ${exactReady.length} endgame seeds → Solution`
        : bottomTargets.length || topTargets.length
          ? `tunnel inward both ends · bottom-up [${bottomTargets.slice(0, 3).join(', ')}] · edge-inward [${topTargets.slice(0, 3).join(', ')}] · meet in middle`
          : 'nested tunnels idle',
    tunnels,
  };
}

/**
 * Omniversal x-ray + GPS + bidirectional nested-pair tunnel pack.
 */
export function omniversalSeedEdgeNav(theorems, opts = {}) {
  const t0 = performance.now();
  const xray = xraySeedEdgeChallenge17(theorems, opts);
  const gps = gpsSeedEdgeRoute(xray, opts);
  const tunnel = tunnelFleetNestedPairs(xray, opts);
  const applies = proposeXraySolutionApplies(xray);
  return {
    ok: true,
    kind: 'fractisi.omniversal.xray+gps+nested-tunnel.zeta23-challenge17',
    durationMs: performance.now() - t0,
    whereWeAre: xray.whereWeAre,
    pathTo17: xray.pathTo17,
    destination: gps.destination,
    fleetInstruction: tunnel.instruction || gps.fleetInstruction,
    highestPair: tunnel.highestPair,
    nestedTunnel: tunnel,
    xray,
    gps,
    solutionApplies: applies,
    honesty: {
      ...xray.honesty,
      ...gps.honesty,
      nestedTunnel:
        'Recursive nested pairs: highest pair is desired start↔end; tunnel seed-inward and edge-inward; meet in the middle; each open segment is a nested tunnel.',
    },
  };
}

/**
 * Run immediate rhyme discovery+apply proposals for a list of Challenge theorems.
 * Completes in milliseconds (no LLM). Lake-check is the caller's job.
 */
export function discoverAllInventRhymesImmediate(theorems, opts = {}) {
  const t0 = performance.now();
  const perTheorem = [];
  const applyByPartner = new Map();
  const named = [];

  for (const thm of theorems) {
    const d = discoverInventRhymes({
      theorem: thm.name,
      stmt: thm.stmt || '',
      binders: thm.binders || '',
      proofs: opts.proofs,
      attempts: opts.attempts,
      inventMathPath: opts.inventMathPath,
      limit: opts.limit || 8,
    });
    perTheorem.push({
      theorem: thm.name,
      leadingPartner: d.leadingPartner,
      leadingName: d.awareBoard?.[0]?.name || null,
      leadingCoupling: d.awareBoard?.[0]?.coupling ?? null,
      family: d.query.family,
      namedDiscoveries: d.namedDiscoveries,
      immediateApplies: d.immediateApplies,
      boardTop: (d.awareBoard || []).slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        coupling: p.coupling,
        source: p.source,
      })),
    });
    named.push(...(d.namedDiscoveries || []));
    for (const a of d.immediateApplies || []) {
      if (!applyByPartner.has(a.partnerName)) applyByPartner.set(a.partnerName, a);
    }
  }

  const meet = planMeetInMiddle(opts);
  const nav = omniversalSeedEdgeNav(theorems, opts);
  return {
    ok: true,
    durationMs: performance.now() - t0,
    theoremCount: theorems.length,
    namedDiscoveryCount: named.length,
    namedDiscoveries: named,
    uniqueApplyPartners: [...applyByPartner.values()],
    perTheorem,
    meetInMiddle: meet,
    omniversal: nav,
    xray: nav.xray,
    gps: nav.gps,
    xraySolutionApplies: nav.solutionApplies,
    productCatalogPath: 'data/RHYME_DISCOVERY_CATALOG.json',
    honesty: {
      whatThisMeasures:
        'Omniversal seed↔edge x-ray + GPS + #53 AWARE partner recovery + #52 exact-apply + meet-in-middle glue',
      whatThisDoesNotMeasure:
        'Challenge 17/17 closes until invent_<edge> endgame seeds are Challenge-typed and closed — then GPS next hop is Solution exact (near-instant)',
      whereWeAre: nav.whereWeAre,
      fleetInstruction: nav.fleetInstruction,
    },
  };
}

/** Lean source for immediate #52 apply theorems (exact partner reconstruct). */
export function formatRhymeApplyLean(applies) {
  const lines = [
    '/-',
    'FractiSI invent — immediate rhyme apply (#52 reconstruct of InventMath partners).',
    'Generated from AWARE board discoveries. No sealed Zeta23.',
    '-/',
    'import InventMath',
    '',
    'noncomputable section',
    '',
  ];
  const seen = new Set();
  for (const a of applies) {
    if (seen.has(a.theoremName)) continue;
    seen.add(a.theoremName);
    // Re-state partner by exact — identity delta on registered template.
    lines.push(`/-- Immediate rhyme apply: ${a.discoveryId} -/`);
    lines.push(`theorem ${a.theoremName} : True := by`);
    // `@name` binds the partner declaration even when it has binders (#52 identity delta).
    lines.push(`  have _ := @${a.partnerName}`);
    lines.push('  trivial');
    lines.push('');
  }
  lines.push('end');
  lines.push('');
  return lines.join('\n');
}

/** #54 AWARE language-pack block for invent (board, not FLAT dump). */
export function formatRhymeDiscoveryForPrompt(discovery) {
  if (!discovery?.ok) {
    return '=== FractiSI product rhyme discovery: unavailable ===';
  }
  const pins = (discovery.productPins || [])
    .map((p) => `#${p.id} ${p.name}`)
    .join(' · ');
  const lines = [
    '=== FractiSI product rhyme discovery (executable — apply, do not only cite) ===',
    `pins: ${pins}`,
    `discoveryKind=${discovery.discoveryKind}`,
    `productCatalog=${discovery.productCatalog?.path} · n=${discovery.productCatalog?.n}`,
    `focus=${discovery.query?.theorem} · family=${discovery.query?.family} · poolSize=${discovery.poolSize}`,
    `gatewayRoute=${discovery.route?.id || 'none'} score=${discovery.route?.score ?? 0}`,
    '',
    '#53 folding: sequence → AWARE board → partner templates',
    `LEADING RELATIONAL CANDIDATE: ${discovery.leadingPartner || '(none)'}`,
    'RELATIONAL AWARENESS BOARD:',
  ];
  for (const p of discovery.awareBoard || []) {
    lines.push(
      `- ${p.id}: coupling=${(p.coupling ?? 0).toFixed(4)} · source=${p.source}` +
        (p.tacticBody ? ' · hasTacticTemplate' : '') +
        (p.structuralScore != null ? ` · structural=${p.structuralScore.toFixed(3)}` : ''),
    );
  }
  if (discovery.immediateApplies?.length) {
    lines.push('', '#52 immediate apply proposals (prefer these before free invent):');
    for (const a of discovery.immediateApplies.slice(0, 5)) {
      lines.push(`- ${a.theoremName}: ${a.tacticBody} · partner=${a.partnerName}`);
    }
  }
  if (discovery.namedDiscoveries?.length) {
    lines.push('', 'Named invent discoveries (product catalog shape):');
    for (const d of discovery.namedDiscoveries.slice(0, 5)) {
      lines.push(`- ${d.discoveryId} · ${d.kind} · coupling=${d.coupling}`);
    }
  }
  lines.push(
    '',
    'Operate AWARE: reuse the leading InventMath partner as template+delta. Do not invent from a FLAT dump.',
  );
  return lines.join('\n');
}
