/**
 * Opt-in share of Tiny Footprint benchmark and validation results.
 *
 * Results sharing is explicit: `shareResults` reads local receipts only after the
 * caller has obtained consent. `shareJoinInterest` sends contact details only and
 * never reads benchmark receipts.
 */
import os from 'node:os';
import { openMailto, trySmtpSend } from './mailer.mjs';
import { buildSharePacket, defaultRecipient } from './packet.mjs';

export { buildSharePacket, defaultRecipient, loadLatestReceipts, summarizeReceipts } from './packet.mjs';

function send(to, subject, body, attachmentPath, openMail) {
  let smtp = { ok: false };
  if (process.env.TINY_FOOTPRINT_SMTP_HOST) smtp = trySmtpSend(to, subject, body, attachmentPath);
  const mailtoOpened = !smtp.ok && openMail !== false ? openMailto(to, subject, body) : false;
  return { emailedViaSmtp: !!smtp.ok, mailtoOpened, smtpReason: smtp.ok ? undefined : smtp.reason };
}

/**
 * @param {{ name?: string, email?: string, org?: string, role?: string, notes?: string, openMail?: boolean }} meta
 * @param {{reportsDir?: string, shareDir?: string}} [options]
 */
export function shareResults(meta = {}, options = {}) {
  const built = buildSharePacket(meta, options);
  const subject = `Tiny Footprint validation results · ${meta.org || meta.name || os.hostname()}`;
  return {
    to: built.to,
    jsonPath: built.jsonPath,
    bodyPath: built.bodyPath,
    ...send(built.to, subject, built.body, built.jsonPath, meta.openMail),
  };
}

export function buildJoinInterestBody(meta) {
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

/**
 * Contact-only join interest. Never reads or attaches benchmark receipts.
 * @param {{ name?: string, email?: string, org?: string, role?: string, hardware?: string, notes?: string, openMail?: boolean }} meta
 */
export function shareJoinInterest(meta = {}) {
  const to = defaultRecipient();
  const subject = `Tiny Footprint validation interest · ${meta.org || meta.name || os.hostname()}`;
  const body = buildJoinInterestBody(meta);
  return { to, body, ...send(to, subject, body, null, meta.openMail) };
}
