/**
 * The registered experiment suite: deterministic workloads plus the optional
 * accelerator labs, with an explicit verdict that keeps `not_run` distinct from
 * both pass and fail.
 */
import { runGpuLiveChatLab } from '../labs/gpu-live-lab.mjs';
import { runGpuLlmRealLab } from '../labs/gpu-llm-real-lab.mjs';
import { LAB_STATUS } from '../labs/lab-status.mjs';
import { experimentA_illustrativeModel } from './a-illustrative-model.mjs';
import { experimentB_structuredData } from './b-structured-data.mjs';
import { experimentC_crossLinked } from './c-cross-linked.mjs';
import { DIGITAL_SEED, ENGINE_SHELF_SLOT, HONESTY, VALIDATION_SEED } from './constants.mjs';
import { experimentD_eightNode } from './d-eight-node.mjs';
import { experimentE_crossOctave } from './e-cross-octave.mjs';
import { experimentF_aiContextProxy } from './f-ai-context.mjs';
import { experimentG_gatewayExactness } from './g-gateway-exactness.mjs';
import { experimentH_enginePinGate } from './h-engine-pin-gate.mjs';
import { experimentI_gpuLiveChatStack } from './i-gpu-live-chat.mjs';
import { experimentJ_gpuLlmReal } from './j-gpu-llm-real.mjs';

export const VERDICT = Object.freeze({ ALL_PASS: 'all_pass', INCOMPLETE: 'incomplete', FAIL: 'fail' });

const statusOf = (r) => r.status ?? (r.pass ? LAB_STATUS.PASS : LAB_STATUS.FAIL);

/** The experiments that need only this process: no GPU, Python, or network. */
export function runDeterministicExperiments({ seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED } = {}) {
  return {
    A: experimentA_illustrativeModel(),
    B: experimentB_structuredData(seed),
    C: experimentC_crossLinked(seed),
    D: experimentD_eightNode(seed),
    E: experimentE_crossOctave(seed),
    F: experimentF_aiContextProxy(seed),
    G: experimentG_gatewayExactness(seed, validationSeed),
  };
}

/**
 * @param {object} [options]
 * @param {number} [options.seed]
 * @param {number} [options.validationSeed]
 * @param {{gpuLive?: object, gpuLlm?: object}} [options.labs] reports from labs
 *   already run; omitted labs are attempted now.
 */
export function runAllExperiments({ seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED, labs = {} } = {}) {
  const { A, B, C, D, E, F, G } = runDeterministicExperiments({ seed, validationSeed });
  const I = experimentI_gpuLiveChatStack(labs.gpuLive ?? runGpuLiveChatLab());
  const J = experimentJ_gpuLlmReal(labs.gpuLlm ?? runGpuLlmRealLab());
  const exactOk = B.exact && D.exact && F.exact && G.pass;
  const H = experimentH_enginePinGate([B, C, D, E, F], exactOk, I);

  const experiments = [
    { id: 'E1_illustrative_model', title: A.title, pass: A.pass, status: statusOf(A), A },
    { id: 'E2_structured_data', title: B.title, pass: B.pass, status: statusOf(B), B },
    { id: 'E3_cross_linked', title: C.title, pass: C.pass, status: statusOf(C), C },
    { id: 'E4_eight_node', title: D.title, pass: D.pass, status: statusOf(D), D },
    { id: 'E5_cross_octave', title: E.title, pass: E.pass, status: statusOf(E), E },
    { id: 'E6_ai_context_proxy', title: F.title, pass: F.pass, status: statusOf(F), F },
    { id: 'E7_gateway_exactness', title: G.title, pass: G.pass, status: statusOf(G), G },
    { id: 'E8_gpu_live_tiny_footprint', title: I.title, pass: I.pass, status: statusOf(I), I },
    { id: 'E10_gpu_llm_real', title: J.title, pass: J.pass, status: statusOf(J), J },
    {
      id: 'E9_engine_pin_gate',
      title: H.title,
      pass: H.pass,
      status: statusOf(H),
      enginePinRecommended: H.enginePinRecommended,
      H,
      interpretation: H.interpretation,
    },
  ];

  const count = (status) => experiments.filter((e) => e.status === status).length;
  const n_pass = count(LAB_STATUS.PASS);
  const n_fail = count(LAB_STATUS.FAIL);
  const n_not_run = count(LAB_STATUS.NOT_RUN);
  return {
    experiments,
    n_pass,
    n_fail,
    n_not_run,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
    verdict: n_fail > 0 ? VERDICT.FAIL : n_not_run > 0 ? VERDICT.INCOMPLETE : VERDICT.ALL_PASS,
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    I,
    J,
    H,
    enginePinRecommended: H.enginePinRecommended,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    product: 'Tiny Footprint',
    honesty: HONESTY,
  };
}
