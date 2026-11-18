/**
 * Pilot Rhyme Expedition · constants
 * Director/Pilot role rhyme for multi-agent coordination.
 * Rebuild of LingBot-style Director/Pilot seats (paper pattern only — no NC weights).
 * ENGINE_SHELF candidate #55 · FractiSI World Model rhyme feature.
 */
export const DOCUMENT_ID = 'WP-PILOT-RHYME-EXPEDITION-EGS-2026-11-18';
export const SEED = 20261118;
export const SCENARIOS = 100;
export const HOPS = 6;
export const PILOTS = 3; // local executors under one Director
export const FLAT_BUDGET = 40;

export const ARMS = Object.freeze([
  'flat_peers',
  'shared_text',
  'director_pilot_private',
  'director_pilot_exact_cache',
  'director_pilot_rhyme',
]);
