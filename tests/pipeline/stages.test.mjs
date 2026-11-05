import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { REPO_ROOT } from '../../src/core/paths.mjs';
import { REBUILD_STAGES, STAGES, selectStages } from '../../src/pipeline/stages.mjs';

test('stages run in provenance order', () => {
  const names = STAGES.map((s) => s.name);
  const order = (a, b) => assert.ok(names.indexOf(a) < names.indexOf(b), `${a} before ${b}`);
  order('deterministic', 'analysis');
  order('measured', 'analysis');
  order('llm', 'analysis');
  order('analysis', 'figures');
  order('figures', 'hydrate');
  order('hydrate', 'render');
  order('render', 'validate');
  order('validate', 'verify');
});

test('every stage points at a script that exists', () => {
  for (const stage of STAGES) assert.ok(fs.existsSync(path.join(REPO_ROOT, stage.command[1])), stage.command[1]);
});

test('selection by rebuild, from and only', () => {
  assert.deepEqual(selectStages({ rebuild: true }).map((s) => s.name), [...REBUILD_STAGES]);
  assert.equal(selectStages({ from: 'figures' })[0].name, 'figures');
  assert.deepEqual(selectStages({ only: ['verify', 'suite'] }).map((s) => s.name), ['suite', 'verify']);
  assert.equal(selectStages().length, STAGES.length);
});

test('an unknown stage is refused', () => {
  assert.throws(() => selectStages({ from: 'nope' }), /unknown stage/);
  assert.throws(() => selectStages({ only: ['nope'] }), /unknown stages/);
});
