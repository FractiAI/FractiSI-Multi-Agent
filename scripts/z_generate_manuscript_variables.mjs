#!/usr/bin/env node
/** Thin orchestrator: write output/data/manuscript_variables.json and hydrate output/manuscript/. */
import { hydrateProject } from '../src/manuscript/pipeline.mjs';

const { tokens, sections, outDir } = hydrateProject();
console.log(`Resolved ${tokens} tokens into ${sections} files under ${outDir}`);
