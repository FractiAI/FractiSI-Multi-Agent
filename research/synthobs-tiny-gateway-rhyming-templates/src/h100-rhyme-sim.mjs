/**
 * Load / validate the H100 rhyme-vs-prefix residency simulation receipt.
 * Simulation only — not a live H100 measurement.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'h100_prefix_cache_sim.py');
const OUT = path.join(ROOT, 'data', 'h100_prefix_cache_sim.json');

/** Must match scripts/h100_prefix_cache_sim.py and rhyme-vs-cache encode (121/198). */
export const RHYME_SHARED_ORG_FRACTION = 1 - 121 / 198;

export function readH100RhymeSimReceipt() {
  if (!fs.existsSync(OUT)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
}

export function runH100RhymeSim({ force = false } = {}) {
  const cached = readH100RhymeSimReceipt();
  if (!force && cached?.ok && cached?.workloads?.rhymingDifferentWording) {
    return { ...cached, liveRun: false, cached: true };
  }
  const py = process.env.TINY_FOOTPRINT_PYTHON || 'python3';
  const r = spawnSync(py, [SCRIPT], { encoding: 'utf8', timeout: 30_000 });
  const report = readH100RhymeSimReceipt();
  if (report?.ok) {
    return { ...report, liveRun: true, status: r.status };
  }
  return {
    ok: false,
    error: r.error?.message || r.stderr || 'h100_rhyme_sim_failed',
    status: r.status,
  };
}

export function assertH100RhymeSimInvariants(report = readH100RhymeSimReceipt()) {
  if (!report?.ok) return { pass: false, reason: 'missing_or_failed_report' };
  const identical = report.workloads?.identicalPrefix;
  const rhyming = report.workloads?.rhymingDifferentWording;
  if (!identical || !rhyming) return { pass: false, reason: 'missing_workloads' };

  const identicalTie =
    identical.comparison.tinyVersusPrefixCacheResidentBytes === 0 &&
    identical.arms.tinyFootprintRhyme.sameResidentSetAsPrefixCache === true;

  const rhymeBeatsPrefix =
    rhyming.comparison.tinyKvReductionVersusPrefixCache > 0.3 &&
    rhyming.comparison.tinyVersusPrefixCacheResidentBytes < 0 &&
    rhyming.arms.tinyFootprintRhyme.sameResidentSetAsPrefixCache === false &&
    rhyming.arms.productionPrefixCache.exactPrefixHits === 0;

  const fractionLock =
    Math.abs((report.workload?.rhymeSharedOrgFraction ?? 0) - RHYME_SHARED_ORG_FRACTION) < 1e-12;

  const latencyProxy =
    rhyming.comparison.tinyMaterializeSpeedupVersusPrefixCache > 1.2;

  const pass = identicalTie && rhymeBeatsPrefix && fractionLock && latencyProxy;
  return {
    pass,
    identicalTie,
    rhymeBeatsPrefix,
    fractionLock,
    latencyProxy,
    tinyKvReductionVersusPrefixCache: rhyming.comparison.tinyKvReductionVersusPrefixCache,
    tinyMaterializeSpeedupVersusPrefixCache:
      rhyming.comparison.tinyMaterializeSpeedupVersusPrefixCache,
  };
}
