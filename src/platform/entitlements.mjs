/**
 * Commercial packaging as capability tiers — not separate products.
 * Entitlements are labels / feature gates for packaging; core architecture
 * remains modular and unrestricted in Community builds unless configured.
 */

export const TIERS = Object.freeze({
  core: {
    id: 'core',
    label: 'FractiSI Multi-Agent Core',
    capabilities: [
      'tiny_footprint_execution',
      'agent_registration',
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
    ],
  },
  professional: {
    id: 'professional',
    label: 'FractiSI Multi-Agent Professional',
    capabilities: [
      'tiny_footprint_execution',
      'agent_registration',
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
      'advanced_coordination',
      'shared_state',
      'dependency_awareness',
      'conflict_detection',
      'composition_engine',
      'advanced_version_management',
      'enhanced_monitoring',
    ],
  },
  enterprise: {
    id: 'enterprise',
    label: 'FractiSI Multi-Agent Enterprise',
    capabilities: [
      'tiny_footprint_execution',
      'agent_registration',
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
      'advanced_coordination',
      'shared_state',
      'dependency_awareness',
      'conflict_detection',
      'composition_engine',
      'advanced_version_management',
      'enhanced_monitoring',
      'deployment_integration',
      'security_governance',
      'rbac',
      'audit_trails',
      'enterprise_admin',
      'self_hosted_deployment',
    ],
  },
});

export function resolveTier(name = 'professional') {
  return TIERS[name] || TIERS.professional;
}

export function hasCapability(tierName, capability) {
  const tier = resolveTier(tierName);
  return tier.capabilities.includes(capability);
}

export function featureMatrix() {
  const caps = [...new Set(Object.values(TIERS).flatMap((t) => t.capabilities))].sort();
  return {
    product: 'FractiSI Multi-Agent',
    tiers: Object.values(TIERS).map((t) => t.id),
    matrix: Object.fromEntries(
      caps.map((cap) => [
        cap,
        {
          core: TIERS.core.capabilities.includes(cap),
          professional: TIERS.professional.capabilities.includes(cap),
          enterprise: TIERS.enterprise.capabilities.includes(cap),
        },
      ]),
    ),
  };
}
