#!/usr/bin/env node
/** Thin orchestrator: render the hydrated manuscript through the template and write the render receipt. */
import { renderManuscript } from '../src/pipeline/render.mjs';

try {
  const receipt = renderManuscript();
  console.log(`Rendered ${receipt.pdf} (${receipt.pdfBytes} bytes), template ${receipt.templateCommit}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
