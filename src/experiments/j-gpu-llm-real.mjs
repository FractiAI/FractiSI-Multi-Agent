/** J: real local-accelerator LLM inference and training. Not the allocation proxy. */
import { LAB_STATUS } from '../labs/lab-status.mjs';

/** @param {object} report output of `runGpuLlmRealLab` */
export function experimentJ_gpuLlmReal(report) {
  const prefill = report?.inference?.comparison?.prefillP50Speedup ?? null;
  const generate = report?.inference?.comparison?.generateP50Speedup ?? null;
  const train = report?.training?.comparison?.stepP50Speedup ?? null;
  const pass = !!report?.ok && report?.labKind === 'real_llm_local_gpu';
  // A healthy run with no accelerator says nothing about this experiment either way.
  const cpuOnly = !!report?.ok && report?.labKind === 'real_llm_local_cpu';
  const status = report?.status === LAB_STATUS.NOT_RUN || cpuOnly ? LAB_STATUS.NOT_RUN : pass ? LAB_STATUS.PASS : LAB_STATUS.FAIL;
  return {
    id: 'J_gpu_llm_real',
    title: 'Tiny Footprint · real local-GPU LLM infer + train (DirectML/CUDA)',
    product: 'Tiny Footprint',
    report,
    prefillP50Speedup: prefill,
    generateP50Speedup: generate,
    trainStepP50Speedup: train,
    status,
    pass,
    honesty: report?.honesty || 'Requires a Python environment with torch; not the HtoD allocation proxy.',
    interpretation: pass
      ? `Real LLM on ${report?.device}: prefill ${prefill?.toFixed?.(2) ?? prefill}×, generate ${
          generate?.toFixed?.(2) ?? generate
        }×, train step ${train?.toFixed?.(2) ?? train}× (with vs without Tiny Footprint).`
      : status === LAB_STATUS.NOT_RUN
        ? `Real LLM lab did not run on this host: ${cpuOnly ? 'no local accelerator, so it ran on CPU only' : report?.reason || 'see report'}.`
        : `Real LLM lab failed: ${report?.error || 'see report'}.`,
  };
}
