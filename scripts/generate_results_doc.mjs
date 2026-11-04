#!/usr/bin/env node
/** Thin orchestrator: write docs/benchmarks/RESULTS.md and the README's evidence block. */
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, repoPath } from '../src/core/paths.mjs';
import { renderEvidenceBlock, renderResultsDoc, replaceEvidenceBlock } from '../src/reporting/results-doc.mjs';

const summary = JSON.parse(fs.readFileSync(path.join(PATHS.outputData, 'analysis_summary.json'), 'utf8'));
const out = repoPath('docs', 'benchmarks', 'RESULTS.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, renderResultsDoc(summary));
const readme = repoPath('README.md');
fs.writeFileSync(readme, replaceEvidenceBlock(fs.readFileSync(readme, 'utf8'), renderEvidenceBlock(summary)));
console.log(out);
