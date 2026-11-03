#!/usr/bin/env node
/**
 * Tiny Footprint Workstation CLI
 * Usage:
 *   node scripts/tiny.mjs <doctor|install|demo|benchmark|report|integrate|join|share>
 *
 * Share / join opt-in emails results to valetpru@gmail.com (mailto, or SMTP if configured).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { shareResults } from './share-results.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SUITE_CANDIDATES = [
  path.join(ROOT, 'research', 'synthobs-tiny-gateway-rhyming-templates'),
  path.join(ROOT, '..', '..', 'research', 'synthobs-tiny-gateway-rhyming-templates'),
];
const SUITE = SUITE_CANDIDATES.find((p) => fs.existsSync(p)) || SUITE_CANDIDATES[0];
const REPO = fs.existsSync(path.join(ROOT, 'package.json')) ? ROOT : path.resolve(SUITE, '../..');
const REPORTS = path.join(ROOT, 'benchmarks', 'reports');
const SHARE_TO = process.env.TINY_FOOTPRINT_SHARE_EMAIL || 'valetpru@gmail.com';

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
  log('Tiny Footprint Workstation 0.1 · doctor');
  log(`workstation: ${ROOT}`);
  log(`suite: ${SUITE} ${fs.existsSync(SUITE) ? 'OK' : 'MISSING'}`);
  log(`docs: ${fs.existsSync(path.join(ROOT, 'docs')) ? 'OK' : 'optional'}`);
  log(`node: ${process.version}`);
  const py = process.env.TINY_FOOTPRINT_PYTHON || 'py';
  const pr = spawnSync(py, ['-3', '--version'], { encoding: 'utf8' });
  log(`python: ${pr.status === 0 ? (pr.stdout || pr.stderr || '').trim() : 'not found (optional for GPU labs)'}`);
  const smi = spawnSync('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader'], {
    encoding: 'utf8',
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
    log('ERROR: research suite missing under research/synthobs-tiny-gateway-rhyming-templates');
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
    env: { TINY_FOOTPRINT_FORCE_LLM_LAB: process.env.TINY_FOOTPRINT_FORCE_LLM_LAB || '0' },
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
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Tiny Footprint · Customer Benchmark</title>
<style>body{font-family:system-ui;max-width:44rem;margin:2rem auto;padding:0 1rem;line-height:1.5}
h1{font-size:1.6rem}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left}
.muted{color:#555;font-size:.9rem}</style></head><body>
<h1>Tiny Footprint — Customer Benchmark</h1>
<p class="muted">Generated ${new Date().toISOString()} · Workstation 0.1</p>
<table>
<tr><th>Metric</th><th>Value</th></tr>
<tr><td>Suite all_pass</td><td>${empirical?.results?.all_pass ?? 'n/a'}</td></tr>
<tr><td>Aggregate memory gate</td><td>${empirical?.results?.H?.aggregatePct != null ? empirical.results.H.aggregatePct.toFixed(1) + '%' : 'n/a'}</td></tr>
<tr><td>Real LLM prefill speedup</td><td>${llm?.inference?.comparison?.prefillP50Speedup?.toFixed?.(2) ?? 'n/a'}×</td></tr>
<tr><td>Real LLM generate speedup</td><td>${llm?.inference?.comparison?.generateP50Speedup?.toFixed?.(2) ?? 'n/a'}×</td></tr>
<tr><td>Real LLM train-step speedup</td><td>${llm?.training?.comparison?.stepP50Speedup?.toFixed?.(2) ?? 'n/a'}×</td></tr>
<tr><td>Device</td><td>${llm?.device ?? 'see receipts'}</td></tr>
</table>
<p class="muted">Raw receipts in benchmarks/reports/. Share: node scripts/tiny.mjs share</p>
</body></html>`;
  const out = path.join(REPORTS, 'customer-benchmark.html');
  fs.writeFileSync(out, html, 'utf8');
  log(`wrote ${out}`);
  return out;
}

async function report() {
  writeReportHtml();
  if (flag('--share') || flag('-s')) {
    log(`share selected → emailing packet to ${SHARE_TO}`);
    const result = shareResults({
      name: process.env.TINY_FOOTPRINT_PARTICIPANT_NAME || '',
      email: process.env.TINY_FOOTPRINT_PARTICIPANT_EMAIL || '',
      org: process.env.TINY_FOOTPRINT_PARTICIPANT_ORG || '',
      openMail: true,
    });
    log(
      result.emailedViaSmtp
        ? `SMTP send OK → ${result.to}`
        : `mailto opened → ${result.to} (packet: ${result.jsonPath})`,
    );
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
    fs.writeFileSync(joinPath, JSON.stringify(record, null, 2), 'utf8');
    log(`saved ${joinPath}`);

    // Always notify join interest; include results when selected
    writeReportHtml();
    const result = shareResults({
      name,
      email,
      org,
      role,
      notes: `${notes}\nHardware: ${hardware}\nShareResultsSelected: ${share}`,
      openMail: true,
    });
    if (!share) {
      log('Join interest email opened (results optional — you answered no to sharing receipts).');
    } else {
      log(
        result.emailedViaSmtp
          ? `Results emailed via SMTP → ${SHARE_TO}`
          : `Results share email opened → ${SHARE_TO}`,
      );
    }
    log(`Packet on disk: ${result.jsonPath}`);
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
    log(
      result.emailedViaSmtp
        ? `SMTP OK → ${result.to}`
        : `mailto opened → ${result.to} · packet ${result.jsonPath}`,
    );
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
