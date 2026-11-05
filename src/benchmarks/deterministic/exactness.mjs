/**
 * Full round trips, where the suite's own checks are partial: B samples twenty
 * records, F compares only the system prompt, and C has no check. E is reported as
 * what it is, a closure that does not contain the rest of the lattice.
 */
import { reconstructNodeView } from '../../engine/broadcast/eight-node.mjs';
import { deepEqual, reconstructExpression } from '../../engine/rhyming/index.mjs';
import { buildStructuredWorkload } from '../../experiments/b-structured-data.mjs';
import { buildCrossLinkedWorkload } from '../../experiments/c-cross-linked.mjs';
import { buildEightNodeWorkload } from '../../experiments/d-eight-node.mjs';
import { buildCrossOctaveWorkload } from '../../experiments/e-cross-octave.mjs';
import { buildAiContextWorkload } from '../../experiments/f-ai-context.mjs';

function structured(seed) {
  const { catalog, conventional, tiny } = buildStructuredWorkload(seed);
  const matched = tiny.expressions.filter((encoded, i) => deepEqual(reconstructExpression(catalog, encoded), conventional[i])).length;
  return { checked: conventional.length, matched, lossless: matched === conventional.length };
}

function crossLinked(seed) {
  const { conventional, tiny } = buildCrossLinkedWorkload(seed);
  const byId = new Map(tiny.nodes.map((node) => [node.id, node]));
  const matched = tiny.edges.filter((edge, i) => {
    const rebuilt = {
      from: byId.get(edge.fromId),
      to: byId.get(edge.toId),
      rel: tiny.template.pattern.rel,
    };
    return deepEqual(rebuilt, conventional.edges[i]);
  }).length;
  return { checked: conventional.edges.length, matched, lossless: matched === conventional.edges.length };
}

function eightNode(seed) {
  const { conventional, tiny } = buildEightNodeWorkload(seed);
  const matched = conventional.filter((copy, i) => deepEqual(reconstructNodeView(tiny, i), copy)).length;
  return { checked: conventional.length, matched, lossless: matched === conventional.length };
}

function aiContext(seed) {
  const { catalog, conventional, tiny } = buildAiContextWorkload(seed);
  const matched = tiny.sessions.filter((session, i) => {
    const system = reconstructExpression(catalog, { templateId: session.systemRef, delta: {} });
    return deepEqual({ session: session.session, messages: [system, ...session.turns] }, conventional[i]);
  }).length;
  return { checked: conventional.length, matched, lossless: matched === conventional.length };
}

function crossOctave(seed) {
  const { conventional, working } = buildCrossOctaveWorkload(seed);
  return {
    checked: conventional.length,
    matched: working.length,
    lossless: false,
    note: 'The working set is the closure of one request. Vectors outside it are not represented, so it cannot reconstruct the lattice.',
  };
}

export function fullExactness({ seed }) {
  return { B: structured(seed), C: crossLinked(seed), D: eightNode(seed), E: crossOctave(seed), F: aiContext(seed) };
}
