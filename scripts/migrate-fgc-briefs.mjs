#!/usr/bin/env node
/** Wrap legacy FGC fragments into data-brief sections. Logic: src/newsroom/migrate-briefs.mjs */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrateBriefsTree } from '../src/newsroom/migrate-briefs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { changed, skipped, migrated } = migrateBriefsTree(ROOT);
for (const slug of skipped) console.log(`skip ${slug} (already structured)`);
for (const slug of migrated) console.log(`migrated ${slug}`);
console.log(`done · ${changed} fragments upgraded`);
