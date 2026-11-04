#!/usr/bin/env node
/**
 * Thin orchestrator: run the pipeline. With no flags, all stages in order.
 *   --rebuild          re-derive everything downstream of the receipts on disk
 *   --from <stage>     start at a stage
 *   --only <a,b>       run only the named stages
 */
import { preflight, runStages } from '../src/pipeline/runner.mjs';
import { selectStages } from '../src/pipeline/stages.mjs';

const args = process.argv.slice(2);
const valueOf = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const stages = selectStages({ rebuild: args.includes('--rebuild'), from: valueOf('--from'), only: valueOf('--only')?.split(',') });
const problems = preflight(stages);
if (problems.length > 0) {
  console.error('Nothing was run. These stages need:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
const { ok, outcomes } = runStages(stages);
for (const { name, status, seconds } of outcomes) console.log(`${name.padEnd(14)} status ${status}  ${seconds.toFixed(1)}s`);
process.exitCode = ok ? 0 : 1;
