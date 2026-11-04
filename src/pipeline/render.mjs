/**
 * Render the hydrated manuscript through the template, then bind the PDF to what it
 * was rendered from. Hydration has already run as its own stage, so the template is
 * told not to repeat it.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { canonicalStringify, sha256File } from '../core/canonical-json.mjs';
import { PATHS } from '../core/paths.mjs';
import { TEMPLATE_PROJECT_NAME, deterministicEnv, resolveTemplate, templateCommit } from './template.mjs';

export const PDF_NAME = `${TEMPLATE_PROJECT_NAME}_combined.pdf`;

/** @param {{env?: NodeJS.ProcessEnv}} [options] */
export function renderManuscript({ env = process.env } = {}) {
  const template = resolveTemplate({ env });
  const run = spawnSync(
    template.python,
    ['scripts/pipeline/stage_03_render.py', '--project', template.project, '--skip-manuscript-hydration'],
    { cwd: template.root, stdio: 'inherit', env: deterministicEnv(env) },
  );
  if (run.status !== 0) throw new Error(`template render failed with status ${run.status}`);
  return writeRenderReceipt({ commit: templateCommit(template.root) });
}

/**
 * @param {object} options
 * @param {string} options.commit template commit
 * @param {string} [options.outputDir]
 */
export function writeRenderReceipt({ commit, outputDir = PATHS.output }) {
  const pdf = path.join(outputDir, 'pdf', PDF_NAME);
  const manifest = path.join(outputDir, 'manuscript', 'hydration_manifest.json');
  if (!fs.existsSync(pdf)) throw new Error(`render produced no PDF at ${pdf}`);
  const receipt = {
    schema: 'tiny-footprint-render/v1',
    pdf: path.posix.join('output', 'pdf', PDF_NAME),
    pdfSha256: sha256File(pdf),
    pdfBytes: fs.statSync(pdf).size,
    hydrationManifestSha256: sha256File(manifest),
    templateCommit: commit,
  };
  const out = path.join(outputDir, 'data', 'render_receipt.json');
  fs.writeFileSync(out, canonicalStringify(receipt));
  return receipt;
}
