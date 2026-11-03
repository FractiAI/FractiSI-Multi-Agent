#!/usr/bin/env node
/**
 * Reference multi-session workload: shared system pattern vs duplicated.
 */
import { performance } from 'node:perf_hooks';

const SYSTEM = 'Tiny Footprint shared organizational pattern. Policy v1. '.repeat(8);
const sessions = 12;

function conventional() {
  const store = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    store.push({ system: SYSTEM, history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = store.reduce((n, x) => n + JSON.stringify(x).length, 0);
  return { mode: 'conventional', ms, bytes, sessions };
}

function tiny() {
  const shared = { system: SYSTEM };
  const deltas = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    deltas.push({ history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = JSON.stringify(shared).length + deltas.reduce((n, x) => n + JSON.stringify(x).length, 0);
  return { mode: 'tiny_footprint', ms, bytes, sessions };
}

const a = conventional();
const b = tiny();
const reduction = 1 - b.bytes / a.bytes;
console.log(JSON.stringify({ product: 'Tiny Footprint', demo: 'multi-session', conventional: a, tiny: b, byteReduction: reduction }, null, 2));
console.log(`[demo] byte reduction ${(reduction * 100).toFixed(1)}% · conventional ${a.bytes} B → tiny ${b.bytes} B`);
