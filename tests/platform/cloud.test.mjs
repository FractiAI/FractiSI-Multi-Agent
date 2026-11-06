import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCloudToken, cloudPrereqMessage } from '../../src/platform/cloud.mjs';
import { checkTryPrereqs } from '../../src/platform/prereqs.mjs';
import { REPO_ROOT } from '../../src/core/paths.mjs';

test('cloud token resolves from FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN', () => {
  assert.equal(resolveCloudToken({}).ok, false);
  assert.equal(resolveCloudToken({ VERCEL_TOKEN: 'x' }).ok, true);
  assert.equal(resolveCloudToken({ FRACTISI_CLOUD_TOKEN: 'y' }).provider, 'vercel');
  assert.match(cloudPrereqMessage(), /VERCEL_TOKEN/);
});

test('try prereqs require git and cloud token', () => {
  const missing = checkTryPrereqs(REPO_ROOT, {});
  assert.equal(missing.ok, false);
  const ok = checkTryPrereqs(REPO_ROOT, { VERCEL_TOKEN: 'test-token' });
  assert.equal(ok.ok, true);
  assert.equal(ok.git.ok, true);
});
