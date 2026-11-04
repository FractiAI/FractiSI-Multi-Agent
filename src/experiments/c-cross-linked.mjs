/** C: a cross-linked graph, with edges duplicating their nodes versus shared references. */
import { bytesOf, reduction } from '../core/bytes.mjs';
import { mulberry32 } from '../core/rng.mjs';
import { createTemplateCatalog, encodeExpression } from '../engine/rhyming/index.mjs';
import { DIGITAL_SEED } from './constants.mjs';

export function buildCrossLinkedWorkload(seed = DIGITAL_SEED, nNodes = 200) {
  const rng = mulberry32(seed);
  const nodes = Array.from({ length: nNodes }, (_, i) => ({
    id: `n${i}`,
    label: `node-${i}`,
    weight: rng(),
    // Fat payload makes naive edge embedding expensive (conventional anti-pattern)
    dossier: Array.from({ length: 40 }, (_, k) => `fact-${i}-${k}-${(rng() * 1e6) | 0}`),
  }));
  // Conventional: each edge embeds full node copies (multi-edge fanout)
  const convEdges = [];
  for (let i = 0; i < nNodes; i++) {
    for (let e = 0; e < 3; e++) {
      const j = (i * 7 + 3 + e * 11) % nNodes;
      convEdges.push({
        from: structuredClone(nodes[i]),
        to: structuredClone(nodes[j]),
        rel: 'depends',
      });
    }
  }
  const conventional = { nodes: structuredClone(nodes), edges: convEdges };

  // Tiny: nodes once + edge id refs + shared relationship template
  const catalog = createTemplateCatalog();
  catalog.register({
    id: 'tpl_edge',
    pattern: { rel: 'depends', kind: 'edge' },
  });
  const tinyEdges = convEdges.map((e, i) => ({
    ...encodeExpression('tpl_edge', { rel: 'depends', kind: 'edge' }, { rel: e.rel, kind: 'edge' }),
    fromId: e.from.id,
    toId: e.to.id,
    i,
  }));
  const tiny = { nodes, edges: tinyEdges, template: catalog.get('tpl_edge') };
  return { conventional, tiny, catalog };
}

export function experimentC_crossLinked(seed = DIGITAL_SEED, nNodes = 200) {
  const { conventional, tiny } = buildCrossLinkedWorkload(seed, nNodes);
  const r = reduction(bytesOf(conventional), bytesOf(tiny));
  return {
    id: 'C_cross_linked',
    title: 'Workload B · cross-linked shared references',
    nNodes,
    nEdges: conventional.edges.length,
    ...r,
    pass: r.ratio >= 0.5,
  };
}
