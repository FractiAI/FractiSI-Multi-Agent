import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildSharePacket, defaultRecipient, loadLatestReceipts, summarizeReceipts } from '../../src/share/packet.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tf-pkt-'));

test('only named receipts are read', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'empirical_report.md'), 'report');
  fs.writeFileSync(path.join(dir, 'validation-join.json'), '{"email":"private@example.com"}');
  assert.deepEqual(Object.keys(loadLatestReceipts(dir)), ['empirical_report.md']);
});

test('a summary reports what the receipts say, including a lab that did not run', () => {
  const text = summarizeReceipts({
    'empirical_report.json': JSON.stringify({ results: { verdict: 'incomplete', H: { aggregatePct: 84.5 } } }),
    'gpu_llm_real_lab.json': JSON.stringify({ status: 'not_run', reason: 'not_requested' }),
  });
  assert.match(text, /verdict: incomplete/);
  assert.match(text, /84\.5%/);
  assert.match(text, /not run \(not_requested\)/);
});

test('no receipts gives instructions, and an unreadable receipt says so', () => {
  assert.match(summarizeReceipts({}), /No benchmark receipts/);
  assert.match(summarizeReceipts({ 'empirical_report.json': '{bad' }), /unreadable/);
});

test('a packet is written with owner-only permissions and declares consent', () => {
  const dir = tmp();
  const built = buildSharePacket({ name: 'A', email: 'a@example.com' }, { reportsDir: dir });
  assert.match(built.body, /Consent: participant explicitly opted in/);
  assert.match(built.body, /a@example\.com/);
  if (process.platform !== 'win32') assert.equal(fs.statSync(built.jsonPath).mode & 0o777, 0o600);
});

test('the recipient can be overridden through the environment', () => {
  const saved = process.env.TINY_FOOTPRINT_SHARE_EMAIL;
  process.env.TINY_FOOTPRINT_SHARE_EMAIL = 'desk@example.com';
  try {
    assert.equal(defaultRecipient(), 'desk@example.com');
  } finally {
    if (saved === undefined) delete process.env.TINY_FOOTPRINT_SHARE_EMAIL;
    else process.env.TINY_FOOTPRINT_SHARE_EMAIL = saved;
  }
});
