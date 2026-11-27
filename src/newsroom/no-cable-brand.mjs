/**
 * Fractal Goldilocks Channel (FGC) — brand-name lock.
 *
 * Player 1: wire-service Yes/No voice only. Never name the cable network brand
 * in FGC surfaces (content/blog, blog/, src/newsroom, css/).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

/** Cable-network brand spelled without a contiguous literal in source. */
export const CABLE_BRAND = String.fromCharCode(67, 78, 66, 67);

export const CABLE_BRAND_RE = new RegExp(CABLE_BRAND, 'i');

/** UTF-8 text trees scanned for the brand name. */
export const CABLE_BRAND_SCAN_ROOTS = Object.freeze([
  'content/blog',
  'blog',
  'src/newsroom',
  'css',
]);

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

/**
 * Return repo-relative paths under the FGC scan roots that contain the brand.
 * @param {string} [root]
 * @returns {string[]}
 */
export function findCableBrandHits(root = REPO_ROOT) {
  const hits = [];
  for (const rel of CABLE_BRAND_SCAN_ROOTS) {
    const abs = join(root, rel);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    for (const file of walk(abs)) {
      const text = readFileSync(file, 'utf8');
      if (CABLE_BRAND_RE.test(text)) hits.push(relative(root, file));
    }
  }
  return hits;
}
