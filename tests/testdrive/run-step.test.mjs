import assert from 'node:assert/strict';
import test from 'node:test';
import { listTestDriveSteps, runTestDriveStep } from '../../src/testdrive/run-step.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const page = readFileSync(join(root, 'test-drive/index.html'), 'utf8');
const deck = readFileSync(join(root, 'talks/aai-symposium-2026/index.html'), 'utf8');
const LABS = ['1', '7', '3', '4', 'git', 'futures'];


test('catalog lists primer through density with git and prediction labs', async () => {
  const steps = listTestDriveSteps();
  assert.equal(steps.length, 10);
  assert.equal(steps[0].id, 'primer');
  assert.match(steps[0].title, /Architecture primer|FractiSI Multi-Agent/);
  assert.match(steps[0].component, /Generative possibility|Tiny Gateway/);
  assert.match(steps[3].component, /Rhyming Templates/);
  assert.match(steps[3].short, /Net Zero|octaves/i);
  assert.match(steps[6].layer, /Coordination/);
  assert.equal(steps[7].id, 'git');
  assert.match(steps[7].title, /Git awareness/);
  assert.equal(steps[8].id, '7');
  assert.equal(steps[9].id, 'futures');
  assert.match(steps[9].title, /Rehearse the future/);
});

test('each step returns structured live results naming components', async () => {
  for (const id of ['primer', '1', '2', '3', '4', '5', '6', 'git', '7', 'futures']) {
    const out = await runTestDriveStep(id);
    assert.equal(out.ok, true);
    assert.equal(out.step.id === 'primer' ? 'primer' : out.step.id, id === '0' ? 'primer' : id);
    assert.ok(Array.isArray(out.step.lines));
    assert.ok(out.step.lines.length > 0);
    assert.ok(out.step.layer);
    assert.ok(out.step.component);
    assert.ok(typeof out.ms === 'number');
  }
  const primer = (await runTestDriveStep('primer')).step.lines.join('\n');
  assert.match(primer, /Generative possibility/);
});

test('the six live tests return a plain-language readout with bars', async () => {
  for (const id of LABS) {
    const { step } = await runTestDriveStep(id);
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

test('headline claims match what the machine returns', async () => {
  assert.equal((await runTestDriveStep('1')).step.readout.bars.treatment < (await runTestDriveStep('1')).step.readout.bars.baseline, true);
  const density = (await runTestDriveStep('7')).step.readout.bars;
  assert.ok(density.treatment > density.baseline * 5, 'density gain is large');
  const rhyme = (await runTestDriveStep('3')).step.readout;
  assert.match(rhyme.baselineValue, /^0 hits$/);
  const discovery = (await runTestDriveStep('4')).step.readout;
  assert.equal(discovery.bars.max, 100);
  assert.match(discovery.also, /fewer operations/);
});

test('Test Drive page explains each test and renders the results card', async () => {
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
  assert.match(page, /fractisi-td-walkthrough-done-v22/);
  assert.match(page, /Git awareness · cleaner merges/);
  assert.match(page, /#git/);
  assert.match(page, /portable cloud lab git/);
  assert.match(page, /fractisi-td-results-v22/);
  assert.doesNotMatch(page, /-v15/);
  assert.match(page, /More agents, same memory\./);
  assert.match(page, /class="step-nav/);
  assert.doesNotMatch(page, /class="bottom-nav/);
  const rail = page.slice(page.indexOf('progress-rail'), page.indexOf('progress-dots'));
  assert.match(rail, /btn-prev/);
  assert.match(rail, /btn-next/);
  assert.match(page, /Six live tests/);
  assert.match(page, /<b>Test 6<\/b>/);
  assert.match(page, /href="#futures"/);
});

test('speaker deck quotes the same numbers the tests return', async () => {
  const one = (await runTestDriveStep('1')).step.readout.bars;
  const density = (await runTestDriveStep('7')).step.readout;
  const rhyme = (await runTestDriveStep('3')).step.readout;
  assert.ok(deck.includes(one.baselineText), 'deck test 1 baseline');
  assert.ok(deck.includes(one.treatmentText), 'deck test 1 treatment');
  assert.ok(deck.includes((await runTestDriveStep('1')).step.readout.headlineValue), 'deck test 1 headline');
  assert.ok(deck.includes(density.headlineValue.replace(' more', '')), 'deck test 2 headline');
  assert.ok(deck.includes(String(density.bars.treatment)), 'deck test 2 capacity');
  assert.ok(deck.includes(rhyme.headlineValue), 'deck test 3 headline');
  assert.match(deck, /100 of 100/);
  assert.match(deck, /data-part="Test 6"/);
  assert.match(deck, /\+3\.6/);
});

test('coordination is reported honestly, never as a collision win', async () => {
  const { metrics } = (await runTestDriveStep('6')).step;
  assert.ok(metrics.n25.cConflicts > metrics.n25.aConflicts, 'premise: coordinated logs more conflicts at n=25');
  assert.match(page, /more conflicts than plain branching/);
  assert.doesNotMatch(page, /fewer (collisions|conflicts)/i);
  assert.doesNotMatch(deck, /fewer (collisions|conflicts)/i);
  assert.match(deck, /more conflicts than plain branching/);
});


test('git awareness lab reports fewer failed merges on portable engine', async () => {
  const { step } = await runTestDriveStep('git', { engine: 'portable' });
  assert.equal(step.metrics.component, 'git_awareness');
  assert.equal(step.metrics.conclusive, true);
  assert.equal(step.metrics.improved, true);
  assert.ok(step.metrics.conventionalFailedMerges > step.metrics.fractisiFailedMerges);
  assert.equal(step.metrics.fractisiFailedMerges, 0);
  assert.match(step.readout.beyondTheory, /well beyond theory/i);
  assert.match(step.readout.brag, /failed merges/);
  assert.match(step.lines.join('\n'), /GIT AWARENESS/);
  assert.match(String(step.metrics.engine || '') + step.lines.join('\n'), /portable/i);
});

test('prediction lab reports more useful work when imagination selects', async () => {
  const { step } = await runTestDriveStep('futures');
  assert.equal(step.metrics.component, 'predictive_shared_state');
  assert.equal(step.metrics.conclusive, true);
  assert.equal(step.metrics.improved, true);
  assert.equal(step.metrics.deltaUsefulSelect32, 1.4);
  assert.equal(step.metrics.deltaUsefulSelect100, 3.6);
  assert.match(step.readout.headlineValue, /\+3\.6/);
  assert.match(step.readout.brag, /\+1\.4/);
  assert.match(step.readout.beyondTheory, /well beyond theory/i);
});

test('invite recap and deck results board include six tests', () => {
  assert.match(page, /PINNED_BRAGS/);
  assert.match(page, /Results board/);
  assert.match(page, /100% fewer Git failed merges/);
  assert.match(page, /git: \{ headlineValue: '100\.0%'/);
  assert.match(page, /futures: \{ headlineValue: '\+3\.6'/);
  assert.match(deck, /Results board/);
  assert.match(deck, /\+3\.6 useful at 100 agents/);
  assert.match(deck, /data-part="Test 5"/);
  assert.match(deck, /data-part="Test 6"/);
  assert.match(deck, /2 failed merges/);
});

test('welcome shows six live tests and stack points at Test 6 next', () => {
  const ids = [...page.matchAll(/\{\n\s+id: '([^']+)'/g)].map((m) => m[1]);
  const start = ids.indexOf('story');
  const arc = ids.slice(start, ids.indexOf('invite') + 1);
  assert.deepEqual(arc, [
    'story',
    'welcome',
    'sandbox',
    'problem',
    'rhyme',
    '1',
    '7',
    '3',
    '4',
    'git',
    'how-stack',
    'futures',
    'invite',
  ]);
  const welcome = page.slice(page.indexOf("id: 'welcome'"), page.indexOf("id: 'sandbox'"));
  assert.match(welcome, /Six live tests/);
  assert.match(welcome, /<b>Test 6<\/b>/);
  assert.match(welcome, /#futures/);
  const stack = page.slice(page.indexOf("id: 'how-stack'"), page.indexOf("id: 'futures'"));
  assert.match(stack, /Five shared-world tests ran on the stack below/);
  assert.match(stack, /Prediction is the sixth live test/);
  assert.doesNotMatch(stack, /The four tests ran/);
  assert.doesNotMatch(page, /tests four of the five/);
  assert.match(page, /Step 1 of 13/);
  const futures = page.slice(page.indexOf("id: 'futures'"), page.indexOf("id: 'invite'"));
  assert.match(futures, /mode: 'lab'/);
});
