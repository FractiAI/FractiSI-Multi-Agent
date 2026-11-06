import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createStore } from '../../src/platform/store.mjs';

test('store persists and restores agents', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-store-'));
  const file = path.join(dir, 'state.json');
  const store = createStore({ path: file, autoPersist: true });
  store.state.agents.set('a1', { id: 'a1', name: 'alpha' });
  store.emit('test', { ok: true });
  store.persist();
  const store2 = createStore({ path: file });
  assert.equal(store2.restore(), true);
  assert.equal(store2.state.agents.get('a1').name, 'alpha');
});
