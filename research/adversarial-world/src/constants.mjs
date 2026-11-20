/**
 * Adversarial World · Rhyming Expedition arm
 * Shared world + deltas + rhyme vs malicious Soft Story agents.
 * ENGINE_SHELF pin deferred. Simulated local lab only — no real targets.
 */
export const DOCUMENT_ID = 'WP-ADVERSARIAL-WORLD-EGS-2026-11-20';
export const SEED = 20261120;
export const TITLE =
  'Can Relational Rhyme Detect and Contain Malicious Agents in a Shared World?';
export const ENGINE_SHELF_PINNED = false;

/** Soft Story agent population (honest + adversarial mix varies by scenario). */
export const N_AGENTS = 12;

/** Attack ids A–J. */
export const ATTACK_IDS = [
  'A_false_observation',
  'B_malicious_delta',
  'C_memory_poisoning',
  'D_false_consensus',
  'E_sybil',
  'F_rhyme_manipulation',
  'G_context_manipulation',
  'H_goal_hijacking',
  'I_privilege_escalation',
  'J_slow_poisoning',
];

/** Extra epistemic scenarios (not attacks). */
export const EPISTEMIC_IDS = [
  'legitimate_disagreement',
  'minority_truth',
  'majority_falsehood',
  'truth_without_rhyme',
  'novel_truth',
];

export const MODEL_IDS = [
  'naive',
  'majority',
  'trusted',
  'fractisi_deltas',
  'fractisi_provenance',
  'fractisi_rhyme',
  'fractisi_full',
];
