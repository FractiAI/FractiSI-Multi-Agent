/**
 * Layer B — FractiSI Coordination Engine.
 * Tracks active agents, shared project state, overlapping work, and safe concurrency.
 * Does not require a Git branch/worktree per agent.
 */
import { createAgentRegistry } from './agents.mjs';
import { createOwnershipTracker } from './ownership.mjs';
import { createConflictDetector } from './conflicts.mjs';

export function createCoordinationEngine(store, opts = {}) {
  const agents = createAgentRegistry(store);
  const ownership = createOwnershipTracker(store);
  const conflicts = createConflictDetector(store, opts);

  function connectProject(project = {}) {
    if (!project.root && !project.name) throw new Error('project_root_or_name_required');
    store.state.project = {
      id: project.id || 'project_default',
      name: project.name || 'unnamed',
      root: project.root || null,
      remote: project.remote || null,
      modules: [...(project.modules || [])],
      connectedAt: new Date().toISOString(),
    };
    store.emit('project.connected', { projectId: store.state.project.id });
    return { ...store.state.project };
  }

  function proposeChange(input = {}) {
    if (!input.agentId) throw new Error('agent_required');
    if (!store.state.agents.has(input.agentId)) throw new Error(`unknown_agent:${input.agentId}`);
    const task =
      input.taskId && store.state.tasks.get(input.taskId)
        ? store.state.tasks.get(input.taskId)
        : ownership.claimTask({
            agentId: input.agentId,
            title: input.title || 'proposed change',
            paths: input.paths || [],
            dependsOn: input.dependsOn || [],
          });
    const gate = conflicts.canProceedIndependently(task.id);
    const proposal = {
      id: `prop_${task.id}`,
      taskId: task.id,
      agentId: input.agentId,
      paths: [...(input.paths || task.paths || [])],
      summary: input.summary || '',
      patch: input.patch || null,
      state: 'proposed',
      safeConcurrent: gate.ok,
      conflicts: gate.conflicts,
      createdAt: new Date().toISOString(),
    };
    store.emit('change.proposed', { proposalId: proposal.id, agentId: input.agentId });
    return proposal;
  }

  function status() {
    const agentList = agents.list();
    const taskList = ownership.list();
    const conflictList = conflicts.detectAll();
    return {
      product: 'FractiSI Multi-Agent',
      project: store.state.project ? { ...store.state.project } : null,
      agents: {
        total: agentList.length,
        active: agents.activeCount(),
        list: agentList,
      },
      tasks: {
        total: taskList.length,
        open: taskList.filter((t) => t.status === 'claimed' || t.status === 'active').length,
        list: taskList,
      },
      conflicts: conflictList,
      events: store.state.events.slice(-20),
    };
  }

  return {
    agents,
    ownership,
    conflicts,
    connectProject,
    proposeChange,
    status,
  };
}
