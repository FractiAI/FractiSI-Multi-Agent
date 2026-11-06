/**
 * FractiSI Multi-Agent platform factory.
 * Wires Tiny Footprint (via optional gateway) with coordination / composition layers.
 */
import { createGateway } from '../engine/gateway.mjs';
import { createCompositionEngine } from './composition.mjs';
import { createCoordinationEngine } from './coordination.mjs';
import { createDeployPipeline } from './deploy.mjs';
import { createGitIntegration } from './git.mjs';
import { COMPANY, CORE_TECHNOLOGY, PRODUCT, PRODUCT_VERSION, productBanner } from './identity.mjs';
import { createStore } from './store.mjs';
import { featureMatrix, resolveTier } from './entitlements.mjs';
import { ingestExternalAgent } from './adapters.mjs';

export function createPlatform(opts = {}) {
  const store = createStore({
    path: opts.statePath || null,
    autoPersist: Boolean(opts.statePath),
  });
  if (opts.statePath) store.restore();

  const gateway = opts.gateway || createGateway();
  const coordination = createCoordinationEngine(store, opts);
  const composition = createCompositionEngine(store, opts);
  const git = createGitIntegration(store, opts);
  const deploy = createDeployPipeline(store);
  const tier = resolveTier(opts.tier || 'professional');

  if (opts.project) coordination.connectProject(opts.project);

  return {
    company: COMPANY,
    product: PRODUCT,
    version: PRODUCT_VERSION,
    coreTechnology: CORE_TECHNOLOGY,
    banner: productBanner(),
    tier,
    store,
    gateway,
    coordination,
    composition,
    git,
    deploy,
    featureMatrix: () => featureMatrix(),
    ingestExternalAgent: (framework, payload) => ingestExternalAgent({ coordination, composition }, framework, payload),
    persist: () => store.persist(),
    status: () => ({
      ...coordination.status(),
      version: PRODUCT_VERSION,
      tier: tier.id,
      contributions: store.snapshot().contributions.length,
      compositions: store.snapshot().compositions.length,
      releases: deploy.list().length,
    }),
  };
}
