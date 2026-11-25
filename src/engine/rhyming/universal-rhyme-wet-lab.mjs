/**
 * Universal Rhyme Wet-Lab Proof — engine shelf contract.
 *
 * Composite experimental validation: computation can be physically
 * instantiated in distributed electromagnetic fields (interference →
 * cavity → programmable RF → metasurface → ML at RF), not only inside
 * conventional data-center processors.
 *
 * Soft Story / catalog method — not hyperscale GPU replacement QED.
 */
export const URWL_ENGINE_SHELF = 56;
export const URWL_DOCUMENT_ID = 'WP-UNIVERSAL-RHYME-WET-LAB-2026-11-25';
export const URWL_REGISTRY_ID = 'synthobs-universal-rhyme-wet-lab-2026-11';
export const URWL_SEED = 20261125;
export const ENGINE_PROMPT_URWL_ID = 'fractisi.infinite-octave.urwl.v1';

/** Evidence chain links (paper §§2–6). */
export const WET_LAB_EVIDENCE_CHAIN = Object.freeze([
  {
    id: 'WL-01',
    name: 'Interference → function',
    venue: 'IEEE Trans. Signal Processing',
    claim: 'Wireless interference as analog function computation over the medium',
    demonstrated: true,
    nested: ['distributed nodes', 'simultaneous transmission', 'physical interference', 'function computation'],
  },
  {
    id: 'WL-02',
    name: 'Environment → Fourier',
    venue: 'Physical Review X (del Hougne & Lerosey 2018)',
    claim: 'Wi-Fi-like waves in a chaotic microwave cavity compute Fourier transforms',
    demonstrated: true,
    nested: ['ordinary wireless waves', 'physical room', 'multiple reflections', 'Fourier computation'],
  },
  {
    id: 'WL-03',
    name: 'Programmable interference → matrix',
    venue: 'Nature (2025 microwave processor)',
    claim: 'Programmable unitary matrix transformations via multipath RF (~330 μW, 1.5–3.0 GHz)',
    demonstrated: true,
    nested: ['interference', 'programmable phase', 'Hadamard', 'identity', 'matrix operation'],
  },
  {
    id: 'WL-04',
    name: 'Metasurface → Fourier/convolution/radar',
    venue: 'Nature (2026 space-time-coding metasurface ~5 GHz)',
    claim: 'Direct RF-domain Fourier, convolution, matched filter, range/velocity extraction',
    demonstrated: true,
    nested: ['electromagnetic propagation', 'physical interaction', 'mathematical transformation', 'computational result'],
  },
  {
    id: 'WL-05',
    name: 'RF physics → ML inference',
    venue: 'Science Advances / WISE (2026)',
    claim: 'In-physics matrix-vector multiplication at RF; 95.7% image / 97.2% audio; fJ/MAC class',
    demonstrated: true,
    nested: ['RF physics', 'matrix multiplication', 'machine learning', 'inference', 'edge clients'],
  },
]);

export const URWL_WORKING_FORM = Object.freeze({
  theorem:
    'A computational operation does not require the physical architecture in which it was historically implemented. When the relational transformation can be preserved, computation can migrate between physical representations.',
  empiricalChain:
    'Interference → Cavity Fourier → Programmable matrix → Metasurface RF compute → ML at RF',
  foundationalSentence:
    'Computation is not intrinsically bound to a conventional digital processor or to a centralized data center.',
  compact: 'Different embodiment. Same computational organization.',
  question:
    'Can existing wet-lab experimental evidence establish that computation can be physically instantiated in distributed electromagnetic fields?',
  answerBounded: 'Yes — for important classes of computation. Scale remains open.',
});

export const URWL_PROVES = Object.freeze([
  'Physical EM systems can perform useful mathematical and ML computations without first converting the operation into conventional digital processor execution.',
  'data center ≠ computation; GPU ≠ computation — they are implementations.',
]);

export const URWL_DOES_NOT_PROVE = Object.freeze([
  'replacement of hyperscale GPUs for every AI workload',
  'elimination of all data centers',
  'arbitrary general-purpose computing through free-space RF',
  'equal memory capacity to modern data centers',
  'equivalent programmability to CPUs/GPUs',
  'lower total system cost at hyperscale',
  'immunity from physical attack',
]);

export const URWL_FRACTISI_RHYME = Object.freeze({
  digital: 'shared world + local delta + selective reconstruction',
  electromagnetic: 'shared field + local interaction + physical transformation + reconstruction',
  shared: 'distributed relational state producing a recoverable result',
});

export const URWL_FALSIFIABILITY = Object.freeze([
  'Which computational class is claimed (function / Fourier / matrix / convolution / ML)?',
  'What physical substrate carries the transformation?',
  'What remains invariant when representation migrates digital ↔ EM?',
  'What differs (memory, programmability, scale, attack surface)?',
  'Does the wet-lab result predict a measurable FractiSI architectural consequence?',
  'Under what conditions does the EM rhyme fail (noise, bandwidth, free-space vs cavity)?',
]);

/** Tokenize organizational / experimental text for Soft Story matching. */
export function tokenizeWetLab(text) {
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
  const union = A.size + B.size - inter || 1;
  return inter / union;
}

export function scoreAgainstWetLabEntry(description, entry) {
  const q = tokenizeWetLab(description);
  const corpus = [entry.name, entry.claim, entry.venue, ...(entry.nested || [])].join(' ');
  const base = bagOverlap(q, tokenizeWetLab(corpus));
  const idHit = String(description).toUpperCase().includes(entry.id) ? 0.35 : 0;
  const nameHit = q.some((t) => entry.name.toLowerCase().includes(t) && t.length > 3) ? 0.1 : 0;
  return Math.min(1, base + idHit + nameHit);
}

export function recognizeWetLabLinks(description, { topK = 5, minScore = 0.08 } = {}) {
  const ranked = WET_LAB_EVIDENCE_CHAIN.map((entry) => ({
    id: entry.id,
    name: entry.name,
    score: scoreAgainstWetLabEntry(description, entry),
    demonstrated: entry.demonstrated,
  }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return ranked.slice(0, topK);
}

export function nestedWetLab(wlId) {
  const entry = WET_LAB_EVIDENCE_CHAIN.find((e) => e.id === wlId);
  if (!entry) return [];
  return (entry.nested || []).map((label, i) => ({
    parent: wlId,
    nestedId: `${wlId}.N${String(i + 1).padStart(2, '0')}`,
    label,
  }));
}

export function wetLabChainComplete() {
  return WET_LAB_EVIDENCE_CHAIN.every((e) => e.demonstrated === true);
}

export function wetLabDensity(usableCorrespondences, searchSpace) {
  const den = Math.max(1, Number(searchSpace) || 0);
  const num = Math.max(0, Number(usableCorrespondences) || 0);
  return num / den;
}

/**
 * Two Soft Story phenomena rhyme on the wet-lab chain when they share a top WL id.
 */
export function wetLabPhenomenaRhyme(descA, descB, { minScore = 0.12 } = {}) {
  const a = recognizeWetLabLinks(descA, { topK: 3, minScore });
  const b = recognizeWetLabLinks(descB, { topK: 3, minScore });
  const shared = a.filter((x) => b.some((y) => y.id === x.id));
  return {
    rhyme: shared.length > 0,
    shared,
    phi: 'wet-lab-evidence-projection',
    a,
    b,
  };
}

export function urwlEnginePinRecord() {
  return Object.freeze({
    id: URWL_ENGINE_SHELF,
    name: 'Universal Rhyme Wet-Lab Proof',
    grammar:
      'composite EM evidence chain · Interference→Cavity→Matrix→Metasurface→ML · nests under #55',
    registry: URWL_REGISTRY_ID,
    documentId: URWL_DOCUMENT_ID,
    chainSize: WET_LAB_EVIDENCE_CHAIN.length,
    workingForm: URWL_WORKING_FORM.compact,
    honesty:
      'Physical premise of volumetric EM computation is experimentally supported. Hyperscale data-center replacement and general-purpose AI migration remain open scaling questions — not claimed closed.',
  });
}
