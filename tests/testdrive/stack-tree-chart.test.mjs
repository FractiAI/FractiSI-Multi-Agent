import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  STACK_TREE_CHART,
  stackTreeChartFigureHtml,
} from '../../src/testdrive/stack-tree-chart.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('stack tree chart ships plate, SVG, and heritage assets', () => {
  for (const rel of [
    'media/fractisi-multi-agent-stack-tree.jpg',
    'media/fractisi-multi-agent-stack-tree.svg',
    'media/infinite-octave-hero-source-tree.jpg',
  ]) {
    assert.equal(existsSync(join(root, rel)), true, rel);
  }
});

test('trunk ladder matches latest named surfaces', () => {
  const t = STACK_TREE_CHART.trunkBottomToTop.join(' | ').toLowerCase();
  for (const needle of [
    'base mainnet',
    'syntheverse sandbox',
    'net zero',
    'balanced zero',
    'infinite octaves',
    'holographic rhyme',
    'rhyming templates',
    'tiny gateway',
    'tiny footprint',
    'coordination',
    'shared state',
    'composition',
    'git awareness',
    'deploy',
  ]) {
    assert.match(t, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.equal(STACK_TREE_CHART.trunkBottomToTop.length, 10);
  assert.equal(STACK_TREE_CHART.crown, 'FractiSI Multi-Agent');
});

test('figure HTML embeds plate and ladder', () => {
  const html = stackTreeChartFigureHtml();
  assert.match(html, /fractisi-multi-agent-stack-tree\.jpg/);
  assert.match(html, /stack-tree-ladder/);
  assert.match(html, /Tiny Footprint/);
});

test('Test Drive how-stack references the updated tree', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(join(root, 'test-drive/index.html'), 'utf8');
  assert.match(page, /fractisi-multi-agent-stack-tree\.jpg/);
  assert.match(page, /how-stack/);
  assert.match(page, /infinite-octave-hero-source-tree\.jpg/);
});

test('Test Drive opens on the hero title and introduces the case', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(join(root, 'test-drive/index.html'), 'utf8');
  assert.match(page, /<h1>One shared world\. Four live tests\.<\/h1>/);
  assert.match(page, /\/css\/site\.css\?v=35/);
  assert.match(page, /Session title: The Multi-Agent World Inference Rhyme\?/);
  assert.match(page, /Let’s begin/);
  assert.match(page, /Applied Active Inference Symposium/);
  assert.match(page, /When many agents share one world, does the way they organize it rhyme\?/);
  assert.match(page, /I work as a restroom valet/);
  assert.match(page, /Syntheverse Sandbox/);
  assert.match(page, /Base Mainnet/);
  assert.doesNotMatch(page, /decide whether FractiSI/);
  assert.doesNotMatch(page, /Training objective/);
  assert.doesNotMatch(page, /Failure mode A/);
  assert.doesNotMatch(page, /Layer [A-F]\b/);
  assert.doesNotMatch(page, new RegExp(['Here is the', 'question'].join(' '), 'i'));
  const markup = page.slice(page.indexOf('<body>'), page.indexOf('<script'));
  const steps = page.slice(page.indexOf('const STEPS'), page.indexOf('const ORDER'));
  const copy = (markup + steps).replace(/<[^>]*>/g, ' ');
  assert.doesNotMatch(copy, /[A-Za-z]!/, 'no exclamation marks in page copy');
  assert.doesNotMatch(copy, /\p{Extended_Pictographic}/u, 'no emoji in page copy');
});

test('Net Zero is defined before the rhyme gate and invitations are present', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(join(root, 'test-drive/index.html'), 'utf8');
  const nz = page.indexOf('Balanced zero, not nothing zero.');
  const gate = page.indexOf('<h3>Repeating</h3>');
  assert.ok(nz > 0 && gate > nz, 'Net Zero must precede the four pillars');
  for (const needle of ['valetpru@gmail.com', '/expedition-002/', '/pricing/', 'Join the beta', 'Get the kit']) {
    assert.ok(page.includes(needle), needle);
  }
  assert.doesNotMatch(page, /What’s broken/);
});

test('Test Drive futures beat covers Predictive Shared State results', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(join(root, 'test-drive/index.html'), 'utf8');
  assert.match(page, /id: 'futures'/);
  assert.match(page, /Rehearse the future\. Change the world on approval\./);
  assert.match(page, /About 99% less at 100 agents|about 99% less at 100 agents/);
  assert.match(page, /never more than 5% behind/i);
  assert.match(page, /chose who goes first/);
  assert.match(page, /\+1\.4/);
  assert.match(page, /\+3\.6/);
  assert.match(page, /cannot overwrite the real world/i);
  assert.match(page, /not a claim that we wrapped Cosmos/i);
});
