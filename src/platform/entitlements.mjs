/**
 * Commercial packaging as capability tiers — not separate products.
 * Entitlements are labels / feature gates for packaging; Community remains
 * genuinely useful and unrestricted for local discovery unless configured.
 *
 * Spec: docs/product/FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md
 * Primary pricing metric: concurrent coordinated agents (not human seats,
 * not per-registration fees, not model tokens, not per-discovery).
 * Category: multi-agent intelligence & convergence (revised Nov 2026).
 */

export const TIERS = Object.freeze({
  community: {
    id: 'community',
    label: 'Community',
    price: { amount: 0, period: 'forever' },
    capacity: {
      registeredAgents: null, // unrestricted for local discovery
      concurrentCoordinatedAgents: null,
      humanOperators: null,
    },
    capabilities: [
      'tiny_footprint_execution',
      'shared_world_registration',
      'agent_registration',
      'basic_coordination',
      'local_composition',
      'local_validation',
      'git_integration',
      'local_benchmarks',
      'community_docs',
      // legacy aliases kept for older callers
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
    ],
  },
  developer_pro: {
    id: 'developer_pro',
    label: 'Developer Pro',
    price: { amount: 59, currency: 'USD', period: 'month' },
    capacity: {
      registeredAgents: null,
      concurrentCoordinatedAgents: 8,
      humanOperators: 1,
    },
    capabilities: [
      'tiny_footprint_execution',
      'shared_world_registration',
      'agent_registration',
      'basic_coordination',
      'local_composition',
      'local_validation',
      'git_integration',
      'local_benchmarks',
      'community_docs',
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
      'advanced_coordination',
      'shared_state',
      'dependency_awareness',
      'conflict_detection',
      'composition_engine',
      'composition_policies',
      'advanced_version_management',
      'rollback_history',
      'multiple_workspaces',
      'enhanced_monitoring',
      'exportable_receipts',
      'priority_support',
    ],
  },
  team: {
    id: 'team',
    label: 'Team',
    price: { amount: 299, currency: 'USD', period: 'month' },
    capacity: {
      registeredAgents: null,
      concurrentCoordinatedAgents: 32,
      humanOperators: null,
    },
    capabilities: [
      'tiny_footprint_execution',
      'shared_world_registration',
      'agent_registration',
      'basic_coordination',
      'local_composition',
      'local_validation',
      'git_integration',
      'local_benchmarks',
      'community_docs',
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
      'advanced_coordination',
      'shared_state',
      'dependency_awareness',
      'conflict_detection',
      'composition_engine',
      'composition_policies',
      'advanced_version_management',
      'rollback_history',
      'multiple_workspaces',
      'enhanced_monitoring',
      'exportable_receipts',
      'priority_support',
      'shared_team_workspaces',
      'team_permissions',
      'cross_project_coordination',
      'centralized_policies',
      'audit_receipts',
      'approval_gated_deploy',
      'team_analytics',
      'team_admin',
    ],
  },
  enterprise: {
    id: 'enterprise',
    label: 'Server / Enterprise',
    price: { amount: 30000, currency: 'USD', period: 'year', from: true },
    capacity: {
      registeredAgents: null, // custom
      concurrentCoordinatedAgents: null,
      humanOperators: null,
    },
    capabilities: [
      'tiny_footprint_execution',
      'shared_world_registration',
      'agent_registration',
      'basic_coordination',
      'local_composition',
      'local_validation',
      'git_integration',
      'local_benchmarks',
      'community_docs',
      'resource_allocation',
      'basic_orchestration',
      'repository_connectivity',
      'advanced_coordination',
      'shared_state',
      'dependency_awareness',
      'conflict_detection',
      'composition_engine',
      'composition_policies',
      'advanced_version_management',
      'rollback_history',
      'multiple_workspaces',
      'enhanced_monitoring',
      'exportable_receipts',
      'priority_support',
      'shared_team_workspaces',
      'team_permissions',
      'cross_project_coordination',
      'centralized_policies',
      'audit_receipts',
      'approval_gated_deploy',
      'team_analytics',
      'team_admin',
      'deployment_integration',
      'security_governance',
      'rbac',
      'audit_trails',
      'enterprise_admin',
      'self_hosted_deployment',
      'enterprise_identity',
      'custom_capacity',
      'private_support',
      'sla',
    ],
  },
  cloud: {
    id: 'cloud',
    label: 'Cloud Platform',
    price: { amount: null, period: 'custom' },
    capacity: {
      registeredAgents: null,
      concurrentCoordinatedAgents: null,
      humanOperators: null,
    },
    capabilities: [
      // inherits enterprise surface + provider-scale labels
      'tiny_footprint_execution',
      'shared_world_registration',
      'agent_registration',
      'basic_coordination',
      'local_composition',
      'local_validation',
      'git_integration',
      'advanced_coordination',
      'composition_engine',
      'approval_gated_deploy',
      'deployment_integration',
      'security_governance',
      'rbac',
      'audit_trails',
      'enterprise_admin',
      'self_hosted_deployment',
      'provider_scale_coordination',
      'multi_tenant_shared_world',
      'custom_infra_economics',
      'licensing_arrangements',
    ],
  },
});

/** Legacy aliases so older callers keep working. */
const ALIASES = Object.freeze({
  core: 'community',
  professional: 'developer_pro',
});

/**
 * FractiSI Multiagent Rhyming Shield — separate top-tier security add-on.
 * Ladder is self-similar to Multi-Agent dollars. Spec:
 * docs/product/FRACTISI_RHYMING_SHIELD_PRICING_PACKAGING_2026-11.md
 */
export const ADDONS = Object.freeze({
  rhyming_shield: {
    id: 'rhyming_shield',
    product: 'FractiSI Multiagent Rhyming Shield',
    kind: 'security_addon',
    pricingCategory: 'top_tier_rhyming_protection',
    requiresBaseProduct: 'FractiSI Multi-Agent',
    packages: {
      lab: {
        id: 'rhyming_shield_lab',
        label: 'Shield Soft Story Lab',
        price: { amount: 0, period: 'forever' },
        requiresTier: 'community',
        capabilities: [
          'rhyming_shield_soft_story_lab',
          'adversarial_world_docs',
          'historical_metadata_replay',
        ],
      },
      developer_pro: {
        id: 'rhyming_shield_developer_pro',
        label: 'Shield Developer Pro',
        price: { amount: 59, currency: 'USD', period: 'month', addon: true },
        requiresTier: 'developer_pro',
        capabilities: [
          'rhyming_shield',
          'rhyming_shield_soft_story_lab',
          'malicious_agent_containment',
          'malicious_information_filter',
          'relational_rhyme_gate',
          'quarantine_receipts',
        ],
      },
      team: {
        id: 'rhyming_shield_team',
        label: 'Shield Team',
        price: { amount: 299, currency: 'USD', period: 'month', addon: true },
        requiresTier: 'team',
        capabilities: [
          'rhyming_shield',
          'rhyming_shield_soft_story_lab',
          'malicious_agent_containment',
          'malicious_information_filter',
          'relational_rhyme_gate',
          'quarantine_receipts',
          'sybil_independence_checks',
          'team_shield_governance',
        ],
      },
      enterprise: {
        id: 'rhyming_shield_enterprise',
        label: 'Shield Enterprise',
        price: { amount: 30000, currency: 'USD', period: 'year', from: true, addon: true },
        requiresTier: 'enterprise',
        capabilities: [
          'rhyming_shield',
          'rhyming_shield_soft_story_lab',
          'malicious_agent_containment',
          'malicious_information_filter',
          'relational_rhyme_gate',
          'quarantine_receipts',
          'sybil_independence_checks',
          'team_shield_governance',
          'enterprise_rhyming_protection',
          'shield_sla',
        ],
      },
      cloud: {
        id: 'rhyming_shield_cloud',
        label: 'Shield Cloud',
        price: { amount: null, period: 'custom', addon: true },
        requiresTier: 'cloud',
        capabilities: [
          'rhyming_shield',
          'enterprise_rhyming_protection',
          'provider_scale_rhyming_shield',
        ],
      },
    },
  },
});

export function resolveTier(name = 'community') {
  const key = ALIASES[name] || name;
  return TIERS[key] || TIERS.community;
}

export function hasCapability(tierName, capability) {
  const tier = resolveTier(tierName);
  return tier.capabilities.includes(capability);
}

export function resolveRhymingShieldPackage(name = 'lab') {
  const pack = ADDONS.rhyming_shield.packages[name];
  return pack || ADDONS.rhyming_shield.packages.lab;
}

export function hasRhymingShieldCapability(packageName, capability) {
  const pack = resolveRhymingShieldPackage(packageName);
  return pack.capabilities.includes(capability);
}

export function featureMatrix() {
  const tierIds = Object.keys(TIERS);
  const caps = [...new Set(Object.values(TIERS).flatMap((t) => t.capabilities))].sort();
  const shieldIds = Object.keys(ADDONS.rhyming_shield.packages);
  return {
    product: 'FractiSI Multi-Agent',
    pricingMetric: 'concurrent_coordinated_agents',
    pricingCategory: 'multi_agent_intelligence_convergence',
    tiers: tierIds,
    prices: Object.fromEntries(
      tierIds.map((id) => [id, TIERS[id].price]),
    ),
    capacity: Object.fromEntries(
      tierIds.map((id) => [id, TIERS[id].capacity]),
    ),
    matrix: Object.fromEntries(
      caps.map((cap) => [
        cap,
        Object.fromEntries(tierIds.map((id) => [id, TIERS[id].capabilities.includes(cap)])),
      ]),
    ),
    addons: {
      rhyming_shield: {
        product: ADDONS.rhyming_shield.product,
        kind: ADDONS.rhyming_shield.kind,
        pricingCategory: ADDONS.rhyming_shield.pricingCategory,
        packages: shieldIds,
        prices: Object.fromEntries(
          shieldIds.map((id) => [id, ADDONS.rhyming_shield.packages[id].price]),
        ),
      },
    },
    // backward-compatible columns
    legacyAliases: { ...ALIASES },
  };
}
