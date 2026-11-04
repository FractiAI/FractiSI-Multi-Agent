/**
 * Tiny Gateway core — rhyme-gated template → selective reconstruct → execute.
 */
import {
  createTemplateCatalog,
  encodeExpression,
  reconstructExpression,
  deepEqual,
  mergeDelta,
} from './rhyming-template.mjs';
import { createVectorStore } from './nested-vector.mjs';
import { auditRhyme } from './holographic-rhyme-gate.mjs';
import { routeBySignature, explainRoute } from './geometric-rhyme-route.mjs';
import {
  createCompressionHookRegistry,
  nestedDeltaFoldHook,
  octaveScaleCapHook,
  workingSetBoundHook,
} from './context-compress-hooks.mjs';
import { createRecursiveContextBuffer } from './context-buffer.mjs';
import { createEnergyModel } from './energy-proxy.mjs';

export function createGateway(options = {}) {
  const catalog = createTemplateCatalog(options);
  const vectors = createVectorStore();
  const requireRhyme = options.requireRhyme === true;
  const hooks = createCompressionHookRegistry();
  if (options.defaultHooks !== false) {
    hooks.registerHook('octave_scale_cap', octaveScaleCapHook({ maxDepth: options.maxHookDepth ?? 6 }));
    hooks.registerHook('working_set_bound', workingSetBoundHook({ maxBytes: options.maxHookBytes ?? 64_000 }));
  }
  const energyModel = options.energyModel || createEnergyModel(options.energy || {});
  let contextBuffer = null;

  return {
    catalog,
    vectors,
    hooks,
    requireRhyme,
    energyModel,
    registerTemplate(t, rhymeEvidence = null) {
      let rhymePass = t.rhymePass;
      if (requireRhyme || rhymeEvidence) {
        const audit = auditRhyme(
          rhymeEvidence || {
            pattern: t.pattern,
            expressions: t.expressions,
            nestDepth: t.nestDepth,
            driftBefore: t.driftBefore,
            driftAfter: t.driftAfter,
          },
        );
        if (!audit.pass) {
          const err = new Error(`holographic_rhyme_rejected:${audit.failed.join(',')}`);
          err.audit = audit;
          throw err;
        }
        rhymePass = true;
      }
      return catalog.register({ ...t, rhymePass });
    },
    /**
     * Discover template by organizational rhyme (structural signature routing).
     * Does not treat exact-text or prefix identity as a match by itself.
     */
    discoverTemplate(shape) {
      return catalog.findMatch(shape);
    },
    routeTemplate(shape, opts = {}) {
      return routeBySignature(shape, catalog, opts);
    },
    ingestExpression(templateId, expression, state = null) {
      const t = catalog.get(templateId);
      if (!t) throw new Error('unknown template');
      let encoded = encodeExpression(templateId, t.pattern, expression, state);
      encoded = hooks.applyEncodeHooks(encoded, { template: t, expression });
      return encoded;
    },
    ingestRhyming(expression, state = null) {
      const match = catalog.findMatch(expression);
      if (!match) throw new Error('no_rhyming_template');
      return this.ingestExpression(match.id, expression, state);
    },
    ingestRhymingBest(expression, state = null, { minScore = 0.85 } = {}) {
      const route = catalog.routeTemplate(expression, { mode: 'best' });
      if (!route.id || route.score < minScore) throw new Error('no_rhyming_template_best');
      return this.ingestExpression(route.id, expression, state);
    },
    openContextBuffer(pattern, opts = {}) {
      if (pattern) hooks.registerHook('nested_delta_fold', nestedDeltaFoldHook(pattern));
      contextBuffer = createRecursiveContextBuffer({
        pattern,
        hooks,
        maxLevels: opts.maxLevels ?? 4,
        maxBytesPerLevel: opts.maxBytesPerLevel ?? 8_192,
      });
      return contextBuffer;
    },
    getContextBuffer() {
      return contextBuffer;
    },
    execute({
      operation,
      templateId,
      encoded,
      vectorRoot = null,
      shape = null,
      energyBudgetJ = null,
      maxDepth = 8,
    }) {
      if (operation === 'reconstruct') {
        let value = reconstructExpression(catalog, encoded);
        value = hooks.applyReconstructHooks(value, { encoded });
        return { ok: true, value };
      }
      if (operation === 'workingSet') {
        const set = vectors.resolveWorkingSet(vectorRoot, {
          maxDepth,
          energyBudgetJ,
          energyModel,
          hooks,
        });
        return { ok: true, value: set, n: set.length, meters: set.meters };
      }
      if (operation === 'validateEqual') {
        const value = reconstructExpression(catalog, encoded);
        return { ok: deepEqual(value, encoded.__expect || value), value };
      }
      if (operation === 'discover') {
        const hit = catalog.findMatch(encoded ?? shape);
        return { ok: Boolean(hit), value: hit };
      }
      if (operation === 'route') {
        const hit = catalog.routeTemplate(encoded ?? shape, { mode: 'exact' });
        return { ok: Boolean(hit.id), value: explainRoute(hit), route: hit };
      }
      if (operation === 'compressMeter') {
        if (!contextBuffer) return { ok: false, error: 'no_context_buffer' };
        return { ok: true, value: contextBuffer.snapshotMeters() };
      }
      if (operation === 'pushTurn') {
        if (!contextBuffer) return { ok: false, error: 'no_context_buffer' };
        const turn = contextBuffer.pushTurn(encoded ?? shape);
        return { ok: true, turn, meters: contextBuffer.snapshotMeters() };
      }
      return { ok: false, error: 'unknown_operation' };
    },
    mergeDelta,
  };
}
