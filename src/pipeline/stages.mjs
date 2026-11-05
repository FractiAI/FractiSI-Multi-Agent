/**
 * The pipeline DAG, in provenance order: plan and source, receipts, analysis, figures,
 * hydration, render, template validation, verification. Each stage is one thin script, so any stage can be
 * run alone. Stages list what they need; they are never skipped silently.
 */
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

const venvPython = path.join(REPO_ROOT, '.venv', 'bin', 'python');
const RENDER_TOOLS = Object.freeze(['pandoc', 'pandoc-crossref', 'xelatex']);

export const STAGES = Object.freeze([
  { name: 'deterministic', command: [process.execPath, 'scripts/run_deterministic_benchmarks.mjs'], tier: 'deterministic' },
  { name: 'simulation', command: [venvPython, 'scripts/h100_prefix_cache_sim.py'], tier: 'simulated' },
  { name: 'suite', command: [process.execPath, 'scripts/run_suite.mjs'], tier: 'measured' },
  { name: 'measured', command: [process.execPath, 'scripts/run_measured_benchmarks.mjs'], tier: 'measured' },
  { name: 'llm', command: [venvPython, 'scripts/run_llm_matrix.py'], tier: 'measured', needs: 'uv sync --group llm', imports: ['torch', 'transformers'] },
  { name: 'analysis', command: [process.execPath, 'scripts/analyze_results.mjs'], tier: 'analysis' },
  { name: 'figures', command: [venvPython, 'scripts/generate_figures.py'], tier: 'analysis', needs: 'uv sync --group figures', imports: ['matplotlib'] },
  { name: 'hydrate', command: [process.execPath, 'scripts/z_generate_manuscript_variables.mjs'], tier: 'manuscript' },
  { name: 'docs', command: [process.execPath, 'scripts/generate_results_doc.mjs'], tier: 'manuscript' },
  { name: 'render', command: [process.execPath, 'scripts/render_manuscript.mjs'], tier: 'manuscript', needs: 'TINY_TEMPLATE_ROOT', tools: RENDER_TOOLS },
  { name: 'validate', command: [process.execPath, 'scripts/validate_render.mjs'], tier: 'verification', needs: 'TINY_TEMPLATE_ROOT' },
  { name: 'verify', command: [process.execPath, 'scripts/verify_project.mjs'], tier: 'verification' },
]);

/** Stages that re-derive everything from the receipts already on disk. */
export const REBUILD_STAGES = Object.freeze(['analysis', 'figures', 'hydrate', 'docs', 'render', 'validate', 'verify']);

/**
 * @param {{from?: string, only?: string[], rebuild?: boolean}} [selection]
 * @returns {typeof STAGES}
 */
export function selectStages({ from, only, rebuild = false } = {}) {
  if (rebuild) return STAGES.filter((stage) => REBUILD_STAGES.includes(stage.name));
  if (only) {
    const unknown = only.filter((name) => !STAGES.some((stage) => stage.name === name));
    if (unknown.length > 0) throw new Error(`unknown stages: ${unknown.join(', ')}`);
    return STAGES.filter((stage) => only.includes(stage.name));
  }
  if (from) {
    const start = STAGES.findIndex((stage) => stage.name === from);
    if (start === -1) throw new Error(`unknown stage: ${from}`);
    return STAGES.slice(start);
  }
  return STAGES;
}
