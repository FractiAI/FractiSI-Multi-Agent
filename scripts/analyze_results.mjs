#!/usr/bin/env node
/** Thin orchestrator: reduce all receipts to output/data/analysis_summary.json. */
import fs from 'node:fs';
import path from 'node:path';
import { buildAnalysisSummary } from '../src/analysis/summary.mjs';
import { loadPlan } from '../src/benchmarks/plan.mjs';
import { canonicalStringify } from '../src/core/canonical-json.mjs';
import { PATHS } from '../src/core/paths.mjs';

const { plan } = loadPlan();
const out = path.join(PATHS.outputData, 'analysis_summary.json');
fs.writeFileSync(out, canonicalStringify(buildAnalysisSummary(plan)));
console.log(out);
