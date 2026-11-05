#!/usr/bin/env node
/** Thin orchestrator: rewrite docs/web/*.html for offline viewing. */
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from '../src/core/paths.mjs';
import { localizeHtml } from '../src/docs_tools/localize-web.mjs';

for (const file of fs.readdirSync(PATHS.webDocs).filter((name) => name.endsWith('.html'))) {
  const target = path.join(PATHS.webDocs, file);
  fs.writeFileSync(target, localizeHtml(fs.readFileSync(target, 'utf8')), 'utf8');
  console.log('localized', file);
}
