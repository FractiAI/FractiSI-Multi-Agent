#!/usr/bin/env node
/** Thin orchestrator: write the byte-stable receipts under output/data/deterministic/. */
import { loadPlan } from '../src/benchmarks/plan.mjs';
import { writeDeterministicReceipts } from '../src/benchmarks/runners.mjs';

const { plan, sha256 } = loadPlan();
for (const file of writeDeterministicReceipts(plan, sha256)) console.log(file);
