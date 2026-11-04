#!/usr/bin/env node
/** Thin orchestrator: find every Node test and hand the list to the built-in runner. */
import { spawnSync } from 'node:child_process';
import { listFiles } from '../src/gates/files.mjs';
import { REPO_ROOT } from '../src/core/paths.mjs';

const files = listFiles(REPO_ROOT).filter((file) => file.startsWith('tests/') && file.endsWith('.test.mjs'));
const run = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...files], { cwd: REPO_ROOT, stdio: 'inherit' });
process.exitCode = run.status ?? 1;
