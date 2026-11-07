/**
 * Symposium / audience Test Drive — one command for IDE agents.
 * Local only: doctor → install → demo → benchmark → report.
 * No cloud token required.
 */
import { doctor } from './doctor.mjs';
import { install } from './install.mjs';
import { demo } from './demo.mjs';
import { benchmark } from './benchmark.mjs';
import { report } from './report.mjs';

const STEPS = [
  ['doctor', doctor],
  ['install', install],
  ['demo', demo],
  ['benchmark', benchmark],
  ['report', report],
];

/** @param {import('../context.mjs').createContext extends Function ? any : any} ctx */
export async function testdrive(ctx) {
  const { log } = ctx;
  log('test-drive · FractiSI Multi-Agent (local · no cloud token)');
  log('Read TEST_DRIVE.md if you are an IDE agent following audience instructions.');

  for (const [name, fn] of STEPS) {
    log(`── ${name} ──`);
    const code = (await fn(ctx)) ?? 0;
    if (code !== 0) {
      log(`test-drive stopped at ${name} (exit ${code})`);
      return code;
    }
  }

  log('test-drive complete');
  log('Optional next: node scripts/tiny.mjs try --workload --repo "$PWD"');
  log('Optional cloud preview (your token): export VERCEL_TOKEN=… && node scripts/tiny.mjs try');
  log('Learn more: https://fractisi.vercel.app/product/');
  return 0;
}
