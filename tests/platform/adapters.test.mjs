import assert from 'node:assert/strict';
import test from 'node:test';
import { getAdapter, ingestExternalAgent, normalizeAgentMessage } from '../../src/platform/adapters.mjs';
import { createPlatform } from '../../src/platform/create-platform.mjs';

test('adapters normalize cursor and claude-code payloads', () => {
  assert.equal(getAdapter('cursor').framework, 'cursor');
  const msg = normalizeAgentMessage({ identity: 'x', status: 'done' });
  assert.equal(msg.completionStatus, 'done');
  const platform = createPlatform();
  const ingested = ingestExternalAgent(platform, 'cursor', {
    agentId: 'cursor-1',
    edits: [{ paths: ['a.ts'], summary: 'edit' }],
    status: 'active',
  });
  assert.equal(ingested.agent.framework, 'cursor');
  assert.equal(ingested.proposals.length, 1);
});
