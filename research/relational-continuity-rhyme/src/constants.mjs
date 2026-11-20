/**
 * Relational Continuity · Rhyming Expedition arm
 * Partners · Question↔Answer · Seed↔Edge across Infinite Octaves.
 * ENGINE_SHELF pin deferred.
 */
export const DOCUMENT_ID = 'WP-RELATIONAL-CONTINUITY-RHYME-EGS-2026-11-20';
export const SEED = 20261120;
export const TITLE =
  'Can Relational Rhyme Connect Partners, Questions to Answers, and Seed to Edge Across Infinite Octaves?';
export const ENGINE_SHELF_PINNED = false;

/** Trials per level. */
export const N_PARTNER = 120;
export const N_QA = 120;
export const N_OCTAVE = 80;

/** Recursive octave depth for H3 (seed → edge). */
export const OCTAVE_DEPTH = 8;

/** Arms compared on every level. */
export const ARMS = Object.freeze([
  'exact_cache',
  'embedding_sim',
  'shared_structured',
  'fractisi_minus_rhyme',
  'fractisi_rhyme',
]);

/** Ablation toggles reported separately. */
export const ABLATIONS = Object.freeze([
  'full',
  'minus_rhyme',
  'minus_shared_world',
  'minus_relational_index',
  'minus_selective_recon',
]);
