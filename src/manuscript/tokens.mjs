/**
 * The token catalog: every value the manuscript may state, bound to a source path in
 * the analysis summary and one presentation format. Nothing here computes a result;
 * a missing source throws instead of substituting a plausible value.
 */
import fs from 'node:fs';
import path from 'node:path';
import { completedRuns } from '../analysis/measured-summary.mjs';
import { canonicalStringify, sha256 } from '../core/canonical-json.mjs';
import { fixed2, int, interval, mib, ms, pct, pct0, sci, text, times, word } from '../core/format.mjs';
import { loadProductConfig } from '../core/config.mjs';
import { readPath } from './source-path.mjs';
import { claimsTable, heapTable, latencyTable, llmTable, residencyTable, rssTable, workloadsTable } from './tables.mjs';

const GIB = 1024 ** 3;

function listJoin(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function rangeOf(values, format) {
  const low = Math.min(...values);
  const high = Math.max(...values);
  return format(low) === format(high) ? format(low) : interval(low, high, format);
}

class Catalog {
  constructor(summary) {
    this.summary = summary;
    this.entries = [];
  }

  /** A value read directly from one source path. */
  add(token, sourcePath, format = text) {
    this.push(token, format(readPath(this.summary, sourcePath)), sourcePath);
  }

  /** A value derived from several paths; the description states the derivation. */
  derived(token, description, value) {
    this.push(token, value, `derived: ${description}`);
  }

  push(token, value, source) {
    if (typeof value !== 'string' || value.trim() === '') throw new Error(`empty value for token ${token}`);
    if (this.entries.some((entry) => entry.token === token)) throw new Error(`duplicate token ${token}`);
    this.entries.push({ token, value, source });
  }
}

/**
 * @param {object} summary analysis summary
 * @param {object} context
 * @param {object} context.plan benchmark plan
 * @param {string} context.planSha256
 * @param {object} context.registry figure registry
 * @param {object} context.suite suite manifest from this host
 */
export function buildCatalog(summary, { plan, planSha256, registry, suite }) {
  const c = new Catalog(summary);
  const det = 'deterministic';
  const s = `${det}.sensitivity`;
  const version = loadProductConfig().version;
  const heapRows = summary.heap.rows;
  const largest = Math.max(...heapRows.map((r) => r.sessions));
  const smallest = Math.min(...heapRows.map((r) => r.sessions));
  const heapAt = (workload, condition, n = largest) => `heap.rows[workload=${workload},sessions=${n},condition=${condition}]`;
  const lat = (workload, condition) => `latency.rows[workload=${workload},condition=${condition}]`;
  const runs = completedRuns(summary);
  if (runs.length === 0) throw new Error('no completed real-model runs; run scripts/run_llm_matrix.py');
  const memoryRuns = runs.filter((r) => r.residency.reduction.device != null);
  if (memoryRuns.length === 0) throw new Error('no real-model run read a device allocator; run scripts/run_llm_matrix.py on an accelerator');
  const kv = memoryRuns.reduce((best, r) => (r.residency.kvBytesPerTokenFormula > best.residency.kvBytesPerTokenFormula ? r : best));
  const kvPath = `llm[run=${kv.run}]`;
  const trainRuns = runs.filter((r) => r.trainingSpeedup != null);
  const modelNames = [...new Set(runs.map((r) => r.model.id.split('/').pop()))];
  const compression = summary.compression.workloads;
  const tinyByKey = new Map(summary.deterministic.suite.workloads.map((w) => [w.key, w.ratio]));
  const workloadRows = summary.deterministic.suite.workloads;
  const shareOf = (keys) => summary.deterministic.sensitivity.byteShare.filter((b) => keys.includes(b.key)).reduce((sum, b) => sum + b.share, 0);
  const loo = summary.deterministic.sensitivity.leaveOneOut;
  const loads = [summary.heap.load, summary.latency.load, summary.rss.load].flatMap((l) => [l.start.loadAverage.one, l.end.loadAverage.one]);
  const below = summary.deterministic.gpuProxy.sweep.find((p) => p.reductionRatio < summary.target);
  const fullKv = summary.deterministic.gpuProxy.sweep.find((p) => p.deltaFraction === 1);
  const scaling = summary.deterministic.scaling.series;
  const heapTotal = plan.measured.heap.trials * plan.measured.heap.sessions.length *
    Object.values(plan.measured.heap.workloads).reduce((sum, w) => sum + w.conditions.length, 0) +
    plan.measured.heap.controls.length * plan.measured.heap.trials;
  const crossover = plan.deterministic.crossover.duplicateFractions;
  const heapValue = (workload, condition, n) => readPath(summary, `${heapAt(workload, condition, n)}.heapPerSessionBytes`);

  // Metadata
  c.derived('PACKAGE_VERSION', 'package.json version', version);
  c.derived('MEASURED_DATE', 'date of the measured heap receipt', summary.heap.load.start.at.slice(0, 10));
  c.derived('PLAN_SHA256', 'sha256 of benchmarks/plan.json', planSha256);
  c.add('SOURCE_FINGERPRINT', 'heap.sourceFingerprint.sha256');
  c.add('SOURCE_FILES', 'heap.sourceFingerprint.fileCount', int);
  c.add('HIST_SUITE_SHA256', 'historical.receipts.suite.sha256');

  // Host
  c.add('HOST_CPU', 'heap.host.cpuModel');
  c.add('HOST_CORES', 'heap.host.logicalCores', int);
  c.add('HOST_NODE', 'heap.host.node');
  c.add('HOST_V8', 'heap.host.v8');
  c.derived('HOST_MEMORY_GIB', 'heap.host.totalMemoryBytes in GiB', (summary.heap.host.totalMemoryBytes / GIB).toFixed(0));
  c.derived('HOST_PLATFORM', 'heap.host platform, release and architecture', `${summary.heap.host.platform} ${summary.heap.host.release} on ${summary.heap.host.arch}`);
  c.derived('LOAD_RANGE', 'one-minute load average across measured receipts', rangeOf(loads, fixed2));

  // Plan
  c.add('SEED_PRIMARY', 'seeds.primary', String);
  c.add('SEED_VALIDATION', 'seeds.validation', String);
  c.add('SEED_BOOTSTRAP', 'bootstrap.seed', String);
  c.add('BOOT_RESAMPLES', 'bootstrap.resamples', int);
  c.add('BOOT_CONFIDENCE', 'bootstrap.confidence', pct0);
  c.derived('SCALING_SESSIONS', 'plan session grid bounds', `${plan.deterministic.scaling.sessions.length} session counts up to ${int(Math.max(...plan.deterministic.scaling.sessions))}`);
  c.derived('SCALING_TURNS', 'plan turn grid', listJoin(plan.deterministic.scaling.turns.map(String)));
  c.derived('CROSSOVER_LOW', 'plan duplicate grid minimum', pct0(Math.min(...crossover)));
  c.derived('CROSSOVER_HIGH', 'plan duplicate grid maximum', pct0(Math.max(...crossover)));
  c.derived('CROSSOVER_SESSIONS', 'plan crossover sessions', word(plan.deterministic.crossover.sessions));
  c.derived('HEAP_WORKLOADS', 'plan heap workload count', word(Object.keys(plan.measured.heap.workloads).length));
  c.derived('HEAP_SESSIONS', 'plan heap session grid', listJoin(plan.measured.heap.sessions.map(int)));
  c.derived('HEAP_TRIALS', 'plan heap trials', String(plan.measured.heap.trials));
  c.derived('HEAP_TOTAL', 'trials times cells, plus controls', int(heapTotal));
  c.derived('HEAP_LARGEST', 'largest heap session count', int(largest));
  c.derived('HEAP_SMALLEST', 'smallest heap session count', int(smallest));
  c.derived('RSS_SESSIONS', 'plan RSS sessions', int(plan.measured.rss.sessions));
  c.derived('RSS_TRIALS', 'plan RSS trials', String(plan.measured.rss.trials));
  c.derived('LAT_PROCESSES', 'plan latency processes', String(plan.measured.latency.processes));
  c.derived('LAT_WARMUP', 'plan latency warm-up', int(plan.measured.latency.warmupOps));
  c.derived('LAT_OPS', 'plan latency operations', int(plan.measured.latency.measuredOps));
  c.derived('LAT_BATCH', 'plan latency batch', String(plan.measured.latency.batch));
  c.derived('LAT_SESSIONS', 'plan latency sessions', String(plan.measured.latency.sessions));

  // Aggregate and workloads
  c.add('TARGET', `${s}.target`, pct0);
  c.add('AGG_PUBLISHED', `${s}.published.ratio`, pct);
  c.add('AGG_UNWEIGHTED', `${s}.unweightedMean.ratio`, pct);
  c.add('AGG_LOSSLESS', `${s}.lossless.ratio`, pct);
  c.add('AGG_NON_STRAWMAN', `${s}.nonStrawman.ratio`, pct);
  c.derived('BYTE_SHARE_CE', 'byte share of workloads C and E', pct(shareOf(['C', 'E'])));
  c.derived('LOO_CLEARS', 'leave-one-out variants clearing the target', word(loo.filter((l) => l.clearsTarget).length));
  c.derived('LOO_TOTAL', 'leave-one-out variants', word(loo.length));
  c.derived('LOO_FAILING', 'workloads whose removal falls below the target', listJoin(loo.filter((l) => !l.clearsTarget).map((l) => l.leftOut)));
  c.add('E_REDUCTION', `${det}.suite.workloads[key=E].ratio`, pct);
  c.add('E_WORKING', `${det}.exactness.E.matched`, int);
  c.add('E_TOTAL', `${det}.exactness.E.checked`, int);
  c.add('C_TO_NORMALIZED', `${det}.baselines.conventionalToNormalized`, pct);
  c.derived('C_TINY_OVER_NORMALIZED', 'Tiny versus the normalized graph', pct(-readPath(summary, `${det}.baselines.normalizedToTiny`)));
  c.derived('GZIP_BEATS_COUNT', 'lossless workloads where gzip exceeds the template reduction', word(compression.filter((w) => w.gzipReduction > tinyByKey.get(w.key)).length));
  c.derived('GZIP_TOTAL', 'lossless workloads compared with gzip', word(compression.length));

  // Scaling and crossover
  c.derived('SCALING_MAX_ERROR', 'largest absolute error, in percentage points', Math.max(...scaling.map((series) => series.maxAbsoluteError * 100)).toFixed(1));
  c.derived('SCALING_LONG_TURNS', 'longest turn count', String(scaling[scaling.length - 1].turns));
  c.derived('SCALING_LONG_REDUCTION', 'reduction at the longest turn count', pct(scaling[scaling.length - 1].measuredAtLargestN));
  c.derived('SCALING_SHORT_TURNS', 'shortest turn count', word(scaling[0].turns));
  c.derived('SCALING_SHORT_REDUCTION', 'reduction at the shortest turn count', pct(scaling[0].measuredAtLargestN));
  c.add('RHYME_DIFFERING_BYTES', `${det}.suite.rhyme.differingWords.rhymeBytes`, int);
  c.add('RHYME_DIFFERING_CACHE', `${det}.suite.rhyme.differingWords.cacheBytes`, int);
  c.add('RHYME_VS_CACHE', `${det}.suite.rhyme.differingWords.rhymeVersusCache`, pct);
  c.add('RHYME_IDENTICAL_CACHE', `${det}.suite.rhyme.identicalText.cacheBytes`, int);
  c.add('RHYME_IDENTICAL_BYTES', `${det}.suite.rhyme.identicalText.rhymeBytes`, int);
  c.add('CROSSOVER_AT', `${det}.crossover.cacheFirstSmallerAt`, pct0);

  // Heap
  c.add('CONTROL_EMPTY', 'heap.controls.emptyMedianBytes', int);
  c.add('CONTROL_EMPTY_MAX', 'heap.controls.emptyMaxBytes', int);
  c.add('CONTROL_KNOWN', 'heap.controls.knownMedianBytes', int);
  c.add('CONTROL_EXPECTED', 'heap.controls.knownExpectedBytes', int);
  c.add('CONTROL_ERROR', 'heap.controls.knownRelativeError', (x) => `${(x * 100).toFixed(2)}%`);
  c.add('CONTROL_TRIALS', 'heap.controls.trials', String);
  c.derived('HEAP_CELLS', 'cells in the heap design', int(heapRows.length));
  c.derived('HEAP_EXACT_CELLS', 'cells where every process read the same value', int(heapRows.filter((r) => r.heap.low === r.heap.high).length));
  c.derived('HEAP_CHILD_FLAGS', 'V8 flags on heap measurements', listJoin(summary.heap.childFlags.map((flag) => `\`${flag}\``)));
  c.add('HEAP_AI_TINY_JSON', `${heapAt('ai_context', 'tiny')}.jsonReduction`, pct);
  c.add('HEAP_AI_TINY', `${heapAt('ai_context', 'tiny')}.heapReduction.estimate`, pct);
  c.add('HEAP_AI_ALIASED', `${heapAt('ai_context', 'aliased')}.heapReduction.estimate`, pct);
  c.derived('HEAP_AI_TINY_VS_ALIASED', 'Tiny and aliased heap medians at the largest count', `${(100 * Math.abs(readPath(summary, `${heapAt('ai_context', 'tiny')}.heap.estimate`) / readPath(summary, `${heapAt('ai_context', 'aliased')}.heap.estimate`) - 1)).toFixed(2)}%`);
  c.add('HEAP_RHYME_TINY_JSON', `${heapAt('rhyme_differing', 'tiny')}.jsonReduction`, pct);
  c.add('HEAP_RHYME_TINY', `${heapAt('rhyme_differing', 'tiny')}.heapReduction.estimate`, pct);
  c.add('HEAP_RHYME_COMPACT', `${heapAt('rhyme_differing', 'tiny_compact')}.heapReduction.estimate`, pct);
  c.add('HEAP_RHYME_ALIASED', `${heapAt('rhyme_differing', 'aliased')}.heapReduction.estimate`, pct);
  c.derived('HEAP_RHYME_CACHE_INCREASE', 'exact cache versus duplicated', pct(-readPath(summary, `${heapAt('rhyme_differing', 'exact_cache')}.heapReduction.estimate`)));
  c.add('HEAP_IDENTICAL_CACHE', `${heapAt('rhyme_identical', 'exact_cache')}.heapReduction.estimate`, pct);
  c.derived('HEAP_RHYME_TINY_SMALLEST_BYTES', 'per-session heap at the smallest count', int(heapValue('rhyme_differing', 'tiny', smallest)));
  c.derived('HEAP_RHYME_DUP_SMALLEST_BYTES', 'per-session heap at the smallest count', int(heapValue('rhyme_differing', 'duplicated', smallest)));
  const sessionCounts = [...new Set(heapRows.map((r) => r.sessions))].sort((a, b) => a - b);
  const breakEven = sessionCounts.find((n) => heapValue('rhyme_differing', 'tiny', n) < heapValue('rhyme_differing', 'duplicated', n));
  if (breakEven === undefined) throw new Error('the shipped engine never uses less heap than duplication on this grid; rewrite the sentence that says it does');
  c.derived('HEAP_RHYME_BREAKEVEN', 'first session count where the shipped engine uses less heap than duplication', int(breakEven));

  // RSS
  c.add('RSS_DUPLICATED', 'rss.rows[condition=duplicated].rss.estimate', mib);
  c.add('RSS_TINY', 'rss.rows[condition=tiny].rss.estimate', mib);
  c.add('RSS_TINY_REDUCTION', 'rss.rows[condition=tiny].rssReduction.estimate', pct);
  c.add('RSS_TINY_HEAP_REDUCTION', 'rss.rows[condition=tiny].heapReduction', pct);
  c.add('RSS_ALIASED_REDUCTION', 'rss.rows[condition=aliased].rssReduction.estimate', pct);
  c.add('RSS_PEAK_DUPLICATED', 'rss.rows[condition=duplicated].peakRssMedianBytes', mib);
  c.add('RSS_PEAK_TINY', 'rss.rows[condition=tiny].peakRssMedianBytes', mib);

  // Latency
  c.add('LAT_AI_TINY_RATIO', `${lat('ai_context', 'tiny')}.ratioToDuplicated.estimate`, times);
  c.add('LAT_RHYME_TINY_RATIO', `${lat('rhyme_differing', 'tiny')}.ratioToDuplicated.estimate`, times);
  c.add('LAT_AI_NOCLONE_RATIO', `${lat('ai_context', 'tiny_noclone')}.ratioToDuplicated.estimate`, times);
  c.add('LAT_RHYME_NOCLONE_RATIO', `${lat('rhyme_differing', 'tiny_noclone')}.ratioToDuplicated.estimate`, times);
  c.derived('LAT_EXACT', 'exact reconstructions across latency conditions', int(summary.latency.rows.reduce((sum, r) => sum + r.exactReconstructions, 0)));
  c.derived('LAT_CHECKED', 'reconstructions checked across latency conditions', int(summary.latency.rows.reduce((sum, r) => sum + r.checkedReconstructions, 0)));

  // Real-model lab
  c.derived('LLM_MODEL_NAMES', 'distinct model names run', listJoin(modelNames.map((name) => `\`${name}\``)));
  c.derived('LLM_BACKENDS', 'distinct backends run', listJoin([...new Set(runs.map((r) => r.backend.toUpperCase()))]));
  c.derived('LLM_RUNS', 'completed runs', word(runs.length));
  c.derived('LLM_DTYPE', 'weight type from receipts', runs[0].model.dtype);
  c.derived('LLM_PYTHON', 'lab software', runs[0].software.python);
  c.derived('LLM_TORCH', 'lab software', runs[0].software.torch);
  c.derived('LLM_TRANSFORMERS', 'lab software', runs[0].software.transformers);
  // The plan lists the original lab's model first.
  const [originalRun] = plan.llm.runs;
  const largerRun = plan.llm.runs.find((run) => run.model !== originalRun.model);
  c.derived('LLM_MODEL_ORIGINAL', 'the plan\'s first model', `\`${originalRun.model.split('/').pop()}\``);
  c.derived('LLM_MODEL_LARGER', 'the plan\'s other model', `\`${largerRun.model.split('/').pop()}\``);
  c.derived('LLM_PREFIX_ORIGINAL', 'prefix tokens for the first model', String(originalRun.prefixTokens));
  c.derived('LLM_PREFIX_LARGER', 'prefix tokens for the other model', String(largerRun.prefixTokens));
  c.derived('LLM_SESSIONS', 'plan sessions', word(plan.llm.sessions));
  c.derived('LLM_TURNS', 'plan turns', word(plan.llm.userTurns));
  c.derived('LLM_SUFFIX_TOKENS', 'suffix tokens from receipts', String(runs[0].workload.suffixTokens));
  c.derived('LLM_NEW_TOKENS', 'plan decoded tokens', word(plan.llm.newTokens));
  c.derived('LLM_TRIALS', 'plan trials', word(plan.llm.trials));
  c.derived('LLM_PREFILL_RANGE', 'prefill speedups across runs', rangeOf(runs.map((r) => r.prefillCall.speedup.estimate), times));
  c.derived('LLM_DECODE_RANGE', 'decode speedups across runs', rangeOf(runs.map((r) => r.decodeBatch.speedup.estimate), times));
  c.derived('LLM_END_TO_END_RANGE', 'prefill plus decode speedups across runs', rangeOf(runs.map((r) => r.endToEndBatch.speedup.estimate), times));
  c.derived('LLM_TRAIN_RANGE', 'training speedups across runs', rangeOf(trainRuns.map((r) => r.trainingSpeedup), times));
  c.derived('LLM_TRAIN_STEPS', 'training rounds', String(trainRuns[0].trainingSteps));
  c.derived('LLM_TOKENS_EQUAL', 'turns with equal greedy tokens across runs', int(runs.reduce((sum, r) => sum + r.equivalence.tokenSequencesEqual, 0)));
  c.derived('LLM_TOKENS_TOTAL', 'turns compared across runs', int(runs.reduce((sum, r) => sum + r.equivalence.turns, 0)));
  c.derived('LLM_WORST_LOGIT', 'worst logit difference across runs', sci(Math.max(...runs.map((r) => r.equivalence.worstLogitAbsDifference))));
  const caught = runs.filter((r) => r.equivalence.control?.detected);
  const missed = runs.filter((r) => !r.equivalence.control?.detected);
  const controlNames = (list) => listJoin([...new Set(list.map((r) => `\`${r.model.id.split('/').pop()}\``))]);
  c.derived('LLM_CONTROL_CAUGHT', 'models on which the check catches a wrong prefix', controlNames(caught));
  c.derived('LLM_CONTROL_MISSED', 'models on which the check does not', controlNames(missed));
  c.derived('LLM_CONTROL_WORST_LOGIT', 'worst true-cache logit difference where the control was caught', sci(Math.max(...caught.map((r) => r.equivalence.worstLogitAbsDifference))));
  c.derived('LLM_CONTROL_WRONG_TOKENS_EQUAL', 'turns whose greedy tokens still matched under a wrong cache, where the control was caught', int(caught.reduce((sum, r) => sum + r.equivalence.control.tokenSequencesEqual, 0)));
  c.derived('LLM_CONTROL_TOKENS_TOTAL', 'turns compared where the control was caught', int(caught.reduce((sum, r) => sum + r.equivalence.turns, 0)));
  c.derived('LLM_CONTROL_CAUGHT_LOGIT', 'smallest wrong-prefix logit difference where it was caught', fixed2(Math.min(...caught.map((r) => r.equivalence.control.worstLogitAbsDifference))));
  c.derived('LLM_CONTROL_MISSED_LOGIT', 'largest wrong-prefix logit difference where it was missed', sci(Math.max(...missed.map((r) => r.equivalence.control.worstLogitAbsDifference))));
  c.derived('LLM_LOGIT_TOLERANCE', 'plan tolerance', String(plan.llm.logitTolerance));
  c.derived('KV_MODEL', 'largest measured run', `\`${kv.model.id.split('/').pop()}\``);
  c.derived('KV_BACKEND', 'largest measured run', kv.backend.toUpperCase());
  c.add('KV_SESSIONS', `${kvPath}.residency.sessions`, word);
  c.add('KV_PREDICTED', `${kvPath}.residency.reduction.predicted`, pct);
  c.add('KV_DEVICE_REDUCTION', `${kvPath}.residency.reduction.device`, pct);
  c.add('KV_WITH_WEIGHTS', `${kvPath}.withWeights.reduction`, pct);
  c.add('KV_WEIGHTS', `${kvPath}.withWeights.weightBytes`, mib);
  c.add('KV_MATERIALIZE', `${kvPath}.residency.materializeMs.p50Ms`, ms);
  c.add('KV_REBUILD_DIFF', `${kvPath}.residency.concatWorstAbsDifference`, sci);

  // Simulation
  c.add('H100_NAME', 'h100.device.name');
  c.add('H100_SESSIONS', 'h100.workload.sessions', word);
  c.add('H100_PREFIX', 'h100.workload.prefixTokens', int);
  c.add('H100_SUFFIX', 'h100.workload.suffixTokens', int);
  c.add('H100_KV_REDUCTION', 'h100.comparison.kvReductionVersusNaive', pct);
  c.add('H100_RESIDENT_REDUCTION', 'h100.comparison.residentReductionVersusNaive', pct);
  c.derived('H100_TINY_VS_PREFIX', 'Tiny minus prefix-cache resident bytes', word(readPath(summary, 'h100.comparison.tinyVersusPrefixCacheResidentBytes')));

  // Historical
  c.add('HIST_DEVICE', 'historical.device');
  c.add('HIST_AGGREGATE', 'historical.aggregate.historicalRatio', pct);
  c.add('HIST_ALLOC', 'historical.gpuAllocation.historicalReductionRatio', pct);
  c.add('HIST_ALLOC_CONVENTIONAL', 'historical.gpuAllocation.conventionalMib', int);
  c.add('HIST_ALLOC_TINY', 'historical.gpuAllocation.tinyMib', (x) => x.toFixed(1));
  c.add('HIST_TRAIN', 'historical.realLlm.trainStepP50Speedup', times);
  c.add('HIST_SMI_CONV', 'historical.gpuMeasured.smiConventionalPeakMib', String);
  c.add('HIST_SMI_TINY', 'historical.gpuMeasured.smiTinyPeakMib', String);
  c.add('HIST_TURN_SPEEDUP', 'historical.gpuMeasured.turnSpeedup', times);
  c.add('HIST_TURN_SPEEDUP_SUITE', 'historical.gpuMeasured.suiteTurnSpeedup', times);
  c.add('HIST_TRAIN_STEPS', 'historical.realLlm.trainSteps', word);
  c.add('HIST_PAYLOAD_RATIO', 'historical.gpuMeasured.payloadRatio', times);
  c.add('HIST_LLM_SMI', 'historical.realLlm.nvidiaSmiUsedMib', String);
  c.add('GPU_SESSIONS', `${det}.gpuProxy.inputs.sessions`, word);
  c.add('GPU_KV', `${det}.gpuProxy.inputs.kvMibPerSession`, word);
  c.add('GPU_SYS', `${det}.gpuProxy.inputs.systemPromptMib`, String);
  c.add('GPU_DELTA', `${det}.gpuProxy.assumedDeltaFraction`, pct0);
  c.derived('GPU_DELTA_BELOW_TARGET', 'first sweep value below the target', pct0(below.deltaFraction));
  c.derived('GPU_REDUCTION_FULL_KV', 'sweep value at a delta of the whole buffer', pct(fullKv.reductionRatio));
  c.add('GPU_LIVE_STATUS', 'gpuLive.status');
  c.add('GPU_LIVE_REASON', 'gpuLive.reason');

  // Suite on this host
  c.derived('SUITE_VERDICT', 'suite manifest on this host', suite.verdict);
  c.derived('SUITE_PASS', 'suite manifest on this host', word(suite.n_pass));
  c.derived('SUITE_FAIL', 'suite manifest on this host', word(suite.n_fail));
  c.derived('SUITE_NOT_RUN', 'suite manifest on this host', word(suite.n_not_run));

  // Tables
  c.derived('TABLE_WORKLOADS', 'workloads table', workloadsTable(summary));
  c.derived('TABLE_HEAP', 'heap table', heapTable(summary));
  c.derived('TABLE_RSS', 'RSS table', rssTable(summary));
  c.derived('TABLE_LATENCY', 'latency table', latencyTable(summary));
  c.derived('TABLE_LLM', 'real-model table', llmTable(summary));
  c.derived('TABLE_RESIDENCY', 'residency table', residencyTable(summary));
  c.derived('TABLE_CLAIMS', 'computed claim ledger', claimsTable(summary));

  // Figure captions come from the figure registry, generated with the figure itself.
  for (const [label, record] of Object.entries(registry)) {
    const token = `FIG_${label.replace(/^fig:/, '').toUpperCase()}_CAPTION`;
    c.derived(token, `figure registry entry ${label}`, record.caption);
  }

  // The catalog states its own size last, so this token counts itself.
  c.derived('TOKEN_COUNT', 'tokens in this catalog', int(c.entries.length + 1));
  return c.entries;
}

/** @param {ReturnType<typeof buildCatalog>} entries */
export function variablesFrom(entries) {
  return Object.fromEntries(entries.map((entry) => [entry.token, entry.value]));
}

/**
 * @param {string} dataDir
 * @param {ReturnType<typeof buildCatalog>} entries
 */
export function writeCatalog(dataDir, entries) {
  fs.writeFileSync(path.join(dataDir, 'manuscript_variables.json'), canonicalStringify(variablesFrom(entries)));
  fs.writeFileSync(path.join(dataDir, 'manuscript_catalog.json'), canonicalStringify({ tokens: entries }));
  return sha256(canonicalStringify(variablesFrom(entries)));
}

