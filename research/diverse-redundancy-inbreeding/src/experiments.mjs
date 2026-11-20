/**
 * Diverse Redundancy · Inbreeding Expedition · experiments
 * E1 depth simulator · E2 Backblaze β · E3 plug-in · E4 yeast · E5 human
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BETA_SWEEP,
  BACKBLAZE_WINDOW_DAYS,
  CLONE_SIZES,
  DEPTHS,
  DIVERSE_CLASS_COUNTS,
  DOCUMENT_ID,
  FIXTURES,
  LAMBDA,
  SEED,
  TITLE,
} from './constants.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Survival of a mission held across `depth` nested copies.
 * Clone: all copies share one class → common-cause β kills the whole group.
 * Diverse: `k` independent classes; common-cause hits one class at a time.
 */
export function survivalClone(depth, nCopies, lambda, beta) {
  // Per-step: survive iff no common-cause AND at least one copy avoids independent fail
  // P(common) = beta; P(all independent fail | no common) = lambda^nCopies
  const pStep = (1 - beta) * (1 - lambda ** nCopies);
  return pStep ** depth;
}

export function survivalDiverse(depth, nClasses, lambda, beta) {
  // Each class fails independently with p_class = beta + (1-beta)*lambda
  // Mission survives a step if at least one class survives
  const pClassFail = beta + (1 - beta) * lambda;
  const pStep = 1 - pClassFail ** nClasses;
  return pStep ** depth;
}

export function runE1DepthSimulator() {
  const rows = [];
  for (const beta of BETA_SWEEP) {
    for (const depth of DEPTHS) {
      for (const n of CLONE_SIZES) {
        rows.push({
          arm: 'clone',
          beta,
          depth,
          n,
          survival: survivalClone(depth, n, LAMBDA, beta),
        });
      }
      for (const k of DIVERSE_CLASS_COUNTS) {
        rows.push({
          arm: 'diverse',
          beta,
          depth,
          n: k,
          survival: survivalDiverse(depth, k, LAMBDA, beta),
        });
      }
    }
  }
  // Headline: at beta=0.2, depth=6, clone-5 vs diverse-5
  const headline = {
    beta: 0.2,
    depth: 6,
    clone5: survivalClone(6, 5, LAMBDA, 0.2),
    diverse5: survivalDiverse(6, 5, LAMBDA, 0.2),
    clone9: survivalClone(6, 9, LAMBDA, 0.2),
    diverse9: survivalDiverse(6, 9, LAMBDA, 0.2),
  };
  const cloneCaps =
    Math.abs(headline.clone9 - headline.clone5) < 0.02 && headline.clone5 < 0.5;
  const diverseBeatsClone = headline.diverse5 > headline.clone5 + 0.2;
  return {
    id: 'E1',
    name: 'Correlated-copy depth simulator',
    lambda: LAMBDA,
    rows,
    headline,
    signal: cloneCaps && diverseBeatsClone,
    note:
      'Identical copies share a common-cause channel; adding clones past a few barely lifts survival when β>0. Diverse classes keep stacking.',
  };
}

function dateIndex(dates, d) {
  return dates.indexOf(d);
}

/**
 * Estimate β from Backblaze: same-model co-failures in a 7-day window
 * vs an exposure-aware null that places failures independently.
 */
export function runE2BackblazeBeta() {
  const bb = loadJson(FIXTURES.backblaze);
  const { dates, models, failures } = bb;
  const nDays = dates.length;
  const byModel = new Map();
  for (const [date, model] of failures) {
    if (!byModel.has(model)) byModel.set(model, []);
    byModel.get(model).push(date);
  }

  let observedPairs = 0;
  let nullPairs = 0;
  let modelCount = 0;
  const perModel = [];

  const rand = mulberry32(SEED);

  for (const [model, failDates] of byModel) {
    if (failDates.length < 2) continue;
    const meta = models[model];
    if (!meta) continue;
    modelCount += 1;
    // Observed: unordered pairs within window
    const sorted = [...failDates].sort();
    let obs = 0;
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const di = dateIndex(dates, sorted[i]);
        const dj = dateIndex(dates, sorted[j]);
        if (di < 0 || dj < 0) continue;
        if (Math.abs(dj - di) <= BACKBLAZE_WINDOW_DAYS) obs += 1;
      }
    }
    // Null: place the same count of failures proportional to daily exposure
    const exposure = meta.exposure;
    const totalExp = exposure.reduce((a, b) => a + b, 0) || 1;
    const cdf = [];
    let acc = 0;
    for (let d = 0; d < nDays; d++) {
      acc += exposure[d] / totalExp;
      cdf.push(acc);
    }
    function drawDay() {
      const u = rand();
      let lo = 0;
      let hi = cdf.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cdf[mid] < u) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }
    const N_NULL = 40;
    let nullSum = 0;
    for (let t = 0; t < N_NULL; t++) {
      const placed = [];
      for (let f = 0; f < failDates.length; f++) placed.push(drawDay());
      placed.sort((a, b) => a - b);
      let n = 0;
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          if (placed[j] - placed[i] <= BACKBLAZE_WINDOW_DAYS) n += 1;
          else break;
        }
      }
      nullSum += n;
    }
    const nullMean = nullSum / N_NULL;
    observedPairs += obs;
    nullPairs += nullMean;
    perModel.push({
      model,
      mfr: meta.mfr,
      failures: failDates.length,
      observedWindowPairs: obs,
      nullMeanWindowPairs: Number(nullMean.toFixed(3)),
      excess: Number((obs - nullMean).toFixed(3)),
    });
  }

  const betaHat =
    nullPairs > 0
      ? Math.max(0, Math.min(1, (observedPairs - nullPairs) / Math.max(observedPairs, 1)))
      : 0;
  // More stable: fraction of observed pairs that exceed null
  const excessRatio =
    observedPairs > 0 ? Math.max(0, (observedPairs - nullPairs) / observedPairs) : 0;

  return {
    id: 'E2',
    name: 'Backblaze same-model co-failure β',
    source: bb.source,
    url: bb.url,
    windowDays: BACKBLAZE_WINDOW_DAYS,
    nDays,
    nModelsWithMultiFail: modelCount,
    nFailures: failures.length,
    observedWindowPairs: observedPairs,
    nullMeanWindowPairs: Number(nullPairs.toFixed(2)),
    betaHat: Number(excessRatio.toFixed(4)),
    signal: excessRatio > 0.03 && observedPairs > nullPairs,
    topExcess: perModel
      .sort((a, b) => b.excess - a.excess)
      .slice(0, 8),
    note:
      'β̂ is the share of same-model window pairs above an exposure-aware independent null — a lower bound on common-cause clustering, not a claim about agent fleets.',
  };
}

export function runE3Plugin(e1, e2) {
  const beta = Math.max(0.05, Math.min(0.5, e2.betaHat || 0.1));
  const depths = [3, 6, 9];
  const table = depths.map((depth) => ({
    depth,
    beta,
    clone3: survivalClone(depth, 3, LAMBDA, beta),
    clone5: survivalClone(depth, 5, LAMBDA, beta),
    clone9: survivalClone(depth, 9, LAMBDA, beta),
    diverse3: survivalDiverse(depth, 3, LAMBDA, beta),
    diverse5: survivalDiverse(depth, 5, LAMBDA, beta),
    diverse9: survivalDiverse(depth, 9, LAMBDA, beta),
  }));
  const at6 = table.find((r) => r.depth === 6);
  return {
    id: 'E3',
    name: 'Plug measured β into depth model',
    betaUsed: beta,
    table,
    signal: at6 && at6.diverse5 > at6.clone5 + 0.05,
    note:
      'Structural plug-in only. Backblaze β is storage hardware; the depth model is an Infinite Octaves nesting analogy, not a live multi-agent bake-off.',
  };
}

function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Yeast: null-inviable rate by paralog presence, length-controlled via bins.
 */
export function runE4Yeast() {
  const y = loadJson(FIXTURES.yeast);
  const genes = y.genes; // [orf, lengthNt, inviableNull, ambiguous, nParalogs, maxId]
  const usable = genes.filter((g) => g[3] === 0); // drop ambiguous
  const withPar = usable.filter((g) => g[4] > 0);
  const noPar = usable.filter((g) => g[4] === 0);

  function rate(xs) {
    return xs.length ? xs.reduce((a, g) => a + g[2], 0) / xs.length : 0;
  }

  // Length tertiles on no-paralog background
  const lengths = noPar.map((g) => g[1]).sort((a, b) => a - b);
  const t1 = lengths[Math.floor(lengths.length / 3)] || 0;
  const t2 = lengths[Math.floor((2 * lengths.length) / 3)] || 0;
  function lenBin(L) {
    if (L <= t1) return 0;
    if (L <= t2) return 1;
    return 2;
  }

  const stratified = [0, 1, 2].map((bin) => {
    const a = noPar.filter((g) => lenBin(g[1]) === bin);
    const b = withPar.filter((g) => lenBin(g[1]) === bin);
    return {
      lengthBin: bin,
      noParalogN: a.length,
      noParalogEssentialRate: Number(rate(a).toFixed(4)),
      withParalogN: b.length,
      withParalogEssentialRate: Number(rate(b).toFixed(4)),
    };
  });

  // Identity bins among paralogs
  const idBins = [
    { label: 'id<30', pred: (g) => g[5] > 0 && g[5] < 30 },
    { label: '30≤id<50', pred: (g) => g[5] >= 30 && g[5] < 50 },
    { label: 'id≥50', pred: (g) => g[5] >= 50 },
  ].map((b) => {
    const xs = withPar.filter(b.pred);
    return {
      label: b.label,
      n: xs.length,
      essentialRate: Number(rate(xs).toFixed(4)),
    };
  });

  const overall = {
    n: usable.length,
    essentialRate: Number(rate(usable).toFixed(4)),
    withParalogN: withPar.length,
    withParalogEssentialRate: Number(rate(withPar).toFixed(4)),
    noParalogN: noPar.length,
    noParalogEssentialRate: Number(rate(noPar).toFixed(4)),
  };

  // Signal: paralogs have LOWER essentiality (buffering) after looking at stratified means
  const meanStratNo = stratified.reduce((a, r) => a + r.noParalogEssentialRate, 0) / 3;
  const meanStratPar = stratified.reduce((a, r) => a + r.withParalogEssentialRate, 0) / 3;
  const buffering = meanStratPar < meanStratNo - 0.02;

  return {
    id: 'E4',
    name: 'Yeast paralog buffering (SGD null inviable)',
    source: y.source,
    overall,
    stratified,
    identityBins: idBins,
    signal: buffering,
    deltaEssential: Number((meanStratPar - meanStratNo).toFixed(4)),
    note:
      'Public SGD null phenotypes + Ensembl yeast paralogs. Soft Story for agent fleets: a second diverged copy buffers single-copy loss more than a near-clone does.',
  };
}

/**
 * Human: LOEUF (higher = more tolerant of LoF) by paralog presence.
 */
export function runE5Human() {
  const h = loadJson(FIXTURES.human);
  const genes = h.genes; // [gene, possibleSynSites, loeuf, nParalogs, maxId]
  const usable = genes.filter((g) => typeof g[2] === 'number' && Number.isFinite(g[2]));
  const withPar = usable.filter((g) => g[3] > 0);
  const noPar = usable.filter((g) => g[3] === 0);

  function mean(xs, idx = 2) {
    return xs.length ? xs.reduce((a, g) => a + g[idx], 0) / xs.length : 0;
  }

  const lengths = noPar.map((g) => g[1]).sort((a, b) => a - b);
  const t1 = lengths[Math.floor(lengths.length / 3)] || 0;
  const t2 = lengths[Math.floor((2 * lengths.length) / 3)] || 0;
  function lenBin(L) {
    if (L <= t1) return 0;
    if (L <= t2) return 1;
    return 2;
  }

  const stratified = [0, 1, 2].map((bin) => {
    const a = noPar.filter((g) => lenBin(g[1]) === bin);
    const b = withPar.filter((g) => lenBin(g[1]) === bin);
    return {
      lengthBin: bin,
      noParalogN: a.length,
      noParalogMeanLoeuf: Number(mean(a).toFixed(4)),
      withParalogN: b.length,
      withParalogMeanLoeuf: Number(mean(b).toFixed(4)),
    };
  });

  const meanNo = stratified.reduce((a, r) => a + r.noParalogMeanLoeuf, 0) / 3;
  const meanPar = stratified.reduce((a, r) => a + r.withParalogMeanLoeuf, 0) / 3;
  // Higher LOEUF = more LoF-tolerant; paralogs should trend higher if buffering holds
  const buffering = meanPar > meanNo + 0.01;

  return {
    id: 'E5',
    name: 'Human paralog × gnomAD LOEUF',
    source: h.source,
    overall: {
      n: usable.length,
      meanLoeuf: Number(mean(usable).toFixed(4)),
      withParalogN: withPar.length,
      withParalogMeanLoeuf: Number(mean(withPar).toFixed(4)),
      noParalogN: noPar.length,
      noParalogMeanLoeuf: Number(mean(noPar).toFixed(4)),
    },
    stratified,
    signal: buffering,
    deltaLoeuf: Number((meanPar - meanNo).toFixed(4)),
    note:
      'gnomAD constraint + Ensembl human paralogs. Soft Story only — not clinical genetics, not a claim that LOEUF proves agent-fleet diversity.',
  };
}

export function runFullExpedition() {
  const e1 = runE1DepthSimulator();
  const e2 = runE2BackblazeBeta();
  const e3 = runE3Plugin(e1, e2);
  const e4 = runE4Yeast();
  const e5 = runE5Human();

  const signals = [e1, e2, e3, e4, e5].filter((e) => e.signal).map((e) => e.id);
  const positive = signals.length >= 3;

  const verdict = positive
    ? `Positive expedition signal on ${signals.join(', ')}: cloned copies share failure modes under common-cause β while diverse classes keep nesting depth; public yeast/human paralog boards and Backblaze same-model clustering support the rhyme.`
    : `Mixed expedition signal (${signals.join(', ') || 'none'}): depth model still shows clone cap under β, but public boards did not all move the same way — pin stays deferred.`;

  return {
    documentId: DOCUMENT_ID,
    title: TITLE,
    seed: SEED,
    rhyme: 'diverse-redundancy-inbreeding',
    rhymingExpeditionArm: true,
    engineShelfPin: 'deferred',
    positiveExpeditionSignal: positive,
    signals,
    e1,
    e2,
    e3,
    e4,
    e5,
    verdict,
    honesty:
      'Soft Story / computational expedition · Rhyming Expedition arm · real public fixtures (Backblaze 2019 H1, SGD yeast, gnomAD + Ensembl paralogs) · depth simulator is structural nesting grammar, not live agent fleets · Backblaze measures drive hardware · yeast/human boards are Soft Story for agent diversity, not wet-lab genetics claims · ENGINE_SHELF pin deferred · Φ_EGS architectural key only · Fair Exchange · → ∞^∞',
  };
}

// silence unused in lint-free ESM
void logistic;
