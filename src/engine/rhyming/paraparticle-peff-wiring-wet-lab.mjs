/**
 * Paraparticle–PEFF Cross-Scale Rhyme — Computational Lab + Wiring Wet Lab.
 *
 * Application companion / Frontier Expedition — not Infinite Octaves ENGINE_SHELF.
 * Literature primitives stay independently demonstrated; wiring is the new object.
 */
export const PEFF_DOCUMENT_ID = 'EXP-FRACTISI-PEFF-PARAPARTICLE-WIRING-WETLAB-2026-11-27';
export const PEFF_REGISTRY_ID = 'synthobs-paraparticle-peff-wiring-wet-lab-2026-11';
export const PEFF_SEED = 20261127;
export const PEFF_ENGINE_SHELF_PINNED = false;
export const PEFF_SERIES = 'FractiSI Frontier Expedition Series';

/** Provisional organization vector R = [Df, Mf, C, Φ, X, T, S]. */
export const R_KEYS = Object.freeze(['Df', 'Mf', 'C', 'Phi', 'X', 'T', 'S']);

/** Supplied PEFF EEG meditation analysis (24 subjects) — historical/supplied tier. */
export const EEG_PEFF_SUPPLIED = Object.freeze({
  subjects: 24,
  source: 'supplied PEFF analysis on public EEG meditation dataset',
  concentration: Object.freeze({
    higuchiDf: 1.42,
    higuchiDfSd: 0.05,
    thetaC: 0.68,
    alphaC: 0.72,
    gammaC: 0.55,
  }),
  mindWandering: Object.freeze({
    higuchiDf: 1.35,
    higuchiDfSd: 0.06,
    thetaC: 0.59,
    alphaC: 0.63,
    gammaC: 0.51,
  }),
});

/**
 * MIT analog paraparticle benchmark (literature / historical).
 * arXiv:2611.03908 · New Scientist 2026-11-27 coverage.
 */
export const MIT_PARAPARTICLE_BENCHMARK = Object.freeze({
  arxiv: '2611.03908',
  venue: 'Analog quantum simulation of paraparticle statistics',
  qubits: 16,
  lattice: 'transmon superconducting-qubit lattice',
  species: 'm=2 R-paraparticle',
  exchangePhaseRad: Math.PI,
  exchangePhaseDeg: 180,
  antibunchingColorIndependent: true,
  occupationDistinctFromBose: true,
  occupationDistinctFromFermi: true,
  newScientistUrl:
    'https://www.newscientist.com/article/2600979-particles-not-seen-before-have-been-observed-in-a-quantum-simulator/',
});

/**
 * Wiring Wet Lab evidence chain — each link is an independently demonstrated
 * experimental primitive with I/O compatibility fields.
 */
export const PEFF_WIRING_CHAIN = Object.freeze([
  {
    id: 'PW-01',
    name: 'Cognitive organization',
    primitive:
      'Public EEG meditation datasets measure concentration vs mind-wandering with fractal and coherence contrasts (supplied PEFF analysis).',
    input: 'cognitive state labels during meditation',
    output: 'state-dependent neural organization (Df, coherence bands)',
    nextInput: 'neural / oscillatory organizational descriptors',
    demonstrated: true,
    compatibility: true,
  },
  {
    id: 'PW-02',
    name: 'Fractal / harmonic / phase organization',
    primitive:
      'Computational PEFF extraction recovers fractal dimension, band coherence, and phase organization from neural time series.',
    input: 'neural organization measurements',
    output: 'R-like organizational representation (Df, C, Phi)',
    nextInput: 'organizational / phase representation for physical comparison',
    demonstrated: true,
    compatibility: true,
  },
  {
    id: 'PW-03',
    name: 'Physical state transformation',
    primitive:
      'Phase/interference transformation experiments show that relational phase rules change measurable signatures without changing only the label.',
    input: 'phase / organizational state',
    output: 'transformed phase / interference signature',
    nextInput: 'exchange / interference conditions',
    demonstrated: true,
    compatibility: true,
  },
  {
    id: 'PW-04',
    name: 'Exchange relationship',
    primitive:
      'MIT m=2 R-paraparticle emulation reports ≈180° exchange phase on a superconducting qubit lattice (arXiv:2611.03908).',
    input: 'two-particle exchange / interference protocol',
    output: 'exchange phase ≈ π with color-agnostic antibunching',
    nextInput: 'occupation / statistics readout',
    demonstrated: true,
    compatibility: true,
  },
  {
    id: 'PW-05',
    name: 'Non-Bose / non-Fermi statistics',
    primitive:
      'Same MIT experiment reports thermal occupation inconsistent with Bose–Einstein and Fermi–Dirac statistics.',
    input: 'paraparticle exchange system',
    output: 'non-classical occupation statistics',
    nextInput: null,
    demonstrated: true,
    compatibility: true,
  },
]);

export const PEFF_WORKING_FORM = Object.freeze({
  question:
    'Do internal PEFF organizational patterns recur across cognitive dynamics, particle events, and paraparticle quantum statistics, and can independently demonstrated mechanisms be wired into a larger FractiSI systemic proof?',
  answerBounded:
    'Yes — as a scientifically testable cross-domain organizational rhyme and a constructible Wiring Wet Lab chain. Not as a new force or physical identity claim.',
  rhyme: 'State → Internal Organization → Relational Transformation → Observable Signature',
  wiring:
    'neural organization → oscillatory/phase organization → physical transformation → exchange/interference → non-classical statistics',
  compact: 'Different systems. Same organizational rhyme under test.',
});

export const PEFF_DOES_NOT_PROVE = Object.freeze([
  'PEFF as a new fundamental force',
  'thoughts as literal particles',
  'paraparticles as PEFF excitations',
  'universal equivalence of spin, phase, and polarity',
  'a single physical mechanism connecting EEG and quantum statistics',
  'discovery of a new elementary particle outside the cited quantum simulation',
]);

export const PEFF_FALSIFIERS = Object.freeze([
  'output of A cannot serve as input to B',
  'relationship appears only after arbitrary rescaling',
  'phase randomization preserves the result',
  'shuffled controls produce the same structure',
  'conventional models explain equally well',
  'invariant disappears on held-out data',
  'original experiment does not support the assumed mechanism',
]);

/** @param {Record<string, number>} partial */
export function encodeR(partial = {}) {
  return Object.fromEntries(R_KEYS.map((k) => [k, Number(partial[k] ?? 0)]));
}

/** @param {Record<string, number>} a @param {Record<string, number>} b */
export function cosineR(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k of R_KEYS) {
    const x = Number(a[k] || 0);
    const y = Number(b[k] || 0);
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Polarity flip P→−P matches e^{iφ} → e^{i(φ+π)} (= −e^{iφ}). */
export function polarityPhaseBridge(phi = 0) {
  const a = cis(phi + Math.PI);
  const b = scaleComplex(cis(phi), -1);
  return {
    phi,
    afterPhase: a,
    afterPolarity: b,
    equal: nearlyEqual(a.re, b.re) && nearlyEqual(a.im, b.im),
    exchangeBenchmarkDeg: MIT_PARAPARTICLE_BENCHMARK.exchangePhaseDeg,
  };
}

function cis(theta) {
  return { re: Math.cos(theta), im: Math.sin(theta) };
}

function scaleComplex(z, s) {
  return { re: z.re * s, im: z.im * s };
}

function nearlyEqual(x, y, eps = 1e-12) {
  return Math.abs(x - y) <= eps;
}

/** @param {{ id: string, output: string, nextInput: string | null, compatibility: boolean }[]} chain */
export function wiringChainAdmits(chain = PEFF_WIRING_CHAIN) {
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i];
    const b = chain[i + 1];
    if (!a.demonstrated || !b.demonstrated) return false;
    if (!a.compatibility || !b.compatibility) return false;
    if (!a.nextInput || !b.input) return false;
    // Compatibility: prior nextInput must be a non-empty descriptor that B accepts.
    if (!String(a.nextInput).trim() || !String(b.input).trim()) return false;
  }
  return chain.every((e) => e.demonstrated && e.compatibility);
}

export function peffExpeditionRecord() {
  return {
    documentId: PEFF_DOCUMENT_ID,
    registryId: PEFF_REGISTRY_ID,
    series: PEFF_SERIES,
    engineShelfPinned: PEFF_ENGINE_SHELF_PINNED,
    question: PEFF_WORKING_FORM.question,
    answerBounded: PEFF_WORKING_FORM.answerBounded,
    rhyme: PEFF_WORKING_FORM.rhyme,
    wiring: PEFF_WORKING_FORM.wiring,
    doesNotProve: [...PEFF_DOES_NOT_PROVE],
    falsifiers: [...PEFF_FALSIFIERS],
    chainIds: PEFF_WIRING_CHAIN.map((e) => e.id),
    mit: {
      arxiv: MIT_PARAPARTICLE_BENCHMARK.arxiv,
      exchangePhaseDeg: MIT_PARAPARTICLE_BENCHMARK.exchangePhaseDeg,
      qubits: MIT_PARAPARTICLE_BENCHMARK.qubits,
    },
  };
}
