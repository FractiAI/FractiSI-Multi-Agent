/** FractiSI company and FractiSI Multi-Agent product identity. */
export const COMPANY = 'FractiSI';
export const PRODUCT = 'FractiSI Multi-Agent';
export const PRODUCT_VERSION = '0.2.0';
export const CORE_TECHNOLOGY = 'Tiny Footprint';
export const ENGINE = 'Tiny Gateway';

/** Integrated capabilities — not separate products. */
export const CAPABILITIES = Object.freeze([
  'tiny_footprint_execution',
  'multi_agent_coordination',
  'shared_state',
  'dependency_awareness',
  'conflict_detection',
  'work_composition',
  'git_version_management',
  'testing_validation',
  'deployment_integration',
  'monitoring_governance',
]);

export function productBanner() {
  return `${COMPANY} · ${PRODUCT} ${PRODUCT_VERSION} · core tech ${CORE_TECHNOLOGY}`;
}
