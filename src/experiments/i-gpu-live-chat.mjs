/** I: live GPU chat stack, device memory and materialization latency. */
import { LAB_STATUS } from '../labs/lab-status.mjs';

/**
 * Interpret one lab report. Pure: the report is produced elsewhere, so the gate
 * logic can be tested against real receipts without a GPU.
 *
 * @param {object} report output of `runGpuLiveChatLab`
 */
export function experimentI_gpuLiveChatStack(report) {
  const allocR = report?.cuMemAlloc?.reductionRatio ?? 0;
  const smiR = report?.nvidiaSmi?.reductionRatio ?? null;
  const densityGain = report?.strategy?.concurrencyDensityGain ?? null;
  const lat = report?.latency ?? null;
  const turnConv = lat?.withoutTinyFootprint?.turnMaterializeMs?.p50Ms ?? null;
  const turnTiny = lat?.withTinyFootprint?.turnMaterializeMs?.p50Ms ?? null;
  const turnRatio = lat?.comparison?.turnP50RatioTinyOverConventional ?? null;
  const turnSpeedup = lat?.comparison?.turnSpeedup ?? null;
  const latencyOk = lat?.passLatencyGate !== false && turnRatio != null;
  const memOk =
    !!report?.ok &&
    (allocR >= 0.8 || (smiR != null && smiR >= 0.7)) &&
    densityGain != null &&
    densityGain > 1;
  const pass = memOk && latencyOk;
  const status = report?.status === LAB_STATUS.NOT_RUN ? LAB_STATUS.NOT_RUN : pass ? LAB_STATUS.PASS : LAB_STATUS.FAIL;
  return {
    id: 'I_gpu_live_chat_stack',
    title: 'Tiny Footprint · live GPU chat-stack memory + latency (nvidia-smi)',
    product: 'Tiny Footprint',
    report,
    allocReduction: allocR,
    smiReduction: smiR,
    concurrencyDensityGain: densityGain,
    latency: lat,
    turnP50MsWithout: turnConv,
    turnP50MsWith: turnTiny,
    turnP50RatioTinyOverConventional: turnRatio,
    turnSpeedup,
    status,
    pass,
    honesty:
      report?.memoryClassNote ||
      'Accelerator device memory + materialization latency on local NVIDIA GPU; GeForce is typically GDDR — HBM is the datacenter analogue. Not frontier decode TTFT.',
    interpretation: pass
      ? `Live on ${report?.device || 'NVIDIA GeForce'}: cuMemAlloc ${(allocR * 100).toFixed(1)}%; nvidia-smi ${
          smiR == null ? 'n/a' : `${(smiR * 100).toFixed(1)}%`
        }; density ${densityGain?.toFixed?.(2) ?? densityGain}×; turn p50 without ${turnConv?.toFixed?.(2) ?? turnConv} ms → with Tiny Footprint ${turnTiny?.toFixed?.(2) ?? turnTiny} ms (${
          turnSpeedup != null ? `${turnSpeedup.toFixed(2)}×` : 'n/a'
        } speedup).`
      : status === LAB_STATUS.NOT_RUN
        ? `GPU live stack did not run on this host: ${report?.reason || 'see report'}.`
        : `GPU live stack gate failed: ${report?.error || 'see report'}.`,
  };
}
