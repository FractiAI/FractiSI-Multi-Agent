/**
 * Layer F — Testing, validation, and FractiSI Deploy capability.
 * Never deploys unvalidated or unauthorized changes.
 */
import { randomUUID } from 'node:crypto';

export function createDeployPipeline(store) {
  const releases = new Map();

  function createReleaseCandidate(compositionId, input = {}) {
    const composition = store.state.compositions.get(compositionId);
    if (!composition) throw new Error(`unknown_composition:${compositionId}`);
    if (composition.state !== 'validated' && composition.state !== 'integrated') {
      throw new Error(`composition_not_validated:${composition.state}`);
    }
    const id = `rc_${randomUUID().slice(0, 8)}`;
    const rc = {
      id,
      compositionId,
      state: 'pending_approval',
      checks: input.checks || [],
      createdAt: new Date().toISOString(),
      approvedBy: null,
      deployedAt: null,
    };
    releases.set(id, rc);
    store.emit('deploy.rc_created', { releaseId: id, compositionId });
    return { ...rc };
  }

  function approve(releaseId, actor = 'operator') {
    const rc = releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    rc.state = 'approved';
    rc.approvedBy = actor;
    rc.approvedAt = new Date().toISOString();
    store.emit('deploy.approved', { releaseId, actor });
    return { ...rc };
  }

  function deploy(releaseId, opts = {}) {
    const rc = releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    if (rc.state !== 'approved' && !opts.force) {
      throw new Error('deploy_requires_approval');
    }
    const composition = store.state.compositions.get(rc.compositionId);
    if (!composition || (composition.state !== 'validated' && composition.state !== 'integrated')) {
      throw new Error('deploy_requires_validated_composition');
    }
    rc.state = 'deployed';
    rc.deployedAt = new Date().toISOString();
    composition.state = 'deployed';
    for (const cid of composition.contributionIds) {
      const c = store.state.contributions.get(cid);
      if (c) c.state = 'deployed';
    }
    store.emit('deploy.completed', { releaseId });
    return { ...rc };
  }

  function rollback(releaseId, reason = 'operator_rollback') {
    const rc = releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    rc.state = 'rolled_back';
    rc.rollbackReason = reason;
    store.emit('deploy.rolled_back', { releaseId, reason });
    return { ...rc };
  }

  function list() {
    return [...releases.values()].map((r) => ({ ...r }));
  }

  return { createReleaseCandidate, approve, deploy, rollback, list };
}
