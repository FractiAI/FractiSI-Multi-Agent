import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadProductConfig, readOptionalJson } from '../../src/core/config.mjs';
import { PATHS } from '../../src/core/paths.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tf-config-'));

test('the shipped configuration loads and resolves the suite', () => {
  const config = loadProductConfig();
  assert.equal(config.configOk, true);
  assert.equal(config.product, 'Tiny Footprint');
  assert.equal(path.resolve(config.suite), PATHS.suite);
  assert.equal(config.version, JSON.parse(fs.readFileSync(PATHS.packageJson, 'utf8')).version);
});

test('absent configuration falls back to documented defaults and says so', () => {
  const config = loadProductConfig({ configPath: path.join(tmp(), 'absent.json') });
  assert.equal(config.configOk, false);
  assert.equal(config.edition, 'community');
  assert.equal(config.honesty.localGpuNotHbm, false);
});

test('readOptionalJson returns an empty object for a malformed file', () => {
  const file = path.join(tmp(), 'bad.json');
  fs.writeFileSync(file, '{not json');
  assert.deepEqual(readOptionalJson(file), {});
});

test('a configured suite path resolves relative to the configuration', () => {
  const dir = tmp();
  const configPath = path.join(dir, 'c.json');
  fs.writeFileSync(configPath, JSON.stringify({ benchmark: { suiteRelative: '../elsewhere', forceLlmLab: true } }));
  const config = loadProductConfig({ configPath });
  assert.equal(config.suite, path.resolve(dir, '../elsewhere'));
  assert.equal(config.forceLlmLabDefault, true);
});
