#!/usr/bin/env node
/** Thin orchestrator: check the whole provenance chain and print each result. */
import { allPassed, verifyProject } from '../src/verification/project.mjs';

const results = verifyProject({ requireRender: !process.argv.includes('--before-render') });
for (const { name, ok, detail } of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `: ${detail}` : ''}`);
process.exitCode = allPassed(results) ? 0 : 1;
