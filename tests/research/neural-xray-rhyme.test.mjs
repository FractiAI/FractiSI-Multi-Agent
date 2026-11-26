import assert from 'node:assert/strict';
import test from 'node:test';
import { runNeuralXrayRhymeSuite } from '../../research/neural-xray-rhyme/src/experiments.mjs';
import { runLiveBlindPredictIntervene } from '../../research/neural-xray-rhyme/src/live-nn.mjs';

test('NXR suite Exp 1–10 all pass · decisive threshold met', () => {
  const report = runNeuralXrayRhymeSuite();
  assert.equal(report.engineShelfSlot, 58);
  assert.equal(report.engineShelfPinned, true);
  assert.equal(report.total, 10);
  assert.equal(report.passCount, 10);
  assert.equal(report.pass, true);
  assert.equal(report.majorResultShape.measured.fullXrayClaimed, false);
  assert.equal(report.majorResultShape.measured.decisiveThresholdOpen, false);
  assert.equal(report.majorResultShape.measured.decisiveThresholdMet, true);
  assert.equal(report.majorResultShape.measured.liveNeuralNet, true);
  assert.equal(report.anchors.tier, 'measured');
});

test('live MLP locks rhyme before blind outcomes and intervention consequence', () => {
  const live = runLiveBlindPredictIntervene();
  assert.equal(live.liveNeuralNet, true);
  assert.equal(live.lockedRhyme.lockedAt, 'before_blind_outcome_scoring');
  assert.equal(live.intervention.plan.lockedBeforeInterventionOutcome, true);
  assert.equal(live.decisiveThresholdMet, true);
  assert.ok(live.blindPrediction.accuracy >= 0.75);
  assert.ok(live.intervention.rhymeFlipRate >= 0.3);
  assert.ok(live.intervention.rhymeFlipRate > live.intervention.controlFlipRate + 0.2);
});
