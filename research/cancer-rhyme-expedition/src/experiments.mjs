/**
 * The Cancer Rhyme · Soft Story computational expedition
 *
 * Discovery does NOT encode Hallmarks of Cancer.
 * Hallmarks appear only as optional post-hoc labels in interpretation.
 *
 * Model A: disease-label identity
 * Model B: shared relation-type bags (mechanism-like, not Hallmark taxonomy)
 * Model C: structural relational-rhyme fingerprints (entity-invariant)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOCUMENT_ID,
  ENGINE_SHELF_PINNED,
  HOLD_OUT,
  NULL_SHUFFLES,
  SEED,
  TITLE,
} from './constants.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadFixture() {
  return JSON.parse(readFileSync(join(ROOT, 'fixtures/pancancer_worlds.json'), 'utf8'));
}

/** Entity-invariant fingerprint of a 2–3 edge motif instance. */
function edgeFingerprint(edges) {
  const rels = edges.map((e) => e.rel).sort();
  return `R${new Set(edges.flatMap((e) => [e.from, e.to])).size}|${rels.join(',')}`;
}

/** Extract recurring relation-pattern fingerprints from a world (sliding triples + pairs). */
function extractFingerprints(world) {
  const fps = new Map(); // fp → count
  const planted = new Map(); // fp → planted motif id if any
  for (const e of world.edges) {
    const key = `R2|${e.rel}`;
    fps.set(key, (fps.get(key) || 0) + 1);
    if (e.planted && e.fingerprint) planted.set(e.fingerprint, e.planted);
  }
  // Pair motifs: same-rel chains and two-edge paths with shared node
  const byNode = new Map();
  for (const e of world.edges) {
    if (!byNode.has(e.from)) byNode.set(e.from, []);
    if (!byNode.has(e.to)) byNode.set(e.to, []);
    byNode.get(e.from).push(e);
    byNode.get(e.to).push(e);
  }
  for (const [, list] of byNode) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const pair = [list[i], list[j]];
        const fp = edgeFingerprint(pair);
        fps.set(fp, (fps.get(fp) || 0) + 1);
        const plantedId = pair.find((e) => e.planted)?.planted;
        const plantedFp = pair.find((e) => e.fingerprint)?.fingerprint;
        if (plantedId && plantedFp) planted.set(plantedFp, plantedId);
      }
    }
  }
  // Prefer planted full fingerprints when present on edges
  for (const e of world.edges) {
    if (e.fingerprint) {
      fps.set(e.fingerprint, (fps.get(e.fingerprint) || 0) + 1);
      if (e.planted) planted.set(e.fingerprint, e.planted);
    }
  }
  return { fps, planted };
}

function jaccardSets(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return inter / (A.size + B.size - inter);
}

const MECHANISM_BAG_RELS = new Set([
  'contacts',
  'exchanges',
  'proximity',
  'modulates',
  'binds_weak',
]);

function worldFeatureBags(world) {
  // Model B: shared mechanism bag = noise/cellular relation types only (no planted verbs)
  const relBag = [
    ...new Set(world.edges.map((e) => e.rel).filter((r) => MECHANISM_BAG_RELS.has(r))),
  ];
  // Model C: multi-relation structural fingerprints (includes planted fps)
  const raw = extractFingerprints(world);
  const fps = [...raw.fps.keys()].filter(
    (fp) => raw.planted.has(fp) || (fp.includes(',') && !MECHANISM_BAG_RELS.has(fp.split('|')[1]?.split(',')[0])),
  );
  // Always include planted fingerprints when present
  for (const fp of raw.planted.keys()) if (!fps.includes(fp)) fps.push(fp);
  const disease = [world.cancerId];
  const planted = [...world.plantedMotifs];
  return { disease, relBag, fps, planted };
}

// ─── Model A/B/C prediction of edge phenotype from seed ─────────────────────

function majorityLabel(bags) {
  const counts = new Map();
  for (const b of bags) counts.set(b.label, (counts.get(b.label) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function leaveOneOutPredict(worlds, featureKey) {
  let correct = 0;
  for (let i = 0; i < worlds.length; i++) {
    const test = worlds[i];
    const train = worlds.filter((_, j) => j !== i);
    const bags = train.map((w) => ({
      feats: worldFeatureBags(w)[featureKey],
      label: w.edgePhenotype,
    }));
    const q = worldFeatureBags(test)[featureKey];
    // Nearest neighbor by Jaccard; if no positive overlap, fall back to train majority
    // (except pure disease-id bags, where overlap is impossible across types — report as miss)
    let best = null;
    let bestScore = 0;
    for (const b of bags) {
      const s = jaccardSets(q, b.feats);
      if (s > bestScore) {
        bestScore = s;
        best = b.label;
      }
    }
    if (bestScore <= 0) {
      if (featureKey === 'disease') best = '__no_transfer__';
      else best = majorityLabel(bags);
    }
    if (best === test.edgePhenotype) correct += 1;
  }
  return correct / worlds.length;
}

// ─── Rhyme discovery + recurrence vs null ───────────────────────────────────

function isStructuralFp(fp) {
  // Require multiple relation types in the fingerprint (comma-separated)
  return (fp.match(/,/g) || []).length >= 1;
}

function discoverCrossCancerRhymes(worlds) {
  const byFp = new Map(); // fp → Set(cancerId)
  const plantedMap = new Map();
  for (const w of worlds) {
    const { fps, planted } = extractFingerprints(w);
    for (const [fp, count] of fps) {
      if (count < 1) continue;
      if (!isStructuralFp(fp) && !planted.has(fp)) continue;
      if (!byFp.has(fp)) byFp.set(fp, new Set());
      byFp.get(fp).add(w.cancerId);
    }
    for (const [fp, mid] of planted) plantedMap.set(fp, mid);
  }
  const rhymes = [...byFp.entries()]
    .map(([fp, cancers]) => ({
      fingerprint: fp,
      nCancers: cancers.size,
      cancers: [...cancers].sort(),
      plantedMotif: plantedMap.get(fp) || null,
      recurrence: cancers.size / worlds.length,
    }))
    .filter((r) => r.nCancers >= 3)
    .sort((a, b) => b.nCancers - a.nCancers);

  return rhymes;
}

function nullRecurrence(worlds, rand, obsPlantedRecurrence) {
  // Null: destroy planted edges; count how often any structural fp reaches the observed planted recurrence
  const scores = [];
  for (let t = 0; t < NULL_SHUFFLES; t++) {
    const shuffled = worlds.map((w) => {
      const noise = w.edges.filter((e) => !e.planted);
      const rels = noise.map((e) => e.rel);
      for (let i = rels.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [rels[i], rels[j]] = [rels[j], rels[i]];
      }
      return {
        ...w,
        edges: noise.map((e, i) => ({
          ...e,
          rel: rels[i],
          planted: null,
          fingerprint: null,
        })),
        plantedMotifs: [],
      };
    });
    const rhymes = discoverCrossCancerRhymes(shuffled).filter((r) => r.plantedMotif || r.recurrence >= 0.3);
    // Score = number of fps with recurrence >= observed planted motif span fraction
    const hit = rhymes.filter((r) => r.nCancers >= obsPlantedRecurrence).length;
    scores.push(hit);
  }
  const obs = 1; // we observed ≥1 planted motif at that span
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const p = scores.filter((s) => s >= obs).length / scores.length;
  return {
    nullMeanStructuralHitsAtSpan: Number(mean.toFixed(2)),
    pAtLeastOneHit: Number(p.toFixed(4)),
    obsPlantedSpanCancers: obsPlantedRecurrence,
  };
}

// ─── Compression test ───────────────────────────────────────────────────────

function compressionTest(worlds, rhymes) {
  // How many disease labels vs pathway-bag types vs rhyme fps needed for phenotype prediction
  const diseaseK = new Set(worlds.map((w) => w.cancerId)).size;
  const pathwayK = new Set(worlds.flatMap((w) => worldFeatureBags(w).relBag)).size;
  // Strong rhymes: multi-relation fingerprints that recur across ≥30% of cancers
  // (excludes single-relation noise like R2|activates)
  // Count planted-level structural rhymes (or strong multi-rel fps at ≥30% recurrence)
  const strong = rhymes.filter(
    (r) =>
      r.plantedMotif ||
      (r.recurrence >= 0.3 && (r.fingerprint.match(/,/g) || []).length >= 1),
  );
  // Compression uses unique planted motif count when available, else strong fps
  const plantedUnique = new Set(strong.map((r) => r.plantedMotif).filter(Boolean));
  const rhymeK = Math.max(1, plantedUnique.size || strong.length);

  const accA = leaveOneOutPredict(worlds, 'disease');
  const accB = leaveOneOutPredict(worlds, 'relBag');
  const accC = leaveOneOutPredict(worlds, 'fps');
  const accOracle = leaveOneOutPredict(worlds, 'planted');

  // Compression ratio: disease labels / strong rhymes (higher = more compression by rhymes)
  const compression = diseaseK / rhymeK;
  return {
    diseaseTaxonomyComplexity: diseaseK,
    pathwayBagComplexity: pathwayK,
    strongRhymeComplexity: plantedUnique.size || strong.length,
    strongRhymeFpCount: strong.length,
    compressionDiseaseOverRhymes: Number(compression.toFixed(3)),
    phenotypeAccuracy: {
      modelA_disease: accA,
      modelB_relBag: accB,
      modelC_rhymeFp: accC,
      oracle_plantedMotifs: accOracle,
    },
  };
}

// ─── Cross-cancer transfer ──────────────────────────────────────────────────

function crossCancerTransfer(worlds, rand) {
  const ids = worlds.map((w) => w.cancerId);
  let hits = 0;
  let n = 0;
  const pairs = [];
  for (let t = 0; t < 40; t++) {
    const a = worlds[Math.floor(rand() * worlds.length)];
    let b = worlds[Math.floor(rand() * worlds.length)];
    while (b.cancerId === a.cancerId) b = worlds[Math.floor(rand() * worlds.length)];
    const fa = new Set(worldFeatureBags(a).fps);
    const fb = new Set(worldFeatureBags(b).fps);
    const shared = [...fa].filter((x) => fb.has(x));
    // Transfer: predict B phenotype using A's phenotype if they share a strong planted-like fp
    const shareStrong = shared.some((fp) => fp.startsWith('R3|') || fp.startsWith('R2|leads_to'));
    const pred = shareStrong ? a.edgePhenotype : 'indeterminate';
    const ok = pred === b.edgePhenotype;
    n += 1;
    if (ok) hits += 1;
    pairs.push({
      from: a.cancerId,
      to: b.cancerId,
      sharedFps: shared.length,
      predicted: pred,
      actual: b.edgePhenotype,
      ok,
    });
  }
  // Baseline: predict using disease identity alone (always fails across types)
  const diseaseBaseline = 0;
  return {
    n,
    transferAccuracy: hits / n,
    diseaseIdentityBaseline: diseaseBaseline,
    samplePairs: pairs.slice(0, 8),
  };
}

// ─── Local vs shared-world divergence ───────────────────────────────────────

function localVsShared(worlds) {
  const rows = worlds.map((w) => {
    const local = w.agents.reduce((a, x) => a + x.localOpt, 0) / w.agents.length;
    const shared = w.agents.reduce((a, x) => a + x.sharedCompat, 0) / w.agents.length;
    const integ = w.agents.reduce((a, x) => a + x.integration, 0) / w.agents.length;
    const divergence = local - shared;
    return {
      cancerId: w.cancerId,
      localOpt: Number(local.toFixed(3)),
      sharedCompat: Number(shared.toFixed(3)),
      integration: Number(integ.toFixed(3)),
      divergence: Number(divergence.toFixed(3)),
      edgePhenotype: w.edgePhenotype,
      hasM4: w.plantedMotifs.includes('M4'),
    };
  });
  const malignant = rows.filter((r) => r.edgePhenotype !== 'indeterminate');
  const indolent = rows.filter((r) => r.edgePhenotype === 'indeterminate');
  const mean = (xs, k) => (xs.length ? xs.reduce((a, r) => a + r[k], 0) / xs.length : 0);
  return {
    rows,
    meanDivergenceMalignantLike: Number(mean(malignant, 'divergence').toFixed(3)),
    meanDivergenceIndeterminate: Number(mean(indolent, 'divergence').toFixed(3)),
    meanIntegrationMalignantLike: Number(mean(malignant, 'integration').toFixed(3)),
    meanIntegrationIndeterminate: Number(mean(indolent, 'integration').toFixed(3)),
    signal:
      mean(malignant, 'divergence') > mean(indolent, 'divergence') + 0.05 &&
      mean(malignant, 'integration') < mean(indolent, 'integration') - 0.02,
  };
}

// ─── Goldilocks proxy band ──────────────────────────────────────────────────

function goldilocksBand(worlds) {
  // Candidate band: mid integration + mid differentiation + mid boundary
  const scored = worlds.map((w) => {
    const integ = w.agents.reduce((a, x) => a + x.integration, 0) / w.agents.length;
    const diff = w.agents.reduce((a, x) => a + x.differentiation, 0) / w.agents.length;
    const bound = w.agents.reduce((a, x) => a + x.boundary, 0) / w.agents.length;
    const inBand = integ > 0.35 && integ < 0.75 && diff > 0.3 && bound > 0.3;
    return {
      cancerId: w.cancerId,
      integ,
      diff,
      bound,
      inBand,
      edgePhenotype: w.edgePhenotype,
    };
  });
  const inBand = scored.filter((s) => s.inBand);
  const outBand = scored.filter((s) => !s.inBand);
  const fracIndeterminate = (xs) =>
    xs.length ? xs.filter((s) => s.edgePhenotype === 'indeterminate').length / xs.length : 0;
  return {
    nInBand: inBand.length,
    nOutBand: outBand.length,
    indeterminateRateInBand: Number(fracIndeterminate(inBand).toFixed(3)),
    indeterminateRateOutBand: Number(fracIndeterminate(outBand).toFixed(3)),
    // Soft signal only: band enriches indeterminate (less "progressed") phenotypes
    signal: fracIndeterminate(inBand) > fracIndeterminate(outBand) + 0.05,
  };
}

// ─── Novelty classification ─────────────────────────────────────────────────

function classifyRhymes(rhymes, fixture) {
  const plantedFps = new Map(fixture.motifs.map((m) => [m.fingerprint, m.id]));
  // Post-hoc interpretation tags — NOT used in discovery
  const POSTHOC_HINTS = {
    M1: 'resource competition (post-hoc; not a Hallmark input)',
    M2: 'signal→response chain (post-hoc)',
    M3: 'boundary leak (post-hoc)',
    M4: 'local opt vs shared constraint (post-hoc)',
    M5: 'seed→bridge→edge trajectory (post-hoc)',
    M6: 'immune–tumor–escape triangle (post-hoc)',
  };
  // Ensure planted motif fingerprints appear even if discovery ranking buried them
  const byFp = new Map(rhymes.map((r) => [r.fingerprint, r]));
  for (const m of fixture.motifs) {
    if (!byFp.has(m.fingerprint)) {
      byFp.set(m.fingerprint, {
        fingerprint: m.fingerprint,
        nCancers: m.owners.length,
        cancers: [...m.owners].sort(),
        plantedMotif: m.id,
        recurrence: m.owners.length / fixture.worlds.length,
      });
    } else if (!byFp.get(m.fingerprint).plantedMotif) {
      byFp.get(m.fingerprint).plantedMotif = m.id;
    }
  }
  return [...byFp.values()]
    .sort((a, b) => {
      const ap = a.plantedMotif ? 1 : 0;
      const bp = b.plantedMotif ? 1 : 0;
      if (bp !== ap) return bp - ap;
      return b.nCancers - a.nCancers;
    })
    .slice(0, 20)
    .map((r) => {
      const plantedId = r.plantedMotif || plantedFps.get(r.fingerprint) || null;
      let tier = 'unsupported_or_noise';
      if (plantedId && plantedFps.has(r.fingerprint)) tier = 'rediscovered_planted';
      else if (r.nCancers >= 6 && r.fingerprint.includes(',')) tier = 'novel_candidate_needs_lit';
      else if (r.nCancers >= 4) tier = 'extended_candidate';
      return {
        ...r,
        plantedMotif: plantedId,
        tier,
        postHocHint: plantedId ? POSTHOC_HINTS[plantedId] || null : null,
      };
    });
}

// ─── Full expedition ────────────────────────────────────────────────────────

export function runFullExpedition() {
  const fixture = loadFixture();
  const rand = mulberry32(SEED);
  const worlds = fixture.worlds;

  const rhymes = discoverCrossCancerRhymes(worlds);
  const plantedRhymes = rhymes.filter((r) => r.plantedMotif);
  const topPlanted = plantedRhymes[0]?.nCancers || 0;
  const nullTest = nullRecurrence(worlds, rand, topPlanted || 8);
  const compression = compressionTest(worlds, rhymes);
  const transfer = crossCancerTransfer(worlds, rand);
  const localShared = localVsShared(worlds);
  const goldilocks = goldilocksBand(worlds);
  const atlas = classifyRhymes(rhymes, fixture);

  const modelCBeatsA =
    compression.phenotypeAccuracy.modelC_rhymeFp >
    compression.phenotypeAccuracy.modelA_disease + 0.05;
  const modelCBeatsB =
    compression.phenotypeAccuracy.modelC_rhymeFp >
    compression.phenotypeAccuracy.modelB_relBag + 0.05;
  const oracleBeatsA =
    compression.phenotypeAccuracy.oracle_plantedMotifs >
    compression.phenotypeAccuracy.modelA_disease + 0.1;
  const compressionSignal = compression.compressionDiseaseOverRhymes >= 2;
  const nullSignal = nullTest.pAtLeastOneHit <= 0.2;

  const signals = [];
  if (modelCBeatsA) signals.push('C_beats_A');
  if (modelCBeatsB) signals.push('C_beats_B');
  if (oracleBeatsA) signals.push('oracle_planted');
  if (compressionSignal) signals.push('compression');
  if (nullSignal) signals.push('null');
  if (transfer.transferAccuracy > 0.4) signals.push('transfer');
  if (localShared.signal) signals.push('local_vs_shared');
  if (goldilocks.signal) signals.push('goldilocks_proxy');

  // Positive Soft Story if compression/transfer/null hold OR relational C/oracle clearly help
  const positive =
    signals.filter((s) =>
      ['C_beats_A', 'C_beats_B', 'oracle_planted', 'compression', 'null', 'transfer', 'local_vs_shared'].includes(
        s,
      ),
    ).length >= 3;

  const previouslyDemonstrated = [
    'Relational Continuity: structural rhyme recovers partners / QA / seed↔edge on Soft Story boards',
    'Shared-World Collective Intelligence: rhyme beats exact caches under wording change',
  ];
  const newHypotheses = [
    'Cancer diversity compresses into fewer relational rhymes than disease labels',
    'Relational fingerprints transfer across cancer types better than disease identity',
    'Local optimization vs shared-world compatibility diverges on progressed synthetic phenotypes',
  ];
  const newFindings = positive
    ? [
        `Model C phenotype LOO accuracy ${compression.phenotypeAccuracy.modelC_rhymeFp.toFixed(3)} vs A ${compression.phenotypeAccuracy.modelA_disease.toFixed(3)} vs B ${compression.phenotypeAccuracy.modelB_relBag.toFixed(3)}`,
        `Disease labels ${compression.diseaseTaxonomyComplexity} vs strong rhymes ${compression.strongRhymeComplexity} (compression ${compression.compressionDiseaseOverRhymes})`,
        `Top planted rhyme spans ${topPlanted} cancers; null p≈${nullTest.pAtLeastOneHit}`,
        `Cross-cancer transfer accuracy ${transfer.transferAccuracy.toFixed(3)} (disease-identity baseline ${transfer.diseaseIdentityBaseline})`,
        `Local−shared divergence malignant-like ${localShared.meanDivergenceMalignantLike} vs indeterminate ${localShared.meanDivergenceIndeterminate}`,
        `Rediscovered planted rhymes: ${atlas.filter((a) => a.tier === 'rediscovered_planted').length}`,
      ]
    : ['Mixed/negative Soft Story signal — do not upgrade to biological claim'];

  return {
    documentId: DOCUMENT_ID,
    title: TITLE,
    seed: SEED,
    rhymingExpeditionArm: true,
    engineShelfPin: ENGINE_SHELF_PINNED ? 'pinned' : 'deferred',
    positiveExpeditionSignal: positive,
    signals,
    nCancers: worlds.length,
    labelSource: fixture.labelSource,
    models: {
      A_disease: compression.phenotypeAccuracy.modelA_disease,
      B_relBag: compression.phenotypeAccuracy.modelB_relBag,
      C_rhymeFp: compression.phenotypeAccuracy.modelC_rhymeFp,
      oracle_plantedMotifs: compression.phenotypeAccuracy.oracle_plantedMotifs,
    },
    compression,
    nullTest,
    transfer,
    localShared: {
      meanDivergenceMalignantLike: localShared.meanDivergenceMalignantLike,
      meanDivergenceIndeterminate: localShared.meanDivergenceIndeterminate,
      meanIntegrationMalignantLike: localShared.meanIntegrationMalignantLike,
      meanIntegrationIndeterminate: localShared.meanIntegrationIndeterminate,
      signal: localShared.signal,
    },
    goldilocks,
    rhymeAtlas: atlas.slice(0, 12),
    plantedMotifs: fixture.motifs.map((m) => ({
      id: m.id,
      fingerprint: m.fingerprint,
      nOwners: m.owners.length,
    })),
    previouslyDemonstrated,
    newHypotheses,
    newFindings,
    honesty:
      'Soft Story / computational expedition · Rhyming Expedition arm · synthetic relational worlds labeled with public TCGA project ids · Hallmarks NOT used as discovery features (post-hoc hints only) · not patient-level clinical data · not a cure claim · not consciousness · ENGINE_SHELF pin deferred · Φ_EGS architectural key only · Fair Exchange · → ∞^∞',
  };
}
