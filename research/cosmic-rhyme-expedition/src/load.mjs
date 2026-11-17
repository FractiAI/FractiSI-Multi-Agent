import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const FIXTURES = join(root, 'fixtures');

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
      let v = cols[j] ?? '';
      v = v.replace(/^"|"$/g, '').trim();
      obj[h] = v;
    });
    rows.push(obj);
  }
  return rows;
}

function splitLine(line, sep) {
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

/** HMS / DMS → degrees when needed. OpenNGC uses HH:MM:SS / ±DD:MM:SS. */
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

export function loadExoplanets(limit = 600) {
  const rows = parseCsv(readFileSync(join(FIXTURES, 'exoplanets_pscomppars.csv'), 'utf8'));
  const out = [];
  for (const r of rows) {
    const orbper = num(r.pl_orbper);
    const rade = num(r.pl_rade);
    const teff = num(r.st_teff);
    const ra = num(r.ra);
    const dec = num(r.dec);
    if ([orbper, rade, teff, ra, dec].some((x) => x == null)) continue;
    out.push({
      id: r.pl_name,
      layer: 'exoplanet',
      host: r.hostname || '',
      ra,
      dec,
      features: {
        log_orbper: Math.log10(Math.max(orbper, 1e-6)),
        log_rade: Math.log10(Math.max(rade, 1e-6)),
        log_bmasse: Math.log10(Math.max(num(r.pl_bmasse) || rade ** 2.06, 1e-6)),
        st_teff: teff,
        st_mass: num(r.st_mass) ?? 1,
        st_rad: num(r.st_rad) ?? 1,
        sy_dist: num(r.sy_dist) ?? 100,
        disc_year: num(r.disc_year) ?? 2000,
      },
      auditLabels: {
        discoverymethod: (r.discoverymethod || 'unknown').toLowerCase(),
        host: (r.hostname || '').toLowerCase(),
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function loadNeos(limit = 400) {
  const raw = JSON.parse(readFileSync(join(FIXTURES, 'jpl_cad_neo.json'), 'utf8'));
  const fields = raw.fields;
  const out = [];
  for (const row of raw.data || []) {
    const o = Object.fromEntries(fields.map((f, i) => [f, row[i]]));
    const dist = num(o.dist);
    const vRel = num(o.v_rel);
    const h = num(o.h);
    const jd = num(o.jd);
    if ([dist, vRel, h, jd].some((x) => x == null)) continue;
    out.push({
      id: `${o.des}@${o.cd}`,
      layer: 'neo',
      designation: o.des,
      ra: jd, // proxy axis for LINEAR ordering (time)
      dec: 0,
      features: {
        log_dist: Math.log10(Math.max(dist, 1e-9)),
        log_v_rel: Math.log10(Math.max(vRel, 1e-9)),
        h_mag: h,
        jd_norm: jd,
        dist_min: num(o.dist_min) ?? dist,
        v_inf: num(o.v_inf) ?? vRel,
      },
      auditLabels: {
        designation: String(o.des).toLowerCase(),
        year: String(o.cd || '').slice(0, 4),
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function loadOpenNgc(limit = 800) {
  const rows = parseCsv(readFileSync(join(FIXTURES, 'openngc.csv'), 'utf8'), ';');
  const out = [];
  for (const r of rows) {
    const type = (r.Type || '').trim();
    if (!type || type === '**' || type === '*') continue; // skip stars / empties
    const ra = hmsToDeg(r.RA);
    const dec = dmsToDeg(r.Dec);
    const maj = num(r.MajAx);
    const vmag = num(r['V-Mag']);
    const bmag = num(r['B-Mag']);
    const redshift = num(r.Redshift);
    const radvel = num(r.RadVel);
    if (ra == null || dec == null) continue;
    if (maj == null && vmag == null) continue;
    out.push({
      id: r.Name,
      layer: 'ngc',
      ra,
      dec,
      features: {
        maj_ax: maj ?? 0.1,
        min_ax: num(r.MinAx) ?? maj ?? 0.1,
        v_mag: vmag ?? bmag ?? 15,
        b_mag: bmag ?? vmag ?? 15,
        redshift: redshift ?? 0,
        radvel: radvel ?? 0,
        ra,
        dec,
      },
      auditLabels: {
        type: type.toLowerCase(),
        const: (r.Const || '').toLowerCase(),
        hubble: (r.Hubble || '').toLowerCase(),
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function loadWmapTt() {
  const text = readFileSync(join(FIXTURES, 'wmap_tt_spectrum_9yr.txt'), 'utf8');
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const parts = line.trim().split(/\s+/).map(Number);
    if (parts.length < 3 || parts.some((p) => !Number.isFinite(p))) continue;
    const [ell, cl, err] = parts;
    rows.push({ ell, cl, err });
  }
  return rows;
}
