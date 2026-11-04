import assert from 'node:assert/strict';
import { shareJoinInterest } from '../../scripts/share-results.mjs';

const savedSmtpHost = process.env.TINY_FOOTPRINT_SMTP_HOST;
delete process.env.TINY_FOOTPRINT_SMTP_HOST;

try {
  const result = shareJoinInterest({
    name: 'Audit Test',
    email: 'audit@example.com',
    org: 'Example Org',
    role: 'Auditor',
    hardware: 'CPU only',
    notes: 'contact-only path',
    openMail: false,
  });

  assert.equal(result.emailedViaSmtp, false);
  assert.equal(result.mailtoOpened, false);
  assert.match(result.body, /Tiny Footprint · Industry validation initiative/);
  assert.match(result.body, /Benchmark results: NOT shared/);
  assert.doesNotMatch(result.body, /receipt/i);
} finally {
  if (savedSmtpHost === undefined) delete process.env.TINY_FOOTPRINT_SMTP_HOST;
  else process.env.TINY_FOOTPRINT_SMTP_HOST = savedSmtpHost;
}

console.log('share-results ok');
