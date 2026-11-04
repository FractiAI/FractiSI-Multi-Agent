#!/usr/bin/env node
/** Thin orchestrator: run the registered suite on this host, writing output/data/suite/. */
import { runSuitePipeline } from '../src/pipeline/suite.mjs';

process.exitCode = runSuitePipeline();
