import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ARCHITECTURE_PRIMER,
  architecturePrimerLines,
} from '../../src/testdrive/architecture-primer.mjs';

test('architecture primer includes the full synthesis spine with locked names', () => {
  const ids = ARCHITECTURE_PRIMER.steps.map((s) => s.id);
  for (const need of [
    'generative',
    'net-zero',
    'phi',
    'octaves',
    'boundary',
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
  assert.match(ARCHITECTURE_PRIMER.steps[1].body, /Root of the shared world/i);
});

test('primer lines are printable for CLI/API', () => {
  const lines = architecturePrimerLines();
  assert.ok(lines.length > 20);
  assert.ok(lines.some((l) => /Net Zero/.test(l)));
  assert.ok(lines.some((l) => /Generative possibility/.test(l)));
  assert.ok(lines.some((l) => /plain English|shared world|Home base|first listen/i.test(l) || /HOW FRACTISI/.test(l)));
});
