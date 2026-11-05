/**
 * Re-derives the GPU lab's allocation figure from its inputs, with no GPU.
 *
 * The published allocation reduction is arithmetic over requested buffer sizes and
 * an assumed delta fraction (per-session state as a share of the KV buffer). This
 * module shows the result reproduces exactly, and how it moves with that assumption.
 */
const MIB = 1024 * 1024;

export function allocationReduction({ sessions, kvMibPerSession, systemPromptMib, weightStubMib, deltaFraction }) {
  const kvBytes = kvMibPerSession * MIB;
  const delta = Math.max(1, Math.trunc(kvBytes * deltaFraction));
  const conventional = (weightStubMib * MIB + sessions * (systemPromptMib * MIB + kvBytes)) / MIB;
  const tiny = (weightStubMib * MIB + systemPromptMib * MIB + sessions * delta) / MIB;
  return { conventionalMib: conventional, tinyMib: tiny, reductionRatio: 1 - tiny / conventional };
}

/** @param {object} options plan.deterministic.gpuProxy */
export function gpuProxySensitivity({ sessions, kvMibPerSession, systemPromptMib, weightStubMib, assumedDeltaFraction, deltaFractions }) {
  const at = (deltaFraction) =>
    allocationReduction({ sessions, kvMibPerSession, systemPromptMib, weightStubMib, deltaFraction });
  return {
    inputs: { sessions, kvMibPerSession, systemPromptMib, weightStubMib },
    assumedDeltaFraction,
    atAssumedFraction: at(assumedDeltaFraction),
    sweep: deltaFractions.map((deltaFraction) => ({ deltaFraction, ...at(deltaFraction) })),
  };
}
