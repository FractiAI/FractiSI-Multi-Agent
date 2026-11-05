import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMailtoUrl, clipForMailto, trySmtpSend } from '../../src/share/mailer.mjs';

test('a long body is clipped by code points and says where the rest is', () => {
  const clipped = clipForMailto('é'.repeat(30), 10);
  assert.ok(clipped.startsWith('é'.repeat(10)));
  assert.match(clipped, /truncated/);
  assert.equal(clipForMailto('short', 10), 'short');
});

test('a mailto URL encodes hostile values', () => {
  const url = buildMailtoUrl('a b@example.com', 'x&y', 'line\n?z=1');
  assert.match(url, /^mailto:a%20b%40example\.com\?subject=x%26y&body=line%0A%3Fz%3D1$/);
});

test('SMTP stays off unless fully configured on Windows', () => {
  assert.deepEqual(trySmtpSend('t', 's', 'b', null, {}, 'win32'), { ok: false, reason: 'smtp_not_configured' });
  const env = { TINY_FOOTPRINT_SMTP_HOST: 'h', TINY_FOOTPRINT_SMTP_USER: 'u', TINY_FOOTPRINT_SMTP_PASS: 'p' };
  assert.deepEqual(trySmtpSend('t', 's', 'b', null, env, 'darwin'), { ok: false, reason: 'smtp_not_configured' });
});

test('an invalid port is refused before anything runs', () => {
  const env = { TINY_FOOTPRINT_SMTP_HOST: 'h', TINY_FOOTPRINT_SMTP_USER: 'u', TINY_FOOTPRINT_SMTP_PASS: 'p', TINY_FOOTPRINT_SMTP_PORT: '25; rm -rf /' };
  assert.deepEqual(trySmtpSend('t', 's', 'b', null, env, 'win32'), { ok: false, reason: 'smtp_port_invalid' });
});
