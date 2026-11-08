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

test('Test Drive opens on hero title case with prose and images', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(join(root, 'test-drive/index.html'), 'utf8');
  assert.match(page, /Let’s begin/);
  assert.match(page, /One shared world\. Many agents\./);
  assert.match(page, /Today we show you a better way/);
  assert.doesNotMatch(page, /decide whether FractiSI/);
  assert.doesNotMatch(page, /Training objective/);
  assert.doesNotMatch(page, /Failure mode A/);
  assert.match(page, /td-hero-visual/);
  assert.match(page, /teach-prose/);
  assert.match(page, /What’s broken/);
  assert.match(page, /fractisi-hero\.jpg/);
  assert.doesNotMatch(page, /Hold that light/);
});
