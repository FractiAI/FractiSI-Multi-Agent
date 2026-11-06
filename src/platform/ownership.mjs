/** Task ownership and dependency tracking. */
import { randomUUID } from 'node:crypto';

export function createOwnershipTracker(store) {
  function claimTask(input = {}) {
    if (!input.title) throw new Error('task_title_required');
    if (!input.agentId) throw new Error('task_agent_required');
    if (!store.state.agents.has(input.agentId)) throw new Error(`unknown_agent:${input.agentId}`);
    const id = input.id || `task_${randomUUID().slice(0, 8)}`;
    const task = {
      id,
      title: String(input.title),
      agentId: input.agentId,
      paths: [...new Set((input.paths || []).map(String))],
      dependsOn: [...new Set((input.dependsOn || []).map(String))],
      status: 'claimed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.state.tasks.set(id, task);
    store.emit('task.claimed', { taskId: id, agentId: input.agentId });
    return { ...task };
  }

  function get(id) {
    const t = store.state.tasks.get(id);
    return t ? { ...t } : null;
  }

  function list(filter = {}) {
    let tasks = [...store.state.tasks.values()];
    if (filter.agentId) tasks = tasks.filter((t) => t.agentId === filter.agentId);
    if (filter.status) tasks = tasks.filter((t) => t.status === filter.status);
    return tasks.map((t) => ({ ...t }));
  }

  function setStatus(id, status) {
    const t = store.state.tasks.get(id);
    if (!t) throw new Error(`unknown_task:${id}`);
    t.status = status;
    t.updatedAt = new Date().toISOString();
    store.emit('task.status', { taskId: id, status });
    return { ...t };
  }

  function dependencyClosure(taskId, seen = new Set()) {
    const t = store.state.tasks.get(taskId);
    if (!t || seen.has(taskId)) return [];
    seen.add(taskId);
    const out = [];
    for (const dep of t.dependsOn) {
      out.push(dep, ...dependencyClosure(dep, seen));
    }
    return [...new Set(out)];
  }

  return { claimTask, get, list, setStatus, dependencyClosure };
}
