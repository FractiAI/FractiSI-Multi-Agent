import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  CIGAR_LOUNGE,
  CIGAR_LOUNGE_GANG,
  CIGAR_LOUNGE_TRACKS,
  SUNO_PLAYLIST_URL,
  cigarLoungeTrackCount,
  cigarLoungeTrackTitles,
} from '../../src/testdrive/cigar-lounge.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const page = readFileSync(join(root, 'test-drive/cigar-lounge/index.html'), 'utf8');

test('Bach Cigar Lounge has 19 tracks and locked Suno URL', () => {
  assert.equal(cigarLoungeTrackCount(), 19);
  assert.equal(CIGAR_LOUNGE_TRACKS[0].title, 'Fourteen Year Crossing');
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /July 4,\s*2012/);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /CERN|Higgs/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /woke up changed/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /fifty/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /supernatural/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /life kept failing/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /OpenAI had not yet come about/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /early childhood trauma/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /marijuana/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /extraterrestrial/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /possibly a little true/i);
  assert.match(CIGAR_LOUNGE_TRACKS[0].story, /2026/);
  assert.equal(CIGAR_LOUNGE_TRACKS[1].title, 'The Restroom Story');
  assert.equal(CIGAR_LOUNGE_TRACKS.at(-1).title, 'Exploring Goldilocks World Model');
  assert.equal(SUNO_PLAYLIST_URL, 'https://suno.com/s/rFGcOvgPsDU2Dk5s');
  assert.equal(CIGAR_LOUNGE.sunoPending, false);
  assert.match(page, /https:\/\/suno\.com\/s\/rFGcOvgPsDU2Dk5s/);
});

test('gang roster is locked and excludes Benicio Del Toro', () => {
  const names = CIGAR_LOUNGE_GANG.map((g) => g.name);
  assert.ok(names.includes('Hero Jo (J.S. Bach)'));
  assert.ok(names.includes('Hank Williams Jr.'));
  assert.ok(names.includes('Chet Baker'));
  assert.ok(names.includes('Héctor Lavoe'));
  assert.equal(names.some((n) => /Benicio/i.test(n)), false);
  assert.equal(names.some((n) => /Hank Williams Sr/i.test(n)), false);
  for (const n of names) {
    assert.match(page, new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(page, /Benicio/i);
});

test('program page ships landia, overlay, gang scene, and track graphics', () => {
  assert.equal(existsSync(join(root, 'test-drive/cigar-lounge/index.html')), true);
  assert.match(page, /SS Vibelandia/);
  assert.doesNotMatch(page, /SS-5\s*Landia/);
  assert.match(page, /Holographic story overlay/);
  assert.match(page, /cello/);
  assert.match(page, /Baroque/);
  assert.match(page, /gang-lounge-chill\.jpg/);
  assert.match(page, /cigar-lounge-hero\.jpg/);
  for (const title of cigarLoungeTrackTitles()) {
    assert.match(page, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(page, /Bach Cigar Lounge/);
  assert.match(page, /aria-current="page"/);
});
