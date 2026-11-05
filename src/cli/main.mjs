/**
 * Tiny Footprint Workstation CLI dispatch.
 *
 * Share (opt-in) emails results to the validation desk (mailto, or SMTP if
 * configured). Join sends contact details; benchmark receipts are read only when
 * the participant selects share.
 */
import { benchmark } from './commands/benchmark.mjs';
import { demo } from './commands/demo.mjs';
import { doctor } from './commands/doctor.mjs';
import { install } from './commands/install.mjs';
import { integrate } from './commands/integrate.mjs';
import { join } from './commands/join.mjs';
import { report } from './commands/report.mjs';
import { share } from './commands/share.mjs';
import { createContext } from './context.mjs';

export const COMMANDS = Object.freeze({ doctor, install, demo, benchmark, report, integrate, join, share });

/** @param {string[]} [argv] */
export async function main(argv = process.argv) {
  const name = argv[2] || 'doctor';
  const command = COMMANDS[name];
  if (!command) {
    console.error(`Unknown command: ${name}`);
    console.error('Commands: doctor | install | demo | benchmark [--full] | report [--share] | integrate | join | share');
    return 1;
  }
  return (await command(createContext({ argv }))) ?? 0;
}
