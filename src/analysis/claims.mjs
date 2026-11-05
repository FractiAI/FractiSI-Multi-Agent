/**
 * The claim ledger: each public statement, what tested it, and an outcome computed
 * from the data. Statuses are derived rather than authored, so a change in the data
 * can change a verdict and no one has to remember to update prose.
 */
import { fixed2, int, pct, pct0, sci, times } from '../core/format.mjs';
import { completedRuns } from './measured-summary.mjs';

export const CLAIM_STATUS = Object.freeze({
  REPRODUCED: 'reproduced',
  QUALIFIED: 'reproduced with a qualification',
  NOT_REPRODUCED: 'not reproduced',
  NOT_TESTABLE: 'not testable on this host',
  CORRECTED: 'corrected in this repository',
});

const heapRow = (summary, workload, condition, sessions) =>
  summary.heap.rows.find((r) => r.workload === workload && r.condition === condition && r.sessions === sessions);
const latencyRow = (summary, workload, condition) =>
  summary.latency.rows.find((r) => r.workload === workload && r.condition === condition);
const range = (values, format) => {
  const low = Math.min(...values);
  const high = Math.max(...values);
  return low === high ? format(low) : `${format(low)} to ${format(high)}`;
};

/** @param {object} summary analysis summary, before claims are attached */
export function evaluateClaims(summary) {
  const { sensitivity, suite, gpuProxy } = summary.deterministic;
  const historical = summary.historical;
  const largest = Math.max(...summary.heap.rows.map((r) => r.sessions));
  const runs = completedRuns(summary);
  const aiTiny = heapRow(summary, 'ai_context', 'tiny', largest);
  const aiAliased = heapRow(summary, 'ai_context', 'aliased', largest);
  const rhymeTiny = heapRow(summary, 'rhyme_differing', 'tiny', largest);
  const rhymeCompact = heapRow(summary, 'rhyme_differing', 'tiny_compact', largest);
  const rhymeAliased = heapRow(summary, 'rhyme_differing', 'aliased', largest);
  const latencyAi = latencyRow(summary, 'ai_context', 'tiny');
  const latencyRhyme = latencyRow(summary, 'rhyme_differing', 'tiny');
  const noCloneAi = latencyRow(summary, 'ai_context', 'tiny_noclone');
  const noCloneRhyme = latencyRow(summary, 'rhyme_differing', 'tiny_noclone');
  const alternatives = [sensitivity.unweightedMean, sensitivity.lossless, sensitivity.nonStrawman];
  const failing = alternatives.filter((a) => !a.clearsTarget).length;
  const differing = suite.rhyme.differingWords;
  const identical = suite.rhyme.identicalText;
  const rhymeJson = differing.rhymeVersusNaive;
  const trainRuns = runs.filter((run) => run.trainingSpeedup != null);
  const trainSpeedups = trainRuns.map((run) => run.trainingSpeedup);
  const prefillSpeedups = runs.map((run) => run.prefillCall.speedup.estimate);
  const decodeSpeedups = runs.map((run) => run.decodeBatch.speedup.estimate);
  const endToEndSpeedups = runs.map((run) => run.endToEndBatch.speedup.estimate);
  const accelerator = runs.filter((run) => run.residency.reduction.device != null);
  const biggest = accelerator.reduce((best, run) => (run.residency.kvBytesPerTokenFormula > (best?.residency.kvBytesPerTokenFormula ?? 0) ? run : best), null);
  const kvAnalogue = biggest
    ? `A real-model analogue is measured here: key-value residency ${pct(biggest.residency.reduction.device)} on the ${biggest.backend.toUpperCase()} allocator, ${pct(biggest.withWeights.reduction)} once weights are counted.`
    : 'The real-model lab did not read a device allocator on this host.';
  const notRunHere = 'The real-model lab did not run on this host.';
  const caught = runs.filter((run) => run.equivalence.control?.detected);
  const missed = runs.filter((run) => !run.equivalence.control?.detected);
  const modelNames = (list) => [...new Set(list.map((run) => run.model.id.split('/').pop()))].join(' and ');
  const equivalenceNote = [
    caught.length > 0 ? `Logits match a full prefill to within ${sci(Math.max(...caught.map((run) => run.equivalence.worstLogitAbsDifference)))} on ${modelNames(caught)}, where the check catches a cache built from the wrong prefix.` : 'On no model does the equivalence check catch a cache built from the wrong prefix.',
    missed.length > 0 && caught.length > 0 ? `On ${modelNames(missed)} it does not, so those turns show nothing.` : '',
  ].filter(Boolean).join(' ');
  const gate = summary.deterministic.rhymeGate;
  const { K, L, M } = summary.deterministic.companions;
  const rhymeSim = summary.h100.workloads.rhymingDifferentWording.comparison;
  const assumedShare = summary.h100.workload.rhymeSharedOrgFraction;
  const measuredShare = biggest?.rhymeSharing;
  const shareHolds = measuredShare != null && measuredShare.matchingCellFraction >= assumedShare && measuredShare.resumeFromRhymingCache.equivalent;
  const residentAtTarget = runs.filter((run) => run.withWeights.reduction >= sensitivity.target);
  const faster = [latencyAi, latencyRhyme].filter((row) => row.ratioToDuplicated.high < 1).length;
  const smi = historical.gpuMeasured;
  const gpuRanHere = summary.gpuLive.status === 'pass';

  return [
    {
      id: 'aggregate',
      claim: `Aggregate representation reduction of ${pct(historical.aggregate.historicalRatio)}, clearing the ${pct0(sensitivity.target)} gate`,
      evidence: `${historical.aggregate.reproduced ? 'Reproduced to every digit' : 'Does not match the historical receipt, recomputed'} at ${pct(sensitivity.published.ratio)}. ${failing} of ${alternatives.length} alternative aggregates fall below the gate: equal weight ${pct(sensitivity.unweightedMean.ratio)}, lossless only ${pct(sensitivity.lossless.ratio)}, without the anti-pattern baseline ${pct(sensitivity.nonStrawman.ratio)}.`,
      status: !historical.aggregate.reproduced ? CLAIM_STATUS.NOT_REPRODUCED : failing > 0 ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.REPRODUCED,
    },
    {
      id: 'memory_shared_prompt',
      claim: 'Sharing a system prompt across sessions uses less memory',
      evidence: `At ${int(largest)} sessions the live heap falls ${pct(aiTiny.heapReduction.estimate)} against the JSON prediction of ${pct(aiTiny.jsonReduction)}. A plain object reference reaches ${pct(aiAliased.heapReduction.estimate)} with no engine.`,
      status: aiTiny.heapReduction.estimate <= 0
        ? CLAIM_STATUS.NOT_REPRODUCED
        : aiTiny.heapReduction.estimate >= aiTiny.jsonReduction && aiTiny.heapReduction.estimate > aiAliased.heapReduction.estimate
          ? CLAIM_STATUS.REPRODUCED
          : CLAIM_STATUS.QUALIFIED,
    },
    {
      id: 'rhyme_bytes',
      claim: `A rhyme stores about ${pct0(rhymeJson)} less when sessions share a shape and differ in words`,
      evidence: `${rhymeJson > 0 ? 'True' : 'False'} of JSON bytes (${pct(rhymeJson)}). In the live heap at ${int(largest)} sessions the shipped engine saves ${pct(rhymeTiny.heapReduction.estimate)}, and a tighter encoding of the same idea ${pct(rhymeCompact.heapReduction.estimate)}, against ${pct(rhymeAliased.heapReduction.estimate)} for a plain reference.`,
      status: rhymeJson <= 0
        ? CLAIM_STATUS.NOT_REPRODUCED
        : rhymeTiny.heapReduction.estimate >= rhymeJson ? CLAIM_STATUS.REPRODUCED : CLAIM_STATUS.QUALIFIED,
    },
    {
      id: 'rhyme_vs_cache',
      claim: 'An exact-text cache wins when every session repeats the same words',
      evidence: `${identical.cacheBytes < identical.rhymeBytes ? 'Reproduced' : 'Not reproduced'}: cache ${int(identical.cacheBytes)} bytes, rhyme ${int(identical.rhymeBytes)} bytes. The cache is first smaller at ${pct0(summary.deterministic.crossover.cacheFirstSmallerAt)} duplicates on the tested grid.`,
      status: identical.cacheBytes < identical.rhymeBytes ? CLAIM_STATUS.REPRODUCED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'latency_in_process',
      claim: 'Lower latency from reconstructing a working set',
      evidence: `In process, materializing a session takes ${times(latencyAi.ratioToDuplicated.estimate)} and ${times(latencyRhyme.ratioToDuplicated.estimate)} the duplicated store's time for the two workloads, or ${times(noCloneAi.ratioToDuplicated.estimate)} and ${times(noCloneRhyme.ratioToDuplicated.estimate)} without cloning.`,
      status: faster === 2 ? CLAIM_STATUS.REPRODUCED : faster === 1 ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'prefill',
      claim: `Real-model prefill speedup of ${times(historical.realLlm.prefillP50Speedup)} (historical, GTX 860M)`,
      evidence: runs.length === 0
        ? notRunHere
        : `Direction reproduced on this host: ${range(prefillSpeedups, times)} per turn. Decode alone ${range(decodeSpeedups, times)}; prefill plus decode ${range(endToEndSpeedups, times)}. The tested mechanism is prefix reuse, which a prefix cache already provides. ${equivalenceNote}`,
      status: runs.length === 0 ? CLAIM_STATUS.NOT_TESTABLE : Math.min(...prefillSpeedups) > 1 ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'train_step',
      claim: `Real-model train-step speedup of ${times(historical.realLlm.trainStepP50Speedup)} (historical, GTX 860M)`,
      evidence: trainRuns.length === 0
        ? notRunHere
        : `Warmed up and with arms interleaved, this host gives ${range(trainSpeedups, times)}, with intervals spanning ${times(Math.min(...trainRuns.map((run) => run.trainingInterval.low)))} to ${times(Math.max(...trainRuns.map((run) => run.trainingInterval.high)))}. Both arms perform the same steps per round; the original lab ran one arm first with no warm-up.`,
      status: trainRuns.length === 0
        ? CLAIM_STATUS.NOT_TESTABLE
        : Math.min(...trainRuns.map((run) => run.trainingInterval.low)) >= historical.realLlm.trainStepP50Speedup ? CLAIM_STATUS.REPRODUCED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'gpu_allocation',
      claim: `GPU allocation falls ${pct(historical.gpuAllocation.historicalReductionRatio)}, from ${fixed2(historical.gpuAllocation.conventionalMib)} to ${fixed2(historical.gpuAllocation.tinyMib)} MiB`,
      evidence: `${historical.gpuAllocation.reproducedByArithmetic ? 'Reproduced to every digit by arithmetic, with no GPU, because the value follows from' : 'Does not follow from'} requested buffer sizes and an assumed ${pct0(gpuProxy.assumedDeltaFraction)} delta. It is not a device reading, and no experiment here measures that assumption.`,
      status: historical.gpuAllocation.reproducedByArithmetic ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'gpu_device_memory',
      claim: `nvidia-smi peak falls ${pct(smi.smiReductionRatio)}, from ${smi.smiConventionalPeakMib} to ${smi.smiTinyPeakMib} MiB (historical, GTX 860M)`,
      evidence: `${gpuRanHere ? `This host read ${pct(summary.gpuLive.nvidiaSmi.reductionRatio)}.` : `Needs NVIDIA hardware; the lab reports ${summary.gpuLive.status} on this host (${summary.gpuLive.reason}).`} ${kvAnalogue}`,
      status: !gpuRanHere ? CLAIM_STATUS.NOT_TESTABLE : summary.gpuLive.nvidiaSmi.reductionRatio > 0 ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'gpu_turn_latency',
      claim: `Host-to-device turn materialization ${times(smi.suiteTurnSpeedup)} faster (historical, GTX 860M)`,
      evidence: `${gpuRanHere ? `This host read ${times(summary.gpuLive.latency.comparison.turnSpeedup)}.` : 'Needs NVIDIA hardware.'} The copied payload alone is ${times(smi.payloadRatio)} smaller than the conventional one, so the byte count predicts most of the speedup recorded in the stored receipts (${smi.turnSpeedup === smi.suiteTurnSpeedup ? times(smi.turnSpeedup) : `${times(smi.turnSpeedup)} and ${times(smi.suiteTurnSpeedup)}`}).`,
      status: !gpuRanHere ? CLAIM_STATUS.NOT_TESTABLE : summary.gpuLive.latency.comparison.turnSpeedup > 1 ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'dram_target',
      claim: `A DRAM or accelerator memory reduction of ${pct0(sensitivity.target)} for AI serving`,
      evidence: residentAtTarget.length > 0
        ? `Resident memory with weights counted reached ${pct(Math.max(...residentAtTarget.map((run) => run.withWeights.reduction)))} on ${modelNames(residentAtTarget)}, against no sharing at all, and a prefix cache gets the same residency.`
        : biggest
        ? `Not established by any receipt. Key-value residency alone can exceed that (${pct(biggest.residency.reduction.device)} here), but counting weights gives ${pct(biggest.withWeights.reduction)} here and ${pct(summary.h100.derived.residentReductionVersusNaive)} on the H100 roofline, and a prefix cache gets the same residency.`
        : `Not established by any receipt. Counting weights gives ${pct(summary.h100.derived.residentReductionVersusNaive)} on the H100 roofline, and a prefix cache gets the same residency.`,
      status: residentAtTarget.length > 0 ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'rhyme_gate',
      claim: 'A four-pillar gate tells a holographic rhyme from a brick wall (Net Zero → ascending octaves)',
      evidence: `${gate.plainWall.pass ? 'It accepts a plain wall.' : 'It refuses a plain wall.'} ${gate.wallWithNestedFieldAndDeclaredValues.pass
        ? `The same bricks pass once they have a nested field and declare a nesting depth and a drift, because ${gate.pillarsReadingDeclaredValues.join(' and ')} read values the caller states.`
        : 'Declaring a nesting depth and a drift on a mid-level nest is not enough without a Net Zero (octave 0) root.'} ${gate.netZeroOctaveRhyme?.pass
        ? `A Net Zero → ascending-octave cohort passes all four pillars (span ${JSON.stringify(gate.netZeroOctaveRhyme.octaveSpan)}).`
        : 'A Net Zero → ascending-octave cohort does not yet pass.'}`,
      status: gate.plainWall.pass || !gate.netZeroOctaveRhyme?.pass
        ? CLAIM_STATUS.NOT_REPRODUCED
        : gate.wallWithNestedFieldAndDeclaredValues.pass
          ? CLAIM_STATUS.QUALIFIED
          : CLAIM_STATUS.REPRODUCED,
    },
    {
      id: 'h100_rhyme',
      claim: `On an H100, a rhyme holds ${pct(rhymeSim.tinyKvReductionVersusPrefixCache)} less KV memory than a prefix cache when wording differs (simulated)`,
      evidence: `${measuredShare == null ? 'The real-model lab did not read this on this host.' : `Measured on ${biggest.model.id.split('/').pop()}, with ${pct(measuredShare.changedTokens / measuredShare.positions)} of tokens changed: ${pct(measuredShare.matchingCellFraction)} of KV cells repeat, and resuming from the other prompt's cache moves logits by ${sci(measuredShare.resumeFromRhymingCache.worstLogitAbsDifference)}.`} The simulation applies a JSON byte fraction of ${pct(assumedShare)} to KV memory, and its equivalence check compares lengths.`,
      status: measuredShare == null ? CLAIM_STATUS.NOT_TESTABLE : shareHolds ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'companion_meters',
      claim: 'Signature routing, context-fold hooks and an energy proxy',
      evidence: `They run and ${K.pass && L.pass && M.pass ? 'pass' : 'do not all pass'}: ${K.bucketCompares} comparisons against ${K.linearCompares} for a scan, a fold ratio of ${pct(L.foldRatio)} over ${L.levels} retained turns, and depth scaled from ${M.baselineDepth} to ${M.scaledDepth}. These count comparisons, bytes and joules from assumed constants. None is a memory, latency or energy reading from a device.`,
      status: K.pass && L.pass && M.pass ? CLAIM_STATUS.QUALIFIED : CLAIM_STATUS.NOT_REPRODUCED,
    },
    {
      id: 'receipts_on_your_machine',
      claim: '`tiny benchmark` produces receipts on your machine',
      evidence: `False before this work: on a host with no GPU it reported a stored laptop receipt as a fresh pass, naming that laptop as the device. Labs now report only what ran in the current invocation, and a regression test pins it. On this host the GPU lab's status is ${summary.gpuLive.status} and the suite's verdict is ${summary.suiteRun.verdict}.`,
      status: summary.gpuLive.status === 'not_run' && summary.suiteRun.verdict === 'all_pass' ? CLAIM_STATUS.NOT_REPRODUCED : CLAIM_STATUS.CORRECTED,
    },
  ];
}
