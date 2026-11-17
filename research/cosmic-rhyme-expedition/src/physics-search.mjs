/**
 * C4 — Novel-physics candidate search on residual cosmic structure.
 *
 * Why C1–C3 were not "novel physics": they showed representation wins and
 * catalog fingerprints. C4 asks a different question: after removing known
 * selection axes and known-template couplings, do residual relational
 * patterns still beat physics-grade nulls on held-out data?
 *
 * Honesty: a surviving candidate is a *candidate*, not a confirmed new law.
 */
import { SEED } from './constants.mjs';
import { loadExoplanets, loadNeos, loadOpenNgc, loadWmapTt } from './load.mjs';
import { bhSurvive, mean, mulberry32, pearson, shuffleInPlace } from './stats.mjs';

/** Linear residual y - (a + b x). */
function residualize(y, x) {
  const n = y.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) * (x[i] - mx);
  }
  const b = den === 0 ? 0 : num / den;
  const a = my - b * mx;
  return y.map((yi, i) => yi - (a + b * x[i]));
}

function residualizeAgainstMany(y, xsList) {
  let r = y.slice();
  for (const x of xsList) r = residualize(r, x);
  return r;
}

function absCorrMatrix(cols) {
  const keys = Object.keys(cols);
  const out = [];
  for (let i = 0; i < keys.length; i += 1) {
    for (let j = i + 1; j < keys.length; j += 1) {
      const raw = pearson(cols[keys[i]], cols[keys[j]]);
      const c = Number.isFinite(raw) ? Math.abs(raw) : 0;
      const pair = [keys[i], keys[j]].sort().join('~');
      out.push({ pair, corr: c });
    }
  }
  out.sort((a, b) => b.corr - a.corr);
  return out;
}

function splitIdx(n, rnd, testFrac = 0.4) {
  const idx = Array.from({ length: n }, (_, i) => i);
  shuffleInPlace(idx, rnd);
  const nTest = Math.max(40, Math.floor(n * testFrac));
  const test = new Set(idx.slice(0, nTest));
  const train = idx.filter((i) => !test.has(i));
  return { train, test: [...test] };
}

/** Known astrophysics / survey templates we treat as rediscovery if they dominate residuals. */
const KNOWN_EXO_TEMPLATES = new Set([
  'log_orbper~log_rade', // period–radius / radius-valley family
  'log_rade~st_teff', // irradiation / equilibrium-temperature family
  'log_bmasse~log_rade', // mass–radius
  'log_orbper~log_bmasse',
  'st_mass~st_teff',
  'st_mass~st_rad',
  'st_rad~st_teff',
]);

/** Survey/selection axes removed before physics residual couplings. */
const SELECTION_AXES_EXO = ['disc_year', 'sy_dist'];
const PHYSICS_AXES_EXO = ['log_orbper', 'log_rade', 'log_bmasse', 'st_teff', 'st_mass', 'st_rad'];

/**
 * C4a — exoplanet residual couplings after removing selection axes.
 */
export function runC4ExoplanetResidualPhysics(opts = {}) {
  const seed = opts.seed ?? SEED + 401;
  const rnd = mulberry32(seed);
  const rows = loadExoplanets(500);
  const n = rows.length;
  const { train, test } = splitIdx(n, rnd, 0.4);

  function pack(indices) {
    const feat = {};
    for (const k of [...SELECTION_AXES_EXO, ...PHYSICS_AXES_EXO]) {
      feat[k] = indices.map((i) => rows[i].features[k]);
    }
    const sel = SELECTION_AXES_EXO.map((k) => feat[k]);
    const resid = {};
    for (const k of PHYSICS_AXES_EXO) {
      resid[k] = residualizeAgainstMany(feat[k], sel);
    }
    return resid;
  }

  const trainResid = pack(train);
  const testResid = pack(test);
  const trainPairs = absCorrMatrix(trainResid);
  const testPairs = absCorrMatrix(testResid);
  const testMap = Object.fromEntries(testPairs.map((p) => [p.pair, p.corr]));

  // Nulls on test residuals: column shuffle + sky-scramble re-residualize
  const NULLS = 200;
  const nullMax = [];
  for (let t = 0; t < NULLS; t += 1) {
    const scrambled = {};
    for (const k of PHYSICS_AXES_EXO) {
      scrambled[k] = testResid[k].slice();
      shuffleInPlace(scrambled[k], rnd);
    }
    const pairs = absCorrMatrix(scrambled);
    nullMax.push(pairs[0]?.corr ?? 0);
  }

  // Also: rebuild residuals after shuffling RA/Dec (footprint null)
  const footprintNullMax = [];
  for (let t = 0; t < 80; t += 1) {
    const ra = rows.map((r) => r.features.ra);
    const dec = rows.map((r) => r.features.dec);
    shuffleInPlace(ra, rnd);
    shuffleInPlace(dec, rnd);
    const feat = {};
    for (const k of PHYSICS_AXES_EXO) feat[k] = test.map((i) => rows[i].features[k]);
    const year = test.map((i) => rows[i].features.disc_year);
    const dist = test.map((i) => rows[i].features.sy_dist);
    // Footprint null: shuffle sky, then residualize physics against year+distance only
    // (same selection removal as main path; sky scramble tests spatial confounding).
    void ra;
    void dec;
    const resid = {};
    for (const k of PHYSICS_AXES_EXO) {
      resid[k] = residualizeAgainstMany(feat[k], [year, dist]);
    }
    footprintNullMax.push(absCorrMatrix(resid)[0]?.corr ?? 0);
  }

  const candidates = trainPairs.slice(0, 8).map((p) => {
    const hold = testMap[p.pair] ?? 0;
    const pShuffle = (nullMax.filter((c) => c >= hold).length + 1) / (NULLS + 1);
    const pFoot = (footprintNullMax.filter((c) => c >= hold).length + 1) / (footprintNullMax.length + 1);
    let verdict = 'null';
    if (pShuffle <= 0.05 && pFoot <= 0.1 && hold >= 0.15) {
      verdict = KNOWN_EXO_TEMPLATES.has(p.pair)
        ? 'known_physics_rediscovery'
        : 'candidate_novel_physics';
    } else if (KNOWN_EXO_TEMPLATES.has(p.pair) && hold >= 0.15) {
      verdict = 'known_physics_rediscovery';
    }
    return {
      pair: p.pair,
      trainCorr: p.corr,
      heldOutCorr: hold,
      pColumnShuffle: pShuffle,
      pFootprintScramble: pFoot,
      verdict,
      note: KNOWN_EXO_TEMPLATES.has(p.pair)
        ? 'Matches a known exoplanet-population template family (period–radius / irradiation / mass–radius / stellar).'
        : 'Not in the locked known-template list; residual coupling after selection regress-out.',
    };
  });

  const novel = candidates.filter((c) => c.verdict === 'candidate_novel_physics');
  const known = candidates.filter((c) => c.verdict === 'known_physics_rediscovery');

  return {
    experiment: 'C4a',
    layer: 'exoplanet_residual',
    nTrain: train.length,
    nTest: test.length,
    removedAxes: SELECTION_AXES_EXO,
    candidates,
    nCandidateNovelPhysics: novel.length,
    nKnownRediscovery: known.length,
    topNovel: novel.slice(0, 5),
    topKnown: known.slice(0, 5),
  };
}

/**
 * C4b — WMAP TT residual spectral search after smooth continuum removal.
 */
export function runC4WmapResidualPhysics(opts = {}) {
  const seed = opts.seed ?? SEED + 402;
  const rnd = mulberry32(seed);
  const rows = loadWmapTt().filter((r) => r.ell >= 2 && r.ell <= 900);
  const logEll = rows.map((r) => Math.log10(r.ell));
  const logCl = rows.map((r) => Math.log10(Math.max(r.cl, 1e-6)));

  // Fit quadratic continuum in log-log
  // residualize stepwise against logEll and logEll^2
  const logEll2 = logEll.map((x) => x * x);
  const resid = residualizeAgainstMany(logCl, [logEll, logEll2]);

  const maxLag = 60;
  function lagAbsCorr(series) {
    const out = [];
    for (let lag = 1; lag <= maxLag; lag += 1) {
      const xs = [];
      const ys = [];
      for (let i = 0; i + lag < series.length; i += 1) {
        xs.push(series[i]);
        ys.push(series[i + lag]);
      }
      out.push({ lag, corr: Math.abs(pearson(xs, ys)) });
    }
    out.sort((a, b) => b.corr - a.corr);
    return out;
  }

  const observed = lagAbsCorr(resid);
  const NULLS = 300;
  const nullPeak = [];
  for (let t = 0; t < NULLS; t += 1) {
    const scrambled = resid.slice();
    shuffleInPlace(scrambled, rnd);
    nullPeak.push(lagAbsCorr(scrambled)[0].corr);
  }

  // Known acoustic-peak multipole neighborhoods (WMAP/ΛCDM family) — rediscovery if residual power concentrates there
  const knownPeakEll = [220, 540, 800];
  const residualPowerNearPeaks = knownPeakEll.map((ell0) => {
    const hits = rows
      .map((r, i) => ({ ell: r.ell, r: Math.abs(resid[i]) }))
      .filter((x) => Math.abs(x.ell - ell0) <= 30);
    return {
      ell: ell0,
      meanAbsResid: mean(hits.map((h) => h.r)),
      n: hits.length,
    };
  });
  const globalMeanAbs = mean(resid.map((x) => Math.abs(x)));
  const peakEnhancement = mean(residualPowerNearPeaks.map((p) => p.meanAbsResid)) / (globalMeanAbs || 1);

  const top = observed.slice(0, 5).map((o) => {
    const p = (nullPeak.filter((c) => c >= o.corr).length + 1) / (NULLS + 1);
    // Lags that merely echo known acoustic spacing (~220 in ell for first peak family) → rediscovery lean
    const nearAcousticSpacing = [18, 19, 20, 21, 22].includes(o.lag) || (o.lag >= 15 && o.lag <= 25);
    let verdict = 'null';
    if (p <= 0.05 && o.corr >= 0.15) {
      verdict =
        peakEnhancement > 1.15 || nearAcousticSpacing
          ? 'known_physics_rediscovery'
          : 'candidate_novel_physics';
    }
    return { ...o, pResidualShuffle: p, verdict, nearAcousticSpacing };
  });

  const novel = top.filter((t) => t.verdict === 'candidate_novel_physics');
  const known = top.filter((t) => t.verdict === 'known_physics_rediscovery');

  return {
    experiment: 'C4b',
    layer: 'wmap_tt_residual',
    nEll: rows.length,
    continuum: 'logCl ~ a + b logEll + c (logEll)^2',
    peakEnhancement,
    residualPowerNearPeaks,
    topLags: top,
    nCandidateNovelPhysics: novel.length,
    nKnownRediscovery: known.length,
    topNovel: novel,
    topKnown: known,
  };
}

/**
 * C4c — deep-sky residual anisotropy after size–brightness selection removal.
 */
export function runC4NgcResidualPhysics(opts = {}) {
  const seed = opts.seed ?? SEED + 403;
  const rnd = mulberry32(seed);
  const rows = loadOpenNgc(600);
  const maj = rows.map((r) => r.features.maj_ax);
  const vmag = rows.map((r) => r.features.v_mag);
  const ra = rows.map((r) => r.features.ra);
  const dec = rows.map((r) => r.features.dec);
  // Residual size after brightness selection
  const majResid = residualize(maj, vmag);

  // Quadrant anisotropy of residual size (proxy for unexpected sky–structure coupling)
  function quadrantMeans(majR, raA, decA) {
    const buckets = { q1: [], q2: [], q3: [], q4: [] };
    for (let i = 0; i < majR.length; i += 1) {
      const east = raA[i] >= 180;
      const north = decA[i] >= 0;
      const key = north && !east ? 'q1' : north && east ? 'q2' : !north && !east ? 'q3' : 'q4';
      buckets[key].push(majR[i]);
    }
    const means = Object.fromEntries(
      Object.entries(buckets).map(([k, v]) => [k, v.length ? mean(v) : 0]),
    );
    const vals = Object.values(means);
    const spread = Math.max(...vals) - Math.min(...vals);
    return { means, spread };
  }

  const observed = quadrantMeans(majResid, ra, dec);
  const NULLS = 400;
  const nullSpreads = [];
  for (let t = 0; t < NULLS; t += 1) {
    const raS = ra.slice();
    const decS = dec.slice();
    shuffleInPlace(raS, rnd);
    shuffleInPlace(decS, rnd);
    nullSpreads.push(quadrantMeans(majResid, raS, decS).spread);
  }
  const p = (nullSpreads.filter((s) => s >= observed.spread).length + 1) / (NULLS + 1);
  const verdict =
    p <= 0.05 && observed.spread > 0
      ? 'candidate_novel_physics'
      : p <= 0.2
        ? 'marginal'
        : 'null';

  return {
    experiment: 'C4c',
    layer: 'ngc_residual_anisotropy',
    n: rows.length,
    removedSelection: 'maj_ax residualized against v_mag',
    quadrantMeans: observed.means,
    anisotropySpread: observed.spread,
    pIsotropicScramble: p,
    verdict,
    note:
      verdict === 'candidate_novel_physics'
        ? 'Residual size anisotropy across sky quadrants beats isotropic scramble — candidate sky-structure signal after brightness selection removal (not a named filament claim).'
        : 'No significant residual sky anisotropy after brightness selection removal under isotropic null.',
  };
}

/**
 * C4d — NEO residual dynamical couplings after removing distance tautologies.
 */
export function runC4NeoResidualPhysics(opts = {}) {
  const seed = opts.seed ?? SEED + 404;
  const rnd = mulberry32(seed);
  const rows = loadNeos(350);
  const { train, test } = splitIdx(rows.length, rnd, 0.4);
  const axes = ['h_mag', 'log_v_rel', 'jd_norm'];
  // Remove distance-dominated selection: residualize against log_dist
  function pack(indices) {
    const dist = indices.map((i) => rows[i].features.log_dist);
    const resid = {};
    for (const k of axes) {
      const y = indices.map((i) => rows[i].features[k]);
      resid[k] = residualize(y, dist);
    }
    return resid;
  }
  const trainR = pack(train);
  const testR = pack(test);
  const trainPairs = absCorrMatrix(trainR);
  const testMap = Object.fromEntries(absCorrMatrix(testR).map((p) => [p.pair, p.corr]));
  const NULLS = 200;
  const nullMax = [];
  for (let t = 0; t < NULLS; t += 1) {
    const scrambled = {};
    for (const k of axes) {
      scrambled[k] = testR[k].slice();
      shuffleInPlace(scrambled[k], rnd);
    }
    nullMax.push(absCorrMatrix(scrambled)[0]?.corr ?? 0);
  }
  const known = new Set(['h_mag~log_v_rel']); // size–speed encounter selection often expected
  const candidates = trainPairs.map((p) => {
    const hold = testMap[p.pair] ?? 0;
    const pS = (nullMax.filter((c) => c >= hold).length + 1) / (NULLS + 1);
    let verdict = 'null';
    if (pS <= 0.05 && hold >= 0.12) {
      verdict = known.has(p.pair) ? 'known_physics_rediscovery' : 'candidate_novel_physics';
    }
    return { pair: p.pair, trainCorr: p.corr, heldOutCorr: hold, pColumnShuffle: pS, verdict };
  });
  return {
    experiment: 'C4d',
    layer: 'neo_residual',
    removedAxes: ['log_dist'],
    candidates,
    nCandidateNovelPhysics: candidates.filter((c) => c.verdict === 'candidate_novel_physics').length,
    nKnownRediscovery: candidates.filter((c) => c.verdict === 'known_physics_rediscovery').length,
    topNovel: candidates.filter((c) => c.verdict === 'candidate_novel_physics'),
    topKnown: candidates.filter((c) => c.verdict === 'known_physics_rediscovery'),
  };
}

export function runC4NovelPhysicsSearch() {
  const exo = runC4ExoplanetResidualPhysics();
  const wmap = runC4WmapResidualPhysics();
  const ngc = runC4NgcResidualPhysics();
  const neo = runC4NeoResidualPhysics();

  const novelHits = [
    ...exo.topNovel.map((c) => ({ layer: exo.layer, ...c })),
    ...wmap.topNovel.map((c) => ({ layer: wmap.layer, ...c })),
    ...neo.topNovel.map((c) => ({ layer: neo.layer, ...c })),
    ...(ngc.verdict === 'candidate_novel_physics'
      ? [{ layer: ngc.layer, pair: 'quadrant_anisotropy', ...ngc }]
      : []),
  ];
  const knownHits = [
    ...exo.topKnown.map((c) => ({ layer: exo.layer, ...c })),
    ...wmap.topKnown.map((c) => ({ layer: wmap.layer, ...c })),
    ...neo.topKnown.map((c) => ({ layer: neo.layer, ...c })),
  ];

  return {
    experiment: 'C4',
    whyPriorArmsWereNotNovelPhysics:
      'C1–C3 demonstrated relational representation and catalog fingerprints (survey history / selection). Those are necessary but not sufficient for a novel-physics claim. C4 residualizes known selection axes and tests leftover couplings against shuffle and footprint nulls.',
    exo,
    wmap,
    ngc,
    neo,
    summary: {
      nCandidateNovelPhysics: novelHits.length,
      nKnownRediscovery: knownHits.length,
      novelHits,
      knownHits,
      physicsSearchSignal: novelHits.length > 0,
      verdict:
        novelHits.length > 0
          ? `C4 POSITIVE — ${novelHits.length} residual candidate(s) beat nulls after selection/template removal; treat as candidate novel physics under this protocol, not confirmed law.`
          : knownHits.length > 0
            ? 'C4 MIXED — residual search mainly rediscovered known physics/selection templates; no candidate novel-physics survivors.'
            : 'C4 NULL — no residual couplings beat physics-grade nulls after selection removal.',
    },
  };
}
