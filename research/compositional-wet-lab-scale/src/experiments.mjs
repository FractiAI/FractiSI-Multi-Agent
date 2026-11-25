/**
 * Compositional Wet-Lab Scale Soft Story — Experiments 1–7.
 * Level I/II closed as Soft Story; Level III hyperscale NOT claimed.
 */
import {
  COMPOSITIONAL_CHAIN,
  COMPOSITION_LAYERS,
  PROOF_LEVELS,
  CWLS_WORKING_FORM,
  CWLS_OPEN_ENGINEERING,
  LEVEL3_OPEN_DIMENSIONS,
  COMPOSITIONAL_WORKLOAD,
  VOLUME_SCALING_SEQUENCE,
  softStoryVolumeScaling,
  recognizeCompositionLinks,
  nestedComposition,
  compositionalLevelsStatus,
} from '../../../src/engine/rhyming/compositional-wet-lab-scale.mjs';
import { level3BaselineComparison } from './level3-baselines.mjs';
import { DOCUMENT_ID, ENGINE_SHELF_PINNED, ENGINE_SHELF_SLOT, REGISTRY_ID, SEED, TITLE } from './constants.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Soft Story boards mapped onto CC-01…CC-07. */
export const COMPOSITION_BOARD = Object.freeze([
  {
    id: 'prop-interfere',
    description: 'electromagnetic superposition interference analog function computation medium',
    gold: ['CC-01'],
  },
  {
    id: 'unitary-matrix',
    description: 'programmable microwave unitary matrix transformation cascaded RF phase',
    gold: ['CC-02'],
  },
  {
    id: 'fourier-conv',
    description: 'space-time-coding metasurface Fourier transform convolution radar 512 samples',
    gold: ['CC-03'],
  },
  {
    id: 'em-calculus',
    description: 'programmable differentiation integration spatial energy electromagnetic metasurface',
    gold: ['CC-04'],
  },
  {
    id: 'wise-rf-ml',
    description: 'WISE radio-frequency matrix-vector multiplication machine learning wireless model broadcast',
    gold: ['CC-05'],
  },
  {
    id: 'rfcnn-deep',
    description: 'radio-frequency convolutional neural network multilayer 26 million parameters nine layers',
    gold: ['CC-06'],
  },
  {
    id: 'holo-space',
    description: 'programmable metasurface computational space holographic channels simultaneous patterns',
    gold: ['CC-07'],
  },
  {
    id: 'compose-workload',
    description: 'encode matrix convolution nonlinear normalization multilayer reconstruct physical medium',
    gold: ['CC-03', 'CC-05', 'CC-06'],
  },
]);

function topId(desc) {
  const ranked = recognizeCompositionLinks(desc, { topK: 1, minScore: 0.05 });
  return ranked[0]?.id ?? null;
}

/** Exp 1 — Cross-domain composition-link identification */
export function experiment1_crossDomain() {
  let hits = 0;
  const rows = COMPOSITION_BOARD.map((p) => {
    const top = topId(p.description);
    const ok = p.gold.includes(top);
    if (ok) hits += 1;
    return { id: p.id, top, gold: p.gold, hit: ok };
  });
  const rate = hits / COMPOSITION_BOARD.length;
  return {
    id: 'E1_cross_domain',
    title: 'Compositional chain identification',
    n: COMPOSITION_BOARD.length,
    hits,
    rate,
    pass: rate >= 0.625,
    rows,
  };
}

/** Exp 2 — Feed-forward composition along the chain */
export function experiment2_feedForward() {
  const order = COMPOSITIONAL_CHAIN.map((e) => e.id);
  const ordered =
    order.length === 7 && order.every((id, i) => id === `CC-0${i + 1}`);
  const pairs = [
    ['prop-interfere', 'unitary-matrix'],
    ['unitary-matrix', 'fourier-conv'],
    ['fourier-conv', 'em-calculus'],
    ['wise-rf-ml', 'rfcnn-deep'],
    ['rfcnn-deep', 'holo-space'],
  ];
  const byId = Object.fromEntries(COMPOSITION_BOARD.map((p) => [p.id, p]));
  let transfers = 0;
  const rows = pairs.map(([a, b]) => {
    const topA = topId(byId[a].description);
    const topB = topId(byId[b].description);
    const ia = order.indexOf(topA);
    const ib = order.indexOf(topB);
    const ok = ia >= 0 && ib >= 0 && ib >= ia;
    if (ok) transfers += 1;
    return { pair: [a, b], topA, topB, feedForward: ok };
  });
  const rate = transfers / pairs.length;
  return {
    id: 'E2_feed_forward',
    title: 'Compositional feed-forward adjacency',
    n: pairs.length,
    transfers,
    rate,
    ordered,
    pass: ordered && rate >= 0.8,
    rows,
  };
}

/** Exp 3 — Five composition layers present */
export function experiment3_layers() {
  const ids = COMPOSITION_LAYERS.map((l) => l.id);
  const complete =
    ids.length === 5 && ids.every((id, i) => id === `CL-0${i + 1}`);
  const named = COMPOSITION_LAYERS.every((l) => l.name && l.body);
  return {
    id: 'E3_composition_layers',
    title: 'Five compositional proof layers',
    layerCount: COMPOSITION_LAYERS.length,
    complete,
    named,
    pass: complete && named,
  };
}

/** Exp 4 — Nested DOF under programmable space */
export function experiment4_nested() {
  const nested = nestedComposition('CC-07');
  const pass = nested.length >= 3;
  return {
    id: 'E4_nested_dof',
    title: 'Nested degrees of freedom under programmable space',
    nestedCount: nested.length,
    labels: nested.map((n) => n.label),
    pass,
  };
}

/** Exp 5 — Level I/II proven; Level III open */
export function experiment5_threeLevels() {
  const status = compositionalLevelsStatus();
  const levelsOk =
    PROOF_LEVELS[0].proven === true &&
    PROOF_LEVELS[1].proven === true &&
    PROOF_LEVELS[2].proven === false;
  return {
    id: 'E5_three_levels',
    title: 'Three-level proof honesty',
    status,
    levelsOk,
    pass: levelsOk && status.chainDemonstrated === status.chainSize,
  };
}

/** Exp 6 — Novel compositional workload maps onto chain */
export function experiment6_novel() {
  const novel =
    'compositional AI workload encoding matrix convolution nonlinear layers reconstruction maximized in electromagnetic computational volume';
  const ranked = recognizeCompositionLinks(novel, { topK: 4, minScore: 0.05 });
  const ids = ranked.map((r) => r.id);
  const hit =
    ids.includes('CC-03') || ids.includes('CC-05') || ids.includes('CC-06') || ids.includes('CC-02');
  return {
    id: 'E6_novel_workload',
    title: 'Novel compositional workload discovery',
    novel,
    ranked: ranked.map((r) => ({ id: r.id, score: Number(r.score.toFixed(4)) })),
    pass: hit,
  };
}

/** Exp 7 — Open engineering list + preprint flag honesty */
export function experiment7_honesty(rng = mulberry32(SEED ^ 0xc0ffee)) {
  void rng();
  const openKept = CWLS_OPEN_ENGINEERING.length >= 10;
  const preprintFlagged = COMPOSITIONAL_CHAIN.some((e) => e.preprint === true);
  const answerBounded = /hyperscale|engineering|NOT YET|not yet/i.test(
    `${CWLS_WORKING_FORM.answer} ${PROOF_LEVELS[2].status}`,
  );
  const nextNamed = Boolean(CWLS_WORKING_FORM.nextExperiment);
  return {
    id: 'E7_honesty_boundary',
    title: 'Honesty boundary (Level III open · preprint flagged)',
    openClaims: CWLS_OPEN_ENGINEERING.length,
    preprintFlagged,
    answerBounded,
    nextNamed,
    pass: openKept && preprintFlagged && answerBounded && nextNamed,
  };
}

export function compositionDensityReport() {
  const usable = COMPOSITION_BOARD.reduce((acc, p) => acc + p.gold.length, 0);
  const space = COMPOSITION_BOARD.length * COMPOSITIONAL_CHAIN.length;
  return {
    id: 'rho_CC',
    usableCorrespondences: usable,
    searchSpace: space,
    rho_R: usable / Math.max(1, space),
  };
}

/** Exp 8 — Level III open engineering catalog stays open */
export function experiment8_level3OpenCatalog() {
  const allOpen = LEVEL3_OPEN_DIMENSIONS.every((d) => d.proven === false && d.status === 'open');
  const coversPaper = LEVEL3_OPEN_DIMENSIONS.length === CWLS_OPEN_ENGINEERING.length;
  return {
    id: 'E8_level3_open_catalog',
    title: 'Level III open engineering catalog',
    n: LEVEL3_OPEN_DIMENSIONS.length,
    dimensions: LEVEL3_OPEN_DIMENSIONS.map((d) => d.id),
    allOpen,
    coversPaper,
    pass: allOpen && coversPaper && LEVEL3_OPEN_DIMENSIONS.length >= 14,
  };
}

/** Exp 9 — Compositional workload stage chain (encode → … → reconstruct) */
export function experiment9_compositionalWorkload() {
  const stages = COMPOSITIONAL_WORKLOAD;
  let hits = 0;
  const rows = stages.map((s) => {
    const ranked = recognizeCompositionLinks(s.probe || s.stage, { topK: 3, minScore: 0.04 });
    const top = ranked[0]?.id ?? null;
    const hit = s.gold.includes(top) || ranked.some((r) => s.gold.includes(r.id));
    if (hit) hits += 1;
    return {
      id: s.id,
      stage: s.stage,
      prefersMedium: s.prefersMedium,
      top,
      gold: s.gold,
      hit,
    };
  });
  const inMedium = stages.filter((s) => s.prefersMedium).length;
  const rate = hits / stages.length;
  return {
    id: 'E9_compositional_workload',
    title: 'Compositional workload stage recognition',
    n: stages.length,
    hits,
    rate,
    inMediumPreferred: inMedium,
    stages: stages.map((s) => s.stage),
    pass: rate >= 0.625 && stages.length === 8 && inMedium >= 6,
    rows,
  };
}

/** Exp 10 — Digital accelerator baseline from measured receipts */
export function experiment10_measuredDigitalBaseline() {
  const cmp = level3BaselineComparison();
  const lat = cmp.digitalLatency;
  const heap = cmp.digitalHeap;
  const hasLatency = lat.available && Number.isFinite(lat.anchors?.aiContextDuplicatedP50Us);
  const hasHeap = heap.available;
  const ratiosOk =
    Number.isFinite(lat.ratios?.aiContextTinyVsDuplicated) &&
    Number.isFinite(lat.ratios?.rhymeDifferingTinyVsDuplicated);
  return {
    id: 'E10_measured_digital_baseline',
    title: 'Measured digital latency/heap baseline',
    tier: lat.tier,
    latencyAvailable: lat.available,
    heapAvailable: heap.available,
    anchors: lat.anchors,
    ratios: lat.ratios,
    heapAnchors: heap.anchors,
    path: lat.path,
    pass: hasLatency && hasHeap && ratiosOk && lat.tier === 'measured',
  };
}

/** Exp 11 — Historical EM energy vs measured digital (tiers explicit) */
export function experiment11_emVsDigitalTiers() {
  const cmp = level3BaselineComparison();
  const em = cmp.historicalEmEnergy;
  const lat = cmp.digitalLatency;
  const emOk =
    em.tier === 'historical' &&
    em.imageFjPerMac === 6.0 &&
    em.audioFjPerMac === 2.8 &&
    em.accuracy.image >= 0.95;
  const digitalOk = lat.tier === 'measured' && lat.available;
  const notEquated = /not a claim|Side-by-side|not equated/i.test(cmp.honesty);
  return {
    id: 'E11_em_vs_digital_tiers',
    title: 'Historical EM fJ/MAC beside measured digital latency',
    em,
    digitalTier: lat.tier,
    digitalAnchors: lat.anchors,
    honesty: cmp.honesty,
    level3Proven: false,
    pass: emOk && digitalOk && notEquated && cmp.level3Proven === false,
  };
}

/** Exp 12 — Ultimate volume scaling Soft Story 1…256 */
export function experiment12_volumeScaling() {
  const expected = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  const seqOk =
    VOLUME_SCALING_SEQUENCE.length === expected.length &&
    VOLUME_SCALING_SEQUENCE.every((v, i) => v === expected[i]);
  const scaling = softStoryVolumeScaling();
  const dofBeatsProportionalHardware =
    scaling.scalesWithDof &&
    scaling.rows.every((r) => r.digitalControllerUnits === 1 && r.softStoryCapacity === r.volumes);
  return {
    id: 'E12_volume_scaling',
    title: 'Soft Story volume scaling 1→256',
    sequence: [...VOLUME_SCALING_SEQUENCE],
    seqOk,
    tier: scaling.tier,
    level3Proven: scaling.level3Proven,
    scalesWithDof: scaling.scalesWithDof,
    digitalWouldScaleProportionally: scaling.digitalWouldScaleProportionally,
    dofBeatsProportionalHardware,
    honesty: scaling.honesty,
    rows: scaling.rows,
    pass: seqOk && scaling.level3Proven === false && dofBeatsProportionalHardware,
  };
}

export function runCompositionalWetLabScaleSuite() {
  const e1 = experiment1_crossDomain();
  const e2 = experiment2_feedForward();
  const e3 = experiment3_layers();
  const e4 = experiment4_nested();
  const e5 = experiment5_threeLevels();
  const e6 = experiment6_novel();
  const e7 = experiment7_honesty();
  const e8 = experiment8_level3OpenCatalog();
  const e9 = experiment9_compositionalWorkload();
  const e10 = experiment10_measuredDigitalBaseline();
  const e11 = experiment11_emVsDigitalTiers();
  const e12 = experiment12_volumeScaling();
  const density = compositionDensityReport();
  const baselines = level3BaselineComparison();
  const experiments = [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12];
  const passCount = experiments.filter((e) => e.pass).length;
  return {
    documentId: DOCUMENT_ID,
    registryId: REGISTRY_ID,
    title: TITLE,
    seed: SEED,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    workingForm: CWLS_WORKING_FORM,
    chainSize: COMPOSITIONAL_CHAIN.length,
    density,
    baselines,
    experiments,
    passCount,
    total: experiments.length,
    pass: passCount === experiments.length,
    majorResultShape: {
      claim: CWLS_WORKING_FORM.answer,
      measured: {
        e1Rate: e1.rate,
        e2Rate: e2.rate,
        e9Rate: e9.rate,
        level3Proven: PROOF_LEVELS[2].proven,
        digitalLatencyTier: baselines.digitalLatency.tier,
        historicalEmFjPerMac: {
          image: baselines.historicalEmEnergy.imageFjPerMac,
          audio: baselines.historicalEmEnergy.audioFjPerMac,
        },
        volumeSequence: [...VOLUME_SCALING_SEQUENCE],
        rho_R: density.rho_R,
      },
    },
  };
}
