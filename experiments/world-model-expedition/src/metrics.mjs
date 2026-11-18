/**
 * Metric families A–E + CIE construction (raw first, composite secondary).
 */

export function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

export function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function ci95(xs) {
  if (xs.length < 2) return { low: mean(xs), high: mean(xs) };
  const m = mean(xs);
  const se = stdev(xs) / Math.sqrt(xs.length);
  const z = 1.96;
  return { low: m - z * se, high: m + z * se };
}

export function summarize(xs) {
  return {
    n: xs.length,
    mean: mean(xs),
    median: median(xs),
    stdev: stdev(xs),
    ci95: ci95(xs),
    min: xs.length ? Math.min(...xs) : 0,
    max: xs.length ? Math.max(...xs) : 0,
  };
}

/**
 * Build raw metric bundle from a single run.
 */
export function buildRawMetrics({
  worldId,
  condition,
  architecture,
  taskGrade,
  worldMetrics,
  duplication,
  timingMs,
  messages,
  novelFacts,
  recovery,
}) {
  return {
    worldId,
    condition,
    architecture,
    timingMs,
    // A. World Coherence
    coherence: {
      crossAgentAgreement: worldMetrics?.crossAgentAgreement ?? null,
      contradictionRate: taskGrade?.contradictionRate ?? worldMetrics?.contradictionRate ?? null,
      staleStateRate: taskGrade?.staleStateRate ?? null,
      relationalCompleteness: taskGrade?.relationalCompleteness ?? null,
      stateFreshness: taskGrade?.stateFreshness ?? null,
    },
    // B. Collective Intelligence
    collectiveIntelligence: {
      taskSuccess: Boolean(taskGrade?.success),
      successScore:
        typeof taskGrade?.completeness === 'number'
          ? taskGrade.completeness
          : typeof taskGrade?.readiness === 'number'
            ? taskGrade.readiness
            : typeof taskGrade?.recovery === 'number'
              ? taskGrade.recovery
              : taskGrade?.success
                ? 1
                : 0,
      novelInformationProduced: novelFacts ?? 0,
      relationalInferred: Boolean(taskGrade?.inferred || taskGrade?.hasFullChain),
    },
    // C. Coordination Efficiency
    coordination: {
      messages: messages ?? 0,
      shareCalls: worldMetrics?.shareCalls ?? 0,
      mergeCalls: worldMetrics?.mergeCalls ?? 0,
      reconstructions: worldMetrics?.reconstructions ?? 0,
      conflicts: worldMetrics?.conflicts ?? 0,
      materializeCalls: worldMetrics?.materializeCalls ?? 0,
    },
    // D. Resource Efficiency
    resource: {
      bytesShared: worldMetrics?.bytesShared ?? 0,
      bytesMaterialized: worldMetrics?.bytesMaterialized ?? 0,
      totalIndependentlyRepresentedBytes: duplication?.totalIndependentlyRepresentedBytes ?? null,
      uniqueInformationBytes: duplication?.uniqueInformationBytes ?? null,
      duplicationRatio: duplication?.duplicationRatio ?? null,
      uniqueInformationRatio: duplication?.uniqueInformationRatio ?? null,
      timingMs,
    },
    // E. Adaptation
    adaptation: {
      recovery: recovery?.recovery ?? taskGrade?.recovery ?? null,
      corrupted: taskGrade?.corrupted ?? null,
      wrong: taskGrade?.wrong ?? null,
    },
    taskGrade,
  };
}

/**
 * Secondary CIE composite — constructed AFTER raw metrics exist.
 * Transparent weights; never hide tradeoffs. Report raw first.
 */
export function computeCIE(raw) {
  const success = raw.collectiveIntelligence.successScore ?? 0;
  const coherence =
    raw.coherence.crossAgentAgreement ??
    raw.coherence.relationalCompleteness ??
    raw.coherence.stateFreshness ??
    (raw.collectiveIntelligence.taskSuccess ? 1 : 0);
  const novel = Math.min(1, (raw.collectiveIntelligence.novelInformationProduced || 0) / 10);
  const coordCost =
    (raw.coordination.messages || 0) +
    (raw.coordination.reconstructions || 0) +
    (raw.coordination.conflicts || 0) * 2;
  const computeCost = (raw.resource.timingMs || 0) / 1000;
  const commCost = (raw.resource.bytesShared || 0) / 1000;
  const latency = raw.resource.timingMs || 0;
  const recoveryCost = raw.adaptation.corrupted ? 1 : 0;

  // Higher is better for success/coherence/novel; lower cost terms are inverted softly
  const cie =
    0.35 * success +
    0.2 * coherence +
    0.1 * novel +
    0.15 * (1 / (1 + coordCost / 20)) +
    0.1 * (1 / (1 + computeCost)) +
    0.05 * (1 / (1 + commCost)) +
    0.05 * (1 / (1 + latency / 50)) -
    0.1 * recoveryCost;

  return {
    cie,
    components: {
      success,
      coherence,
      novel,
      coordCost,
      computeCost,
      commCost,
      latency,
      recoveryCost,
    },
    note: 'Secondary composite only — inspect raw metrics for tradeoffs. Weights are transparent, not optimized for FractiSI.',
  };
}
