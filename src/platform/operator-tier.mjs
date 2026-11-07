/**
 * Resolve the operator's commercial edition for feature gates.
 * Community is the default for this open kit. Paid customers set
 * FRACTISI_EDITION / FRACTISI_TIER (or product config.edition).
 */
import { hasCapability, resolveTier } from './entitlements.mjs';

export function resolveOperatorTier(ctx = {}, env = process.env) {
  const raw =
    env.FRACTISI_EDITION ||
    env.FRACTISI_TIER ||
    ctx?.config?.edition ||
    'community';
  return resolveTier(String(raw).toLowerCase().trim());
}

/** Cloud deploy (approval-gated publish) is a paid capability. */
export function canDeploy(tierOrName) {
  const id = typeof tierOrName === 'string' ? tierOrName : tierOrName?.id;
  return hasCapability(id || 'community', 'approval_gated_deploy');
}

export function deployPaidMessage(tier) {
  const label = tier?.label || 'Community';
  return [
    `deploy · paid feature — current edition: ${label}`,
    'Community (free): local work · Git commits · Test Drive. No cloud deploy.',
    'Unlock deploy: Team · Enterprise · Cloud → https://fractisi.vercel.app/product/pricing/',
    'Then set FRACTISI_EDITION=team (or enterprise|cloud) and FRACTISI_CLOUD_TOKEN / VERCEL_TOKEN.',
  ];
}
