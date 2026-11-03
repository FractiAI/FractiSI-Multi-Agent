/**
 * Eight-node simultaneous broadcast — one originating story, shared refs.
 * Nodes are connection ports, not subject categories.
 */
export const NODE_COUNT = 8;

export function conventionalEightCopies(story) {
  return Array.from({ length: NODE_COUNT }, (_, i) => ({
    node: i,
    story: structuredClone(story),
    state: { node: i, ticks: 0 },
  }));
}

export function tinySharedBroadcast(story) {
  const origin = { id: 'origin', story };
  const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
    node: i,
    originRef: origin.id,
    state: { node: i, ticks: 0 },
  }));
  return { origin, nodes };
}

export function reconstructNodeView(tiny, nodeIndex) {
  const n = tiny.nodes[nodeIndex];
  return {
    node: n.node,
    story: structuredClone(tiny.origin.story),
    state: structuredClone(n.state),
  };
}
