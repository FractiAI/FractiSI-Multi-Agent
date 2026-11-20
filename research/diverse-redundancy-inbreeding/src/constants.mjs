/**
 * Diverse Redundancy · Inbreeding Expedition · constants
 * Rhyming World Model / Rhyming Expedition arm.
 * Cloned (same-lineage) copies vs diverse copies — common-cause β.
 * ENGINE_SHELF pin deferred until measured rates lock.
 */
export const DOCUMENT_ID = 'WP-DIVERSE-REDUNDANCY-INBREEDING-EGS-2026-11-19';
export const SEED = 20261119;
export const TITLE =
  'Do Diverse Copies Hold a Mission Deeper Than Cloned Copies When Failures Share a Cause?';
/** ENGINE_SHELF pin stays deferred until measured rates lock across fleets. */
export const ENGINE_SHELF_PINNED = false;

/** Common-cause fractions swept in the depth simulator. */
export const BETA_SWEEP = Object.freeze([0, 0.05, 0.1, 0.2, 0.35, 0.5]);

/** Independent failure probability per copy class (per horizon step). */
export const LAMBDA = 0.02;

/** Depth horizons (log-scale nest count). */
export const DEPTHS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);

/** Clone group sizes vs diverse class counts. */
export const CLONE_SIZES = Object.freeze([1, 3, 5, 9]);
export const DIVERSE_CLASS_COUNTS = Object.freeze([1, 3, 5, 9]);

/** Co-failure window for Backblaze same-model pairs (days). */
export const BACKBLAZE_WINDOW_DAYS = 7;

export const FIXTURES = Object.freeze({
  backblaze: 'fixtures/backblaze_2019h1.json',
  yeast: 'fixtures/yeast_paralog_essential.json',
  human: 'fixtures/human_paralog_constraint.json',
});
