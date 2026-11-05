/** The generated results page for the documentation, from the same tables as the manuscript. */
import { heapTable, latencyTable, llmTable, residencyTable, rssTable, workloadsTable, claimsTable } from '../manuscript/tables.mjs';
import { completedRuns } from '../analysis/measured-summary.mjs';
import { fixed2, int, pct, pct0, times } from '../core/format.mjs';

const BLOCK_START = '<!-- BEGIN GENERATED EVIDENCE -->';
const BLOCK_END = '<!-- END GENERATED EVIDENCE -->';
/** How far apart two heap reductions can be, as a fraction, and still read as level. */
const VERDICT_LEVEL_MARGIN = 0.05;

/**
 * The values behind the short answer, or null when the data no longer support its
 * wording. Sentences do not update themselves, so a changed result removes the
 * sentence rather than leaving a false one in place.
 *
 * @param {object} summary analysis summary
 */
export function verdictFacts(summary) {
  const largest = Math.max(...summary.heap.rows.map((r) => r.sessions));
  const heap = (workload, condition) => summary.heap.rows.find((r) => r.workload === workload && r.condition === condition && r.sessions === largest);
  const latency = (workload, condition) => summary.latency.rows.find((r) => r.workload === workload && r.condition === condition);
  const runs = completedRuns(summary);
  const kv = runs.filter((r) => r.residency.reduction.device != null)
    .reduce((best, r) => (r.residency.kvBytesPerTokenFormula > (best?.residency.kvBytesPerTokenFormula ?? 0) ? r : best), null);
  if (!kv) return null;
  const reduction = (workload, condition) => heap(workload, condition).heapReduction.estimate;
  const ratio = (workload, condition) => latency(workload, condition).ratioToDuplicated.estimate;
  const prefill = runs.map((r) => r.prefillCall.speedup.estimate);
  const workloads = ['ai_context', 'rhyme_differing'];
  const span = (condition) => {
    const values = workloads.map((w) => ratio(w, condition));
    return `${times(Math.min(...values))} to ${times(Math.max(...values))}`;
  };
  const holds = Math.min(...prefill) > 1
    && workloads.every((w) => reduction(w, 'tiny') - reduction(w, 'aliased') < VERDICT_LEVEL_MARGIN)
    && workloads.every((w) => ratio(w, 'tiny') > 1 && ratio(w, 'tiny_noclone') >= 1)
    && Math.abs(reduction('rhyme_differing', 'tiny_compact') - reduction('rhyme_differing', 'aliased')) < VERDICT_LEVEL_MARGIN;
  if (!holds) return null;
  return {
    prefill: `${times(Math.min(...prefill))} to ${times(Math.max(...prefill))}`,
    kvDevice: pct(kv.residency.reduction.device),
    kvWithWeights: pct(kv.withWeights.reduction),
    promptTiny: pct(reduction('ai_context', 'tiny')),
    promptAliased: pct(reduction('ai_context', 'aliased')),
    shapeTiny: pct(reduction('rhyme_differing', 'tiny')),
    shapeAliased: pct(reduction('rhyme_differing', 'aliased')),
    shapeCompact: pct(reduction('rhyme_differing', 'tiny_compact')),
    rebuild: span('tiny'),
    rebuildNoClone: span('tiny_noclone'),
  };
}

/** @param {object} summary analysis summary */
function renderShortAnswer(summary) {
  const f = verdictFacts(summary);
  if (!f) return '';
  return `## The short answer

Sharing a prompt prefix is the one thing here that performs, and it is not new.

- **What works:** sharing a prompt prefix across sessions. Prefill runs ${f.prefill} faster, and KV memory falls ${f.kvDevice}, or ${f.kvWithWeights} once model weights are counted. Production prefix caches already do this, so it helps only on a serving stack without one.
- **What does not:** the rhyming engine. With a shared prompt it saves ${f.promptTiny} of heap, against ${f.promptAliased} for a plain object reference. With the same shape and different words it saves ${f.shapeTiny}, against ${f.shapeAliased}. Rebuilding a session takes ${f.rebuild} the time of reading a duplicated store.
- **What could improve it:** two changes, each measured on its own. Without \`structuredClone\`, rebuilding takes ${f.rebuildNoClone}, which is still no faster than a duplicated store. A tighter encoding saves ${f.shapeCompact} of heap on the same-shape workload, about level with a plain reference.
- **What is worth reusing:** the benchmark method. Each receipt is bound to the code that produced it, and the real-model equivalence check also runs against a deliberately wrong cache, which shows whether that check can fail at all.

These values come from one host and small GPT-2-family models. They do not say how the kit behaves on a production server.

`;
}

/** @param {object} summary analysis summary */
export function renderEvidenceBlock(summary) {
  const s = summary.deterministic.sensitivity;
  const largest = Math.max(...summary.heap.rows.map((r) => r.sessions));
  const heap = (workload, condition) => summary.heap.rows.find((r) => r.workload === workload && r.condition === condition && r.sessions === largest);
  const latency = (workload, condition) => summary.latency.rows.find((r) => r.workload === workload && r.condition === condition);
  const runs = completedRuns(summary);
  const span = (values) => `${times(Math.min(...values))} to ${times(Math.max(...values))}`;
  const device = runs.filter((r) => r.residency.reduction.device != null);
  const kv = device.reduce((best, r) => (r.residency.kvBytesPerTokenFormula > (best?.residency.kvBytesPerTokenFormula ?? 0) ? r : best), null);
  const lines = [
    ...(verdictFacts(summary)
      ? ['**In short:** sharing a prompt prefix across sessions is the one thing here that performs, and production prefix caches already do it. The rhyming engine does not beat a plain object reference in memory, and it is slower to rebuild a session. [The results page](./docs/benchmarks/RESULTS.md) has the short answer with its numbers.', '']
      : []),
    `Generated from the receipts in [\`output/data/\`](./output/data/README.md). Measured values are from **${summary.heap.host.cpuModel}**. [Full results and the claim ledger](./docs/benchmarks/RESULTS.md).`,
    '',
    `- **Representation bytes** (deterministic): the published aggregate reproduces at **${pct(s.published.ratio)}**. It is ${pct(s.unweightedMean.ratio)} with equal weights and ${pct(s.lossless.ratio)} over lossless workloads, against a target of ${pct0(s.target)}.`,
    `- **Live memory** (measured, ${int(largest)} sessions sharing a system prompt): JSON predicts ${pct(heap('ai_context', 'tiny').jsonReduction)} and the V8 heap falls **${pct(heap('ai_context', 'tiny').heapReduction.estimate)}**. A plain object reference reaches ${pct(heap('ai_context', 'aliased').heapReduction.estimate)}.`,
    `- **Same shape, different words** (measured): JSON predicts ${pct(heap('rhyme_differing', 'tiny').jsonReduction)} and the shipped engine's heap shows **${pct(heap('rhyme_differing', 'tiny').heapReduction.estimate)}**. A tighter encoding of the same idea reaches ${pct(heap('rhyme_differing', 'tiny_compact').heapReduction.estimate)}, level with a plain reference at ${pct(heap('rhyme_differing', 'aliased').heapReduction.estimate)}.`,
    `- **In-process latency** (measured): materializing a session takes ${times(latency('ai_context', 'tiny').ratioToDuplicated.estimate)} to ${times(latency('rhyme_differing', 'tiny').ratioToDuplicated.estimate)} the time of reading a duplicated store.`,
  ];
  if (runs.length > 0) {
    lines.push(`- **Real models** (measured): reusing a shared prefix speeds prefill by **${span(runs.map((r) => r.prefillCall.speedup.estimate))}**, with decode at ${span(runs.map((r) => r.decodeBatch.speedup.estimate))}. A production prefix cache provides the same mechanism.`);
  }
  if (kv) {
    lines.push(`- **Key-value residency** (measured, \`${kv.model.id.split('/').pop()}\` on ${kv.backend.toUpperCase()}): **${pct(kv.residency.reduction.device)}** on the device allocator, ${pct(kv.withWeights.reduction)} once weights are counted.`);
  }
  if (kv?.rhymeSharing) {
    lines.push(`- **Rhymes on real tensors** (measured, \`${kv.model.id.split('/').pop()}\`): with ${pct(kv.rhymeSharing.changedTokens / kv.rhymeSharing.positions)} of tokens changed, ${pct(kv.rhymeSharing.matchingCellFraction)} of KV cells repeat, and resuming from the other prompt's cache moves logits by ${fixed2(kv.rhymeSharing.resumeFromRhymingCache.worstLogitAbsDifference)}. The simulated ${pct(summary.h100.workloads.rhymingDifferentWording.comparison.tinyKvReductionVersusPrefixCache)} H100 saving for rhymes has no measurement behind it.`);
  }
  lines.push(`- **Not established:** a reduction of ${pct0(s.target)} in DRAM or accelerator memory for AI serving.`);
  return lines.join('\n');
}

/**
 * Replace the generated block in a README, leaving everything else alone.
 *
 * @param {string} readme
 * @param {string} block
 */
export function replaceEvidenceBlock(readme, block) {
  const start = readme.indexOf(BLOCK_START);
  const end = readme.indexOf(BLOCK_END);
  if (start === -1 || end === -1 || end < start) throw new Error('README has no generated evidence block');
  return `${readme.slice(0, start + BLOCK_START.length)}\n${block}\n${readme.slice(end)}`;
}

/** @param {object} summary analysis summary */
export function renderResultsDoc(summary) {
  const s = summary.deterministic.sensitivity;
  return `# Benchmark results

<!-- Generated by scripts/generate_results_doc.mjs from output/data/analysis_summary.json. Do not edit. -->

These tables come from the receipts under [\`output/data/\`](../../output/data/README.md). The measured tables describe one host: **${summary.heap.host.cpuModel}**, Node ${summary.heap.host.node}. Run the benchmarks yourself for your own machine; see [running the benchmarks](running.md).

${renderShortAnswer(summary)}## Representation bytes

Deterministic. Identical on any machine.

${workloadsTable(summary)}

Aggregate: **${pct(s.published.ratio)}** byte-weighted, ${pct(s.unweightedMean.ratio)} with equal weights, ${pct(s.lossless.ratio)} over lossless workloads, ${pct(s.nonStrawman.ratio)} without the anti-pattern baseline. Target: ${pct0(s.target)}.

## Live V8 heap

Measured, at the largest session count.

${heapTable(summary)}

## Resident set size

Measured, ingesting sessions one at a time.

${rssTable(summary)}

## Materialization latency

Measured. Medians over independent processes.

${latencyTable(summary)}

## Real models

Measured. Logits and greedy tokens are compared between arms, turn by turn, and a wrong-prefix control shows whether that comparison can see a wrong cache.

${llmTable(summary)}

Key-value residency:

${residencyTable(summary)}

## Claim ledger

Statuses are computed from the data by \`src/analysis/claims.mjs\`.

${claimsTable(summary)}
`;
}
