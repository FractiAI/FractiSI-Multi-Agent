/** Verify the kit is present and ready. */
import fs from 'node:fs';
import { PATHS } from '../../core/paths.mjs';

export function install(ctx) {
  const { log, config, reports } = ctx;
  log('install · verifying kit');
  if (!fs.existsSync(config.suite)) {
    log(`ERROR: research suite missing at ${config.suite}`);
    return 1;
  }
  fs.mkdirSync(reports, { recursive: true });
  if (fs.existsSync(PATHS.packageJson)) log('package.json OK — Community Edition needs no license key');
  log('Next: node scripts/tiny.mjs demo');
  log('Join industry testing: node scripts/tiny.mjs join');
  return 0;
}
