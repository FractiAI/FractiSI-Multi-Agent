#!/usr/bin/env node
/** Thin orchestrator: run one measurement in this fresh process and print its JSON. */
import { measureControl, measureHeap } from '../src/benchmarks/measured/heap-measure.mjs';
import { measureLatency } from '../src/benchmarks/measured/latency-measure.mjs';
import { measureRss } from '../src/benchmarks/measured/rss-measure.mjs';

const spec = JSON.parse(process.argv[2]);
const run = { heap: measureHeap, control: measureControl, latency: measureLatency, rss: measureRss }[spec.kind];
if (!run) throw new Error(`unknown measurement kind: ${spec.kind}`);
console.log(JSON.stringify(run(spec)));
