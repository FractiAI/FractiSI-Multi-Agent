/**
 * Neural X-Ray Rhyme — ENGINE_SHELF #58.
 *
 * Computational-lab + wiring/wet-lab convergence → organizational X-ray.
 * Nests under #55 Principal Rhyme Theorem · #56 Wet-Lab · #57 Compositional Scale.
 *
 * Soft Story / catalog method — does NOT claim all neural-network internals decoded.
 */
export const NXR_ENGINE_SHELF = 58;
export const NXR_DOCUMENT_ID = 'WP-NEURAL-XRAY-RHYME-2026-11-25';
export const NXR_REGISTRY_ID = 'synthobs-neural-xray-rhyme-2026-11';
export const NXR_SEED = 20261125;
export const ENGINE_PROMPT_NXR_ID = 'fractisi.infinite-octave.nxr.v1';

/** Eight-stage integrated proof architecture (paper §2). */
export const XRAY_STAGES = Object.freeze([
  { id: 'XR-01', name: 'Observe', body: 'Acquire measurements from computational and wiring/wet-lab systems.' },
  { id: 'XR-02', name: 'Encode', body: 'Translate observations into comparable structural representations.' },
  { id: 'XR-03', name: 'Detect', body: 'FractiSI searches for recurring organizational relationships.' },
  { id: 'XR-04', name: 'Match', body: 'Determine whether the same rhyme appears in the other evidence stream.' },
  { id: 'XR-05', name: 'Reconstruct', body: 'Use the detected rhyme to reconstruct missing or transformed structure.' },
  { id: 'XR-06', name: 'Predict', body: 'Freeze the rhyme and predict on previously unseen observations.' },
  { id: 'XR-07', name: 'Intervene', body: 'Alter the identified organizational relationship.' },
  { id: 'XR-08', name: 'Observe consequence', body: 'Determine whether the predicted system-level change occurs.' },
]);

/** Claims A/B/C (paper §1). */
export const XRAY_CLAIMS = Object.freeze([
  {
    id: 'XA',
    name: 'Organization exists above components',
    body: 'Recurring relationships not reducible to any one neuron, weight, feature, wire, or component.',
  },
  {
    id: 'XB',
    name: 'Organization survives representation changes',
    body: 'Same structure when words, vectors, neurons, layers, implementations, or physical↔computational encodings change.',
  },
  {
    id: 'XC',
    name: 'Organization is useful',
    body: 'Detected rhyme permits reconstruction, prediction, compression, coordination, or causal intervention.',
  },
]);

/** Five principal-rhyme criteria (paper §12). */
export const PRINCIPAL_RHYME_CRITERIA = Object.freeze([
  { id: 'PRC-01', name: 'Persistence', body: 'Survives representation changes.' },
  { id: 'PRC-02', name: 'Recurrence', body: 'Appears more than once under independent conditions.' },
  { id: 'PRC-03', name: 'Compression', body: 'Describes multiple observations more efficiently than unrelated descriptions.' },
  { id: 'PRC-04', name: 'Prediction', body: 'Predicts an unseen observation.' },
  { id: 'PRC-05', name: 'Intervention', body: 'Changing it produces the predicted consequence.' },
]);

/**
 * Soft Story wiring/wet-lab sequence bridges (paper §§5–6).
 * Ordered observations → relationships — not a claim that biology = ANNs.
 */
export const WIRING_SEQUENCE = Object.freeze([
  {
    id: 'WS-01',
    observation: 'EM interference implements analog functions in the medium',
    relationship: 'communication participates in computation',
    nest: ['WL-01', 'CC-01'],
  },
  {
    id: 'WS-02',
    observation: 'Programmable RF matrix / Fourier / convolution in EM space',
    relationship: 'physical transformation = mathematical operator',
    nest: ['WL-03', 'WL-04', 'CC-02', 'CC-03'],
  },
  {
    id: 'WS-03',
    observation: 'WISE RF matrix-vector ML inference with wireless model broadcast',
    relationship: 'distributed endpoints share organization without full digital copies',
    nest: ['WL-05', 'CC-05'],
  },
  {
    id: 'WS-04',
    observation: 'APP–DNMT3A / NPY–SOD1 class wiring discoveries (STRING-empty, rhyme coupling)',
    relationship: 'relational fingerprint recovers partners literal edges miss',
    nest: ['PR-04', 'PR-09'],
  },
  {
    id: 'WS-05',
    observation: 'Shared-world delta + selective reconstruction in FractiSI multi-agent labs',
    relationship: 'exact lexical identity ≠ structural match',
    nest: ['PR-09', 'PR-08'],
  },
]);

export const NXR_WORKING_FORM = Object.freeze({
  question:
    'Can FractiSI X-ray the hidden organizational structure of neural networks by combining computational-lab and wiring/wet-lab evidence?',
  answer:
    'YES — if the computational and wiring/wet-lab evidence converge on the same reproducible, predictive, and causally testable rhyme.',
  compact: 'See the rhyme. Reconstruct. Predict. Intervene.',
  decisiveThreshold:
    'Successful blind prediction and intervention using a rhyme identified before the corresponding outcome is observed.',
  evidentiaryHierarchy: 'correlation < structural correspondence < prediction < successful intervention',
});

export const NXR_PROVES = Object.freeze([
  'Computational Soft Story evidence supports structural match beyond literal identity, selective reconstruction, and reusable organizational relationships.',
  'Wiring/wet-lab observations can be ordered into a relational sequence and projected onto the same principal-rhyme vocabulary.',
]);

export const NXR_DOES_NOT_PROVE = Object.freeze([
  'that all neural-network internals have already been decoded',
  'that biology and artificial neural networks are identical',
  'completed blind prediction + causal intervention on a live neural network (decisive threshold still open)',
  'that every parameter becomes individually interpretable',
  'hyperscale replacement of conventional interpretability methods',
]);

export const NXR_FALSIFIABILITY = Object.freeze([
  'Detected rhymes disappear under representation changes',
  'Cross-model / cross-domain correspondence fails',
  'Blind prediction performs no better than appropriate controls',
  'Apparent rhymes cannot be reconstructed',
  'Intervention does not produce predicted consequences',
  'Equivalent performance from simpler conventional methods',
  'Cross-domain correspondence disappears when experimental leakage is removed',
]);

export function tokenizeXray(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9μµ→←\s./+-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function bagOverlap(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter || 1);
}

export function scoreAgainstXrayStage(description, entry) {
  const q = tokenizeXray(description);
  const corpus = [entry.name, entry.body, entry.id].join(' ');
  const base = bagOverlap(q, tokenizeXray(corpus));
  const idHit = String(description).toUpperCase().includes(entry.id) ? 0.35 : 0;
  return Math.min(1, base + idHit);
}

export function recognizeXrayStages(description, { topK = 5, minScore = 0.08 } = {}) {
  return XRAY_STAGES.map((entry) => ({
    id: entry.id,
    name: entry.name,
    score: scoreAgainstXrayStage(description, entry),
  }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, topK);
}

export function recognizeWiringLinks(description, { topK = 5, minScore = 0.06 } = {}) {
  return WIRING_SEQUENCE.map((entry) => {
    const corpus = [entry.observation, entry.relationship, ...(entry.nest || [])].join(' ');
    const score = bagOverlap(tokenizeXray(description), tokenizeXray(corpus));
    return { id: entry.id, score, nest: entry.nest };
  })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, topK);
}

export function crossDomainRhyme(compDesc, wetDesc, { minScore = 0.05 } = {}) {
  const a = recognizeWiringLinks(compDesc, { topK: 3, minScore });
  const b = recognizeWiringLinks(wetDesc, { topK: 3, minScore });
  const sharedIds = a.filter((x) => b.some((y) => y.id === x.id));
  // Also match when nest families overlap (PR-/WL-/CC- prefixes) across streams
  const nestsA = new Set(a.flatMap((x) => x.nest || []));
  const nestsB = new Set(b.flatMap((x) => x.nest || []));
  const sharedNests = [...nestsA].filter((n) => nestsB.has(n));
  const sharedFamilies = [...nestsA]
    .map((n) => n.slice(0, 2))
    .filter((f, i, arr) => arr.indexOf(f) === i && [...nestsB].some((n) => n.startsWith(f)));
  const rhyme = sharedIds.length > 0 || sharedNests.length > 0 || sharedFamilies.length > 0;
  return {
    rhyme,
    shared: sharedIds,
    sharedNests,
    sharedFamilies,
    phi: 'computational↔wiring/wet-lab projection',
  };
}

export function principalCriteriaComplete() {
  return (
    PRINCIPAL_RHYME_CRITERIA.length === 5 &&
    PRINCIPAL_RHYME_CRITERIA.every((c, i) => c.id === `PRC-0${i + 1}`)
  );
}

export function nxrEnginePinRecord() {
  return Object.freeze({
    id: NXR_ENGINE_SHELF,
    name: 'Neural X-Ray Rhyme',
    grammar:
      'Observe→Encode→Detect→Match→Reconstruct→Predict→Intervene→Consequence · nests under #55/#56/#57',
    registry: NXR_REGISTRY_ID,
    documentId: NXR_DOCUMENT_ID,
    stages: XRAY_STAGES.length,
    workingForm: NXR_WORKING_FORM.compact,
    honesty:
      'Supports a testable systemic model. Does NOT claim all neural-network internals decoded. Decisive threshold = blind prediction + causal intervention.',
  });
}
