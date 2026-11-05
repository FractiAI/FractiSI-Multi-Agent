/**
 * Reference points for the same data under other designs.
 *
 * Normalized baseline for C: the suite's conventional arm embeds full copies of
 * both nodes in every edge. The ordinary alternative stores each node once and has
 * edges refer to nodes by id, with no template engine.
 *
 * Compression reference: gzip of the same JSON says how much redundancy the bytes
 * contain. Compressed bytes cannot be used in place, so this is a yardstick and not
 * a competing design. Its bytes depend on the zlib build, recorded with the result.
 */
import { gzipSync } from 'node:zlib';
import { bytesOf, reduction } from '../../core/bytes.mjs';
import { buildStructuredWorkload } from '../../experiments/b-structured-data.mjs';
import { buildCrossLinkedWorkload } from '../../experiments/c-cross-linked.mjs';
import { buildEightNodeWorkload } from '../../experiments/d-eight-node.mjs';
import { buildAiContextWorkload } from '../../experiments/f-ai-context.mjs';

export function normalizedCrossLinkedBaseline({ seed }) {
  const { conventional, tiny } = buildCrossLinkedWorkload(seed);
  const normalized = {
    nodes: tiny.nodes,
    edges: tiny.edges.map((edge) => ({ fromId: edge.fromId, toId: edge.toId, rel: tiny.template.pattern.rel })),
  };
  const conventionalBytes = bytesOf(conventional);
  const normalizedBytes = bytesOf(normalized);
  const tinyBytes = bytesOf(tiny);
  return {
    conventionalBytes,
    normalizedBytes,
    tinyBytes,
    conventionalToNormalized: reduction(conventionalBytes, normalizedBytes).ratio,
    conventionalToTiny: reduction(conventionalBytes, tinyBytes).ratio,
    normalizedToTiny: reduction(normalizedBytes, tinyBytes).ratio,
  };
}

function gzipBytes(value) {
  return gzipSync(Buffer.from(JSON.stringify(value), 'utf8')).length;
}

export function compressionReference({ seed }) {
  const entries = [
    ['B', buildStructuredWorkload(seed)],
    ['C', buildCrossLinkedWorkload(seed)],
    ['D', buildEightNodeWorkload(seed)],
    ['F', buildAiContextWorkload(seed)],
  ];
  return {
    zlib: process.versions.zlib,
    workloads: entries.map(([key, workload]) => {
      const baselineBytes = bytesOf(workload.conventional);
      const tinyBytes = bytesOf(workload.tiny);
      const baselineGzipBytes = gzipBytes(workload.conventional);
      return {
        key,
        baselineBytes,
        tinyBytes,
        baselineGzipBytes,
        tinyGzipBytes: gzipBytes(workload.tiny),
        tinyReduction: reduction(baselineBytes, tinyBytes).ratio,
        gzipReduction: reduction(baselineBytes, baselineGzipBytes).ratio,
      };
    }),
  };
}
