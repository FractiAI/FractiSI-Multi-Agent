#!/usr/bin/env node
/**
 * Thin orchestrator: `npm run research`. Runs the registered suite on this machine
 * and writes under output/data/suite/. The receipts in this directory's data/ are
 * the historical record and are never overwritten.
 */
import { runSuitePipeline } from '../../../src/pipeline/suite.mjs';

process.exitCode = runSuitePipeline();
