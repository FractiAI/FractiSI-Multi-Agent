/**
 * The suite's identifiers, seeds and targets. The engine is a candidate for ENGINE_SHELF
 * #52, gated on data, with an 80% representation research target.
 */
export { PHI_EGS } from '../engine/rhyming/gate.mjs';
export const DOC_ID = 'WP-SYNTHOBS-TINY-GATEWAY-RHYMING-TEMPLATES-EGS-2026-11-03';
export const REGISTRY_ID = 'synthobs-tiny-gateway-rhyming-templates-2026-11';
export const PAPER_FILE = 'docs/SYNTHOBS_TINY_GATEWAY_RHYMING_TEMPLATES_EGS_2026-11.md';
export const SHIP_BLOG_SLUG = 'tiny-gateway-rhyming-templates';
export const SHIP_BLOG_FILE = 'blog-tiny-gateway-rhyming-templates-2026-11.html';
/** Companion pin before meta honesty/protocol; pin only if measured gate passes. */
export const ENGINE_SHELF_SLOT = 52;
export const ENGINE_SHELF_PINNED_INITIAL = false;
export const STANDALONE_REPO = 'FractiAI/synthobs-tiny-gateway-rhyming-templates';
export const STUDY_TITLE =
  'Tiny Gateway: Rhyming Templates and a New Architecture for Memory-Efficient Computing';
export const EXPEDITION = 'Homeostasis Expedition';
export const JOURNEY_SLUG = 'homeostasis-expedition';
export const DIGITAL_SEED = 20261103;
export const VALIDATION_SEED = 202611032;

/**
 * Pass bar from paper section 9.6. This is measured on in-process representation
 * bytes, not on device DRAM. DRAM is the product analogue, not a quantity this
 * suite reads.
 */
export const REPRESENTATION_REDUCTION_TARGET = 0.8;
/** @deprecated Use REPRESENTATION_REDUCTION_TARGET; the old name overstates what is measured. */
export const DRAM_REDUCTION_TARGET = REPRESENTATION_REDUCTION_TARGET;

export const HONESTY =
  'Tiny Gateway · Rhyming Templates / Tiny Footprint: holographic rhyme = repeating · self-similar · self-correcting · recursive (four-pillar gate). Signature-bucket routing + recursive context-fold hooks + byte-touch joule PROXY are companion meters (K/L/M) — not semantic retrieval, not a KV-compression product, not wall-socket energy, not solar-synced clocks. In-process lab + (A) HtoD allocation proxy on GTX 860M and (B) REAL local-GPU LLM lab (sshleifer/tiny-gpt2 via torch-directml) measuring shared-prefix infer + AdamW train with vs without Tiny Footprint — those GPU meters are prefix-reuse, not rhyme proofs. Proxy ≠ model forward. DirectML on laptop GeForce ≠ datacenter HBM / hosted frontier API. Φ_EGS design grammar only. Engine pin is data-gated.';

export const BUILDS_ON = Object.freeze([
  'synthobs-tiny-gateway-language-radar-2026-10',
  'synthobs-wave-node-mathematics-2026-10',
  'synthobs-tiny-reality-generation-model-2026-10',
  'synthobs-net-zero-missing-half-2026-10',
]);
