/**
 * Conflict / interference detection.
 * Path overlap is necessary but not sufficient — also flags shared interface
 * markers and dependency edges when present on contributions.
 */

function pathOverlap(a = [], b = []) {
  const setB = new Set(b);
  return a.filter((p) => setB.has(p));
}

function interfaceTouch(paths = [], markers = []) {
  if (!markers.length) return [];
  return paths.filter((p) => markers.some((m) => p.includes(m)));
}

export function createConflictDetector(store, opts = {}) {
  const interfaceMarkers = opts.interfaceMarkers || [
    'package.json',
    'tsconfig',
    'schema',
    'migration',
    'api/',
    'interfaces/',
    'Dockerfile',
  ];

  function detectForTask(taskId) {
    const task = store.state.tasks.get(taskId);
    if (!task) throw new Error(`unknown_task:${taskId}`);
    const conflicts = [];
    for (const other of store.state.tasks.values()) {
      if (other.id === task.id) continue;
      if (other.status === 'cancelled' || other.status === 'integrated') continue;
      const overlap = pathOverlap(task.paths, other.paths);
      if (overlap.length) {
        conflicts.push({
          type: 'path_overlap',
          severity: 'high',
          taskId: task.id,
          otherTaskId: other.id,
          otherAgentId: other.agentId,
          paths: overlap,
        });
      }
      const iface = interfaceTouch(task.paths, interfaceMarkers);
      const otherIface = interfaceTouch(other.paths, interfaceMarkers);
      const sharedIface = pathOverlap(iface, otherIface);
      if (sharedIface.length && !overlap.length) {
        conflicts.push({
          type: 'shared_interface',
          severity: 'medium',
          taskId: task.id,
          otherTaskId: other.id,
          otherAgentId: other.agentId,
          paths: sharedIface,
        });
      }
      if (task.dependsOn.includes(other.id) || other.dependsOn.includes(task.id)) {
        conflicts.push({
          type: 'dependency_edge',
          severity: 'low',
          taskId: task.id,
          otherTaskId: other.id,
          otherAgentId: other.agentId,
          paths: [],
        });
      }
    }
    return conflicts;
  }

  function detectAll() {
    const seen = new Set();
    const out = [];
    for (const task of store.state.tasks.values()) {
      for (const c of detectForTask(task.id)) {
        const key = [c.type, c.taskId, c.otherTaskId, ...(c.paths || [])].sort().join('|');
        const alt = [c.type, c.otherTaskId, c.taskId, ...(c.paths || [])].sort().join('|');
        if (seen.has(key) || seen.has(alt)) continue;
        seen.add(key);
        out.push(c);
      }
    }
    return out;
  }

  function canProceedIndependently(taskId) {
    const conflicts = detectForTask(taskId).filter((c) => c.severity === 'high');
    return { ok: conflicts.length === 0, conflicts };
  }

  return { detectForTask, detectAll, canProceedIndependently, pathOverlap };
}
