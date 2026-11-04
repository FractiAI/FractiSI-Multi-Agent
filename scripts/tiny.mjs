#!/usr/bin/env node
/**
 * Tiny Footprint Workstation CLI
 * Usage:
 *   node scripts/tiny.mjs <doctor|install|demo|benchmark|report|integrate|join|share>
 *
 * Share (opt-in) emails results to valetpru@gmail.com (mailto, or SMTP if configured).
 * Join sends contact details; benchmark receipts are read only when the participant selects share.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { shareJoinInterest, shareResults } from './share-results.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'tiny-footprint', 'configuration', 'default.json');
const REPORTS = path.join(ROOT, 'benchmarks', 'reports');
const SHARE_TO = process.env.TINY_FOOTPRINT_SHARE_EMAIL || 'valetpru@gmail.com';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

const CONFIG = readJson(CONFIG_PATH);
const CONFIG_OK = fs.existsSync(CONFIG_PATH) && Object.keys(CONFIG).length > 0;
const PKG = readJson(path.join(ROOT, 'package.json'));
const PRODUCT = CONFIG.product || 'Tiny Footprint';
const VERSION = PKG.version || '0.1.0';
const EDITION = CONFIG.edition || 'community';
const HEADLINE = CONFIG.headline || 'Less Memory. Lower Latency. More AI Performance.';
const suiteRelative = CONFIG?.benchmark?.suiteRelative;
const SUITE =
  typeof suiteRelative === 'string' && suiteRelative.length > 0
    ? path.resolve(path.dirname(CONFIG_PATH), suiteRelative)
    : path.join(ROOT, 'research', 'synthobs-tiny-gateway-rhyming-templates');
const FORCE_LLM_LAB =
  process.env.TINY_FOOTPRINT_FORCE_LLM_LAB || (CONFIG?.benchmark?.forceLlmLab === true ? '1' : '0');

function log(msg) {
  console.log(`[tiny] ${msg}`);
}

function flag(name) {
  return process.argv.includes(name);
}

function runNode(script, args = [], opts = {}) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    stdio: 'inherit',
    env: { ...process.env, ...opts.env },
  });
  return r.status ?? 1;
}

async function ask(rl, q, def = '') {
  const a = (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim();
  return a || def;
}

function doctor() {
  log(`${PRODUCT} Workstation ${VERSION} (${EDITION}) · doctor`);
  log(`workstation: ${ROOT}`);
  log(`config: ${CONFIG_OK ? 'OK' : 'defaults'}`);
  log(`suite: ${SUITE} ${fs.existsSync(SUITE) ? 'OK' : 'MISSING'}`);
  log(`docs: ${fs.existsSync(path.join(ROOT, 'docs')) ? 'OK' : 'optional'}`);
  log(`node: ${process.version}`);
  const py = process.env.TINY_FOOTPRINT_PYTHON || 'py';
  const pr = spawnSync(py, ['-3', '--version'], { encoding: 'utf8', timeout: 5000 });
  log(`python: ${pr.status === 0 ? (pr.stdout || pr.stderr || '').trim() : 'not found (optional for GPU labs)'}`);
  const smi = spawnSync('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader'], {
    encoding: 'utf8',
    timeout: 5000,
  });
  if (smi.status === 0) log(`gpu: ${(smi.stdout || '').trim()}`);
  else log('gpu: nvidia-smi not available (CPU demo still works)');
  log(`share recipient: ${SHARE_TO}`);
  log('doctor complete');
  return 0;
}

function install() {
  log('install · verifying kit');
  if (!fs.existsSync(SUITE)) {
    log(`ERROR: research suite missing at ${SUITE}`);
    return 1;
  }
  fs.mkdirSync(REPORTS, { recursive: true });
  const pkg = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkg)) log('package.json OK — Community Edition needs no license key');
  log('Next: node scripts/tiny.mjs demo');
  log('Join industry testing: node scripts/tiny.mjs join');
  return 0;
}

function demo() {
  log('demo · multi-session Tiny Footprint workload');
  return runNode(path.join(ROOT, 'workloads', 'multi-session', 'run.mjs'));
}

function benchmark() {
  log('benchmark · conventional vs Tiny');
  fs.mkdirSync(REPORTS, { recursive: true });
  const pipeline = path.join(SUITE, 'scripts', 'run_empirical_pipeline.mjs');
  if (!fs.existsSync(pipeline)) {
    log('ERROR: suite pipeline missing');
    return 1;
  }
  const status = runNode(pipeline, [], {
    cwd: SUITE,
    env: { TINY_FOOTPRINT_FORCE_LLM_LAB: FORCE_LLM_LAB },
  });
  for (const name of [
    'empirical_report.json',
    'empirical_report.md',
    'gpu_live_chat_hbm_lab.json',
    'gpu_llm_real_lab.json',
  ]) {
    const src = path.join(SUITE, 'data', name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(REPORTS, name));
      log(`copied ${name}`);
    }
  }
  return status;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[ch]);
}

function writeReportHtml() {
  fs.mkdirSync(REPORTS, { recursive: true });
  let empirical = null;
  let llm = null;
  try {
    empirical = JSON.parse(fs.readFileSync(path.join(REPORTS, 'empirical_report.json'), 'utf8'));
  } catch {
    /* optional */
  }
  try {
    llm = JSON.parse(fs.readFileSync(path.join(REPORTS, 'gpu_llm_real_lab.json'), 'utf8'));
  } catch {
    /* optional */
  }
  const allPass = empirical?.results?.all_pass ?? 'n/a';
  const aggregate = empirical?.results?.H?.aggregatePct;
  const aggregateText = typeof aggregate === 'number' ? `${aggregate.toFixed(1)}%` : 'n/a';
  const prefill = llm?.inference?.comparison?.prefillP50Speedup;
  const generate = llm?.inference?.comparison?.generateP50Speedup;
  const trainStep = llm?.training?.comparison?.stepP50Speedup;
  const prefillText = typeof prefill === 'number' ? `${prefill.toFixed(2)}×` : 'n/a';
  const generateText = typeof generate === 'number' ? `${generate.toFixed(2)}×` : 'n/a';
  const trainStepText = typeof trainStep === 'number' ? `${trainStep.toFixed(2)}×` : 'n/a';
  const honesty = [];
  if (CONFIG?.honesty?.localGpuNotHbm) honesty.push('Local GPU results are not datacenter HBM silicon identity.');
  if (CONFIG?.honesty?.notHostedFrontierBakeoff) honesty.push('Not a hosted frontier-vendor bake-off.');
  const honestyText = honesty.join(' ') || 'Local results only; validate on your own workload.';
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(PRODUCT)} · Customer Benchmark</title>
<style>body{font-family:system-ui;max-width:44rem;margin:2rem auto;padding:0 1rem;line-height:1.5}
h1{font-size:1.6rem}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left}
.muted{color:#555;font-size:.9rem}</style></head><body>
<h1>${escapeHtml(PRODUCT)} — Customer Benchmark</h1>
<p class="muted">${escapeHtml(HEADLINE)} · Generated ${new Date().toISOString()} · Workstation ${escapeHtml(VERSION)}</p>
<table>
<tr><th>Metric</th><th>Value</th></tr>
<tr><td>Suite all_pass</td><td>${escapeHtml(allPass)}</td></tr>
<tr><td>Aggregate memory gate</td><td>${escapeHtml(aggregateText)}</td></tr>
<tr><td>Real LLM prefill speedup</td><td>${escapeHtml(prefillText)}</td></tr>
<tr><td>Real LLM generate speedup</td><td>${escapeHtml(generateText)}</td></tr>
<tr><td>Real LLM train-step speedup</td><td>${escapeHtml(trainStepText)}</td></tr>
<tr><td>Device</td><td>${escapeHtml(llm?.device ?? 'see receipts')}</td></tr>
</table>
<p class="muted">${escapeHtml(honestyText)}</p>
<p class="muted">Raw receipts in benchmarks/reports/. Share: node scripts/tiny.mjs share</p>
</body></html>`;
  const out = path.join(REPORTS, 'customer-benchmark.html');
  fs.writeFileSync(out, html, 'utf8');
  log(`wrote ${out}`);
  return out;
}

function logShareResult(result, label) {
  if (result.emailedViaSmtp) {
    log(`${label} emailed via SMTP → ${result.to}`);
    return;
  }
  if (result.mailtoOpened) {
    log(`${label} mail client opened → ${result.to}`);
    return;
  }
  log(`${label} not sent — no SMTP and no mail client opened${result.jsonPath ? `; packet: ${result.jsonPath}` : ''}`);
}

async function report() {
  writeReportHtml();
  if (flag('--share') || flag('-s')) {
    log(`share selected → preparing packet for ${SHARE_TO}`);
    const result = shareResults({
      name: process.env.TINY_FOOTPRINT_PARTICIPANT_NAME || '',
      email: process.env.TINY_FOOTPRINT_PARTICIPANT_EMAIL || '',
      org: process.env.TINY_FOOTPRINT_PARTICIPANT_ORG || '',
      openMail: true,
    });
    logShareResult(result, 'Share');
  } else {
    log('Tip: add --share to email results to the validation desk (valetpru@gmail.com)');
  }
  return 0;
}

function integrate() {
  const adapters = path.join(ROOT, 'tiny-footprint', 'adapters', 'README.md');
  if (fs.existsSync(adapters)) console.log(fs.readFileSync(adapters, 'utf8'));
  log('Integrate via defined adapters — do not replace the customer AI stack.');
  return 0;
}

async function join() {
  log('Join the Tiny Footprint industry-wide validation initiative');
  log(`Results share address: ${SHARE_TO}`);
  const rl = readline.createInterface({ input, output });
  try {
    const name = await ask(rl, 'Your name');
    const email = await ask(rl, 'Work email');
    const org = await ask(rl, 'Organization');
    const role = await ask(rl, 'Role', 'Infrastructure / MLOps');
    const hardware = await ask(rl, 'Hardware interest', 'local GPU / HBM cluster');
    const notes = await ask(rl, 'Notes (optional)', '');
    const shareAns = (await ask(rl, 'Share your latest benchmark results with the validation desk? (y/N)', 'N')).toLowerCase();
    const share = shareAns === 'y' || shareAns === 'yes';

    const joinPath = path.join(REPORTS, 'validation-join.json');
    fs.mkdirSync(REPORTS, { recursive: true });
    const record = {
      product: 'Tiny Footprint Validation Initiative',
      at: new Date().toISOString(),
      name,
      email,
      org,
      role,
      hardware,
      notes,
      shareResults: share,
      shareTo: SHARE_TO,
    };
    fs.writeFileSync(joinPath, JSON.stringify(record, null, 2), { encoding: 'utf8', mode: 0o600 });
    log(`saved ${joinPath}`);

    if (share) {
      // Receipts are read only after explicit consent.
      writeReportHtml();
      const result = shareResults({
        name,
        email,
        org,
        role,
        notes: `${notes}\nHardware: ${hardware}`,
        openMail: true,
      });
      logShareResult(result, 'Results share');
      log(`Packet on disk: ${result.jsonPath}`);
    } else {
      // Contact-only message; shareJoinInterest never reads benchmark receipts.
      const result = shareJoinInterest({ name, email, org, role, hardware, notes, openMail: true });
      logShareResult(result, 'Join interest');
      log('No benchmark receipts were read or attached.');
    }
    return 0;
  } finally {
    rl.close();
  }
}

async function share() {
  log(`share · opt-in send to ${SHARE_TO}`);
  writeReportHtml();
  const rl = flag('--yes') || flag('-y') ? null : readline.createInterface({ input, output });
  try {
    let meta = {
      name: process.env.TINY_FOOTPRINT_PARTICIPANT_NAME || '',
      email: process.env.TINY_FOOTPRINT_PARTICIPANT_EMAIL || '',
      org: process.env.TINY_FOOTPRINT_PARTICIPANT_ORG || '',
    };
    if (rl) {
      const confirm = (await ask(rl, `Email latest results to ${SHARE_TO}? (y/N)`, 'N')).toLowerCase();
      if (confirm !== 'y' && confirm !== 'yes') {
        log('Share cancelled — nothing sent.');
        return 0;
      }
      meta = {
        name: await ask(rl, 'Your name', meta.name),
        email: await ask(rl, 'Your email', meta.email),
        org: await ask(rl, 'Organization', meta.org),
      };
    }
    const result = shareResults({ ...meta, openMail: true });
    logShareResult(result, 'Share');
    log(`Packet on disk: ${result.jsonPath}`);
    return 0;
  } finally {
    rl?.close();
  }
}

const cmd = process.argv[2] || 'doctor';
const map = { doctor, install, demo, benchmark, report, integrate, join, share };

async function main() {
  if (!map[cmd]) {
    console.error(`Unknown command: ${cmd}`);
    console.error('Commands: doctor | install | demo | benchmark | report [--share] | integrate | join | share');
    process.exit(1);
  }
  const out = map[cmd]();
  const code = out && typeof out.then === 'function' ? await out : out;
  process.exit(code ?? 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
