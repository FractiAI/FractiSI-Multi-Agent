/**
 * The benchmark plan is the contract: every grid, trial count and seed comes from
 * `benchmarks/plan.json`, and a malformed plan stops the run instead of silently
 * falling back to defaults.
 */
import fs from 'node:fs';
import { PATHS } from '../core/paths.mjs';
import { sha256 } from '../core/canonical-json.mjs';

export const PLAN_SCHEMA = 'tiny-footprint-benchmark-plan/v1';

/** @param {unknown} plan */
export function validatePlan(plan) {
  const problems = [];
  const need = (condition, message) => {
    if (!condition) problems.push(message);
  };
  need(plan?.schema === PLAN_SCHEMA, `schema must be ${PLAN_SCHEMA}`);
  for (const seed of ['primary', 'validation', 'orderShuffle', 'bootstrap']) {
    need(Number.isInteger(plan?.seeds?.[seed]), `seeds.${seed} must be an integer`);
  }
  const scaling = plan?.deterministic?.scaling;
  need(positiveInts(scaling?.sessions), 'deterministic.scaling.sessions must be positive integers');
  need(positiveInts(scaling?.turns), 'deterministic.scaling.turns must be positive integers');
  need(
    Array.isArray(plan?.deterministic?.crossover?.duplicateFractions) &&
      plan.deterministic.crossover.duplicateFractions.every((p) => p >= 0 && p <= 1),
    'deterministic.crossover.duplicateFractions must lie in [0, 1]',
  );
  const heap = plan?.measured?.heap;
  need(positiveInts(heap?.sessions), 'measured.heap.sessions must be positive integers');
  need(Number.isInteger(heap?.trials) && heap.trials >= 3, 'measured.heap.trials must be at least 3');
  need(Number.isInteger(plan?.measured?.latency?.processes) && plan.measured.latency.processes >= 3,
    'measured.latency.processes must be at least 3');
  if (problems.length > 0) throw new Error(`invalid benchmark plan:\n- ${problems.join('\n- ')}`);
  return plan;
}

/** @param {string} [planPath] */
/**
 * The receipt name of one real-model run. `run_slug` in `src/tiny_footprint_labs/llm/matrix.py`
 * computes the same name when the run writes its receipt.
 *
 * @param {{model: string, backend: string}} run
 */
export function llmRunSlug(run) {
  return `${run.model}-${run.backend}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function loadPlan(planPath = PATHS.plan) {
  const text = fs.readFileSync(planPath, 'utf8');
  return { plan: validatePlan(JSON.parse(text)), sha256: sha256(text) };
}

function positiveInts(values) {
  return Array.isArray(values) && values.length > 0 && values.every((v) => Number.isInteger(v) && v > 0);
}
