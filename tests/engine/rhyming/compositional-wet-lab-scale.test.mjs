import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMPOSITIONAL_CHAIN,
  COMPOSITION_LAYERS,
  PROOF_LEVELS,
  CWLS_ENGINE_SHELF,
  recognizeCompositionLinks,
  nestedComposition,
  compositionalLevelsStatus,
  cwlsEnginePinRecord,
  CWLS_WORKING_FORM,
  CWLS_OPEN_ENGINEERING,
} from '../../../src/engine/rhyming/compositional-wet-lab-scale.mjs';

test('compositional chain CC-01…CC-07 with preprint on CC-06', () => {
  assert.equal(COMPOSITIONAL_CHAIN.length, 7);
  assert.ok(COMPOSITIONAL_CHAIN.every((e) => e.demonstrated));
  const cnn = COMPOSITIONAL_CHAIN.find((e) => e.id === 'CC-06');
  assert.equal(cnn.preprint, true);
});

test('five composition layers and three-level honesty', () => {
  assert.equal(COMPOSITION_LAYERS.length, 5);
  assert.equal(PROOF_LEVELS[0].proven, true);
  assert.equal(PROOF_LEVELS[1].proven, true);
  assert.equal(PROOF_LEVELS[2].proven, false);
  const status = compositionalLevelsStatus();
  assert.equal(status.level3, false);
});

test('engine shelf #57 pin record', () => {
  const pin = cwlsEnginePinRecord();
  assert.equal(pin.id, 57);
  assert.equal(CWLS_ENGINE_SHELF, 57);
  assert.match(pin.honesty, /NOT proven|not proven/i);
  assert.match(CWLS_WORKING_FORM.compact, /Compose the rhymes/i);
  assert.ok(CWLS_OPEN_ENGINEERING.length >= 10);
});

test('recognize metasurface Fourier/convolution as CC-03', () => {
  const ranked = recognizeCompositionLinks(
    'space-time-coding metasurface Fourier transform convolution radar',
    { topK: 3 },
  );
  assert.ok(ranked.some((r) => r.id === 'CC-03'));
});

test('nested DOF under CC-07', () => {
  const nested = nestedComposition('CC-07');
  assert.ok(nested.length >= 3);
});
