#!/usr/bin/env node
/** Thin orchestrator: run the reference multi-session workload. */
import { demoPassed, demoSummaryLines, runMultiSessionDemo } from '../../src/workloads/multi-session.mjs';

const result = runMultiSessionDemo();
console.log(JSON.stringify(result, null, 2));
for (const line of demoSummaryLines(result)) console.log(line);
if (!demoPassed(result)) process.exitCode = 1;
