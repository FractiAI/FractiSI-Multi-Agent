#!/usr/bin/env node
// Reduces public raw downloads to small committed fixtures. See README for the download commands.
import { createReadStream, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawn, execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, '../fixtures');
mkdirSync(FIX, { recursive: true });
const raw = (process.argv.find((a) => a.startsWith('--raw=')) || '--raw=/tmp/expdata').slice(6);

function mfr(model) {
  if (/^ST/.test(model)) return 'Seagate';
  if (/^HGST/.test(model)) return 'HGST';
  if (/^WDC|^WD/.test(model)) return 'WDC';
  if (/^TOSHIBA/.test(model)) return 'Toshiba';
  if (/^HITACHI/.test(model)) return 'Hitachi';
  return 'Other';
}

async function backblaze() {
  const files = [];
  for (const q of ['data_Q1_2019.zip', 'data_Q2_2019.zip']) {
    const list = execSync(`unzip -Z1 ${join(raw, q)}`, { maxBuffer: 1 << 26 }).toString().split('\n');
    for (const f of list) if (/^\d{4}-\d{2}-\d{2}\.csv$/.test(f)) files.push({ zip: join(raw, q), name: f, date: f.slice(0, 10) });
  }
  files.sort((a, b) => a.date.localeCompare(b.date));
  const dates = files.map((f) => f.date);
  const exposure = new Map();
  const failures = [];
  for (const f of files) {
    const p = spawn('unzip', ['-p', f.zip, f.name]);
    const rl = createInterface({ input: p.stdout });
    let first = true;
    for await (const line of rl) {
      if (first) { first = false; continue; }
      const c = line.split(',', 5);
      const model = c[2];
      if (!model) continue;
      let row = exposure.get(model);
      if (!row) { row = new Array(files.length).fill(0); exposure.set(model, row); }
      row[dates.indexOf(f.date)] += 1;
      if (c[4] === '1') failures.push([f.date, model]);
    }
  }
  const models = {};
  for (const [model, row] of exposure) {
    models[model] = { mfr: mfr(model), driveDays: row.reduce((a, b) => a + b, 0), exposure: row };
  }
  writeFileSync(join(FIX, 'backblaze_2019h1.json'), JSON.stringify({
    source: 'Backblaze Hard Drive Stats, 2019 Q1 and Q2 daily snapshots (public)',
    url: 'https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data',
    dates,
    models,
    failures,
  }));
  console.log('backblaze', dates.length, 'days', Object.keys(models).length, 'models', failures.length, 'failures');
}

function yeast() {
  const feat = readFileSync(join(raw, 'sgd_features.tab'), 'utf8').split('\n');
  const orfs = new Map();
  for (const l of feat) {
    const c = l.split('\t');
    if (c[1] !== 'ORF' || !['Verified', 'Uncharacterized'].includes(c[2])) continue;
    const len = Math.abs(Number(c[10]) - Number(c[9])) + 1;
    if (c[3] && len > 0) orfs.set(c[3], { id: c[3], status: c[2], len });
  }
  const inv = new Set();
  const via = new Set();
  for (const l of readFileSync(join(raw, 'yeast_phenotype.tab'), 'utf8').split('\n')) {
    const c = l.split('\t');
    if (c[6] !== 'null') continue;
    if (c[9] === 'inviable') inv.add(c[0]);
    if (c[9] === 'viable') via.add(c[0]);
  }
  const par = new Map();
  for (const l of readFileSync(join(raw, 'sc_paralogs.tsv'), 'utf8').split('\n').slice(1)) {
    const c = l.split('\t');
    if (!c[0] || !c[2]) continue;
    const id = Number(c[3]);
    const cur = par.get(c[0]) || { n: 0, maxId: 0 };
    cur.n += 1;
    if (!Number.isNaN(id)) cur.maxId = Math.max(cur.maxId, id);
    par.set(c[0], cur);
  }
  const genes = [];
  for (const o of orfs.values()) {
    const p = par.get(o.id) || { n: 0, maxId: 0 };
    genes.push([o.id, o.len, inv.has(o.id) ? 1 : 0, inv.has(o.id) && via.has(o.id) ? 1 : 0, p.n, Math.round(p.maxId * 10) / 10]);
  }
  writeFileSync(join(FIX, 'yeast_paralog_essential.json'), JSON.stringify({
    source: 'SGD phenotype_data.tab (null mutants) and SGD_features.tab; Ensembl BioMart paralogues for S. cerevisiae',
    columns: ['orf', 'lengthNt', 'inviableNull', 'ambiguousInviableAndViable', 'nParalogs', 'maxParalogPercentId'],
    genes,
  }));
  console.log('yeast genes', genes.length, 'inviable', genes.filter((g) => g[2]).length);
}

function human() {
  const lines = execSync(`zcat ${join(raw, 'gnomad_lof.txt.bgz')}`, { maxBuffer: 1 << 28 }).toString().split('\n');
  const h = lines[0].split('\t');
  const ix = (n) => h.indexOf(n);
  const par = new Map();
  for (const l of readFileSync(join(raw, 'hs_paralogs.tsv'), 'utf8').split('\n').slice(1)) {
    const c = l.split('\t');
    if (!c[1] || !c[2]) continue;
    const id = Number(c[3]);
    const cur = par.get(c[1]) || { n: 0, maxId: 0 };
    cur.n += 1;
    if (!Number.isNaN(id)) cur.maxId = Math.max(cur.maxId, id);
    par.set(c[1], cur);
  }
  const genes = [];
  for (const l of lines.slice(1)) {
    const c = l.split('\t');
    const loeuf = Number(c[ix('oe_lof_upper')]);
    const exp = Number(c[ix('exp_lof')]);
    const size = Number(c[ix('possible_syn')]);
    if (!c[0] || Number.isNaN(loeuf) || !(exp >= 10) || !(size > 0)) continue;
    const p = par.get(c[0]) || { n: 0, maxId: 0 };
    genes.push([c[0], size, Math.round(loeuf * 1000) / 1000, p.n, Math.round(p.maxId * 10) / 10]);
  }
  writeFileSync(join(FIX, 'human_paralog_constraint.json'), JSON.stringify({
    source: 'gnomAD v2.1.1 constraint by gene (LOEUF = oe_lof_upper; genes with expected LoF >= 10); Ensembl BioMart human paralogues',
    columns: ['gene', 'possibleSynSites', 'loeuf', 'nParalogs', 'maxParalogPercentId'],
    genes,
  }));
  console.log('human genes', genes.length);
}

yeast();
human();
await backblaze();
