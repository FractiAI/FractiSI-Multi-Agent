import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const FIXTURES = join(root, 'fixtures');

/** Cosmic fixtures live in the Cosmic Rhyme sibling suite (same repo). */
export const COSMIC_FIXTURES = join(
  root,
  '..',
  'cosmic-rhyme-expedition',
  'fixtures',
);

function parseCsv(text, sep = ',') {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  if (!lines.length) return [];
  const headers = splitLine(lines[0], sep).map((h) => h.replace(/^"|"$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitLine(lines[i], sep);
    if (cols.length < headers.length) continue;
    const obj = {};
    headers.forEach((h, j) => {
      obj[h] = (cols[j] ?? '').replace(/^"|"$/g, '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

function splitLine(line, sep = ',') {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === sep && !inQ) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function num(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hmsToDeg(ra) {
  if (ra == null || ra === '') return null;
  if (!String(ra).includes(':')) return num(ra);
  const [h, m, s] = String(ra).split(':').map(Number);
  if (![h, m, s].every(Number.isFinite)) return null;
  return (h + m / 60 + s / 3600) * 15;
}

function dmsToDeg(dec) {
  if (dec == null || dec === '') return null;
  if (!String(dec).includes(':')) return num(dec);
  const neg = String(dec).trim().startsWith('-');
  const parts = String(dec).replace('+', '').replace('-', '').split(':').map(Number);
  if (parts.some((p) => !Number.isFinite(p))) return null;
  const [d, m, s] = parts;
  const val = d + m / 60 + s / 3600;
  return neg ? -val : val;
}

export function loadExoplanets(limit = 500) {
  const rows = parseCsv(readFileSync(join(COSMIC_FIXTURES, 'exoplanets_pscomppars.csv'), 'utf8'));
  const out = [];
  for (const r of rows) {
    const orbper = num(r.pl_orbper);
    const rade = num(r.pl_rade);
    const teff = num(r.st_teff);
    const mass = num(r.st_mass);
    const rad = num(r.st_rad);
    const year = num(r.disc_year);
    const ra = num(r.ra);
    const dec = num(r.dec);
    const dist = num(r.sy_dist);
    const bmasse = num(r.pl_bmasse);
    if (![orbper, rade, teff, mass, rad, year, ra, dec].every(Number.isFinite)) continue;
    out.push({
      id: String(r.pl_name || r.hostname || out.length),
      layer: 'exoplanet',
      host: r.hostname || null,
      ra,
      features: {
        log_orbper: Math.log(orbper),
        log_rade: Math.log(rade),
        log_bmasse: Math.log((bmasse > 0 ? bmasse : 1e-6)),
        st_teff: teff,
        st_mass: mass,
        st_rad: rad,
        disc_year: year,
        sy_dist: dist ?? 0,
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function loadNeos(limit = 350) {
  const raw = JSON.parse(readFileSync(join(COSMIC_FIXTURES, 'jpl_cad_neo.json'), 'utf8'));
  const data = raw.data || raw;
  const fields = raw.fields || [];
  const idx = Object.fromEntries(fields.map((f, i) => [f, i]));
  const out = [];
  for (const row of data) {
    const des = row[idx.des] ?? row[0];
    const cd = row[idx.cd] ?? '';
    const dist = num(row[idx.dist]);
    const vRel = num(row[idx.v_rel]);
    const vInf = num(row[idx.v_inf]) ?? vRel;
    const h = num(row[idx.h]);
    if (![dist, vRel, h].every(Number.isFinite)) continue;
    out.push({
      id: `${des}@${cd}`,
      layer: 'neo',
      designation: String(des),
      ra: dist,
      order: dist,
      features: {
        log_dist: Math.log(dist + 1e-12),
        log_v_rel: Math.log(vRel + 1e-12),
        h_mag: h,
        dist_min: dist,
        v_inf: vInf,
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function loadOpenNgc(limit = 600) {
  const rows = parseCsv(readFileSync(join(COSMIC_FIXTURES, 'openngc.csv'), 'utf8'), ';');
  const out = [];
  for (const r of rows) {
    const type = (r.Type || '').trim();
    if (!type || type === '**' || type === '*') continue;
    const ra = hmsToDeg(r.RA);
    const dec = dmsToDeg(r.Dec);
    const maj = num(r.MajAx);
    const min = num(r.MinAx);
    const vmag = num(r['V-Mag']);
    const bmag = num(r['B-Mag']);
    if (ra == null || dec == null) continue;
    if (maj == null && vmag == null) continue;
    out.push({
      id: String(r.Name || out.length),
      layer: 'ngc',
      ra,
      order: ra,
      features: {
        ra,
        dec,
        maj_ax: maj ?? 0.1,
        min_ax: min ?? maj ?? 0.1,
        v_mag: vmag ?? bmag ?? 15,
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function loadWmapTt() {
  const text = readFileSync(join(COSMIC_FIXTURES, 'wmap_tt_spectrum_9yr.txt'), 'utf8');
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const parts = line.trim().split(/\s+/).map(Number);
    if (parts.length < 2 || !parts.every(Number.isFinite)) continue;
    rows.push({ ell: parts[0], cl: parts[1] });
  }
  return rows;
}

export function loadGenomeExons() {
  const panel = JSON.parse(readFileSync(join(FIXTURES, 'exons.panel.json'), 'utf8'));
  const genes = JSON.parse(readFileSync(join(FIXTURES, 'genes.panel.json'), 'utf8')).genes;
  const geneBySym = Object.fromEntries(genes.map((g) => [g.symbol, g]));
  const cpgs = JSON.parse(readFileSync(join(FIXTURES, 'cpg.panel.json'), 'utf8')).islands;
  const out = [];
  for (const e of panel.exons) {
    const g = geneBySym[e.symbol];
    const chromNum = Number(String(e.chrom).replace('chr', '').replace('X', '23').replace('Y', '24').replace('M', '0')) || 0;
    const length = Math.max(1, e.exonEnd - e.exonStart);
    const nearCpg = cpgs.filter(
      (c) => c.chrom === e.chrom && !(c.end < e.exonStart - 50000 || c.start > e.exonEnd + 50000),
    );
    const cpgProx =
      nearCpg.length === 0
        ? 1e6
        : Math.min(
            ...nearCpg.map((c) => Math.min(Math.abs(c.start - e.exonStart), Math.abs(c.end - e.exonEnd))),
          );
    out.push({
      id: `${e.symbol}:ex${e.exonIndex}@${e.chrom}:${e.exonStart}`,
      layer: 'genome_exon',
      symbol: e.symbol,
      chrom: e.chrom,
      order: chromNum * 1e9 + e.exonStart,
      ra: chromNum * 1e9 + e.exonStart,
      features: {
        chrom_num: chromNum,
        start: e.exonStart,
        end: e.exonEnd,
        log_len: Math.log(length),
        exon_index: e.exonIndex,
        strand: e.strand,
        gene_span: g ? Math.log(Math.max(1, g.end - g.start)) : 0,
        tss_dist: g ? Math.log(Math.abs(e.exonStart - g.tss) + 1) : 0,
        log_cpg_prox: Math.log(cpgProx + 1),
        near_cpg_n: nearCpg.length,
      },
    });
  }
  return out;
}

export function loadChrMWindows(window = 120, step = 60) {
  const fa = readFileSync(join(FIXTURES, 'chrM.hs1.fa'), 'utf8');
  const seq = fa
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('>'))
    .join('')
    .toUpperCase()
    .replace(/[^ACGTN]/g, '');
  const out = [];
  for (let i = 0; i + window <= seq.length; i += step) {
    const chunk = seq.slice(i, i + window);
    const counts = { A: 0, C: 0, G: 0, T: 0, N: 0 };
    for (const ch of chunk) counts[ch] = (counts[ch] || 0) + 1;
    const gc = (counts.C + counts.G) / window;
    let cpg = 0;
    for (let j = 0; j < chunk.length - 1; j += 1) if (chunk.slice(j, j + 2) === 'CG') cpg += 1;
    // dinucleotide diversity
    const di = {};
    for (let j = 0; j < chunk.length - 1; j += 1) {
      const k = chunk.slice(j, j + 2);
      di[k] = (di[k] || 0) + 1;
    }
    const entropy = Object.values(di).reduce((s, c) => {
      const p = c / (window - 1);
      return s - p * Math.log(p + 1e-12);
    }, 0);
    out.push({
      id: `chrM:${i}-${i + window}`,
      layer: 'genome_chrm',
      order: i,
      ra: i,
      features: {
        start: i,
        gc,
        cpg_density: cpg / Math.max(1, window - 1),
        a_frac: counts.A / window,
        t_frac: counts.T / window,
        entropy,
        mid: i + window / 2,
      },
    });
  }
  return out;
}
