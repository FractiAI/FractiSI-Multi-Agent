/** Layer A/B — agent registration, lifecycle, capacity, permissions. */
import { randomUUID } from 'node:crypto';

const STATUSES = new Set(['registered', 'active', 'paused', 'completed', 'failed', 'revoked']);

export function createAgentRegistry(store) {
  function register(input = {}) {
    if (!input.name) throw new Error('agent_name_required');
    const id = input.id || `agent_${randomUUID().slice(0, 8)}`;
    if (store.state.agents.has(id)) throw new Error(`agent_exists:${id}`);
    const agent = {
      id,
      name: String(input.name),
      framework: input.framework || 'native',
      status: 'registered',
      permissions: Object.freeze([...(input.permissions || ['read', 'propose'])]),
      capacity: Number.isFinite(input.capacity) ? input.capacity : 1,
      workspace: input.workspace || null,
      metadata: input.metadata || {},
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.state.agents.set(id, agent);
    store.emit('agent.registered', { agentId: id });
    return { ...agent };
  }

  function get(id) {
    const a = store.state.agents.get(id);
    return a ? { ...a } : null;
  }

  function list(filter = {}) {
    let agents = [...store.state.agents.values()];
    if (filter.status) agents = agents.filter((a) => a.status === filter.status);
    if (filter.framework) agents = agents.filter((a) => a.framework === filter.framework);
    return agents.map((a) => ({ ...a }));
  }

  function setStatus(id, status) {
    if (!STATUSES.has(status)) throw new Error(`invalid_status:${status}`);
    const a = store.state.agents.get(id);
    if (!a) throw new Error(`unknown_agent:${id}`);
    a.status = status;
    a.updatedAt = new Date().toISOString();
    store.emit('agent.status', { agentId: id, status });
    return { ...a };
  }

  function activeCount() {
    return [...store.state.agents.values()].filter((a) => a.status === 'active' || a.status === 'registered').length;
  }

  function revoke(id) {
    return setStatus(id, 'revoked');
  }

  return { register, get, list, setStatus, activeCount, revoke };
}
