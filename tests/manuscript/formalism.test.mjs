import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { FORMALISM_LEDGER_NAME, buildFormalismLedger, writeFormalismLedger } from '../../src/manuscript/formalism.mjs';

function manuscript(sections) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-formal-'));
  for (const [name, text] of Object.entries(sections)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

test('every formal block becomes a fact bound to the file that defines it', () => {
  const dir = manuscript({ '02_formalism.md': '::: {.definition #def:reduction}\nx\n:::\n\n::: {.proposition #prop:saturation}\ny\n:::\n' });
  assert.deepEqual(buildFormalismLedger(dir).claims, [
    { id: 'def:reduction', kind: 'citation', value: 'def:reduction', source_path: 'docs/manuscript/02_formalism.md' },
    { id: 'prop:saturation', kind: 'citation', value: 'prop:saturation', source_path: 'docs/manuscript/02_formalism.md' },
  ]);
});

test('negative control: a reference alone never registers a statement', () => {
  const dir = manuscript({ '04_results.md': 'As [@prop:missing] shows.\n\n::: {.note #note:other}\nz\n:::\n' });
  assert.deepEqual(buildFormalismLedger(dir).claims, []);
});

test('the file name stays readable by the registry, which needs both words', () => {
  assert.match(FORMALISM_LEDGER_NAME, /claim/);
  assert.match(FORMALISM_LEDGER_NAME, /ledger/);
  assert.match(FORMALISM_LEDGER_NAME, /\.json$/);
});

test('the authored manuscript defines the proposition its sections cite', () => {
  const labels = buildFormalismLedger().claims.map((claim) => claim.value);
  assert.ok(labels.includes('prop:saturation'));
  for (const claim of buildFormalismLedger().claims) assert.ok(fs.existsSync(claim.source_path), claim.source_path);
});

test('writing reports the count and leaves canonical JSON', () => {
  const source = manuscript({ 'a.md': '::: {.theorem #thm:one}\nx\n:::\n' });
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-formal-data-'));
  assert.equal(writeFormalismLedger(data, source), 1);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(data, FORMALISM_LEDGER_NAME), 'utf8')).claims[0].value, 'thm:one');
});
