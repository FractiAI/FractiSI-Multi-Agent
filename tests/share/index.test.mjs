import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildJoinInterestBody, shareJoinInterest, shareResults } from '../../src/share/index.mjs';

function withoutSmtp(run) {
  const saved = process.env.TINY_FOOTPRINT_SMTP_HOST;
  delete process.env.TINY_FOOTPRINT_SMTP_HOST;
  try {
    return run();
  } finally {
    if (saved !== undefined) process.env.TINY_FOOTPRINT_SMTP_HOST = saved;
  }
}

test('the contact-only path sends no receipts and says so', () => {
  const result = withoutSmtp(() => shareJoinInterest({ name: 'A', email: 'a@example.com', org: 'O', role: 'R', hardware: 'CPU', notes: 'n', openMail: false }));
  assert.equal(result.emailedViaSmtp, false);
  assert.equal(result.mailtoOpened, false);
  assert.match(result.body, /Benchmark results: NOT shared/);
  assert.doesNotMatch(result.body, /receipt/i);
});

test('a join body fills absent fields explicitly', () => {
  assert.match(buildJoinInterestBody({}), /From: n\/a <n\/a>/);
});

test('sharing results writes a packet and sends nothing without a mail path', () => {
  const reportsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-share-'));
  fs.writeFileSync(path.join(reportsDir, 'empirical_report.md'), 'report');
  const result = withoutSmtp(() => shareResults({ name: 'A', openMail: false }, { reportsDir }));
  assert.equal(result.emailedViaSmtp, false);
  assert.equal(result.mailtoOpened, false);
  assert.ok(fs.existsSync(result.jsonPath));
  assert.ok(fs.existsSync(result.bodyPath));
});
