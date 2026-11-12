import assert from 'node:assert/strict';
import test from 'node:test';
import { listTestDriveSteps, runTestDriveStep } from '../../src/testdrive/run-step.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const page = readFileSync(join(root, 'test-drive/index.html'), 'utf8');
const deck = readFileSync(join(root, 'talks/aai-symposium-2026/index.html'), 'utf8');
const LABS = ['1', '7', '3', '4', 'git'];


test('catalog lists primer through density with git awareness lab', () => {
  const steps = listTestDriveSteps();
  assert.equal(steps.length, 9);
  assert.equal(steps[0].id, 'primer');
  assert.match(steps[0].title, /Architecture primer|FractiSI Multi-Agent/);
  assert.match(steps[0].component, /Generative possibility|Tiny Gateway/);
  assert.match(steps[3].component, /Rhyming Templates/);
  assert.match(steps[3].short, /Net Zero|octaves/i);
  assert.match(steps[6].layer, /Coordination/);
  assert.equal(steps[7].id, 'git');
  assert.match(steps[7].title, /Git awareness/);
  assert.equal(steps[8].id, '7');
});

test('each step returns structured live results naming components', () => {
  for (const id of ['primer', '1', '2', '3', '4', '5', '6', 'git', '7']) {
    const out = runTestDriveStep(id);
    assert.equal(out.ok, true);
    assert.equal(out.step.id === 'primer' ? 'primer' : out.step.id, id === '0' ? 'primer' : id);
    assert.ok(Array.isArray(out.step.lines));
    assert.ok(out.step.lines.length > 0);
    assert.ok(out.step.layer);
    assert.ok(out.step.component);
    assert.ok(typeof out.ms === 'number');
  }
  const primer = runTestDriveStep('primer').step.lines.join('\n');
  assert.match(primer, /Generative possibility/);
  assert.match(primer, /Net Zero/);
  assert.match(primer, /Φ_EGS|1\.618/);
  assert.match(primer, /Infinite Octaves/);
  assert.match(primer, /Boundary nodes/);
  assert.match(primer, /Recursive trees/);
  assert.match(primer, /3D Hexagon|eight-node/);
  assert.match(primer, /Wave/);
  assert.match(primer, /Awareness/);
  assert.match(primer, /Rhyming Templates/);
  assert.match(primer, /Tiny Footprint/);
  assert.match(primer, /Active Inference/);
  assert.match(primer, /including humans/);
  assert.match(primer, /possible rhyme|Possible Active Inference/);
  assert.match(primer, /shared world|Home base|plain English/i);
  const rhyme = runTestDriveStep(3).step.lines.join('\n');
  assert.match(rhyme, /RHYMING TEMPLATES|Rhyming Template/i);
  assert.match(rhyme, /Net Zero/);
});

test('discovery step reports 100/100 vs 0/100', () => {
  const out = runTestDriveStep(4);
  assert.equal(out.step.metrics.pass, true);
  assert.equal(out.step.metrics.flatDiscoveries, 0);
  assert.equal(out.step.metrics.fractisiDiscoveries, 100);
  assert.equal(out.step.metrics.component, 'selective_reconstruction');
});


test('the four live tests return a plain-language readout with bars', () => {
  for (const id of LABS) {
    const { step } = runTestDriveStep(id);
    const r = step.readout;
    assert.ok(r, id);
    assert.ok(r.done && r.done.length > 40, id + ' done');
    assert.ok(r.tested && r.tested.length > 20, id + ' tested');
    assert.ok(r.summary && r.summary.length > 40, id + ' summary');
    assert.ok(r.implication && r.implication.length > 40, id + ' implication');
    assert.ok(r.beyondTheory && /coherent/i.test(r.beyondTheory), id + ' beyondTheory coherent');
    assert.ok(/predictable/i.test(r.beyondTheory), id + ' beyondTheory predictable');
    assert.ok(/well beyond theory/i.test(r.beyondTheory), id + ' beyondTheory phrase');
    assert.ok(r.headlineValue, id + ' headline');
    assert.ok(r.baselineValue && r.treatmentValue, id + ' values');
    assert.ok(r.bars && r.bars.caption, id + ' bars');
    assert.equal(typeof r.bars.baseline, 'number', id);
    assert.equal(typeof r.bars.treatment, 'number', id);
    assert.ok(r.bars.baselineText && r.bars.treatmentText, id);
  }
});

test('headline claims match what the machine returns', () => {
  assert.equal(runTestDriveStep('1').step.readout.bars.treatment < runTestDriveStep('1').step.readout.bars.baseline, true);
  const density = runTestDriveStep('7').step.readout.bars;
  assert.ok(density.treatment > density.baseline * 5, 'density gain is large');
  const rhyme = runTestDriveStep('3').step.readout;
  assert.match(rhyme.baselineValue, /^0 hits$/);
  const discovery = runTestDriveStep('4').step.readout;
  assert.equal(discovery.bars.max, 100);
  assert.match(discovery.also, /fewer operations/);
});

test('Test Drive page explains each test and renders the results card', () => {
  assert.match(page, /The test<\/span>/);
  assert.match(page, /What to watch/);
  assert.match(page, /<p class="rc-kicker">Result<\/p>/);
  assert.match(page, /What we did/);
  assert.match(page, /What we measured/);
  assert.match(page, /What came back/);
  assert.match(page, /What it means/);
  assert.match(page, /Beyond theory/);
  assert.match(page, /sectionHtml/);
  assert.match(page, /rc-num/);
  assert.match(page, /bar-track/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(page, /Twelve agents share one context/);
  assert.match(page, /exact-text cache reuses only identical text/i);
  assert.match(page, /six links deep/);
  assert.match(page, /fractisi-td-walkthrough-done-v19/);
  assert.match(page, /Git awareness · cleaner merges/);
  assert.match(page, /#git/);
  assert.match(page, /fractisi-td-results-v19/);
  assert.doesNotMatch(page, /-v15/);
  assert.match(page, /More agents, same memory\./);
});

test('speaker deck quotes the same numbers the tests return', () => {
  const one = runTestDriveStep('1').step.readout.bars;
  const density = runTestDriveStep('7').step.readout;
  const rhyme = runTestDriveStep('3').step.readout;
  assert.ok(deck.includes(one.baselineText), 'deck test 1 baseline');
  assert.ok(deck.includes(one.treatmentText), 'deck test 1 treatment');
  assert.ok(deck.includes(runTestDriveStep('1').step.readout.headlineValue), 'deck test 1 headline');
  assert.ok(deck.includes(density.headlineValue.replace(' more', '')), 'deck test 2 headline');
  assert.ok(deck.includes(String(density.bars.treatment)), 'deck test 2 capacity');
  assert.ok(deck.includes(rhyme.headlineValue), 'deck test 3 headline');
  assert.match(deck, /100 of 100/);
});

test('coordination is reported honestly, never as a collision win', () => {
  const { metrics } = runTestDriveStep('6').step;
  assert.ok(metrics.n25.cConflicts > metrics.n25.aConflicts, 'premise: coordinated logs more conflicts at n=25');
  assert.match(page, /more conflicts than plain branching/);
  assert.doesNotMatch(page, /fewer (collisions|conflicts)/i);
  assert.doesNotMatch(deck, /fewer (collisions|conflicts)/i);
  assert.match(deck, /more conflicts than plain branching/);
});


test('git awareness lab uses real git and reports fewer failed merges', () => {
  const { step } = runTestDriveStep('git');
  assert.equal(step.metrics.component, 'git_awareness');
  assert.equal(step.metrics.conclusive, true);
  assert.equal(step.metrics.improved, true);
  assert.ok(step.metrics.conventionalFailedMerges > step.metrics.fractisiFailedMerges);
  assert.equal(step.metrics.fractisiFailedMerges, 0);
  assert.ok(step.readout.done.includes('temporary Git repo') || step.readout.done.includes('worktree'));
  assert.match(step.readout.beyondTheory, /well beyond theory/i);
  assert.match(step.lines.join('\n'), /GIT AWARENESS/);
});
