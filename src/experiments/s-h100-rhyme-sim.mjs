/**
 * S: the H100 rhyme-versus-prefix simulation. Pure, so the gate can be tested against a
 * report without Python. A simulation is not a measurement: the rhyme arm's saving comes
 * from a fraction of JSON bytes applied to KV memory, which no experiment here supports.
 */
import { LAB_STATUS } from '../labs/lab-status.mjs';

/** Must match `src/tiny_footprint_labs/h100/roofline.py`, and the rhyme encode (121 of 198 bytes). */
export const RHYME_SHARED_ORG_FRACTION = 1 - 121 / 198;

export function assertH100RhymeSimInvariants(report) {
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

/** @param {object} report output of `runH100RhymeSim` */
export function experimentS_h100RhymeVsPrefixSim(report) {
  const invariants = assertH100RhymeSimInvariants(report);
  const rhyming = report?.workloads?.rhymingDifferentWording;
  const pass = report?.ok === true && invariants.pass === true;
  return {
    id: 'S_h100_rhyme_vs_prefix_sim',
    title: 'H100 simulation · rhyme beats prefix cache when organizational wording differs',
    report,
    invariants,
    tinyKvReductionVersusPrefixCache: rhyming?.comparison?.tinyKvReductionVersusPrefixCache ?? null,
    tinyMaterializeSpeedupVersusPrefixCache: rhyming?.comparison?.tinyMaterializeSpeedupVersusPrefixCache ?? null,
    status: report?.status === LAB_STATUS.NOT_RUN ? LAB_STATUS.NOT_RUN : pass ? LAB_STATUS.PASS : LAB_STATUS.FAIL,
    pass,
    honesty:
      report?.honesty ||
      'H100 SXM published-profile simulation — not a live H100 measurement; shared/delta fraction from in-process rhyme encode.',
  };
}
