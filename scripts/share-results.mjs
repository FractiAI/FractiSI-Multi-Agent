/**
 * Opt-in share of Tiny Footprint benchmark / validation results.
 * Default recipient: valetpru@gmail.com
 *
 * Results sharing is explicit: buildSharePacket() reads local receipts only after
 * the caller has obtained consent. shareJoinInterest() sends contact details only
 * and never reads benchmark receipts.
 *
 * Opens the system mail client with a prefilled message (works without SMTP).
 * If TINY_FOOTPRINT_SMTP_HOST/USER/PASS are set, attempts a silent SMTP send
 * through PowerShell Send-MailMessage (Windows only).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS = path.join(ROOT, 'benchmarks', 'reports');
const SHARE_DIR = path.join(REPORTS, 'share-packets');
const DEFAULT_TO = process.env.TINY_FOOTPRINT_SHARE_EMAIL || 'valetpru@gmail.com';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

const CONFIG = readJson(path.join(ROOT, 'tiny-footprint', 'configuration', 'default.json'));
const PKG = readJson(path.join(ROOT, 'package.json'));
const PRODUCT = `${CONFIG.product || 'Tiny Footprint'} Workstation`;
const VERSION = PKG.version || '0.1.0';

export function loadLatestReceipts() {
  const names = [
    'customer-benchmark.html',
    'empirical_report.json',
    'empirical_report.md',
    'gpu_live_chat_hbm_lab.json',
    'gpu_llm_real_lab.json',
  ];
  const files = {};
  for (const n of names) {
    const p = path.join(REPORTS, n);
    if (fs.existsSync(p)) files[n] = fs.readFileSync(p, 'utf8');
  }
  return files;
}

export function buildSharePacket(meta = {}) {
  const files = loadLatestReceipts();
  const packet = {
    product: PRODUCT,
    version: VERSION,
    sharedAt: new Date().toISOString(),
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    node: process.version,
    meta,
    receipts: Object.keys(files),
    summaryText: summarize(files),
  };
  fs.mkdirSync(SHARE_DIR, { recursive: true });
  const id = packet.sharedAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(SHARE_DIR, `share-${id}.json`);
  const bodyPath = path.join(SHARE_DIR, `share-${id}.txt`);
  fs.writeFileSync(jsonPath, JSON.stringify({ ...packet, files }, null, 2), { encoding: 'utf8', mode: 0o600 });
  const body = [
    'Tiny Footprint · Industry validation / shared benchmark results',
    '==============================================================',
    `Shared at: ${packet.sharedAt}`,
    `From: ${meta.name || 'n/a'} <${meta.email || 'n/a'}>`,
    `Org: ${meta.org || 'n/a'}`,
    `Role: ${meta.role || 'n/a'}`,
    `Host: ${packet.hostname} · ${packet.platform}`,
    `Node: ${packet.node}`,
    '',
    packet.summaryText,
    '',
    '--- receipt filenames ---',
    ...packet.receipts.map((r) => `· ${r}`),
    '',
    'Full JSON packet attached in local share-packets folder (paste if needed):',
    jsonPath,
    '',
    'Consent: participant explicitly opted in to sharing benchmark receipts.',
    'Honesty: participant hardware results; not FractiAI CapEx guarantee; GDDR≠HBM.',
  ].join('\n');
  fs.writeFileSync(bodyPath, body, { encoding: 'utf8', mode: 0o600 });
  return { packet, jsonPath, bodyPath, body, to: DEFAULT_TO };
}

function summarize(files) {
  const lines = [];
  try {
    if (files['empirical_report.json']) {
      const e = JSON.parse(files['empirical_report.json']);
      lines.push(`Suite all_pass: ${e?.results?.all_pass}`);
      lines.push(`Aggregate memory gate: ${e?.results?.H?.aggregatePct?.toFixed?.(1) ?? 'n/a'}%`);
    }
  } catch {
    /* ignore */
  }
  try {
    if (files['gpu_llm_real_lab.json']) {
      const l = JSON.parse(files['gpu_llm_real_lab.json']);
      lines.push(`Device: ${l.device || 'n/a'}`);
      lines.push(`Prefill speedup: ${l?.inference?.comparison?.prefillP50Speedup?.toFixed?.(2) ?? 'n/a'}×`);
      lines.push(`Generate speedup: ${l?.inference?.comparison?.generateP50Speedup?.toFixed?.(2) ?? 'n/a'}×`);
      lines.push(`Train-step speedup: ${l?.training?.comparison?.stepP50Speedup?.toFixed?.(2) ?? 'n/a'}×`);
    }
  } catch {
    /* ignore */
  }
  if (!lines.length) lines.push('No benchmark receipts found yet — run: node scripts/tiny.mjs benchmark && node scripts/tiny.mjs report');
  return lines.join('\n');
}

function buildJoinInterestBody(meta) {
  return [
    'Tiny Footprint · Industry validation initiative — join interest',
    '===============================================================',
    `Requested at: ${new Date().toISOString()}`,
    `From: ${meta.name || 'n/a'} <${meta.email || 'n/a'}>`,
    `Org: ${meta.org || 'n/a'}`,
    `Role: ${meta.role || 'n/a'}`,
    `Hardware: ${meta.hardware || 'n/a'}`,
    `Notes: ${meta.notes || 'n/a'}`,
    '',
    'Benchmark results: NOT shared (participant did not opt in).',
    'This message contains contact details and hardware interest only.',
  ].join('\n');
}

function openMailto(to, subject, body) {
  // Keep body within typical mailto URL limits by truncating; full text stays on disk.
  const max = 1800;
  const clipped = body.length > max ? `${Array.from(body).slice(0, max).join('')}\n\n…[truncated — see local share packet]…` : body;
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(clipped)}`;
  let r;
  if (process.platform === 'win32') {
    // Pass the URL through the environment; never interpolate it into PowerShell code.
    r = spawnSync('powershell', ['-NoProfile', '-Command', 'Start-Process $env:TINY_FOOTPRINT_MAILTO_URL'], {
      encoding: 'utf8',
      timeout: 5000,
      env: { ...process.env, TINY_FOOTPRINT_MAILTO_URL: url },
    });
  } else if (process.platform === 'darwin') {
    r = spawnSync('open', [url], { encoding: 'utf8', timeout: 5000 });
  } else {
    r = spawnSync('xdg-open', [url], { encoding: 'utf8', timeout: 5000 });
  }
  return r.status === 0;
}

function trySmtpSend(to, subject, body, attachmentPath) {
  const host = process.env.TINY_FOOTPRINT_SMTP_HOST;
  const user = process.env.TINY_FOOTPRINT_SMTP_USER;
  const pass = process.env.TINY_FOOTPRINT_SMTP_PASS;
  const from = process.env.TINY_FOOTPRINT_SMTP_FROM || user;
  const port = process.env.TINY_FOOTPRINT_SMTP_PORT || '587';
  if (!host || !user || !pass || process.platform !== 'win32') return { ok: false, reason: 'smtp_not_configured' };
  if (!/^\d+$/.test(port)) return { ok: false, reason: 'smtp_port_invalid' };
  // Constant script: all values arrive through environment variables, so recipient
  // addresses, subjects, bodies, and attachment paths are never parsed as code.
  const ps = String.raw`
$ErrorActionPreference = 'Stop'
$pass = ConvertTo-SecureString $env:TINY_FOOTPRINT_SMTP_PASS -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($env:TINY_FOOTPRINT_SMTP_USER, $pass)
$params = @{
  From = $env:TINY_FOOTPRINT_SMTP_FROM
  To = $env:TINY_FOOTPRINT_MAIL_TO
  Subject = $env:TINY_FOOTPRINT_MAIL_SUBJECT
  Body = $env:TINY_FOOTPRINT_MAIL_BODY
  SmtpServer = $env:TINY_FOOTPRINT_SMTP_HOST
  Port = [int]$env:TINY_FOOTPRINT_SMTP_PORT
  UseSsl = $true
  Credential = $cred
}
if ($env:TINY_FOOTPRINT_MAIL_ATTACHMENT) {
  $params.Attachments = $env:TINY_FOOTPRINT_MAIL_ATTACHMENT
}
Send-MailMessage @params
`;
  const env = {
    ...process.env,
    TINY_FOOTPRINT_SMTP_FROM: from,
    TINY_FOOTPRINT_MAIL_TO: to,
    TINY_FOOTPRINT_MAIL_SUBJECT: subject,
    TINY_FOOTPRINT_MAIL_BODY: body,
    TINY_FOOTPRINT_MAIL_ATTACHMENT: attachmentPath || '',
    TINY_FOOTPRINT_SMTP_PORT: port,
  };
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], {
    encoding: 'utf8',
    timeout: 30000,
    env,
  });
  return {
    ok: r.status === 0,
    reason: r.error?.message,
    stderr: r.stderr,
    stdout: r.stdout,
  };
}

/**
 * @param {{ name?: string, email?: string, org?: string, role?: string, notes?: string, openMail?: boolean }} meta
 */
export function shareResults(meta = {}) {
  const built = buildSharePacket(meta);
  const subject = `Tiny Footprint validation results · ${meta.org || meta.name || os.hostname()}`;
  let smtp = { ok: false };
  if (process.env.TINY_FOOTPRINT_SMTP_HOST) {
    smtp = trySmtpSend(built.to, subject, built.body, built.jsonPath);
  }
  const mailtoOpened = !smtp.ok && meta.openMail !== false
    ? openMailto(built.to, subject, built.body)
    : false;
  return {
    to: built.to,
    jsonPath: built.jsonPath,
    bodyPath: built.bodyPath,
    emailedViaSmtp: !!smtp.ok,
    mailtoOpened,
    smtpReason: smtp.ok ? undefined : smtp.reason,
  };
}

/**
 * Contact-only join interest. Never reads or attaches benchmark receipts.
 * @param {{ name?: string, email?: string, org?: string, role?: string, hardware?: string, notes?: string, openMail?: boolean }} meta
 */
export function shareJoinInterest(meta = {}) {
  const subject = `Tiny Footprint validation interest · ${meta.org || meta.name || os.hostname()}`;
  const body = buildJoinInterestBody(meta);
  let smtp = { ok: false };
  if (process.env.TINY_FOOTPRINT_SMTP_HOST) {
    smtp = trySmtpSend(DEFAULT_TO, subject, body, null);
  }
  const mailtoOpened = !smtp.ok && meta.openMail !== false
    ? openMailto(DEFAULT_TO, subject, body)
    : false;
  return {
    to: DEFAULT_TO,
    body,
    emailedViaSmtp: !!smtp.ok,
    mailtoOpened,
    smtpReason: smtp.ok ? undefined : smtp.reason,
  };
}
