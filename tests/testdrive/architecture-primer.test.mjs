import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ARCHITECTURE_PRIMER,
  architecturePrimerLines,
  NET_ZERO_DEFINITION,
  RHYME_DEFINITION,
} from '../../src/testdrive/architecture-primer.mjs';
import { FOUR_PILLARS } from '../../src/engine/rhyming/gate.mjs';

test('architecture primer includes the full synthesis spine with locked names', () => {
  const ids = ARCHITECTURE_PRIMER.steps.map((s) => s.id);
  for (const need of [
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
  assert.equal(
    ARCHITECTURE_PRIMER.steps[0].name,
    'Generative possibility',
    'stack start must be locked Generative possibility, not an invented brand',
  );
  assert.match(ARCHITECTURE_PRIMER.title, /stack map/i);
  assert.match(ARCHITECTURE_PRIMER.lede, /shared world/i);
  assert.match(ARCHITECTURE_PRIMER.steps[1].body, /Balanced zero, not nothing zero/i);
  assert.match(ARCHITECTURE_PRIMER.steps[1].body, /active-equilibrium/i);
  assert.match(ARCHITECTURE_PRIMER.steps[1].body, /not nothing zero/i);
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
  assert.match(RHYME_DEFINITION.gate, /active-equilibrium/i);
  assert.match(RHYME_DEFINITION.lede, /not a prefix-cache hit/i);
  assert.ok(RHYME_DEFINITION.notARhyme.some((n) => /prefix/i.test(n)));
  assert.ok(RHYME_DEFINITION.notARhyme.some((n) => /brick-wall/i.test(n)));
  assert.match(RHYME_DEFINITION.symposiumKinship, /not framework identity/i);
});

test('primer lines define Net Zero before rhyme', () => {
  const lines = architecturePrimerLines();
  const blob = lines.join('\n');
  assert.ok(lines.length > 20);
  assert.match(blob, /Net Zero/);
  assert.match(blob, /Generative possibility/);
  assert.match(blob, /WHAT WE MEAN BY NET ZERO/);
  assert.match(blob, /active-equilibrium/);
  assert.match(blob, /WHAT WE MEAN BY RHYME/);
  const nzAt = blob.indexOf('WHAT WE MEAN BY NET ZERO');
  const rhymeAt = blob.indexOf('WHAT WE MEAN BY RHYME');
  assert.ok(nzAt >= 0 && rhymeAt > nzAt, 'Net Zero definition must print before rhyme');
  assert.match(blob, /Repeating/);
  assert.match(blob, /Self-similar/);
  assert.match(blob, /Self-correcting/);
  assert.match(blob, /Recursive/);
  assert.match(blob, /Not a rhyme/);
});
