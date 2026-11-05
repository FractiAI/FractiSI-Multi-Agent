/**
 * Message delivery for the opt-in share path. Opens the system mail client by
 * default. When TINY_FOOTPRINT_SMTP_HOST/USER/PASS are set, attempts a silent SMTP
 * send through PowerShell Send-MailMessage (Windows only).
 */
import { spawnSync } from 'node:child_process';

const MAILTO_MAX_CHARS = 1800;

/** Keep a body within typical mailto URL limits; truncation counts code points. */
export function clipForMailto(body, max = MAILTO_MAX_CHARS) {
  const points = Array.from(body);
  if (points.length <= max) return body;
  return `${points.slice(0, max).join('')}\n\n…[truncated — see local share packet]…`;
}

export function buildMailtoUrl(to, subject, body) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(clipForMailto(body))}`;
}

export function openMailto(to, subject, body) {
  const url = buildMailtoUrl(to, subject, body);
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

/**
 * Constant script: all values arrive through environment variables, so recipient
 * addresses, subjects, bodies, and attachment paths are never parsed as code.
 */
const SMTP_POWERSHELL = String.raw`
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

export function trySmtpSend(to, subject, body, attachmentPath, env = process.env, platform = process.platform) {
  const host = env.TINY_FOOTPRINT_SMTP_HOST;
  const user = env.TINY_FOOTPRINT_SMTP_USER;
  const pass = env.TINY_FOOTPRINT_SMTP_PASS;
  const from = env.TINY_FOOTPRINT_SMTP_FROM || user;
  const port = env.TINY_FOOTPRINT_SMTP_PORT || '587';
  if (!host || !user || !pass || platform !== 'win32') return { ok: false, reason: 'smtp_not_configured' };
  if (!/^\d+$/.test(port)) return { ok: false, reason: 'smtp_port_invalid' };
  const r = spawnSync('powershell', ['-NoProfile', '-Command', SMTP_POWERSHELL], {
    encoding: 'utf8',
    timeout: 30000,
    env: {
      ...env,
      TINY_FOOTPRINT_SMTP_FROM: from,
      TINY_FOOTPRINT_MAIL_TO: to,
      TINY_FOOTPRINT_MAIL_SUBJECT: subject,
      TINY_FOOTPRINT_MAIL_BODY: body,
      TINY_FOOTPRINT_MAIL_ATTACHMENT: attachmentPath || '',
      TINY_FOOTPRINT_SMTP_PORT: port,
    },
  });
  return { ok: r.status === 0, reason: r.error?.message, stderr: r.stderr, stdout: r.stdout };
}
