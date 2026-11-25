/**
 * Universal Rhyme Wet-Lab Soft Story lab — Experiments 1–7.
 * Regenerable / deterministic. Catalog method, not hyperscale replacement QED.
 */
import {
  WET_LAB_EVIDENCE_CHAIN,
  recognizeWetLabLinks,
  nestedWetLab,
  wetLabPhenomenaRhyme,
  wetLabChainComplete,
  wetLabDensity,
  URWL_WORKING_FORM,
  URWL_PROVES,
  URWL_DOES_NOT_PROVE,
  URWL_FRACTISI_RHYME,
  URWL_FALSIFIABILITY,
} from '../../../src/engine/rhyming/universal-rhyme-wet-lab.mjs';
import { DOCUMENT_ID, ENGINE_SHELF_PINNED, ENGINE_SHELF_SLOT, REGISTRY_ID, SEED, TITLE } from './constants.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Soft Story boards — experimental / architectural descriptions mapped to WL ids. */
export const PHENOMENA_BOARD = Object.freeze([
  {
    id: 'ieee-interference',
    domain: 'wireless',
    description: 'distributed nodes simultaneous transmission physical interference wireless analog function computation',
    gold: ['WL-01'],
  },
  {
    id: 'prx-cavity',
    domain: 'microwave',
    description: 'Wi-Fi waves chaotic microwave cavity reflect-array Fourier transform physical room',
    gold: ['WL-02'],
  },
  {
    id: 'nature-matrix',
    domain: 'rf-processor',
    description: 'programmable unitary matrix multipath interference phase Hadamard identity microwave processor',
    gold: ['WL-03'],
  },
  {
    id: 'metasurface-radar',
    domain: 'metasurface',
    description: 'space-time-coding metasurface Fourier convolution matched filter radar velocity range electromagnetic',
    gold: ['WL-04'],
  },
  {
    id: 'wise-ml',
    domain: 'ml-rf',
    description: 'WISE radio-frequency matrix-vector multiplication machine learning inference image audio classification',
    gold: ['WL-05'],
  },
  {
    id: 'fractisi-delta',
    domain: 'multi-agent',
    description: 'shared world local delta selective reconstruction distributed relational recoverable result',
    gold: ['WL-01', 'WL-05'],
  },
  {
    id: 'data-center-vs-volume',
    domain: 'architecture',
    description: 'computation migrates from GPU data center into distributed electromagnetic field volume',
    gold: ['WL-05', 'WL-04'],
  },
  {
    id: 'edge-clients',
    domain: 'edge',
    description: 'three edge clients common wireless model broadcast local RF physics matrix multiplication',
    gold: ['WL-05'],
  },
]);

function hitsGold(ranked, gold) {
  const ids = new Set(ranked.map((r) => r.id));
  return gold.some((g) => ids.has(g));
}

function topId(desc) {
  const ranked = recognizeWetLabLinks(desc, { topK: 1, minScore: 0.05 });
  return ranked[0]?.id || null;
}

/** Exp 1 — Cross-domain identification on wet-lab chain */
export function experiment1_crossDomain() {
  let hits = 0;
  const rows = PHENOMENA_BOARD.map((p) => {
    const ranked = recognizeWetLabLinks(p.description, { topK: 3 });
    const ok = hitsGold(ranked, p.gold);
    if (ok) hits += 1;
    return { id: p.id, domain: p.domain, gold: p.gold, top: ranked.slice(0, 3), hit: ok };
  });
  const rate = hits / PHENOMENA_BOARD.length;
  return {
    id: 'E1_cross_domain',
    title: 'Cross-domain wet-lab identification',
    n: PHENOMENA_BOARD.length,
    hits,
    rate,
    pass: rate >= 0.7,
    rows,
  };
}

/** Exp 2 — Compositional adjacency: each board hits its gold WL and the chain is ordered WL-01…WL-05 */
export function experiment2_transfer() {
  const order = WET_LAB_EVIDENCE_CHAIN.map((e) => e.id);
  const ordered =
    order.length === 5 && order.every((id, i) => id === `WL-0${i + 1}`);
  const byId = Object.fromEntries(PHENOMENA_BOARD.map((p) => [p.id, p]));
  // Adjacent composition pairs from the paper chain
  const pairs = [
    ['ieee-interference', 'prx-cavity'], // WL-01 → WL-02
    ['prx-cavity', 'nature-matrix'], // WL-02 → WL-03
    ['nature-matrix', 'metasurface-radar'], // WL-03 → WL-04
    ['metasurface-radar', 'wise-ml'], // WL-04 → WL-05
  ];
  let transfers = 0;
  const rows = pairs.map(([a, b]) => {
    const topA = topId(byId[a].description);
    const topB = topId(byId[b].description);
    const ia = order.indexOf(topA);
    const ib = order.indexOf(topB);
    // Composition succeeds when both map onto the chain and B is at/after A (can feed forward)
    const ok = ia >= 0 && ib >= 0 && ib >= ia;
    if (ok) transfers += 1;
    return { pair: [a, b], topA, topB, feedForward: ok };
  });
  const rate = transfers / pairs.length;
  return {
    id: 'E2_chain_transfer',
    title: 'Wet-lab compositional adjacency',
    n: pairs.length,
    transfers,
    rate,
    ordered,
    pass: ordered && rate >= 0.75,
    rows,
  };
}

/** Exp 3 — Search reduction: direct lexical vs chain recognition */
export function experiment3_searchReduction(rng = mulberry32(SEED)) {
  const catalogSize = WET_LAB_EVIDENCE_CHAIN.length;
  const queries = PHENOMENA_BOARD;
  let directSteps = 0;
  let rhymeSteps = 0;
  let directHits = 0;
  let rhymeHits = 0;
  for (const q of queries) {
    let best = null;
    let bestScore = -1;
    for (const other of queries) {
      if (other.id === q.id) continue;
      directSteps += 1;
      const tokensQ = new Set(q.description.split(/\s+/));
      const tokensO = other.description.split(/\s+/);
      let inter = 0;
      for (const t of tokensO) if (tokensQ.has(t)) inter += 1;
      const score = inter / Math.max(1, tokensO.length);
      if (score > bestScore) {
        bestScore = score;
        best = other;
      }
    }
    if (best && best.gold.some((g) => q.gold.includes(g))) directHits += 1;

    rhymeSteps += catalogSize;
    const ranked = recognizeWetLabLinks(q.description, { topK: 2 });
    rhymeSteps += ranked.length;
    let found = false;
    for (const other of queries) {
      if (other.id === q.id) continue;
      rhymeSteps += 1;
      if (ranked.some((r) => other.gold.includes(r.id))) {
        found = true;
        break;
      }
    }
    if (found) rhymeHits += 1;
  }
  void rng();
  return {
    id: 'E3_search_reduction',
    title: 'Search reduction (direct vs wet-lab chain)',
    directSteps,
    rhymeSteps,
    directHits,
    rhymeHits,
    stepRatio: rhymeSteps / Math.max(1, directSteps),
    pass: rhymeHits >= directHits && rhymeHits / queries.length >= 0.7,
  };
}

/** Exp 4 — Reconstruction from WL id */
export function experiment4_reconstruction() {
  const rows = PHENOMENA_BOARD.map((p) => {
    const top = topId(p.description);
    const nested = nestedWetLab(top);
    return {
      id: p.id,
      compressedTo: top,
      nestedCount: nested.length,
      reconstructed: top && p.gold.includes(top),
    };
  });
  const rate = rows.filter((r) => r.reconstructed).length / rows.length;
  return {
    id: 'E4_reconstruction',
    title: 'Reconstruction from wet-lab organization',
    rate,
    pass: rate >= 0.6,
    rows,
  };
}

/** Exp 5 — Nested discovery under each WL link */
export function experiment5_nested() {
  const parents = WET_LAB_EVIDENCE_CHAIN.map((e) => e.id);
  const rows = parents.map((id) => {
    const nested = nestedWetLab(id);
    return { parent: id, nestedCount: nested.length, nested: nested.map((n) => n.label) };
  });
  return {
    id: 'E5_nested_discovery',
    title: 'Nested wet-lab discovery',
    parents: rows,
    pass: rows.every((r) => r.nestedCount >= 2),
  };
}

/** Exp 6 — Novel: FractiSI volumetric architecture hits chain */
export function experiment6_novel() {
  const novel = {
    id: 'volumetric-architecture',
    description:
      'distributed electromagnetic representation wave interaction interference mixing physical computation local reconstruction user',
    expectedFamily: ['WL-01', 'WL-04', 'WL-05'],
  };
  const ranked = recognizeWetLabLinks(novel.description, { topK: 5 });
  const hit = ranked.some((r) => novel.expectedFamily.includes(r.id));
  return {
    id: 'E6_novel_discovery',
    title: 'Novel volumetric architecture discovery',
    novel,
    ranked: ranked.map((r) => ({ id: r.id, score: Number(r.score.toFixed(4)) })),
    pass: hit,
  };
}

/** Exp 7 — Bounded honesty: chain complete AND open claims stay open */
export function experiment7_honesty(rng = mulberry32(SEED ^ 0x9e3779b9)) {
  void rng();
  const chainOk = wetLabChainComplete();
  const openKept = URWL_DOES_NOT_PROVE.length >= 5;
  const provesBounded = URWL_PROVES.length >= 1 && URWL_PROVES.length <= 3;
  const fractisiRhyme =
    Boolean(URWL_FRACTISI_RHYME.digital) &&
    Boolean(URWL_FRACTISI_RHYME.electromagnetic) &&
    Boolean(URWL_FRACTISI_RHYME.shared);
  return {
    id: 'E7_honesty_boundary',
    title: 'Honesty boundary (premise closed · scale open)',
    chainComplete: chainOk,
    openClaims: URWL_DOES_NOT_PROVE.length,
    provesCount: URWL_PROVES.length,
    fractisiRhyme,
    pass: chainOk && openKept && provesBounded && fractisiRhyme,
  };
}

export function wetLabDensityReport() {
  const usable = PHENOMENA_BOARD.reduce((acc, p) => acc + p.gold.length, 0);
  const space = PHENOMENA_BOARD.length * WET_LAB_EVIDENCE_CHAIN.length;
  return {
    id: 'rho_WL',
    usableCorrespondences: usable,
    searchSpace: space,
    rho_R: wetLabDensity(usable, space),
  };
}

export function runUniversalRhymeWetLabSuite() {
  const e1 = experiment1_crossDomain();
  const e2 = experiment2_transfer();
  const e3 = experiment3_searchReduction();
  const e4 = experiment4_reconstruction();
  const e5 = experiment5_nested();
  const e6 = experiment6_novel();
  const e7 = experiment7_honesty();
  const density = wetLabDensityReport();
  const experiments = [e1, e2, e3, e4, e5, e6, e7];
  const passCount = experiments.filter((e) => e.pass).length;
  return {
    documentId: DOCUMENT_ID,
    registryId: REGISTRY_ID,
    title: TITLE,
    seed: SEED,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    workingForm: URWL_WORKING_FORM,
    falsifiability: URWL_FALSIFIABILITY,
    chainSize: WET_LAB_EVIDENCE_CHAIN.length,
    density,
    experiments,
    passCount,
    total: experiments.length,
    pass: passCount === experiments.length,
    majorResultShape: {
      claim: URWL_WORKING_FORM.answerBounded,
      measured: {
        e1Rate: e1.rate,
        e2Rate: e2.rate,
        e3RhymeHits: e3.rhymeHits,
        e7ChainComplete: e7.chainComplete,
        rho_R: density.rho_R,
      },
    },
  };
}
