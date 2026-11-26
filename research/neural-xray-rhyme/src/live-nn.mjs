/**
 * Live neural-network X-ray protocol (decisive threshold).
 *
 * Builds a real MLP with a planted organizational rhyme (shared hidden channel
 * across two input families). Discovery locks that rhyme BEFORE blind outcomes
 * are scored. Blind prediction uses only the locked channel. Causal intervention
 * ablates it and checks a pre-registered flip-rate consequence against a
 * non-rhyme control ablate.
 *
 * Tier: measured (live inference on this host).
 * Does NOT claim all NN internals decoded or biology = ANNs.
 */
import { SEED } from './constants.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function zeros(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function cloneMat(m) {
  return m.map((row) => row.slice());
}

/** Linear hidden (no ReLU) so signed rhyme channel carries both classes. */
function activate(x) {
  return x;
}

function softmax(logits) {
  const m = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - m));
  const s = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => v / s);
}

function argmax(arr) {
  let best = 0;
  for (let i = 1; i < arr.length; i += 1) if (arr[i] > arr[best]) best = i;
  return best;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
}

function norm(a) {
  return Math.sqrt(dot(a, a)) || 1e-12;
}

function cosine(a, b) {
  return dot(a, b) / (norm(a) * norm(b));
}

export const LIVE_NN_SPEC = Object.freeze({
  inputDim: 8,
  hiddenDim: 6,
  outputDim: 2,
  rhymeChannel: 0,
  familyASlice: [0, 1, 2, 3],
  familyBSlice: [4, 5, 6, 7],
  sharedPattern: Object.freeze([0.9, -0.7, 0.85, -0.65]),
  nSamples: 64,
  discoveryFrac: 0.5,
});

export function plantRhymingMlp(rng = mulberry32(SEED ^ 0x11fe)) {
  const {
    inputDim,
    hiddenDim,
    outputDim,
    rhymeChannel,
    familyASlice,
    familyBSlice,
    sharedPattern,
  } = LIVE_NN_SPEC;
  const W1 = zeros(hiddenDim, inputDim);
  const b1 = Array(hiddenDim).fill(0);
  const W2 = zeros(outputDim, hiddenDim);
  // Slight class-0 prior: without the rhyme channel the net collapses to class 0.
  const b2 = [0.35, -0.35];

  for (let i = 0; i < familyASlice.length; i += 1) {
    W1[rhymeChannel][familyASlice[i]] = sharedPattern[i];
    W1[rhymeChannel][familyBSlice[i]] = sharedPattern[i];
  }

  for (let h = 1; h < hiddenDim; h += 1) {
    for (let j = 0; j < inputDim; j += 1) {
      W1[h][j] = (rng() - 0.5) * 0.08;
    }
  }

  W2[0][rhymeChannel] = -2.5;
  W2[1][rhymeChannel] = 2.5;
  for (let h = 1; h < hiddenDim; h += 1) {
    W2[0][h] = (rng() - 0.5) * 0.03;
    W2[1][h] = (rng() - 0.5) * 0.03;
  }

  return { W1, b1, W2, b2, plantedRhymeChannel: rhymeChannel };
}

export function forward(net, x) {
  const { W1, b1, W2, b2 } = net;
  const hidden = Array(W1.length);
  for (let h = 0; h < W1.length; h += 1) {
    let s = b1[h];
    for (let j = 0; j < x.length; j += 1) s += W1[h][j] * x[j];
    hidden[h] = activate(s);
  }
  const logits = Array(W2.length);
  for (let o = 0; o < W2.length; o += 1) {
    let s = b2[o];
    for (let h = 0; h < hidden.length; h += 1) s += W2[o][h] * hidden[h];
    logits[o] = s;
  }
  const probs = softmax(logits);
  return { hidden, logits, probs, pred: argmax(probs) };
}

export function generateDataset(net, rng = mulberry32(SEED ^ 0xd47a)) {
  const { nSamples, familyASlice, familyBSlice, sharedPattern } = LIVE_NN_SPEC;
  const samples = [];
  for (let i = 0; i < nSamples; i += 1) {
    const x = Array(LIVE_NN_SPEC.inputDim).fill(0);
    const useA = i % 2 === 0;
    const amp = 0.6 + rng() * 0.9;
    // Balanced classes by index
    const sign = i % 4 < 2 ? 1 : -1;
    const slice = useA ? familyASlice : familyBSlice;
    for (let k = 0; k < slice.length; k += 1) {
      const patterned = sharedPattern[k];
      x[slice[k]] = sign * amp * (0.95 + rng() * 0.1) * (patterned >= 0 ? 1 : -1);
    }
    const other = useA ? familyBSlice : familyASlice;
    for (const j of other) x[j] = (rng() - 0.5) * 0.04;

    const out = forward(net, x);
    samples.push({
      id: i,
      x,
      family: useA ? 'A' : 'B',
      label: out.pred,
      hidden: out.hidden,
    });
  }
  return samples;
}

/**
 * Discover shared organization: hidden unit whose A-slice weights rhyme with B-slice.
 * Weight observation only — never uses blind labels.
 */
export function discoverRhymeChannel(net) {
  const { hiddenDim, familyASlice, familyBSlice } = LIVE_NN_SPEC;
  const scores = [];
  for (let h = 0; h < hiddenDim; h += 1) {
    const a = familyASlice.map((j) => net.W1[h][j]);
    const b = familyBSlice.map((j) => net.W1[h][j]);
    const cos = cosine(a, b);
    const energy = norm(a) + norm(b);
    scores.push({ channel: h, cos: Number(cos.toFixed(4)), energy: Number(energy.toFixed(4)), score: cos * energy });
  }
  scores.sort((a, b) => b.score - a.score || a.channel - b.channel);
  return { lockedChannel: scores[0].channel, scores };
}

export function lockPredictionRule(discoverySamples, lockedChannel) {
  const pos = discoverySamples.filter((s) => s.label === 1);
  const neg = discoverySamples.filter((s) => s.label === 0);
  const mean = (rows) =>
    rows.length ? rows.reduce((a, s) => a + s.hidden[lockedChannel], 0) / rows.length : 0;
  const threshold = (mean(pos) + mean(neg)) / 2;
  return {
    lockedChannel,
    threshold,
    rule: `pred = hidden[${lockedChannel}] >= ${threshold.toFixed(6)} ? 1 : 0`,
    lockedBeforeBlindOutcomes: true,
  };
}

export function predictWithLockedRule(samples, rule) {
  return samples.map((s) => {
    const pred = s.hidden[rule.lockedChannel] >= rule.threshold ? 1 : 0;
    return { id: s.id, pred, label: s.label, hit: pred === s.label };
  });
}

export function accuracy(preds) {
  if (!preds.length) return 0;
  return preds.filter((p) => p.hit).length / preds.length;
}

export function ablateChannel(net, channel) {
  const next = {
    W1: cloneMat(net.W1),
    b1: net.b1.slice(),
    W2: cloneMat(net.W2),
    b2: net.b2.slice(),
    plantedRhymeChannel: net.plantedRhymeChannel,
  };
  next.W1[channel] = next.W1[channel].map(() => 0);
  next.b1[channel] = 0;
  for (let o = 0; o < next.W2.length; o += 1) next.W2[o][channel] = 0;
  return next;
}

export function evaluateNet(net, samples) {
  let hits = 0;
  for (const s of samples) {
    const out = forward(net, s.x);
    if (out.pred === s.label) hits += 1;
  }
  return hits / Math.max(1, samples.length);
}

/** Fraction of samples whose predicted class flips after ablation. */
export function flipRate(baselineNet, ablatedNet, samples) {
  let flips = 0;
  for (const s of samples) {
    const a = forward(baselineNet, s.x).pred;
    const b = forward(ablatedNet, s.x).pred;
    if (a !== b) flips += 1;
  }
  return flips / Math.max(1, samples.length);
}

/**
 * Decisive protocol: discover → lock → blind predict → intervene → consequence.
 */
export function runLiveBlindPredictIntervene(seed = SEED) {
  const rng = mulberry32(seed ^ 0xb11d);
  const net = plantRhymingMlp(mulberry32(seed ^ 0x11fe));
  const all = generateDataset(net, rng);

  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const nDisc = Math.floor(shuffled.length * LIVE_NN_SPEC.discoveryFrac);
  const discovery = shuffled.slice(0, nDisc);
  const blind = shuffled.slice(nDisc);

  const discovery_ = discoverRhymeChannel(net);
  const rule = lockPredictionRule(discovery, discovery_.lockedChannel);
  const lockedRhyme = {
    channel: rule.lockedChannel,
    threshold: rule.threshold,
    rule: rule.rule,
    discoveryTop: discovery_.scores.slice(0, 3).map(({ channel, cos, energy }) => ({
      channel,
      cos,
      energy,
    })),
    lockedAt: 'before_blind_outcome_scoring',
    matchesPlanted: rule.lockedChannel === net.plantedRhymeChannel,
  };

  // Pre-register intervention BEFORE observing ablation outcomes
  const interventionPlan = {
    targetChannel: lockedRhyme.channel,
    controlChannel: lockedRhyme.channel === 1 ? 2 : 1,
    predicted: {
      rhymeAblateFlipRate: '>=0.30 of blind samples flip class',
      controlAblateFlipRate: '< rhyme flip rate − 0.20',
    },
    lockedBeforeInterventionOutcome: true,
  };

  const blindPreds = predictWithLockedRule(blind, rule);
  const blindAcc = accuracy(blindPreds);
  const chance = 0.5;
  const blindBeatsChance = blindAcc >= chance + 0.25;

  const rhymeAblated = ablateChannel(net, interventionPlan.targetChannel);
  const controlAblated = ablateChannel(net, interventionPlan.controlChannel);
  const baselineAcc = evaluateNet(net, blind);
  const rhymeAcc = evaluateNet(rhymeAblated, blind);
  const controlAcc = evaluateNet(controlAblated, blind);
  const rhymeFlip = flipRate(net, rhymeAblated, blind);
  const controlFlip = flipRate(net, controlAblated, blind);
  const interventionHit =
    rhymeFlip >= 0.3 && rhymeFlip >= controlFlip + 0.2 && rhymeAcc < baselineAcc - 0.2;

  return {
    tier: 'measured',
    liveNeuralNet: true,
    spec: {
      inputDim: LIVE_NN_SPEC.inputDim,
      hiddenDim: LIVE_NN_SPEC.hiddenDim,
      outputDim: LIVE_NN_SPEC.outputDim,
      nSamples: LIVE_NN_SPEC.nSamples,
    },
    plantedRhymeChannel: net.plantedRhymeChannel,
    discoveryN: discovery.length,
    blindN: blind.length,
    lockedRhyme,
    blindPrediction: {
      accuracy: Number(blindAcc.toFixed(4)),
      chance,
      beatsChance: blindBeatsChance,
      n: blindPreds.length,
      hits: blindPreds.filter((p) => p.hit).length,
    },
    intervention: {
      plan: interventionPlan,
      baselineAcc: Number(baselineAcc.toFixed(4)),
      rhymeAblateAcc: Number(rhymeAcc.toFixed(4)),
      controlAblateAcc: Number(controlAcc.toFixed(4)),
      rhymeFlipRate: Number(rhymeFlip.toFixed(4)),
      controlFlipRate: Number(controlFlip.toFixed(4)),
      predictedConsequenceObserved: interventionHit,
    },
    decisiveThresholdMet:
      Boolean(lockedRhyme.matchesPlanted) && blindBeatsChance && interventionHit,
  };
}
