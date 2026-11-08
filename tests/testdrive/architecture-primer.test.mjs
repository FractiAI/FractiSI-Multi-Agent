import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ARCHITECTURE_PRIMER,
  architecturePrimerLines,
  NET_ZERO_DEFINITION,
  RHYME_DEFINITION,
  SANDBOX_FRAME,
} from '../../src/testdrive/architecture-primer.mjs';
import { FOUR_PILLARS } from '../../src/engine/rhyming/gate.mjs';

test('architecture primer includes the full synthesis spine with locked names', () => {
  const ids = ARCHITECTURE_PRIMER.steps.map((s) => s.id);
  for (const need of [
    'base-mainnet',
    'syntheverse',
    'generative',
    'net-zero',
    'phi',
    'octaves',
    'boundary',
    'rhyme',
    'trees',
    'polygons',
    'wave',
    'awareness',
    'synthesis',
  ]) {
    assert.ok(ids.includes(need), `missing ${need}`);
  }
  assert.match(ARCHITECTURE_PRIMER.chain, /Base Mainnet/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Syntheverse Sandbox/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Generative possibility/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Net Zero/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Φ_EGS/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Boundary nodes/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Holographic rhyme/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Recursive trees/);
  assert.match(ARCHITECTURE_PRIMER.chain, /3D Hexagon \/ eight-node/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Wave–Node–Fq/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Awareness/);
  assert.match(ARCHITECTURE_PRIMER.chain, /FractiSI Multi-Agent/);
  assert.match(ARCHITECTURE_PRIMER.activeInference, /including humans/);
  assert.equal(ARCHITECTURE_PRIMER.steps[0].name, 'Base Mainnet');
  assert.equal(ARCHITECTURE_PRIMER.steps[1].name, 'Syntheverse Sandbox');
  assert.match(ARCHITECTURE_PRIMER.title, /stack map/i);
  assert.match(ARCHITECTURE_PRIMER.lede, /Syntheverse Sandbox/i);
  assert.match(ARCHITECTURE_PRIMER.lede, /Base Mainnet/i);
  const netZero = ARCHITECTURE_PRIMER.steps.find((s) => s.id === 'net-zero');
  assert.match(netZero.body, /Balanced zero, not nothing zero/i);
  assert.match(netZero.body, /active[- ]equilibrium/i);
  assert.match(netZero.body, /not nothing zero/i);
});

test('sandbox frame locks Base Mainnet · Syntheverse · enter/exit awareness', () => {
  assert.match(SANDBOX_FRAME.punch, /enter and leave/i);
  assert.equal(SANDBOX_FRAME.baseMainnet.name, 'Base Mainnet');
  assert.equal(SANDBOX_FRAME.syntheverse.name, 'Syntheverse Sandbox');
  assert.match(SANDBOX_FRAME.awareness.body, /whichever awareness you choose/i);
  assert.match(SANDBOX_FRAME.honesty, /not a claim you must hold crypto/i);
});

test('locked Net Zero definition precedes rhyme and matches catalog peers', () => {
  assert.equal(NET_ZERO_DEFINITION.punch, 'Balanced zero, not nothing zero.');
  assert.match(NET_ZERO_DEFINITION.lede, /balanced zero/i);
  assert.match(NET_ZERO_DEFINITION.lede, /not nothing zero/i);
  assert.match(NET_ZERO_DEFINITION.body, /Goldilocks/i);
  assert.ok(NET_ZERO_DEFINITION.notNetZero.some((n) => /climate/i.test(n)));
  assert.ok(NET_ZERO_DEFINITION.notNetZero.some((n) => /Nothing zero/i.test(n)));
  assert.match(NET_ZERO_DEFINITION.productRole, /Rhymes/i);
});

test('locked rhyme definition matches the four-pillar gate', () => {
  assert.equal(RHYME_DEFINITION.pillars.length, 4);
  assert.deepEqual(
    RHYME_DEFINITION.pillars.map((p) => p.id),
    FOUR_PILLARS.slice(),
  );
  assert.match(RHYME_DEFINITION.gate, /Net Zero/);
  assert.match(RHYME_DEFINITION.gate, /active[- ]equilibrium/i);
  assert.match(RHYME_DEFINITION.lede, /not a prefix-cache hit/i);
  assert.ok(RHYME_DEFINITION.notARhyme.some((n) => /prefix/i.test(n)));
  assert.ok(RHYME_DEFINITION.notARhyme.some((n) => /brick-wall/i.test(n)));
  assert.match(RHYME_DEFINITION.symposiumKinship, /not framework identity/i);
});

test('primer lines open with valet story, then sandbox, Net Zero, rhyme', () => {
  const lines = architecturePrimerLines();
  const blob = lines.join('\n');
  assert.ok(lines.length > 20);
  assert.match(blob, /A RESTROOM VALET STORY|restroom valet/i);
  assert.match(blob, /AI-generated music|AI music/i);
  assert.match(blob, /Base Mainnet/);
  assert.match(blob, /Syntheverse Sandbox/);
  assert.match(blob, /WHAT WE MEAN BY NET ZERO/);
  assert.match(blob, /active[- ]equilibrium/i);
  assert.match(blob, /WHAT WE MEAN BY RHYME/);
  const storyAt = blob.indexOf('A RESTROOM VALET STORY');
  const sandAt = blob.indexOf('WHERE THIS PEEK SITS');
  const nzAt = blob.indexOf('WHAT WE MEAN BY NET ZERO');
  const rhymeAt = blob.indexOf('WHAT WE MEAN BY RHYME');
  assert.ok(
    storyAt >= 0 && sandAt > storyAt && nzAt > sandAt && rhymeAt > nzAt,
    'story → sandbox → Net Zero → rhyme order',
  );
  assert.match(blob, /Repeating/);
  assert.match(blob, /Not a rhyme/);
});
