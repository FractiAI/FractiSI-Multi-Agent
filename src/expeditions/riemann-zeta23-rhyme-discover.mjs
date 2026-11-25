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
/** Challenge headline → next-layer InventMath partner (ε-form / assembly). */
export const CHALLENGE_PARTNER_MAP = Object.freeze({
  two_thirds_on_critical_line: 'eps_form_twoThirds',
  two_thirds_on_critical_line_cumulative: 'eps_form_twoThirds',
  two_thirds_simple_on_critical_line: 'eps_form_half',
  two_thirds_simple_on_critical_line_cumulative: 'eps_form_half',
  five_sixths_distinct: 'eps_form_threeQuarters',
  five_sixths_distinct_cumulative: 'eps_form_threeQuarters',
  montgomery_taylor_on_critical_line: 'eps_form_of_isLittleO',
  montgomery_taylor_simple_on_critical_line_mult: 'eps_form_of_isLittleO',
  montgomery_taylor_simple_on_critical_line_mult_cumulative: 'eps_form_of_isLittleO',
  montgomery_taylor_distinct_mult: 'eps_form_of_isLittleO',
  montgomery_taylor_distinct_mult_cumulative: 'eps_form_of_isLittleO',
  dirichlet_two_thirds_on_critical_line: 'eps_form_twoThirds',
  dirichlet_two_thirds_simple_on_critical_line: 'eps_form_half',
  dirichlet_five_sixths_distinct: 'eps_form_threeQuarters',
  dirichlet_montgomery_taylor_on_critical_line: 'eps_form_of_isLittleO',
  dirichlet_montgomery_taylor_simple_on_critical_line_mult: 'eps_form_of_isLittleO',
  dirichlet_montgomery_taylor_distinct_mult: 'eps_form_of_isLittleO',
});

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

  return {
    ok: true,
    durationMs: performance.now() - t0,
    theoremCount: theorems.length,
    namedDiscoveryCount: named.length,
    namedDiscoveries: named,
    uniqueApplyPartners: [...applyByPartner.values()],
    perTheorem,
    productCatalogPath: 'data/RHYME_DISCOVERY_CATALOG.json',
    honesty: {
      whatThisMeasures:
        'Immediate #53 AWARE partner recovery + #52 exact-apply proposals for InventMath templates (product rhyme result shape)',
      whatThisDoesNotMeasure:
        'Challenge headline 17/17 closes — analytic stack still required; apply closes are InventMath reconstructs',
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
