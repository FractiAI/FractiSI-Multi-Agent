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
import { init } from './commands/init.mjs';
import { status } from './commands/status.mjs';
import { agents } from './commands/agents.mjs';
import { compose } from './commands/compose.mjs';
import { coordBench } from './commands/coord-bench.mjs';
import { tryPlatform } from './commands/try.mjs';
import { deploy } from './commands/deploy.mjs';
import { propose } from './commands/propose.mjs';
import { repo } from './commands/repo.mjs';
import { capture } from './commands/capture.mjs';
import { createContext } from './context.mjs';

export const COMMANDS = Object.freeze({
  doctor, install, demo, benchmark, report, integrate, join, share,
  init, status, agents, compose, 'coord-bench': coordBench,
  try: tryPlatform, deploy, propose, repo, capture,
});

/** @param {string[]} [argv] */
export async function main(argv = process.argv) {
  const name = argv[2] || 'doctor';
  const command = COMMANDS[name];
  if (!command) {
    console.error(`Unknown command: ${name}`);
    console.error('Commands: doctor | install | init | try | capture | status | agents | propose | compose | repo | deploy | demo | benchmark | coord-bench | report | integrate | join | share');
    return 1;
  }
  return (await command(createContext({ argv }))) ?? 0;
}
