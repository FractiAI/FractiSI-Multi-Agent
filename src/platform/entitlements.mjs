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

export function resolveTier(name = 'community') {
  const key = ALIASES[name] || name;
  return TIERS[key] || TIERS.community;
}

export function hasCapability(tierName, capability) {
  const tier = resolveTier(tierName);
  return tier.capabilities.includes(capability);
}

export function featureMatrix() {
  const tierIds = Object.keys(TIERS);
  const caps = [...new Set(Object.values(TIERS).flatMap((t) => t.capabilities))].sort();
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
    // backward-compatible columns
    legacyAliases: { ...ALIASES },
  };
}
