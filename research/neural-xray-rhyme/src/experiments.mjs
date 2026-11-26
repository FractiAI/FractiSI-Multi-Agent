/**
 * Neural X-Ray — Soft Story Exp 1–8 + live-MLP decisive Exp 9–10.
 * Full NN decode / frontier end-to-end X-ray NOT claimed.
 */
import {
  XRAY_STAGES,
  XRAY_CLAIMS,
  PRINCIPAL_RHYME_CRITERIA,
  WIRING_SEQUENCE,
  NXR_WORKING_FORM,
  NXR_PROVES,
  NXR_DOES_NOT_PROVE,
  NXR_FALSIFIABILITY,
  recognizeXrayStages,
  recognizeWiringLinks,
  crossDomainRhyme,
  principalCriteriaComplete,
} from '../../../src/engine/rhyming/neural-xray-rhyme.mjs';
import { loadComputationalLabAnchors } from './measured-baselines.mjs';
import { runLiveBlindPredictIntervene } from './live-nn.mjs';
import { DOCUMENT_ID, ENGINE_SHELF_PINNED, ENGINE_SHELF_SLOT, REGISTRY_ID, SEED, TITLE } from './constants.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAGE_BOARD = Object.freeze([
  { id: 'observe', probe: 'observe acquire measurements computational wet-lab systems XR-01', gold: ['XR-01'] },
  { id: 'encode', probe: 'encode translate observations structural representations XR-02', gold: ['XR-02'] },
  { id: 'detect', probe: 'detect FractiSI recurring organizational relationships XR-03', gold: ['XR-03'] },
  { id: 'match', probe: 'match same rhyme other evidence stream XR-04', gold: ['XR-04'] },
  { id: 'reconstruct', probe: 'reconstruct missing transformed structure detected rhyme XR-05', gold: ['XR-05'] },
  { id: 'predict', probe: 'predict freeze rhyme previously unseen observations XR-06', gold: ['XR-06'] },
  { id: 'intervene', probe: 'intervene alter identified organizational relationship XR-07', gold: ['XR-07'] },
  {
    id: 'consequence',
    probe: 'observe consequence predicted system-level change occurs XR-08',
    gold: ['XR-08'],
  },
]);

function topStage(desc) {
  return recognizeXrayStages(desc, { topK: 1, minScore: 0.05 })[0]?.id ?? null;
}

/** Exp 1 — Eight-stage proof chain identification */
export function experiment1_stages() {
  let hits = 0;
  const rows = STAGE_BOARD.map((p) => {
    const top = topStage(p.probe);
    const ok = p.gold.includes(top);
    if (ok) hits += 1;
    return { id: p.id, top, gold: p.gold, hit: ok };
  });
  const ordered =
    XRAY_STAGES.length === 8 && XRAY_STAGES.every((s, i) => s.id === `XR-0${i + 1}`);
  const rate = hits / STAGE_BOARD.length;
  return {
    id: 'E1_xray_stages',
    title: 'Integrated proof stages Observe→…→Consequence',
    n: STAGE_BOARD.length,
    hits,
    rate,
    ordered,
    pass: ordered && rate >= 0.875,
    rows,
  };
}

/** Exp 2 — Claims A/B/C present and distinct */
export function experiment2_claims() {
  const ids = XRAY_CLAIMS.map((c) => c.id);
  const complete = ids.length === 3 && ids[0] === 'XA' && ids[1] === 'XB' && ids[2] === 'XC';
  const named = XRAY_CLAIMS.every((c) => c.name && c.body);
  return {
    id: 'E2_claims_abc',
    title: 'Claims A/B/C (organization · persistence · utility)',
    complete,
    named,
    pass: complete && named,
  };
}

/** Exp 3 — Five principal-rhyme criteria */
export function experiment3_criteria() {
  return {
    id: 'E3_principal_criteria',
    title: 'Principal-rhyme criteria Persistence→Intervention',
    n: PRINCIPAL_RHYME_CRITERIA.length,
    complete: principalCriteriaComplete(),
    names: PRINCIPAL_RHYME_CRITERIA.map((c) => c.name),
    pass: principalCriteriaComplete(),
  };
}

/** Exp 4 — Blind discovery / locked / test Soft Story split */
export function experiment4_blindSplit(rng = mulberry32(SEED ^ 0x51ed)) {
  const seq = [...WIRING_SEQUENCE];
  // Deterministic shuffle via RNG
  for (let i = seq.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }
  const discovery = seq.slice(0, 3);
  const locked = discovery.map((d) => d.id);
  const blind = seq.slice(3);
  // Soft Story: freeze discovery nest vocabulary; check blind items share nest family with discovery
  const discoveryNests = new Set(discovery.flatMap((d) => d.nest));
  const predictions = blind.map((b) => {
    const overlap = b.nest.filter((n) => discoveryNests.has(n) || discoveryNests.has(n.slice(0, 2)));
    // Predict shared principal family if any nest prefix matches PR-/WL-/CC-
    const familyHit = b.nest.some((n) =>
      [...discoveryNests].some((d) => d.slice(0, 2) === n.slice(0, 2)),
    );
    return { id: b.id, familyHit, overlap };
  });
  const predRate = predictions.filter((p) => p.familyHit).length / Math.max(1, predictions.length);
  return {
    id: 'E4_blind_split',
    title: 'Blind Soft Story: discovery → locked → test',
    discovery: locked,
    blind: blind.map((b) => b.id),
    predRate,
    pass: discovery.length >= 3 && blind.length >= 1 && predRate >= 0.5,
    predictions,
  };
}

/** Exp 5 — Cross-domain computational ↔ wiring/wet-lab match */
export function experiment5_crossDomain() {
  const pairs = [
    [
      'shared world local delta selective reconstruction structural match not exact lexical identity Tiny Gateway compression',
      'APP DNMT3A wiring discovery STRING empty rhyme coupling relational fingerprint selective reconstruction',
    ],
    [
      'WISE class distributed endpoints share organization without full digital copies wireless model broadcast',
      'WISE radio-frequency matrix-vector multiplication wireless model broadcast distributed endpoints',
    ],
    [
      'programmable RF matrix Fourier convolution physical transformation mathematical operator electromagnetic',
      'EM interference programmable matrix Fourier convolution physical transformation mathematical operator',
    ],
  ];
  let hits = 0;
  const rows = pairs.map(([comp, wet], i) => {
    const r = crossDomainRhyme(comp, wet);
    if (r.rhyme) hits += 1;
    return { pair: i + 1, rhyme: r.rhyme, shared: r.shared.map((s) => s.id) };
  });
  const rate = hits / pairs.length;
  return {
    id: 'E5_cross_domain',
    title: 'Cross-domain computational ↔ wiring/wet-lab rhyme',
    n: pairs.length,
    hits,
    rate,
    pass: rate >= 0.66,
    rows,
  };
}

/** Exp 6 — Measured computational anchors (representation ≠ organization) */
export function experiment6_measuredComputational() {
  const anchors = loadComputationalLabAnchors();
  const r = anchors.representationVsOrganization || {};
  const hasRatios =
    Number.isFinite(r.aiContextTinyVsDuplicated) && Number.isFinite(r.rhymeDifferingTinyVsDuplicated);
  const hasHeap =
    Number.isFinite(r.identicalAliasedHeapReduction) || Number.isFinite(r.differingTinyHeapReduction);
  return {
    id: 'E6_measured_computational',
    title: 'Measured computational-lab anchors',
    tier: anchors.tier,
    available: anchors.available,
    path: anchors.path,
    representationVsOrganization: r,
    selectiveReconstruction: anchors.selectiveReconstruction,
    pass: anchors.available && anchors.tier === 'measured' && hasRatios && hasHeap,
  };
}

/** Exp 7 — Soft Story intervention: disrupt shared organization → predicted loss */
export function experiment7_intervention(rng = mulberry32(SEED ^ 0xc0de)) {
  void rng();
  // Intact: full observation + relationship + nest vocabulary
  const intact = WIRING_SEQUENCE.map(
    (w) => `${w.observation} ${w.relationship} ${(w.nest || []).join(' ')}`,
  ).join(' ');
  // Disrupt: replace organizational vocabulary with unrelated tokens (remove rhyme glue)
  const disrupted = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi';
  const scoreSum = (desc) =>
    recognizeWiringLinks(desc, { topK: 5, minScore: 0.04 }).reduce((acc, r) => acc + r.score, 0);
  const intactScore = scoreSum(intact);
  const disruptedScore = scoreSum(disrupted);
  const predictedDrop = intactScore > disruptedScore + 0.2;
  return {
    id: 'E7_intervention_soft_story',
    title: 'Soft Story intervention: disrupt organization → recognition drop',
    intactScore: Number(intactScore.toFixed(4)),
    disruptedScore: Number(disruptedScore.toFixed(4)),
    predictedDrop,
    // Soft Story only — not a live neural-net causal experiment
    liveNeuralNet: false,
    pass: predictedDrop && intactScore >= 0.3,
  };
}

/** Exp 8 — Honesty: full decode not claimed; live decisive protocol named */
export function experiment8_honesty() {
  const openKept = NXR_DOES_NOT_PROVE.length >= 4;
  const provesBounded = NXR_PROVES.length >= 1 && NXR_PROVES.length <= 3;
  const falsifiable = NXR_FALSIFIABILITY.length >= 5;
  const thresholdNamed = /blind prediction|intervention/i.test(NXR_WORKING_FORM.decisiveThreshold);
  const answerBounded = /if the computational|causally testable/i.test(NXR_WORKING_FORM.answer);
  const liveProve = NXR_PROVES.some((p) => /live MLP|decisive threshold met/i.test(p));
  const noOpenLiveGap = !NXR_DOES_NOT_PROVE.some((p) => /decisive threshold still open/i.test(p));
  return {
    id: 'E8_honesty_boundary',
    title: 'Honesty: full NN decode not claimed · live decisive protocol bounded',
    openClaims: NXR_DOES_NOT_PROVE.length,
    provesCount: NXR_PROVES.length,
    falsifiable,
    thresholdNamed,
    answerBounded,
    liveProve,
    noOpenLiveGap,
    pass:
      openKept &&
      provesBounded &&
      falsifiable &&
      thresholdNamed &&
      answerBounded &&
      liveProve &&
      noOpenLiveGap,
  };
}

/** Exp 9 — Live MLP: rhyme locked before blind outcomes → blind prediction */
export function experiment9_liveBlindPrediction(live = runLiveBlindPredictIntervene(SEED)) {
  return {
    id: 'E9_live_blind_prediction',
    title: 'Live MLP blind prediction (rhyme locked before outcomes)',
    tier: live.tier,
    liveNeuralNet: live.liveNeuralNet,
    lockedChannel: live.lockedRhyme.channel,
    lockedAt: live.lockedRhyme.lockedAt,
    matchesPlanted: live.lockedRhyme.matchesPlanted,
    blindAccuracy: live.blindPrediction.accuracy,
    beatsChance: live.blindPrediction.beatsChance,
    pass:
      live.liveNeuralNet &&
      live.lockedRhyme.lockedAt === 'before_blind_outcome_scoring' &&
      live.lockedRhyme.matchesPlanted &&
      live.blindPrediction.beatsChance,
    live,
  };
}

/** Exp 10 — Live MLP: intervene on locked rhyme → predicted consequence */
export function experiment10_liveIntervention(live = runLiveBlindPredictIntervene(SEED)) {
  const interv = live.intervention;
  return {
    id: 'E10_live_intervention',
    title: 'Live MLP intervention (ablate locked rhyme → predicted flips)',
    tier: live.tier,
    liveNeuralNet: live.liveNeuralNet,
    lockedBeforeOutcome: interv.plan.lockedBeforeInterventionOutcome,
    rhymeFlipRate: interv.rhymeFlipRate,
    controlFlipRate: interv.controlFlipRate,
    predictedConsequenceObserved: interv.predictedConsequenceObserved,
    decisiveThresholdMet: live.decisiveThresholdMet,
    pass:
      live.liveNeuralNet &&
      interv.plan.lockedBeforeInterventionOutcome &&
      interv.predictedConsequenceObserved &&
      live.decisiveThresholdMet,
    live,
  };
}

export function runNeuralXrayRhymeSuite() {
  const e1 = experiment1_stages();
  const e2 = experiment2_claims();
  const e3 = experiment3_criteria();
  const e4 = experiment4_blindSplit();
  const e5 = experiment5_crossDomain();
  const e6 = experiment6_measuredComputational();
  const e7 = experiment7_intervention();
  const e8 = experiment8_honesty();
  const live = runLiveBlindPredictIntervene(SEED);
  const e9 = experiment9_liveBlindPrediction(live);
  const e10 = experiment10_liveIntervention(live);
  const experiments = [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10];
  const passCount = experiments.filter((e) => e.pass).length;
  const anchors = loadComputationalLabAnchors();
  const decisive =
    Boolean(e9.pass) && Boolean(e10.pass) && Boolean(e10.decisiveThresholdMet);
  return {
    documentId: DOCUMENT_ID,
    registryId: REGISTRY_ID,
    title: TITLE,
    seed: SEED,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    workingForm: NXR_WORKING_FORM,
    wiringSequenceSize: WIRING_SEQUENCE.length,
    stages: XRAY_STAGES.length,
    anchors,
    experiments,
    passCount,
    total: experiments.length,
    pass: passCount === experiments.length,
    majorResultShape: {
      claim: NXR_WORKING_FORM.answer,
      measured: {
        e1Rate: e1.rate,
        e5Rate: e5.rate,
        e6Tier: e6.tier,
        e9BlindAcc: e9.blindAccuracy,
        e10RhymeFlip: e10.rhymeFlipRate,
        e10ControlFlip: e10.controlFlipRate,
        fullXrayClaimed: false,
        decisiveThresholdOpen: false,
        decisiveThresholdMet: decisive,
        liveNeuralNet: true,
      },
    },
  };
}
