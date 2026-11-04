import assert from 'node:assert/strict';
import { experimentH_enginePinGate } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';

const passingParts = [{ baselineBytes: 1000, tinyBytes: 100 }];
const failingGpu = experimentH_enginePinGate(passingParts, true, { pass: false });
assert.equal(failingGpu.enginePinRecommended, false);
assert.equal(failingGpu.pass, false);

const missingGpu = experimentH_enginePinGate(passingParts, true, null);
assert.equal(missingGpu.enginePinRecommended, false);
assert.equal(missingGpu.pass, false);

const belowTarget = experimentH_enginePinGate([{ baselineBytes: 1000, tinyBytes: 300 }], true, {
  pass: true,
  allocReduction: 0.9,
});
assert.equal(belowTarget.enginePinRecommended, false);
assert.equal(belowTarget.pass, false);

const passing = experimentH_enginePinGate(passingParts, true, { pass: true, allocReduction: 0.9 });
assert.equal(passing.enginePinRecommended, true);
assert.equal(passing.pass, true);

console.log('engine gate ok');
