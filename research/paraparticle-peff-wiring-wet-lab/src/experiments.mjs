/**
 * Paraparticle–PEFF Cross-Scale Rhyme · Computational Lab + Wiring Wet Lab
 *
 * Soft Story / regenerable board. Does not claim PEFF is a new force, or that
 * cognition and paraparticles are physically identical.
 */
import {
  DOCUMENT_ID,
  REGISTRY_ID,
  SEED,
  ENGINE_SHELF_PINNED,
  SERIES,
  TITLE,
} from './constants.mjs';
import {
  EEG_PEFF_SUPPLIED,
  MIT_PARAPARTICLE_BENCHMARK,
  PEFF_WIRING_CHAIN,
  PEFF_WORKING_FORM,
  PEFF_DOES_NOT_PROVE,
  encodeR,
  cosineR,
  polarityPhaseBridge,
  wiringChainAdmits,
  peffExpeditionRecord,
} from '../../../src/engine/rhyming/paraparticle-peff-wiring-wet-lab.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function eegR(state) {
  return encodeR({
    Df: state.higuchiDf,
    Mf: state.higuchiDfSd,
    C: (state.thetaC + state.alphaC + state.gammaC) / 3,
    Phi: state.alphaC,
    X: 0.2,
    T: 0.4,
    S: 0.5,
  });
}

function particleEvents(rand, n = 48) {
  const events = [];
  for (let i = 0; i < n; i++) {
    const mode = i % 3; // 0 conventional, 1 para-like, 2 noise
    const label = mode === 0 ? 'A' : mode === 1 ? 'A' : 'B'; // labels collide for 0/1
    const Df = mode === 1 ? 1.55 + rand() * 0.05 : mode === 0 ? 1.2 + rand() * 0.05 : 0.9 + rand() * 0.2;
    const Phi = mode === 1 ? 0.85 + rand() * 0.05 : mode === 0 ? 0.4 + rand() * 0.05 : rand();
    const T = mode === 1 ? 0.8 + rand() * 0.05 : mode === 0 ? 0.35 + rand() * 0.05 : rand();
    events.push({
      id: i,
      label,
      mode,
      R: encodeR({ Df, Mf: 0.1, C: Phi * 0.7, Phi, X: mode === 1 ? 0.9 : 0.2, T, S: 0.5 }),
    });
  }
  return events;
}

function classifyByLabel(events, query) {
  return events.filter((e) => e.label === query.label).map((e) => e.mode);
}

/** Nearest R-centroid among modes present in the board. */
function classifyByR(events, query) {
  const modes = [...new Set(events.map((e) => e.mode))];
  const centroids = Object.fromEntries(
    modes.map((m) => {
      const members = events.filter((e) => e.mode === m);
      const acc = encodeR({});
      for (const e of members) {
        for (const k of Object.keys(acc)) acc[k] += e.R[k];
      }
      for (const k of Object.keys(acc)) acc[k] /= members.length;
      return [m, acc];
    }),
  );
  let best = modes[0];
  let bestSim = -1;
  for (const m of modes) {
    const sim = cosineR(query.R, centroids[m]);
    if (sim > bestSim) {
      bestSim = sim;
      best = m;
    }
  }
  // Recover all events whose nearest centroid matches the query's predicted mode.
  return events
    .filter((e) => {
      let bm = modes[0];
      let bs = -1;
      for (const m of modes) {
        const sim = cosineR(e.R, centroids[m]);
        if (sim > bs) {
          bs = sim;
          bm = m;
        }
      }
      return bm === best;
    })
    .map((e) => e.mode);
}

function shuffleR(R, rand) {
  const vals = Object.values(R);
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = vals[i];
    vals[i] = vals[j];
    vals[j] = tmp;
  }
  return encodeR({
    Df: vals[0],
    Mf: vals[1],
    C: vals[2],
    Phi: vals[3],
    X: vals[4],
    T: vals[5],
    S: vals[6],
  });
}

function phaseRandomize(R, rand) {
  return encodeR({ ...R, Phi: rand(), X: rand(), C: rand() });
}

function exp1CognitiveOrganization() {
  const c = EEG_PEFF_SUPPLIED.concentration;
  const m = EEG_PEFF_SUPPLIED.mindWandering;
  const deltas = {
    higuchiDf: c.higuchiDf - m.higuchiDf,
    thetaC: c.thetaC - m.thetaC,
    alphaC: c.alphaC - m.alphaC,
    gammaC: c.gammaC - m.gammaC,
  };
  const pass = Object.values(deltas).every((d) => d > 0);
  return {
    id: 'E1',
    title: 'Cognitive organization is measurable (supplied PEFF EEG)',
    pass,
    tier: 'historical_supplied',
    subjects: EEG_PEFF_SUPPLIED.subjects,
    deltas,
  };
}

function exp2ParticleInternalOrganization(rand) {
  const events = particleEvents(rand, 60);
  const query = events.find((e) => e.mode === 1);
  const byLabel = classifyByLabel(events, query);
  const byR = classifyByR(events, query);
  const labelPrecision = byLabel.filter((m) => m === 1).length / Math.max(1, byLabel.length);
  const rPrecision = byR.filter((m) => m === 1).length / Math.max(1, byR.length);
  // Labels collide for conventional vs para-like (both "A"); organization must separate them.
  const pass = rPrecision > labelPrecision + 0.2 && rPrecision >= 0.9;
  return {
    id: 'E2',
    title: 'Internal particle organization beats colliding labels',
    pass,
    tier: 'simulated',
    labelPrecision,
    rPrecision,
  };
}

function exp3ParaparticleBenchmark() {
  const b = MIT_PARAPARTICLE_BENCHMARK;
  const pass =
    Math.abs(b.exchangePhaseRad - Math.PI) < 1e-12 &&
    b.antibunchingColorIndependent === true &&
    b.occupationDistinctFromBose === true &&
    b.occupationDistinctFromFermi === true &&
    b.qubits === 16;
  return {
    id: 'E3',
    title: 'MIT paraparticle exchange benchmark encoded',
    pass,
    tier: 'historical_literature',
    arxiv: b.arxiv,
    exchangePhaseDeg: b.exchangePhaseDeg,
    qubits: b.qubits,
  };
}

function exp4CrossDomainRhyme(rand) {
  const eeg = eegR(EEG_PEFF_SUPPLIED.concentration);
  const particle = encodeR({ Df: 1.5, Mf: 0.12, C: 0.7, Phi: 0.85, X: 0.85, T: 0.8, S: 0.55 });
  const para = encodeR({
    Df: 1.45,
    Mf: 0.1,
    C: 0.65,
    Phi: MIT_PARAPARTICLE_BENCHMARK.exchangePhaseRad / Math.PI,
    X: 1.0,
    T: 0.75,
    S: 0.6,
  });
  const simEP = cosineR(eeg, particle);
  const simPP = cosineR(particle, para);
  const simEE = cosineR(eeg, para);
  const nullSims = [];
  for (let i = 0; i < 40; i++) {
    nullSims.push(cosineR(eeg, shuffleR(particle, rand)));
  }
  const nullMean = nullSims.reduce((a, b) => a + b, 0) / nullSims.length;
  const meanSim = (simEP + simPP + simEE) / 3;
  const pass = meanSim > nullMean + 0.08 && meanSim >= 0.85;
  return {
    id: 'E4',
    title: 'Cross-domain organizational rhyme vs shuffle null',
    pass,
    tier: 'simulated',
    meanSim,
    nullMean,
    sims: { eeg_particle: simEP, particle_para: simPP, eeg_para: simEE },
  };
}

function exp5SpinPhasePolarity() {
  const bridge = polarityPhaseBridge(0.37);
  const pass = bridge.equal === true && bridge.exchangeBenchmarkDeg === 180;
  return {
    id: 'E5',
    title: 'Polarity flip matches 180° phase inversion algebra',
    pass,
    tier: 'deterministic',
    exchangeBenchmarkDeg: bridge.exchangeBenchmarkDeg,
  };
}

function exp6WiringChain() {
  const admit = wiringChainAdmits(PEFF_WIRING_CHAIN);
  const pass = admit && PEFF_WIRING_CHAIN.length === 5;
  return {
    id: 'E6',
    title: 'Wiring Wet Lab chain admits PW-01…PW-05',
    pass,
    tier: 'compositional',
    links: PEFF_WIRING_CHAIN.map((e) => e.id),
  };
}

function exp7Falsification(rand) {
  const eeg = eegR(EEG_PEFF_SUPPLIED.concentration);
  const particle = encodeR({ Df: 1.5, Mf: 0.12, C: 0.7, Phi: 0.85, X: 0.85, T: 0.8, S: 0.55 });
  const real = cosineR(eeg, particle);
  const phased = cosineR(eeg, phaseRandomize(particle, rand));
  const shuffled = cosineR(eeg, shuffleR(particle, rand));
  const badChain = PEFF_WIRING_CHAIN.map((e, i) =>
    i === 2 ? { ...e, compatibility: false, nextInput: '' } : e,
  );
  const rejectsBad = wiringChainAdmits(badChain) === false;
  const pass = real > phased + 0.05 && real > shuffled + 0.05 && rejectsBad;
  return {
    id: 'E7',
    title: 'Falsifiers: phase randomize, shuffle, and bad link reject',
    pass,
    tier: 'simulated',
    real,
    phased,
    shuffled,
    rejectsBad,
  };
}

function exp8FreezeRStar(rand) {
  const Rstar = encodeR({
    Df: 1.45,
    Mf: 0.1,
    C: 0.68,
    Phi: 0.9,
    X: 0.88,
    T: 0.78,
    S: 0.55,
  });
  // Freeze before held-out: held-out para-like events must stay near R*
  const held = particleEvents(rand, 30).filter((e) => e.mode === 1);
  const sims = held.map((e) => cosineR(e.R, Rstar));
  const mean = sims.reduce((a, b) => a + b, 0) / Math.max(1, sims.length);
  const pass = mean >= 0.9 && sims.every((s) => s >= 0.85);
  return {
    id: 'E8',
    title: 'Frozen R* recovers held-out para-like organization',
    pass,
    tier: 'simulated',
    Rstar,
    heldOutMean: mean,
    heldOutN: held.length,
  };
}

export function runParaparticlePeffSuite(seed = SEED) {
  const rand = mulberry32(seed);
  const experiments = [
    exp1CognitiveOrganization(),
    exp2ParticleInternalOrganization(rand),
    exp3ParaparticleBenchmark(),
    exp4CrossDomainRhyme(rand),
    exp5SpinPhasePolarity(),
    exp6WiringChain(),
    exp7Falsification(rand),
    exp8FreezeRStar(rand),
  ];
  const passCount = experiments.filter((e) => e.pass).length;
  return {
    documentId: DOCUMENT_ID,
    registryId: REGISTRY_ID,
    title: TITLE,
    series: SERIES,
    seed,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    workingForm: PEFF_WORKING_FORM,
    doesNotProve: [...PEFF_DOES_NOT_PROVE],
    record: peffExpeditionRecord(),
    experiments,
    passCount,
    total: experiments.length,
    pass: passCount === experiments.length,
  };
}
