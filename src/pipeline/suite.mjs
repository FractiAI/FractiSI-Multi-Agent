/**
 * The suite pipeline behind `npm run research`. It writes under output/data/suite/,
 * leaving the historical receipts in research/.../data untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canonicalStringify } from '../core/canonical-json.mjs';
import { PATHS } from '../core/paths.mjs';
import { describeHost } from '../benchmarks/host.mjs';
import { renderSuiteReport } from '../reporting/suite-report.mjs';
import { DOC_ID, ENGINE_SHELF_SLOT, REGISTRY_ID, STUDY_TITLE } from '../experiments/constants.mjs';
import { runAllExperiments } from '../experiments/suite.mjs';

/** @param {{outDir?: string, labs?: object, log?: (message: string) => void}} [options] */
export function runSuitePipeline({ outDir = path.join(PATHS.outputData, 'suite'), labs, log = console.log } = {}) {
  log(`[tiny-gateway-rhyming] ${STUDY_TITLE}`);
  const results = runAllExperiments(labs ? { labs } : {});
  const report = {
    schema: 'synthobs-tiny-gateway-rhyming-templates/v2',
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    host: describeHost(),
    results,
  };
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'empirical_report.json'), canonicalStringify(report));
  fs.writeFileSync(path.join(outDir, 'empirical_report.md'), renderSuiteReport(report));
  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    canonicalStringify({
      verdict: results.verdict,
      n_pass: results.n_pass,
      n_fail: results.n_fail,
      n_not_run: results.n_not_run,
      n_total: results.n_total,
      aggregateReduction: results.H.aggregateRatio,
      enginePinRecommended: results.enginePinRecommended,
      engineShelfSlot: ENGINE_SHELF_SLOT,
    }),
  );
  log(`[tiny-gateway-rhyming] ${results.n_pass} pass · ${results.n_fail} fail · ${results.n_not_run} not run`);
  log(`[tiny-gateway-rhyming] aggregate reduction ${(results.H.aggregateRatio * 100).toFixed(1)}% pin=${results.enginePinRecommended}`);
  log(`[tiny-gateway-rhyming] ${results.H.interpretation}`);
  for (const key of ['B', 'C', 'D', 'E', 'F']) log(`  ${key}: ${(results[key].ratio * 100).toFixed(1)}%`);
  return results.n_fail > 0 ? 1 : 0;
}
