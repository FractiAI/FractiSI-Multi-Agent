/**
 * Build the opt-in result packet. Reads local receipts, so callers must obtain
 * consent first. Written with owner-only permissions under a gitignored folder.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadProductConfig } from '../core/config.mjs';
import { PATHS } from '../core/paths.mjs';

export const RECEIPT_NAMES = Object.freeze([
  'customer-benchmark.html',
  'empirical_report.json',
  'empirical_report.md',
  'heap_benchmark.json',
  'gpu_live_chat_hbm_lab.json',
  'gpu_llm_real_lab.json',
]);

/** @param {string} [reportsDir] */
export function loadLatestReceipts(reportsDir = PATHS.reports) {
  const files = {};
  for (const name of RECEIPT_NAMES) {
    const file = path.join(reportsDir, name);
    if (fs.existsSync(file)) files[name] = fs.readFileSync(file, 'utf8');
  }
  return files;
}

/** @param {Record<string, string>} files */
export function summarizeReceipts(files) {
  const lines = [];
  try {
    if (files['empirical_report.json']) {
      const e = JSON.parse(files['empirical_report.json']);
      lines.push(`Suite verdict: ${e?.results?.verdict}`);
      lines.push(`Aggregate representation gate: ${e?.results?.H?.aggregatePct?.toFixed?.(1) ?? 'n/a'}%`);
    }
  } catch {
    lines.push('Suite report unreadable.');
  }
  try {
    if (files['gpu_llm_real_lab.json']) {
      const l = JSON.parse(files['gpu_llm_real_lab.json']);
      if (l.status === 'not_run') {
        lines.push(`Real-model lab: not run (${l.reason})`);
      } else {
        lines.push(`Device: ${l.device || 'n/a'}`);
        lines.push(`Prefill speedup: ${l?.inference?.comparison?.prefillP50Speedup?.toFixed?.(2) ?? 'n/a'}×`);
      }
    }
  } catch {
    lines.push('Real-model lab receipt unreadable.');
  }
  if (!lines.length) lines.push('No benchmark receipts found yet — run: node scripts/tiny.mjs benchmark && node scripts/tiny.mjs report');
  return lines.join('\n');
}

/**
 * @param {object} [meta] participant details
 * @param {{reportsDir?: string, shareDir?: string, to?: string}} [options]
 */
export function buildSharePacket(meta = {}, options = {}) {
  const config = loadProductConfig();
  const reportsDir = options.reportsDir ?? PATHS.reports;
  const shareDir = options.shareDir ?? path.join(reportsDir, 'share-packets');
  const files = loadLatestReceipts(reportsDir);
  const packet = {
    product: `${config.product} Workstation`,
    version: config.version,
    sharedAt: new Date().toISOString(),
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    node: process.version,
    meta,
    receipts: Object.keys(files),
    summaryText: summarizeReceipts(files),
  };
  fs.mkdirSync(shareDir, { recursive: true });
  const id = packet.sharedAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(shareDir, `share-${id}.json`);
  const bodyPath = path.join(shareDir, `share-${id}.txt`);
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
    'The full JSON packet is saved on this machine. Attach it if this message has no attachment:',
    jsonPath,
    '',
    'Consent: participant explicitly opted in to sharing benchmark receipts.',
    'Honesty: participant hardware results; not FractiAI CapEx guarantee; GDDR≠HBM.',
  ].join('\n');
  fs.writeFileSync(bodyPath, body, { encoding: 'utf8', mode: 0o600 });
  return { packet, jsonPath, bodyPath, body, to: options.to ?? defaultRecipient() };
}

export function defaultRecipient() {
  return process.env.TINY_FOOTPRINT_SHARE_EMAIL || 'valetpru@gmail.com';
}
