import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  MUSICAL_TRAINING,
  SUNO_PLAYLIST_URL,
  musicalChapterCount,
  musicalChapters,
} from '../../src/testdrive/musical-training.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const page = readFileSync(join(root, 'test-drive/musical/index.html'), 'utf8');
const td = readFileSync(join(root, 'test-drive/index.html'), 'utf8');

test('musical training has 16 chapters across six parts', () => {
  assert.equal(musicalChapterCount(), 16);
  assert.equal(MUSICAL_TRAINING.parts.length, 6);
  assert.equal(musicalChapters()[0].title, 'The Syntheverse Sandbox');
  assert.equal(musicalChapters().at(-1).title, 'Exploring Goldilocks World');
});

test('Suno playlist is the locked Player 1 URL', () => {
  assert.equal(SUNO_PLAYLIST_URL, 'https://suno.com/s/QB8n2fLhy5NORPkV');
  assert.equal(MUSICAL_TRAINING.sunoPlaylistUrl, SUNO_PLAYLIST_URL);
  assert.match(page, /https:\/\/suno\.com\/s\/QB8n2fLhy5NORPkV/);
  assert.match(td, /https:\/\/suno\.com\/s\/QB8n2fLhy5NORPkV/);
});

test('musical page ships and crosswalks to live Test Drive', () => {
  assert.equal(existsSync(join(root, 'test-drive/musical/index.html')), true);
  assert.match(page, /Musical Training Program/);
  assert.match(page, /16 chapters/);
  assert.match(page, /Awareness/);
  assert.match(page, /Tiny Footprint/);
  assert.match(page, /\/test-drive\//);
  for (const ch of musicalChapters()) {
    assert.match(page, new RegExp(ch.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('live Test Drive points at the musical parallel path', () => {
  assert.match(td, /\/test-drive\/musical\//);
});
