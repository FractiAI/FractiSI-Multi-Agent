import assert from 'node:assert/strict';
import test from 'node:test';
import { deploy } from '../../../src/cli/commands/deploy.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('Community edition refuses deploy as a paid feature', async () => {
  const lines = [];
  const prev = process.env.FRACTISI_EDITION;
  delete process.env.FRACTISI_EDITION;
  delete process.env.FRACTISI_TIER;
  try {
    const ctx = createContext({ argv: ['node', 'tiny', 'deploy', 'list'], log: (l) => lines.push(l) });
    const code = await deploy(ctx);
    assert.equal(code, 2);
    assert.ok(lines.some((l) => /paid feature/i.test(l)));
  } finally {
    if (prev !== undefined) process.env.FRACTISI_EDITION = prev;
  }
});

test('Team edition reaches deploy list without crashing', async () => {
  const lines = [];
  const prev = process.env.FRACTISI_EDITION;
  process.env.FRACTISI_EDITION = 'team';
  try {
    const ctx = createContext({ argv: ['node', 'tiny', 'deploy', 'list'], log: (l) => lines.push(l) });
    const code = await deploy(ctx);
    assert.ok(typeof code === 'number');
    assert.ok(code === 0 || code === 2); // 2 only if cloud note path; list returns 0
    assert.ok(lines.some((l) => /deploy/i.test(l)));
  } finally {
    if (prev === undefined) delete process.env.FRACTISI_EDITION;
    else process.env.FRACTISI_EDITION = prev;
  }
});
