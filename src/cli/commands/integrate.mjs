/** Show the versioned adapters; integration never replaces the customer's stack. */
import fs from 'node:fs';
import { PATHS } from '../../core/paths.mjs';

export function integrate(ctx) {
  if (fs.existsSync(PATHS.adaptersGuide)) console.log(fs.readFileSync(PATHS.adaptersGuide, 'utf8'));
  ctx.log('Integrate via defined adapters — do not replace the customer AI stack.');
  return 0;
}
