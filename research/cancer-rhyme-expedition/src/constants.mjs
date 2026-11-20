/**
 * The Cancer Rhyme · Rhyming Expedition arm
 * Shared relational structure across cancer diversity · Soft Story lab.
 * ENGINE_SHELF pin deferred. Not clinical oncology.
 */
export const DOCUMENT_ID = 'WP-CANCER-RHYME-EGS-2026-11-20';
export const SEED = 20261120;
export const TITLE =
  'Does Cancer Diversity Compress Into Fewer Relational Rhymes Than Disease Labels Suggest?';
export const ENGINE_SHELF_PINNED = false;

/** Number of cancer worlds in the regenerable fixture. */
export const N_CANCERS = 24;

/** Agents / states / edges per world (approx). */
export const AGENTS_PER_WORLD = 18;
export const EDGES_PER_WORLD = 42;

/** Planted cross-cancer relational motifs (discovery target — not Hallmarks). */
export const PLANTED_MOTIF_COUNT = 6;

/** Hold-out fraction for transfer / validation. */
export const HOLD_OUT = 0.3;

/** Null shuffles for recurrence tests. */
export const NULL_SHUFFLES = 40;
