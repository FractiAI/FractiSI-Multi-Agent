import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ARCHITECTURE_PRIMER,
  architecturePrimerLines,
} from '../../src/testdrive/architecture-primer.mjs';

test('architecture primer includes the full synthesis spine', () => {
  const ids = ARCHITECTURE_PRIMER.steps.map((s) => s.id);
  for (const need of [
    'ipl',
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
  assert.match(ARCHITECTURE_PRIMER.chain, /Infinite Possibilities Lattice/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Net Zero/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Φ_EGS/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Boundary nodes/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Recursive trees/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Polygons-in-circle/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Wave–Node–Fq/);
  assert.match(ARCHITECTURE_PRIMER.chain, /Awareness/);
  assert.match(ARCHITECTURE_PRIMER.chain, /FractiSI Multi-Agent/);
  assert.match(ARCHITECTURE_PRIMER.activeInference, /including humans/);
});

test('primer lines are printable for CLI/API', () => {
  const lines = architecturePrimerLines();
  assert.ok(lines.length > 20);
  assert.ok(lines.some((l) => /Net Zero/.test(l)));
});
