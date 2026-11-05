import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PAPER_COPIES, checkResearchPaper, lostCharacterLines } from '../../src/gates/research-paper.mjs';

function tree(first, second = first, scripts = { research: 'x' }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-paper-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts }));
  for (const [file, text] of [[PAPER_COPIES[0], first], [PAPER_COPIES[1], second]]) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkResearchPaper().problems, []);
});

test('a question that ends in a question mark is not a lost character', () => {
  assert.deepEqual(lostCharacterLines('Does it hold? Yes.\nDoes it hold?\n(Really?)'), []);
});

test('negative control: a lost character inside a word, between words or in a table cell is found', () => {
  assert.deepEqual(lostCharacterLines("today?s\nfine\nA ? B\n| x | ? |\n? start"), [1, 3, 4, 5]);
  assert.match(checkResearchPaper(tree('B?F')).problems[0], /:1: a character was lost/);
});

test('negative control: copies that differ fail', () => {
  assert.match(checkResearchPaper(tree('one', 'two')).problems[0], /differ/);
});

test('negative control: a command the package does not define fails, and one it defines passes', () => {
  assert.deepEqual(checkResearchPaper(tree('Reproduce: `npm run research`')).problems, []);
  assert.match(checkResearchPaper(tree('Reproduce: `npm run missing`')).problems[0], /npm run missing/);
});
