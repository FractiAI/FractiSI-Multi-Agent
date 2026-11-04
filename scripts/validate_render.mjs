#!/usr/bin/env node
/** Thin orchestrator: run the template's output validator over the rendered project. */
import { validateRender } from '../src/pipeline/validate.mjs';

try {
  const { project } = validateRender();
  console.log(`Template validation passed for ${project}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
