/**
 * Opt-in share of Tiny Footprint benchmark / validation results.
 * Default recipient: valetpru@gmail.com
 *
 * Opens the system mail client with a prefilled message (works without SMTP).
 * If TINY_FOOTPRINT_SMTP_URL is set (e.g. smtp://user:pass@host:587), attempts
 * a silent SMTP send via Node (optional dependency-free raw socket not used —
 * we shell to PowerShell Send-MailMessage when SMTP_* env vars are present).
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
    product: 'Tiny Footprint Workstation',
    version: '0.1.0',
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
  fs.writeFileSync(jsonPath, JSON.stringify({ ...packet, files }, null, 2), 'utf8');
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
    'Honesty: participant hardware results; not FractiAI CapEx guarantee; GDDR≠HBM.',
  ].join('\n');
  fs.writeFileSync(bodyPath, body, 'utf8');
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

function openMailto(to, subject, body) {
  // Keep body within typical mailto URL limits by truncating; full text stays on disk.
  const max = 1800;
  const clipped = body.length > max ? `${body.slice(0, max)}\n\n…[truncated — see local share packet]…` : body;
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(clipped)}`;
  if (process.platform === 'win32') {
    spawnSync('powershell', ['-NoProfile', '-Command', `Start-Process '${url.replace(/'/g, "''")}'`], {
      encoding: 'utf8',
    });
    return true;
  }
  if (process.platform === 'darwin') {
    spawnSync('open', [url], { encoding: 'utf8' });
    return true;
  }
  spawnSync('xdg-open', [url], { encoding: 'utf8' });
  return true;
}

function trySmtpSend(to, subject, body, jsonPath) {
  const host = process.env.TINY_FOOTPRINT_SMTP_HOST;
  const user = process.env.TINY_FOOTPRINT_SMTP_USER;
  const pass = process.env.TINY_FOOTPRINT_SMTP_PASS;
  const from = process.env.TINY_FOOTPRINT_SMTP_FROM || user;
  if (!host || !user || !pass || process.platform !== 'win32') return { ok: false, reason: 'smtp_not_configured' };
  const ps = `
$ErrorActionPreference = 'Stop'
$pass = ConvertTo-SecureString $env:TINY_FOOTPRINT_SMTP_PASS -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($env:TINY_FOOTPRINT_SMTP_USER, $pass)
Send-MailMessage -From $env:TINY_FOOTPRINT_SMTP_FROM -To '${to}' -Subject @'
${subject.replace(/'/g, "''")}
'@ -Body @'
${body.replace(/'/g, "''")}
'@ -SmtpServer '${host}' -Port ${process.env.TINY_FOOTPRINT_SMTP_PORT || 587} -UseSsl -Credential $cred -Attachments '${jsonPath.replace(/'/g, "''")}'
`;
  const env = {
    ...process.env,
    TINY_FOOTPRINT_SMTP_FROM: from,
  };
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8', env });
  return { ok: r.status === 0, stderr: r.stderr, stdout: r.stdout };
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
  if (!smtp.ok && meta.openMail !== false) {
    openMailto(built.to, subject, built.body);
  }
  return {
    to: built.to,
    jsonPath: built.jsonPath,
    bodyPath: built.bodyPath,
    emailedViaSmtp: !!smtp.ok,
    mailtoOpened: !smtp.ok && meta.openMail !== false,
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('share-results.mjs')) {
  // allow direct run
}
