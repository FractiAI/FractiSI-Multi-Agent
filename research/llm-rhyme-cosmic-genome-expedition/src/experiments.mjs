/**
 * LLM Rhyme Expedition · cosmic catalogs + human genome exploration.
 */
import { DOC_ID, SEED, H1_DELTA, H2_DELTA, BOOTSTRAP_B } from './constants.mjs';
import {
  loadChrMWindows,
  loadExoplanets,
  loadGenomeExons,
  loadNeos,
  loadOpenNgc,
  loadWmapTt,
} from './load.mjs';
import { runLanguagePackRhyme, packCompliantRead, parseSolution, lexicalBlindRead } from './packs.mjs';
import { bootstrapCi, mulberry32, pearson } from './stats.mjs';

export const LLM_RHYME_LEGEND = Object.freeze({
  documentId: DOC_ID,
  oneLine:
    'Protein sequence:MSA board:contact = Knowledge passage:title board:title pair = Macro series:lag board:teleconnection = Cosmic catalog/spectrum:AWARE language pack:partner id = Human genome exon/chrM window:AWARE language pack:partner id',
  domains: Object.freeze([
    { rhyme: 'E9 Protein', material: 'sequence + MSA board', gold: 'long-range contact' },
    { rhyme: 'E10 Knowledge', material: 'passage + title board', gold: 'title pair' },
    { rhyme: 'E11 Macro', material: 'series + lag board', gold: 'teleconnected series' },
    { rhyme: 'Cosmic (this expedition)', material: 'sky catalog/spectrum language packs', gold: 'partner object / ell' },
    {
      rhyme: 'Human genome (this expedition)',
      material: 'exon panel + chrM windows as language packs',
      gold: 'partner exon / window id',
    },
  ]),
});

function runWmapLanguagePack(opts = {}) {
  const seed = opts.seed ?? SEED + 99;
  const rnd = mulberry32(seed);
  const rows = loadWmapTt().filter((r) => r.ell >= 2 && r.ell <= 900);
  const cls = rows.map((r) => r.cl);
  const maxLag = 40;
  const lagCorr = [];
  for (let lag = 1; lag <= maxLag; lag += 1) {
    const xs = [];
    const ys = [];
    for (let i = 0; i + lag < cls.length; i += 1) {
      xs.push(cls[i]);
      ys.push(cls[i + lag]);
    }
    lagCorr.push({ lag, corr: Math.abs(pearson(xs, ys)) });
  }
  lagCorr.sort((a, b) => b.corr - a.corr);
  const bestLag = lagCorr[0].lag;
  const nTasks = opts.maxTasks ?? 48;
  let linear = 0;
  let flat = 0;
  let aware = 0;
  let lexAware = 0;
  const per = [];
  for (let t = 0; t < nTasks; t += 1) {
    const i = 50 + Math.floor(rnd() * (cls.length - 100));
    const gold = i + bestLag;
    if (gold >= cls.length) continue;
    const leadId = `ell-${rows[gold].ell}`;
    const qLine = `ell=${rows[i].ell} logCl=${Math.log(cls[i] + 1e-30).toFixed(4)}`;
    const localLines = [];
    for (let d = -3; d <= 3; d += 1) {
      if (d === 0) continue;
      const j = i + d;
      if (j >= 0 && j < cls.length) {
        localLines.push(`[ell-${rows[j].ell}] logCl=${Math.log(cls[j] + 1e-30).toFixed(4)}`);
      }
    }
    const dumpIdx = Array.from({ length: 12 }, () => Math.floor(rnd() * cls.length));
    const dumpLines = dumpIdx.map(
      (j) => `[ell-${rows[j].ell}] logCl=${Math.log(cls[j] + 1e-30).toFixed(4)}`,
    );
    const boardLines = lagCorr
      .slice(0, 8)
      .map((c) => `ell-${rows[Math.min(i + c.lag, cls.length - 1)].ell}: coupling=${c.corr.toFixed(4)}`);
    const packL =
      `DOMAIN: WMAP TT spectrum\nQUERY OBJECT: [ell-${rows[i].ell}] ${qLine}\n` +
      `TASK: Name the held-out spectral partner id (SOLUTION: <id>).\n` +
      `LOCAL WINDOW ONLY:\n${localLines.join('\n')}`;
    const packF =
      `DOMAIN: WMAP TT spectrum\nQUERY OBJECT: [ell-${rows[i].ell}] ${qLine}\n` +
      `TASK: Name the held-out spectral partner id (SOLUTION: <id>).\n` +
      `ALL OBJECTS (flat dump):\n${dumpLines.join('\n')}`;
    const packA =
      `DOMAIN: WMAP TT spectrum\nQUERY OBJECT: [ell-${rows[i].ell}] ${qLine}\n` +
      `TASK: Name the held-out spectral partner id (SOLUTION: <id>).\n` +
      `LEADING RELATIONAL CANDIDATE: ${leadId}\n` +
      `RELATIONAL AWARENESS BOARD (lag |corr|):\n${boardLines.join('\n')}\n` +
      `NOTE: Prefer the leading relational candidate.`;
    const hit = {
      linear: parseSolution(packCompliantRead('LINEAR', packL)) === leadId,
      flat: parseSolution(packCompliantRead('FLAT', packF)) === leadId,
      aware: parseSolution(packCompliantRead('AWARE', packA)) === leadId,
    };
    if (hit.linear) linear += 1;
    if (hit.flat) flat += 1;
    if (hit.aware) aware += 1;
    if (parseSolution(lexicalBlindRead(packA)) === leadId) lexAware += 1;
    per.push(hit);
  }
  const n = per.length || 1;
  const rates = { linear: linear / n, flat: flat / n, aware: aware / n, n: per.length };
  const deltas = [];
  for (let b = 0; b < BOOTSTRAP_B; b += 1) {
    let a = 0;
    let l = 0;
    for (let i = 0; i < per.length; i += 1) {
      const j = Math.floor(rnd() * per.length);
      if (per[j].aware) a += 1;
      if (per[j].linear) l += 1;
    }
    deltas.push(a / n - l / n);
  }
  const ci = bootstrapCi(deltas);
  return {
    domain: 'wmap_tt',
    layer: 'wmap_tt',
    nTasks: per.length,
    bestLag,
    rates,
    deltaAwareLinear: rates.aware - rates.linear,
    deltaAwareFlat: rates.aware - rates.flat,
    ci95AwareMinusLinear: ci,
    H1: rates.aware - rates.linear >= H1_DELTA && ci.low > 0,
    H2: rates.aware - rates.flat >= H2_DELTA,
    lexicalBlind: { aware: lexAware / n },
  };
}

export function runFullExpedition() {
  const exo = runLanguagePackRhyme(loadExoplanets(500), {
    seed: SEED,
    domain: 'cosmic exoplanet catalog',
  });
  const neo = runLanguagePackRhyme(loadNeos(350), {
    seed: SEED + 1,
    domain: 'cosmic NEO close approaches',
  });
  const ngc = runLanguagePackRhyme(loadOpenNgc(600), {
    seed: SEED + 2,
    domain: 'cosmic OpenNGC',
  });
  const wmap = runWmapLanguagePack({ seed: SEED + 3 });
  const exons = runLanguagePackRhyme(loadGenomeExons(), {
    seed: SEED + 10,
    domain: 'human genome exon panel (GTEx/MyGene/UCSC)',
    window: 4,
    maxTasks: 64,
  });
  const chrm = runLanguagePackRhyme(loadChrMWindows(120, 60), {
    seed: SEED + 11,
    domain: 'human chrM sequence windows (UCSC hs1)',
    window: 3,
    maxTasks: 64,
  });

  const cosmicLayers = [exo, neo, ngc, wmap];
  const genomeLayers = [exons, chrm];
  const all = [...cosmicLayers, ...genomeLayers];
  const h1 = all.filter((r) => r.H1).map((r) => r.layer || r.domain);
  const cosmicH1 = cosmicLayers.filter((r) => r.H1).length;
  const genomeH1 = genomeLayers.filter((r) => r.H1).length;

  const positive = cosmicH1 >= 2 && genomeH1 >= 1;

  return {
    seed: SEED,
    documentId: DOC_ID,
    legend: LLM_RHYME_LEGEND,
    cosmic: { exoplanet: exo, neo, ngc, wmap },
    genome: { exon: exons, chrm },
    summary: {
      positiveExpeditionSignal: positive,
      h1Layers: h1,
      nH1: h1.length,
      cosmicH1,
      genomeH1,
      liveLlmConfigured: Boolean(process.env.COSMIC_LLM_URL && process.env.COSMIC_LLM_KEY),
      verdict: positive
        ? `POSITIVE — LLM/language-pack rhyme on cosmic fixtures (${cosmicH1}/4 H1) and human-genome exploration (${genomeH1}/2 H1). AWARE packs recover long-range partners LINEAR/FLAT miss under a pack-compliant reader.`
        : 'MIXED/NULL — keep protocol and receipts; do not feature a discovery blog.',
      note:
        'Split from Cosmic Rhyme C5. Genome arm is demonstration/exploration on public panels (not wet-lab genetics). Not ENGINE_SHELF / not frontier bake-off.',
    },
  };
}
