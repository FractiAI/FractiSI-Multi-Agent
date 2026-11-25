/**
 * Compositional Wet-Lab Scale Proof — ENGINE_SHELF #57.
 *
 * Level I physical / Level II compositional / Level III systemic.
 * Nests under #56 Universal Rhyme Wet-Lab and #55 Principal Rhyme Theorem.
 *
 * Soft Story / catalog method — Level III hyperscale replacement NOT claimed.
 */
export const CWLS_ENGINE_SHELF = 57;
export const CWLS_DOCUMENT_ID = 'WP-COMPOSITIONAL-WET-LAB-SCALE-2026-11-25';
export const CWLS_REGISTRY_ID = 'synthobs-compositional-wet-lab-scale-2026-11';
export const CWLS_SEED = 20261125;
export const ENGINE_PROMPT_CWLS_ID = 'fractisi.infinite-octave.cwls.v1';

/** Five layers of compositional wet-lab proof (paper §2). */
export const COMPOSITION_LAYERS = Object.freeze([
  {
    id: 'CL-01',
    name: 'Primitive',
    body: 'A physical medium demonstrably performs a computational operation.',
  },
  {
    id: 'CL-02',
    name: 'Interface',
    body: 'The output of one physical operation can serve as the input to another.',
  },
  {
    id: 'CL-03',
    name: 'Cascading',
    body: 'Multiple operations can be chained beyond a single transformation.',
  },
  {
    id: 'CL-04',
    name: 'Programmability',
    body: 'The physical computational structure can be changed to perform different transformations.',
  },
  {
    id: 'CL-05',
    name: 'Scaling',
    body: 'Relevant dimensions can increase without changing the fundamental computational principle.',
  },
]);

/** Three-level proof status (paper §16). */
export const PROOF_LEVELS = Object.freeze([
  {
    level: 1,
    name: 'Physical',
    question: 'Can electromagnetic physics perform computation?',
    status: 'YES',
    proven: true,
  },
  {
    level: 2,
    name: 'Compositional',
    question:
      'Can experimentally demonstrated EM computational primitives be composed into increasingly general computational systems?',
    status: 'YES — with substantial experimental support',
    proven: true,
  },
  {
    level: 3,
    name: 'Systemic',
    question:
      'Can the resulting computational medium perform data-center-class workloads at competitive scale, energy, reliability, memory, and economics?',
    status: 'NOT YET PROVEN — experimentally approachable',
    proven: false,
  },
]);

/**
 * Extended compositional chain (paper §§3–10).
 * Builds on #56 WL-01…WL-05 and adds calculus, multilayer RF-CNN, programmable space.
 */
export const COMPOSITIONAL_CHAIN = Object.freeze([
  {
    id: 'CC-01',
    name: 'Propagation participates',
    claim: 'EM superposition implements functions in the medium',
    layer: 'CL-01',
    demonstrated: true,
    nested: ['interference', 'analog function', 'communication=computation'],
  },
  {
    id: 'CC-02',
    name: 'Programmable unitary matrix',
    claim: '2025 Nature Communications microwave unitary transforms',
    layer: 'CL-01',
    demonstrated: true,
    nested: ['vector', 'physical transformation', 'transformed vector', 'parallel RF'],
  },
  {
    id: 'CC-03',
    name: 'Fourier + convolution in EM',
    claim: '2026 Nature Communications space-time-coding metasurface (512 samples)',
    layer: 'CL-03',
    demonstrated: true,
    nested: ['Fourier', 'convolution', 'radar', 'programmable vocabulary'],
  },
  {
    id: 'CC-04',
    name: 'EM calculus',
    claim: '2026 National Science Review differentiation/integration on spatial energy',
    layer: 'CL-03',
    demonstrated: true,
    nested: ['differentiation', 'integration', 'dynamic switch', 'field as math object'],
  },
  {
    id: 'CC-05',
    name: 'WISE ML at RF',
    claim: 'RF matrix-vector multiplication → ML inference; wireless model broadcast',
    layer: 'CL-02',
    demonstrated: true,
    nested: ['frequency mixer', 'edge clients', 'fJ/MAC', 'distributed inference'],
  },
  {
    id: 'CC-06',
    name: 'Multilayer RF-CNN',
    claim: '2026 preprint: up to 26.4M params, nine layers (treat as preprint)',
    layer: 'CL-03',
    demonstrated: true,
    preprint: true,
    nested: ['RF convolution', 'deep network', 'image generation', 'classification'],
  },
  {
    id: 'CC-07',
    name: 'Programmable computational space',
    claim: '2026 Nature Communications: thousands of holographic channels',
    layer: 'CL-04',
    demonstrated: true,
    nested: ['6144-element metasurface', '62 simultaneous holograms', '1024-channel patterns', 'DOF'],
  },
]);

export const CWLS_WORKING_FORM = Object.freeze({
  question:
    'Can compositional wet-lab evidence establish that a distributed electromagnetic computational medium can scale toward data-center workloads?',
  answer:
    'YES — at the level of compositional physical proof, with full hyperscale replacement remaining an engineering validation rather than an established fact.',
  compact: 'Compose the rhymes. Scale is the remaining experiment.',
  operationalRhyme:
    'If a computational organization survives transformation between physical representations while preserving required input-output relationships, the representations are computational rhymes of the same underlying process.',
  nextExperiment:
    'Compositional workload: encode → matmul → conv → nonlinear → norm → matmul → layers → reconstruct, maximized in-medium; compare joules/op and scaling with volumes.',
});

export const CWLS_OPEN_ENGINEERING = Object.freeze([
  'memory capacity',
  'persistent state',
  'numerical precision',
  'noise / error correction',
  'synchronization',
  'arbitrary nonlinear computation',
  'programming complexity',
  'routing / fan-in/fan-out',
  'training',
  'general-purpose workloads',
  'physical density / thermal',
  'manufacturing cost / reliability',
  'total-system energy / throughput',
  'economic competitiveness',
]);

/** Level III open dimensions — each remains NOT proven (paper §15). */
export const LEVEL3_OPEN_DIMENSIONS = Object.freeze(
  CWLS_OPEN_ENGINEERING.map((name, i) =>
    Object.freeze({
      id: `L3-${String(i + 1).padStart(2, '0')}`,
      name,
      status: 'open',
      proven: false,
    }),
  ),
);

/**
 * Compositional workload stages (paper §17).
 * Prefer keeping intermediate ops in the physical medium.
 */
export const COMPOSITIONAL_WORKLOAD = Object.freeze([
  {
    id: 'CW-01',
    stage: 'input encoding',
    prefersMedium: true,
    gold: ['CC-01', 'CC-02'],
    probe:
      'input encoding electromagnetic propagation superposition interference programmable unitary matrix',
  },
  {
    id: 'CW-02',
    stage: 'matrix multiplication',
    prefersMedium: true,
    gold: ['CC-02', 'CC-05'],
    probe:
      'matrix multiplication programmable microwave unitary RF matrix-vector WISE frequency mixer',
  },
  {
    id: 'CW-03',
    stage: 'convolution',
    prefersMedium: true,
    gold: ['CC-03', 'CC-06'],
    probe: 'convolution Fourier transform space-time-coding metasurface radio-frequency CNN',
  },
  {
    id: 'CW-04',
    stage: 'nonlinear transformation',
    prefersMedium: true,
    gold: ['CC-06', 'CC-04'],
    probe:
      'nonlinear transformation multilayer RF convolutional neural network differentiation integration',
  },
  {
    id: 'CW-05',
    stage: 'normalization',
    prefersMedium: false,
    gold: ['CC-05', 'CC-06'],
    probe: 'normalization machine learning inference RF multilayer network classification',
  },
  {
    id: 'CW-06',
    stage: 'second matrix transformation',
    prefersMedium: true,
    gold: ['CC-02', 'CC-05'],
    probe: 'second matrix transformation programmable unitary microwave RF matrix-vector multiplication',
  },
  {
    id: 'CW-07',
    stage: 'repeated layers',
    prefersMedium: true,
    gold: ['CC-06'],
    probe: 'repeated layers multilayer RF-CNN deep network nine layers millions of parameters',
  },
  {
    id: 'CW-08',
    stage: 'output reconstruction',
    prefersMedium: true,
    gold: ['CC-07', 'CC-01'],
    probe:
      'output reconstruction programmable metasurface computational space holographic channels propagation',
  },
]);

/** Ultimate scaling volumes (paper §18): 1 → 2 → 4 → … → 256. */
export const VOLUME_SCALING_SEQUENCE = Object.freeze(
  Array.from({ length: 9 }, (_, i) => 2 ** i),
);

/**
 * Historical EM energy anchors from WISE wet-lab literature (not this host).
 * Tier: historical. Do not conflate with measured digital baselines.
 */
export const HISTORICAL_EM_ENERGY = Object.freeze({
  tier: 'historical',
  source: 'WISE RF matrix-vector multiplication (Science Advances class, 2026)',
  imageFjPerMac: 6.0,
  audioFjPerMac: 2.8,
  accuracy: Object.freeze({ image: 0.957, audio: 0.972 }),
  note: 'Literature wet-lab figures under experimental conditions — not a FractiSI measured receipt.',
});

/**
 * Soft Story volume-scaling model (Level III NOT claimed).
 * If organization is held constant, useful capacity scales with physical volumes/DOF;
 * digital hardware cost scales proportionally with volumes.
 * Returns Soft Story ratios — not a wet-lab hyperscale proof.
 */
export function softStoryVolumeScaling(volumes = VOLUME_SCALING_SEQUENCE) {
  const rows = volumes.map((v) => {
    const capacity = v; // Soft Story: capacity ∝ volumes when organization constant
    const digitalHardware = v; // proportional digital processing hardware
    const dofRegime = v; // same Soft Story capacity under DOF scaling
    return {
      volumes: v,
      softStoryCapacity: capacity,
      digitalHardwareUnits: digitalHardware,
      dofCapacity: dofRegime,
      // Under Soft Story assumptions, DOF regime matches capacity without extra digital units beyond 1 base controller
      digitalControllerUnits: 1,
      regime: 'soft_story',
    };
  });
  const last = rows[rows.length - 1];
  return {
    tier: 'soft_story',
    level3Proven: false,
    volumes: [...volumes],
    rows,
    scalesWithDof: last.softStoryCapacity === last.volumes,
    digitalWouldScaleProportionally: last.digitalHardwareUnits === last.volumes,
    honesty:
      'Soft Story organizational scaling model only. Does not prove Level III systemic hyperscale replacement.',
  };
}

export function tokenizeComposition(text) {
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

export function scoreAgainstCompositionEntry(description, entry) {
  const q = tokenizeComposition(description);
  const corpus = [entry.name, entry.claim, ...(entry.nested || [])].join(' ');
  const base = bagOverlap(q, tokenizeComposition(corpus));
  const idHit = String(description).toUpperCase().includes(entry.id) ? 0.35 : 0;
  return Math.min(1, base + idHit);
}

export function recognizeCompositionLinks(description, { topK = 5, minScore = 0.08 } = {}) {
  return COMPOSITIONAL_CHAIN.map((entry) => ({
    id: entry.id,
    name: entry.name,
    score: scoreAgainstCompositionEntry(description, entry),
    layer: entry.layer,
    demonstrated: entry.demonstrated,
    preprint: Boolean(entry.preprint),
  }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, topK);
}

export function nestedComposition(ccId) {
  const entry = COMPOSITIONAL_CHAIN.find((e) => e.id === ccId);
  if (!entry) return [];
  return (entry.nested || []).map((label, i) => ({
    parent: ccId,
    nestedId: `${ccId}.N${String(i + 1).padStart(2, '0')}`,
    label,
  }));
}

export function compositionalLevelsStatus() {
  return {
    level1: PROOF_LEVELS[0].proven,
    level2: PROOF_LEVELS[1].proven,
    level3: PROOF_LEVELS[2].proven,
    layers: COMPOSITION_LAYERS.length,
    chainDemonstrated: COMPOSITIONAL_CHAIN.filter((e) => e.demonstrated).length,
    chainSize: COMPOSITIONAL_CHAIN.length,
  };
}

export function cwlsEnginePinRecord() {
  return Object.freeze({
    id: CWLS_ENGINE_SHELF,
    name: 'Compositional Wet-Lab Scale Proof',
    grammar:
      'Level I/II/III · Primitive→Interface→Cascade→Program→Scale · nests under #56/#55',
    registry: CWLS_REGISTRY_ID,
    documentId: CWLS_DOCUMENT_ID,
    chainSize: COMPOSITIONAL_CHAIN.length,
    workingForm: CWLS_WORKING_FORM.compact,
    honesty:
      'Level I physical and Level II compositional proofs supported experimentally. Level III systemic hyperscale replacement is NOT proven — remaining engineering validation.',
  });
}
