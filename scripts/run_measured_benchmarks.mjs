#!/usr/bin/env node
/** Thin orchestrator: measure heap and latency on this machine, under output/data/measured/. */
import { loadPlan } from '../src/benchmarks/plan.mjs';
import { writeMeasuredReceipts } from '../src/benchmarks/runners.mjs';

const { plan, sha256 } = loadPlan();
const onProgress = (label, done, total) => {
  if (done === total || done % 100 === 0) console.error(`[${label}] ${done}/${total}`);
};
for (const file of writeMeasuredReceipts(plan, sha256, { onProgress })) console.log(file);
