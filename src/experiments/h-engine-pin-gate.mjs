/**
 * H: ENGINE_SHELF pin gate. At least 80% representation reduction, exactness
 * checks, and a GPU lab that passed in this invocation.
 */
import { aggregateReduction } from '../core/bytes.mjs';
import { LAB_STATUS } from '../labs/lab-status.mjs';
import { ENGINE_SHELF_SLOT, REPRESENTATION_REDUCTION_TARGET } from './constants.mjs';

export function experimentH_enginePinGate(parts, exactOk, gpuLab) {
  const agg = aggregateReduction(parts);
  const hitsTarget = agg.ratio >= REPRESENTATION_REDUCTION_TARGET;
  const gpuOk = gpuLab?.pass === true;
  const gpuNotRun = gpuLab == null || gpuLab?.status === LAB_STATUS.NOT_RUN;
  const enginePinRecommended = hitsTarget && exactOk && gpuOk;
  const status = enginePinRecommended
    ? LAB_STATUS.PASS
    : hitsTarget && exactOk && gpuNotRun
      ? LAB_STATUS.NOT_RUN
      : LAB_STATUS.FAIL;
  return {
    id: 'H_engine_pin_gate',
    title: 'Data-gated ENGINE_SHELF pin (80% representation gate + Tiny Footprint GPU lab)',
    target: REPRESENTATION_REDUCTION_TARGET,
    aggregateRatio: agg.ratio,
    aggregatePct: agg.ratio * 100,
    ...agg,
    exactOk,
    gpuLabPass: gpuLab?.pass ?? null,
    enginePinRecommended,
    candidateSlot: ENGINE_SHELF_SLOT,
    status,
    pass: enginePinRecommended,
    interpretation: enginePinRecommended
      ? `Representation aggregate ${(agg.ratio * 100).toFixed(1)}% ≥ 80% with B/D/F/G exactness checks + GPU live-stack lab (alloc ${(100 * (gpuLab.allocReduction || 0)).toFixed(1)}%).`
      : status === LAB_STATUS.NOT_RUN
        ? `Pin withheld: representation aggregate ${(agg.ratio * 100).toFixed(1)}% and exactness passed, but the GPU lab did not run on this host.`
        : `Pin refused — representation aggregate, exactness, or GPU lab gate failed.`,
  };
}
