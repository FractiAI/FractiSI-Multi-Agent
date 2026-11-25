/**
 * FractiSI product rhyme discovery for ζ-23 invent.
 *
 * Uses the live product stack — not prompt-only ENGINE_SHELF slogans:
 *   #52 Tiny Gateway · Rhyming Templates (createGateway / rankPartialRhymes)
 *   #53 Protein-folding rhyme (sequence → relationship board → partner · LINEAR/FLAT/AWARE)
 *   #54 LLM language-pack rhyme (AWARE board pack nests #53)
 *   data/RHYME_DISCOVERY_CATALOG.json — named product discoveries (184 rows)
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

/** Latest FractiSI product rhyme pins (docs/product/FRACTISI_ENGINE_METHOD_PINS_2026-11.md). */
export const PRODUCT_RHYME_PINS = Object.freeze(
  ENGINE_SHELF_PINS.filter((p) => [52, 53, 54].includes(p.id)),
);

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

/** Feature vector for #53 board couplings (invent objects). */
export function inventObjectFeatures({ name, stmt = '', binders = '', closed = false, source = 'peer' }) {
  const s = `${name} ${stmt}`.toLowerCase();
  const features = {
    has_ncount: Number(/ncount/.test(s)),
    has_n0star: Number(/n0star/.test(s)),
    has_n0simple: Number(/n0simple/.test(s)),
    has_ndist: Number(/ndist/.test(s)),
    has_cmt: Number(/cmt|montgomery/.test(s)),
    has_dirichlet: Number(/dirichlet/.test(s)),
    has_rank_trace: Number(/rank_trace|indicator_pos|multiplicity/.test(s)),
    has_assembly: Number(/thm[ac]_|assembly|window_constant|two_minus/.test(s)),
    has_proportion: Number(/≤|≥|liminf|two_thirds|five_sixths|simple/.test(s)),
    has_forall: Number(/∀/.test(stmt)),
    has_exists: Number(/∃/.test(stmt)),
    binder_arity: Math.min(8, String(binders || '').split(/\s+/).filter(Boolean).length),
    closed: Number(Boolean(closed)),
    source_inventmath: Number(source === 'InventMath'),
    source_ladder: Number(source === 'paper_ladder'),
    source_peer: Number(source === 'peer' || source === 'peer_invent'),
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

/** #53 AWARE relationship board: ranked partners for query (not LINEAR window / not FLAT dump). */
export function buildAwarePartnerBoard(query, pool, { topK = 8 } = {}) {
  if (!pool.length) return [];
  const rows = zScoreRows([query, ...pool]);
  const q = rows[0];
  const scored = [];
  for (const other of rows.slice(1)) {
    scored.push({
      id: other.id,
      name: other.name,
      source: other.source,
      score: cosine(q.z, other.z),
      closed: other.closed,
      tacticBody: other.tacticBody || null,
      features: other.features,
    });
  }
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored.slice(0, topK);
}

function leanStructuralPattern({ name, stmt = '', binders = '', closed = false }) {
  const s = `${name} ${stmt}`.toLowerCase();
  let family = 'lean_goal';
  if (/rank_trace|indicator_pos|multiplicity/.test(s)) family = 'rank_trace_la';
  else if (/thm[ac]_|assembly|window_constant/.test(s)) family = 'assembly_arith';
  else if (/dirichlet/.test(s)) family = 'dirichlet_proportion';
  else if (/montgomery|cmt/.test(s)) family = 'montgomery_taylor_proportion';
  else if (/five_sixths|ndist/.test(s)) family = 'distinct_proportion';
  else if (/simple|n0simple/.test(s)) family = 'simple_online_proportion';
  else if (/n0star|critical_line|two_thirds/.test(s)) family = 'online_proportion';
  // Nest under Net Zero so #52 four-pillar gate can score invent shapes (product root).
  return {
    netZero: { octave: 0 },
    octave: 0,
    organization: {
      octave: 1,
      kind: 'lean_theorem',
      family,
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
    out.push({
      id: `inventmath:${name}`,
      name,
      source: 'InventMath',
      stmt,
      binders: '',
      closed: true,
      tacticBody: body,
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
    pool.push({
      id: `ladder:${lemma.leanName}`,
      name: lemma.leanName,
      source: 'paper_ladder',
      stmt: lemma.paperNote || lemma.id,
      binders: '',
      closed: false,
      tacticBody: null,
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
      pool.push({
        id: `peer:${name}`,
        name,
        source: 'peer_invent',
        stmt: '',
        binders: '',
        closed: Boolean(p?.closed),
        tacticBody: p?.body || null,
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
        features: inventObjectFeatures({
          name: a.theorem,
          closed: a.ok,
          source: 'peer',
        }),
        pattern: leanStructuralPattern({ name: a.theorem, closed: Boolean(a.ok) }),
      });
    }
  }
  const query = {
    id: `focus:${theorem}`,
    name: theorem,
    source: 'focus',
    stmt,
    binders,
    closed: false,
    tacticBody: null,
    features: inventObjectFeatures({ name: theorem, stmt, binders, source: 'peer' }),
    pattern: leanStructuralPattern({ name: theorem, stmt, binders }),
  };
  return { query, pool };
}

/**
 * Executable product rhyme discovery for one Challenge theorem.
 * #53 board + #52 gateway structural route + #54 AWARE pack + product catalog exemplars.
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

  // #53 AWARE board (sequence → board → partner)
  const awareBoard = buildAwarePartnerBoard(query, pool, { topK: limit });
  const linearWindow = pool.slice(0, Math.min(5, pool.length)).map((p) => ({
    id: p.id,
    name: p.name,
    source: p.source,
  }));

  // #52 Tiny Gateway structural rhyme route
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
      structuralScore: structural?.score ?? null,
      closed: hit.closed,
      tacticBody: meta.tacticBody || null,
      pattern: meta.pattern || null,
    };
  });

  // Four-pillar audit on focus pattern (product gate — honesty if evidence thin)
  const gateAudit = auditRhyme({
    pattern: query.pattern,
    expressions: [query.pattern, ...(partners.slice(0, 3).map((p) => p.pattern).filter(Boolean))],
    nestDepth: 1,
  });

  // Product catalog exemplars (named discoveries — method shape for invent)
  const exemplars = [];
  if (productCatalog.ok) {
    for (const d of productCatalog.proteinFolding.slice(0, 3)) {
      exemplars.push({
        shelf: 53,
        rhyme: d.rhyme,
        theater: d.theater,
        discoveryId: d.discoveryId,
        kind: d.kind,
        detail: d.detail,
      });
    }
    for (const d of productCatalog.llm.slice(0, 4)) {
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

  return {
    ok: true,
    discoveryKind: 'fractisi.product.#53-board+#52-gateway+#54-pack+RHYME_DISCOVERY_CATALOG',
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
      family: query.pattern.organization?.family || query.pattern.family || null,
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
    '=== FractiSI product rhyme discovery (executable) ===',
    `pins: ${pins}`,
    `discoveryKind=${discovery.discoveryKind}`,
    `productCatalog=${discovery.productCatalog?.path} · n=${discovery.productCatalog?.n} · generatedAt=${discovery.productCatalog?.generatedAt}`,
    `focus=${discovery.query?.theorem} · family=${discovery.query?.family} · poolSize=${discovery.poolSize}`,
    `gatewayRoute=${discovery.route?.id || 'none'} score=${discovery.route?.score ?? 0}`,
    `fourPillarGate=${discovery.gateAudit?.pass ? 'pass' : 'fail:' + (discovery.gateAudit?.failed || []).join(',')}`,
    '',
    '#53 folding: sequence (focus theorem) → AWARE relationship board → partner templates',
    `LEADING RELATIONAL CANDIDATE: ${discovery.leadingPartner || '(none)'}`,
    'RELATIONAL AWARENESS BOARD (measured couplings — prefer leading partner as template+delta):',
  ];
  for (const p of discovery.awareBoard || []) {
    lines.push(
      `- ${p.id}: coupling=${p.coupling.toFixed(4)} · source=${p.source}` +
        (p.tacticBody ? ' · hasTacticTemplate' : '') +
        (p.structuralScore != null ? ` · structural=${p.structuralScore.toFixed(3)}` : ''),
    );
    if (p.tacticBody) {
      lines.push('  tacticTemplate:');
      for (const row of String(p.tacticBody).split('\n').slice(0, 10)) {
        lines.push(`    ${row}`);
      }
    }
  }
  if (discovery.templateDeltas?.length) {
    lines.push('', '#52 Tiny Gateway templateRefs (selective reconstruct):');
    for (const t of discovery.templateDeltas) {
      lines.push(`- templateRef=${t.templateRef} coupling=${t.coupling.toFixed(4)}`);
    }
  }
  if (discovery.exemplars?.length) {
    lines.push(
      '',
      'Product catalog exemplars (named AWARE-only discoveries — same grammar, other theaters):',
    );
    for (const e of discovery.exemplars) {
      lines.push(
        `- [#${e.shelf}] ${e.theater}: ${e.discoveryId} · ${e.kind}` +
          (e.coupling != null ? ` · coupling=${e.coupling}` : ''),
      );
    }
  }
  lines.push(
    '',
    'Do NOT invent from a FLAT dump of all lemmas. Operate AWARE on the board: reuse the leading partner as template; invent only the delta for the focus theorem.',
  );
  return lines.join('\n');
}
