/**
 * Player 1 lock: FGC keeps wire-service voice and never names the cable network brand.
 * Scans content/blog, blog/, src/newsroom, and css/ as UTF-8 text.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CABLE_BRAND = String.fromCharCode(67, 78, 66, 67); // C N B C
const BRAND_RE = new RegExp(CABLE_BRAND, 'i');
const SCAN_ROOTS = ['content/blog', 'blog', 'src/newsroom', 'css'];
const TEXT_EXT = new Set(['.md', '.html', '.mjs', '.js', '.css', '.json', '.txt']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* walk(full);
      continue;
    }
    const ext = name.includes('.') ? `.${name.split('.').pop()}` : '';
    if (!TEXT_EXT.has(ext)) continue;
    yield full;
  }
}

test('FGC surfaces never name the cable network brand', () => {
  const hits = [];
  for (const root of SCAN_ROOTS) {
    const abs = join(ROOT, root);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    for (const file of walk(abs)) {
      const text = readFileSync(file, 'utf8');
      if (BRAND_RE.test(text)) hits.push(relative(ROOT, file));
    }
  }
  assert.deepEqual(hits, [], `brand name found in: ${hits.join(', ')}`);
});
