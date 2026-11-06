/**
 * External agent compatibility — common integration interface + adapters.
 * Adapters map framework-specific payloads onto FractiSI agent messages.
 */

export const AGENT_MESSAGE_FIELDS = Object.freeze([
  'identity',
  'taskAssignment',
  'currentState',
  'dependencies',
  'proposedChanges',
  'resourceRequirements',
  'completionStatus',
  'validationResults',
]);

export function normalizeAgentMessage(raw = {}) {
  return {
    identity: raw.identity || raw.agentId || null,
    taskAssignment: raw.taskAssignment || raw.task || null,
    currentState: raw.currentState || raw.state || 'unknown',
    dependencies: [...(raw.dependencies || [])],
    proposedChanges: [...(raw.proposedChanges || raw.changes || [])],
    resourceRequirements: raw.resourceRequirements || {},
    completionStatus: raw.completionStatus || raw.status || 'unknown',
    validationResults: raw.validationResults || null,
    framework: raw.framework || 'unknown',
  };
}

function baseAdapter(framework, map) {
  return {
    framework,
    capabilities: map.capabilities || ['identity', 'proposedChanges', 'completionStatus'],
    normalize(payload) {
      return normalizeAgentMessage(map.normalize ? map.normalize(payload) : { ...payload, framework });
    },
  };
}

export const adapters = Object.freeze({
  cursor: baseAdapter('cursor', {
    capabilities: ['identity', 'taskAssignment', 'proposedChanges', 'completionStatus'],
    normalize(payload) {
      return {
        framework: 'cursor',
        identity: payload.agentId || payload.sessionId || payload.identity,
        taskAssignment: payload.task || payload.prompt || payload.taskAssignment,
        proposedChanges: payload.edits || payload.proposedChanges || [],
        completionStatus: payload.status || payload.completionStatus || 'active',
        currentState: payload.state || 'active',
        dependencies: payload.dependencies || [],
        resourceRequirements: payload.resources || {},
      };
    },
  }),
  'claude-code': baseAdapter('claude-code', {
    capabilities: ['identity', 'proposedChanges', 'completionStatus', 'validationResults'],
    normalize(payload) {
      return {
        framework: 'claude-code',
        identity: payload.agentId || payload.id || payload.identity,
        taskAssignment: payload.goal || payload.taskAssignment,
        proposedChanges: payload.patches || payload.proposedChanges || [],
        completionStatus: payload.status || 'active',
        currentState: payload.state || 'active',
        dependencies: payload.dependencies || [],
        validationResults: payload.tests || payload.validationResults || null,
      };
    },
  }),
  vscode: baseAdapter('vscode', {
    capabilities: ['identity', 'proposedChanges', 'currentState'],
    normalize(payload) {
      return {
        framework: 'vscode',
        identity: payload.extensionId || payload.identity,
        proposedChanges: payload.workspaceEdits || payload.proposedChanges || [],
        currentState: payload.state || 'active',
        completionStatus: payload.status || 'active',
        taskAssignment: payload.taskAssignment || null,
        dependencies: [],
      };
    },
  }),
  openai: baseAdapter('openai', {
    capabilities: ['identity', 'taskAssignment', 'proposedChanges', 'completionStatus'],
    normalize(payload) {
      return {
        framework: 'openai',
        identity: payload.assistant_id || payload.id || payload.identity,
        taskAssignment: payload.instructions || payload.taskAssignment,
        proposedChanges: payload.tool_calls || payload.proposedChanges || [],
        completionStatus: payload.status || 'active',
        currentState: payload.state || 'active',
        dependencies: payload.dependencies || [],
      };
    },
  }),
  native: baseAdapter('native', {
    capabilities: [...AGENT_MESSAGE_FIELDS],
  }),
});

export function getAdapter(framework) {
  return adapters[framework] || adapters.native;
}

export function ingestExternalAgent(platform, framework, payload) {
  const adapter = getAdapter(framework);
  const message = adapter.normalize(payload);
  const existing = platform.coordination.agents.list().find((a) => a.id === message.identity);
  const agent =
    existing ||
    platform.coordination.agents.register({
      id: message.identity || undefined,
      name: `${framework}:${message.identity || 'agent'}`,
      framework,
      permissions: ['read', 'propose'],
      metadata: { ingested: true },
    });
  const proposals = [];
  for (const change of message.proposedChanges) {
    const paths = Array.isArray(change) ? [] : change.paths || change.path ? [change.path] : [];
    proposals.push(
      platform.coordination.proposeChange({
        agentId: agent.id,
        title: change.summary || change.title || 'external proposal',
        paths,
        summary: typeof change === 'string' ? change : change.summary || '',
        patch: change,
      }),
    );
  }
  return { agent, message, proposals, adapter: framework };
}
