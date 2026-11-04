#!/usr/bin/env node
/** Thin orchestrator: run the reference multi-session workload. */
import { runMultiSessionDemo } from '../../src/workloads/multi-session.mjs';

const result = runMultiSessionDemo();
console.log(JSON.stringify(result, null, 2));
console.log(
  `[demo] byte reduction ${(result.byteReduction * 100).toFixed(1)}% · conventional ${result.conventional.bytes} B → tiny ${result.tiny.bytes} B`,
);
