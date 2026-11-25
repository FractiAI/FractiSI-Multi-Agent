/**
 * Principal Rhyme Theorem (PRT) — engine shelf contract.
 *
 * Organizational rhyme ≠ superficial resemblance. Phenomena rhyme when a
 * transformation Φ maps significant organization (relations / dynamics /
 * boundaries / invariants) across substrates, scales, or representations.
 *
 * Catalog architecture + measurable Soft Story experiments — not Universe
 * ontology QED, not physics retirement of objects.
 */
export const PRT_ENGINE_SHELF = 55;
export const PRT_DOCUMENT_ID = 'WP-PRINCIPAL-RHYME-THEOREM-EGS-2026-11-25';
export const PRT_REGISTRY_ID = 'synthobs-principal-rhyme-theorem-2026-11';
export const PRT_SEED = 20261125;
export const ENGINE_PROMPT_PRT_ID = 'fractisi.infinite-octave.prt.v1';

/** Evidence hierarchy for proposed correspondences (paper §7). */
export const RHYME_LEVELS = Object.freeze([
  { level: 0, name: 'Visual', body: 'Objects look alike.' },
  { level: 1, name: 'Structural', body: 'Relational topology corresponds.' },
  { level: 2, name: 'Dynamic', body: 'Behavior through time corresponds.' },
  { level: 3, name: 'Functional', body: 'Organizational functions correspond.' },
  { level: 4, name: 'Generative', body: 'Comparable rules generate the organization.' },
  { level: 5, name: 'Invariant', body: 'Organization survives substrate / scale / representation change.' },
]);

/**
 * First Principal Rhyme Catalog (PR-01 … PR-20 + PR-∞).
 * Each entry is a reusable organizational structure, not an object inventory.
 */
export const PRINCIPAL_RHYME_CATALOG = Object.freeze([
  {
    id: 'PR-01',
    name: 'Being ↔ Change',
    canonical: 'persistence ↔ transformation',
    nested: ['object ↔ process', 'state ↔ transition', 'stability ↔ instability', 'persistence ↔ evolution'],
  },
  {
    id: 'PR-02',
    name: 'Boundary ↔ Environment',
    canonical: 'system distinguished from surrounds',
    nested: ['cell ↔ environment', 'organism ↔ ecosystem', 'planet ↔ space', 'agent ↔ world', 'process ↔ external state'],
  },
  {
    id: 'PR-03',
    name: 'Part ↔ Whole',
    canonical: 'components in larger organization',
    nested: ['particle→atom', 'atom→molecule', 'molecule→cell', 'cell→organism', 'organism→ecosystem', 'agent→multi-agent'],
  },
  {
    id: 'PR-04',
    name: 'Node ↔ Relationship',
    canonical: 'entities gain meaning through connections',
    nested: ['atom↔bond', 'neuron↔synapse', 'person↔relationship', 'server↔network', 'agent↔message', 'concept↔association'],
  },
  {
    id: 'PR-05',
    name: 'Source ↔ Sink',
    canonical: 'originate → flow → accumulate / terminate',
    nested: ['star→radiation', 'battery→load', 'river→ocean', 'generator→consumer', 'source→receiver'],
  },
  {
    id: 'PR-06',
    name: 'Flow ↔ Resistance',
    canonical: 'movement through constraints',
    nested: ['energy↔impedance', 'fluid↔friction', 'electricity↔resistance', 'heat↔thermal resistance', 'info↔bandwidth', 'compute↔bottleneck'],
  },
  {
    id: 'PR-07',
    name: 'Input → Transformation → Output',
    canonical: 'I → F(I) → O',
    nested: ['physical dynamics', 'metabolism', 'sensory processing', 'computation', 'manufacturing', 'AI inference', 'multi-agent coordination'],
  },
  {
    id: 'PR-08',
    name: 'Encode ↔ Decode',
    canonical: 'representation change with recoverable structure',
    nested: ['DNA→protein', 'signal→neural', 'pixels→vision', 'source→executable', 'compressed→reconstructed'],
  },
  {
    id: 'PR-09',
    name: 'Compression ↔ Reconstruction',
    canonical: 'shared organization without every detail',
    nested: ['memory↔recall', 'compression↔decompression', 'cache↔recomputation', 'model↔generated state', 'Tiny Gateway↔selective materialization'],
  },
  {
    id: 'PR-10',
    name: 'Signal ↔ Noise',
    canonical: 'meaningful structure vs irrelevant variation',
    nested: ['sensory↔background', 'data↔noise', 'relevant↔irrelevant context', 'useful↔redundant world state'],
  },
  {
    id: 'PR-11',
    name: 'Pattern ↔ Prediction',
    canonical: 'Observation → Pattern → Prediction',
    nested: ['recognition', 'inference'],
  },
  {
    id: 'PR-12',
    name: 'Prediction ↔ Error',
    canonical: 'Model → Prediction → Observation → Error',
    nested: ['expectation', 'discrepancy as information'],
  },
  {
    id: 'PR-13',
    name: 'Transformation ↔ Invariance',
    canonical: 'change with preserved organizational property',
    nested: ['symmetry', 'invariant features'],
  },
  {
    id: 'PR-14',
    name: 'Symmetry ↔ Conservation',
    canonical: 'Symmetry → Invariance → Conservation (Noether precedent)',
    nested: ['continuous symmetry', 'conservation laws'],
  },
  {
    id: 'PR-15',
    name: 'Replication ↔ Variation',
    canonical: 'structure persists while variants appear',
    nested: ['biological evolution', 'copy with mutation'],
  },
  {
    id: 'PR-16',
    name: 'Selection ↔ Adaptation',
    canonical: 'some variants persist under conditions',
    nested: ['fitness under constraints'],
  },
  {
    id: 'PR-17',
    name: 'Convergence ↔ Divergence',
    canonical: 'similar solutions from different starts / diverge under different environments',
    nested: ['convergent evolution', 'path dependence'],
  },
  {
    id: 'PR-18',
    name: 'Local ↔ Global',
    canonical: 'local interaction → collective structure',
    nested: ['physical', 'biological', 'computational', 'social'],
  },
  {
    id: 'PR-19',
    name: 'Feedback',
    canonical: 'A → B → A (output becomes input)',
    nested: ['homeostasis', 'learning', 'control', 'ecosystems', 'markets', 'adaptive AI'],
  },
  {
    id: 'PR-20',
    name: 'Model ↔ World',
    canonical: 'World → Model → Action → World′',
    nested: ['representation', 'action loop'],
  },
  {
    id: 'PR-∞',
    name: 'Rhyme ↔ Rhyme',
    canonical: 'R(R(R(…))) — relationships participate in higher-order relationships',
    nested: ['meta-rhyme', 'recursive relational space'],
  },
]);

export const PRT_WORKING_FORM = Object.freeze({
  theorem:
    'Phenomena that differ in substrate, scale, representation, or vocabulary may instantiate recurring organizational structures. These structures can be identified as rhymes, recursively decomposed into nested rhymes, connected across domains, and potentially exploited for prediction, reconstruction, and computation.',
  empiricalChain:
    'Rhyme Recognition → Organizational Transfer → Reduced Redundancy → Computational Advantage',
  foundationalSentence: 'The universe does not necessarily repeat its things; it repeatedly instantiates its relationships.',
  compact: 'Different things. Same rhyme.',
});

export const PRT_FALSIFIABILITY = Object.freeze([
  'What exactly corresponds?',
  'What transformation connects the systems?',
  'What remains invariant?',
  'What differs?',
  'Can the correspondence predict anything?',
  'Can the original structure be reconstructed?',
  'Does recognizing the rhyme provide measurable advantage?',
  'Under what conditions does the rhyme fail?',
]);

export const PRT_FRACTISI_CYCLE = Object.freeze([
  'Recognize',
  'Connect',
  'Reconstruct',
  'Coordinate',
  'Verify',
]);

/** Tokenize organizational text for Soft Story matching. */
export function tokenizeOrganization(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9↔→←∞\s-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function bagOverlap(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  const union = A.size + B.size - inter || 1;
  return inter / union;
}

/**
 * Score a phenomenon description against one catalog entry.
 * Returns best nested / canonical overlap in [0, 1].
 */
export function scoreAgainstEntry(description, entry) {
  const q = tokenizeOrganization(description);
  const corpus = [entry.name, entry.canonical, ...(entry.nested || [])].join(' ');
  const base = bagOverlap(q, tokenizeOrganization(corpus));
  // Boost exact id / short-name hits
  const idHit = String(description).toUpperCase().includes(entry.id) ? 0.35 : 0;
  const nameHit = q.some((t) => entry.name.toLowerCase().includes(t) && t.length > 3) ? 0.1 : 0;
  return Math.min(1, base + idHit + nameHit);
}

/**
 * Rhyme recognition: rank catalog entries for an unfamiliar phenomenon.
 * Soft Story / catalog method — not a claim of unique ground truth.
 */
export function recognizeRhymes(description, { topK = 5, minScore = 0.08 } = {}) {
  const ranked = PRINCIPAL_RHYME_CATALOG.map((entry) => ({
    id: entry.id,
    name: entry.name,
    score: scoreAgainstEntry(description, entry),
    levelHint: entry.id === 'PR-∞' ? 5 : entry.id === 'PR-14' || entry.id === 'PR-13' ? 5 : 3,
  }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return ranked.slice(0, topK);
}

/**
 * Nested rhyme discovery: given a top rhyme, return its nested subordinate ids/labels.
 */
export function nestedRhymes(prId) {
  const entry = PRINCIPAL_RHYME_CATALOG.find((e) => e.id === prId);
  if (!entry) return [];
  return (entry.nested || []).map((label, i) => ({
    parent: prId,
    nestedId: `${prId}.N${String(i + 1).padStart(2, '0')}`,
    label,
  }));
}

/**
 * Rhyme density ρ_R = usable organizational correspondences / search space.
 */
export function rhymeDensity(usableCorrespondences, searchSpace) {
  const den = Math.max(1, Number(searchSpace) || 0);
  const num = Math.max(0, Number(usableCorrespondences) || 0);
  return num / den;
}

/**
 * Two Soft Story phenomena "rhyme" when they share a top catalog id above threshold
 * under independent descriptions (Φ = catalog projection).
 */
export function phenomenaRhyme(descA, descB, { minScore = 0.12 } = {}) {
  const a = recognizeRhymes(descA, { topK: 3, minScore });
  const b = recognizeRhymes(descB, { topK: 3, minScore });
  const shared = a.filter((x) => b.some((y) => y.id === x.id));
  return {
    rhyme: shared.length > 0,
    shared,
    phi: 'catalog-projection',
    a,
    b,
  };
}

export function prtEnginePinRecord() {
  return Object.freeze({
    id: PRT_ENGINE_SHELF,
    name: 'Principal Rhyme Theorem',
    grammar: 'organizational rhyme · nested catalog · Recognize→Connect→Reconstruct→Coordinate→Verify',
    registry: PRT_REGISTRY_ID,
    documentId: PRT_DOCUMENT_ID,
    catalogSize: PRINCIPAL_RHYME_CATALOG.length,
    levels: RHYME_LEVELS.length,
    workingForm: PRT_WORKING_FORM.compact,
    honesty:
      'Foundational catalog / computational research program pin. Not Universe ontology QED; not every resemblance is a rhyme.',
  });
}
