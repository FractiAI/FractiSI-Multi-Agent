import assert from 'node:assert/strict';
import {
  experimentR_holographicRhymeGate,
  experimentH_enginePinGate,
} from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';

const R = experimentR_holographicRhymeGate();
assert.equal(R.pass, true, 'holographic rhyme gate must pass');
assert.equal(R.trueAudit.pass, true);
assert.equal(R.brickAudit.pass, false);
assert.equal(R.falseMatchRejected, true);
assert.equal(R.arrayObjectDistinct, true);
assert.equal(R.nestedFieldDelta, true);

const failing = experimentH_enginePinGate([{ baselineBytes: 1000, tinyBytes: 100 }], true, { pass: false }, true);
assert.equal(failing.enginePinRecommended, false);

const blockedRhyme = experimentH_enginePinGate([{ baselineBytes: 1000, tinyBytes: 100 }], true, { pass: true }, false);
assert.equal(blockedRhyme.enginePinRecommended, false);

const passing = experimentH_enginePinGate([{ baselineBytes: 1000, tinyBytes: 100 }], true, { pass: true, allocReduction: 0.9 }, true);
assert.equal(passing.enginePinRecommended, true);

console.log('rhyme gate ok');
