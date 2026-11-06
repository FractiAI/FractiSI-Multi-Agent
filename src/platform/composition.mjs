/**
 * Layer D — Composition Engine.
 * Distinguishes proposed → accepted → validated → integrated → deployed.
 * Path-disjoint changes are not auto-merged; semantic/interface markers still apply.
 */
import { randomUUID } from 'node:crypto';
import { createConflictDetector } from './conflicts.mjs';

const STATES = Object.freeze([
  'proposed',
  'accepted',
  'validated',
  'integrated',
  'deployed',
  'rejected',
  'rolled_back',
]);

export function createCompositionEngine(store, opts = {}) {
  const conflicts = createConflictDetector(store, opts);

  function submitContribution(input = {}) {
    if (!input.agentId) throw new Error('agent_required');
    if (!store.state.agents.has(input.agentId)) throw new Error(`unknown_agent:${input.agentId}`);
    const id = input.id || `contrib_${randomUUID().slice(0, 8)}`;
    const contribution = {
      id,
      agentId: input.agentId,
      taskId: input.taskId || null,
      paths: [...new Set((input.paths || []).map(String))],
      summary: input.summary || '',
      diff: input.diff || null,
      files: input.files && typeof input.files === 'object' ? { ...input.files } : {},
      interfacesTouched: [...new Set((input.interfacesTouched || []).map(String))],
      dependsOn: [...new Set((input.dependsOn || []).map(String))],
      parentIds: [...new Set((input.parentIds || []).map(String))],
      state: 'proposed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.state.contributions.set(id, contribution);
    store.emit('contribution.submitted', { contributionId: id });
    return { ...contribution };
  }

  function setContributionState(id, state) {
    if (!STATES.includes(state)) throw new Error(`invalid_state:${state}`);
    const c = store.state.contributions.get(id);
    if (!c) throw new Error(`unknown_contribution:${id}`);
    c.state = state;
    c.updatedAt = new Date().toISOString();
    store.emit('contribution.state', { contributionId: id, state });
    return { ...c };
  }

  function evaluateCompatibility(contributionIds = []) {
    const selected = contributionIds.map((id) => {
      const c = store.state.contributions.get(id);
      if (!c) throw new Error(`unknown_contribution:${id}`);
      return c;
    });
    const issues = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = selected[i];
        const b = selected[j];
        const overlap = conflicts.pathOverlap(a.paths, b.paths);
        if (overlap.length) {
          issues.push({
            type: 'path_overlap',
            severity: 'high',
            a: a.id,
            b: b.id,
            paths: overlap,
            composable: false,
          });
        }
        const iface = conflicts.pathOverlap(
          [...a.paths, ...a.interfacesTouched],
          [...b.paths, ...b.interfacesTouched],
        ).filter((p) =>
          ['api/', 'schema', 'migration', 'package.json', 'interfaces/'].some((m) => p.includes(m)),
        );
        if (iface.length && !overlap.length) {
          issues.push({
            type: 'semantic_interface',
            severity: 'high',
            a: a.id,
            b: b.id,
            paths: iface,
            composable: false,
          });
        }
        if (a.dependsOn.includes(b.id) || b.dependsOn.includes(a.id)) {
          issues.push({
            type: 'ordering_dependency',
            severity: 'medium',
            a: a.id,
            b: b.id,
            paths: [],
            composable: true,
            orderHint: a.dependsOn.includes(b.id) ? [b.id, a.id] : [a.id, b.id],
          });
        }
      }
    }
    const blocking = issues.filter((x) => x.composable === false);
    return {
      contributionIds: selected.map((c) => c.id),
      composable: blocking.length === 0,
      issues,
      suggestedOrder: topologicalOrder(selected),
    };
  }

  function topologicalOrder(selected) {
    const ids = selected.map((c) => c.id);
    const byId = new Map(selected.map((c) => [c.id, c]));
    const pending = new Set(ids);
    const ordered = [];
    while (pending.size) {
      let progressed = false;
      for (const id of [...pending]) {
        const deps = (byId.get(id).dependsOn || []).filter((d) => pending.has(d));
        if (deps.length === 0) {
          ordered.push(id);
          pending.delete(id);
          progressed = true;
        }
      }
      if (!progressed) {
        ordered.push(...pending);
        break;
      }
    }
    return ordered;
  }

  function compose(contributionIds = [], optsIn = {}) {
    const evaluation = evaluateCompatibility(contributionIds);
    if (!evaluation.composable && !optsIn.force) {
      return {
        ok: false,
        state: 'rejected',
        evaluation,
        reason: 'incompatible_contributions',
      };
    }
    const id = `comp_${randomUUID().slice(0, 8)}`;
    const composition = {
      id,
      contributionIds: [...evaluation.suggestedOrder],
      evaluation,
      state: optsIn.skipValidation ? 'integrated' : 'accepted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validation: null,
    };
    store.state.compositions.set(id, composition);
    for (const cid of contributionIds) {
      setContributionState(cid, composition.state === 'integrated' ? 'integrated' : 'accepted');
    }
    store.emit('composition.created', { compositionId: id });
    return { ok: true, composition: { ...composition } };
  }

  function validate(compositionId, result = {}) {
    const c = store.state.compositions.get(compositionId);
    if (!c) throw new Error(`unknown_composition:${compositionId}`);
    const passed = result.passed !== false;
    c.validation = {
      passed,
      checks: result.checks || [],
      at: new Date().toISOString(),
    };
    c.state = passed ? 'validated' : 'rejected';
    c.updatedAt = new Date().toISOString();
    for (const cid of c.contributionIds) {
      setContributionState(cid, passed ? 'validated' : 'rejected');
    }
    store.emit('composition.validated', { compositionId, passed });
    return { ...c };
  }

  function integrate(compositionId) {
    const c = store.state.compositions.get(compositionId);
    if (!c) throw new Error(`unknown_composition:${compositionId}`);
    if (c.state !== 'validated' && c.state !== 'accepted') {
      throw new Error(`composition_not_ready:${c.state}`);
    }
    c.state = 'integrated';
    c.updatedAt = new Date().toISOString();
    for (const cid of c.contributionIds) setContributionState(cid, 'integrated');
    store.emit('composition.integrated', { compositionId });
    return { ...c };
  }

  function rollback(compositionId, reason = 'operator_rollback') {
    const c = store.state.compositions.get(compositionId);
    if (!c) throw new Error(`unknown_composition:${compositionId}`);
    c.state = 'rolled_back';
    c.rollbackReason = reason;
    c.updatedAt = new Date().toISOString();
    for (const cid of c.contributionIds) setContributionState(cid, 'rejected');
    store.emit('composition.rolled_back', { compositionId, reason });
    return { ...c };
  }

  function lineage(contributionId) {
    const c = store.state.contributions.get(contributionId);
    if (!c) throw new Error(`unknown_contribution:${contributionId}`);
    const parents = c.parentIds.map((id) => store.state.contributions.get(id)).filter(Boolean);
    const children = [...store.state.contributions.values()].filter((x) => x.parentIds.includes(contributionId));
    return {
      contribution: { ...c },
      parents: parents.map((p) => ({ ...p })),
      children: children.map((ch) => ({ ...ch })),
    };
  }

  return {
    STATES,
    submitContribution,
    setContributionState,
    evaluateCompatibility,
    compose,
    validate,
    integrate,
    rollback,
    lineage,
  };
}
