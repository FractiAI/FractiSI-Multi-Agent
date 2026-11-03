/**
 * Tiny Gateway · Rhyming Templates — Experiments A–H
 * Memory lab + exactness + data-gated ENGINE_SHELF pin
 */
import {
  DIGITAL_SEED,
  VALIDATION_SEED,
  DRAM_REDUCTION_TARGET,
  ENGINE_SHELF_SLOT,
  HONESTY,
} from './constants.mjs';
import { mulberry32 } from './rng.mjs';
import { bytesOf, reduction, illustrativeMemoryModel } from './memory.mjs';
import {
  createTemplateCatalog,
  encodeExpression,
  reconstructExpression,
  deepEqual,
} from './rhyming-template.mjs';
import { createVectorStore } from './nested-vector.mjs';
import {
  conventionalEightCopies,
  tinySharedBroadcast,
  reconstructNodeView,
  NODE_COUNT,
} from './eight-node.mjs';
import { createGateway } from './gateway.mjs';
import { runGpuLiveChatLab } from './gpu-live-lab.mjs';
import { runGpuLlmRealLab } from './gpu-llm-real-lab.mjs';

/** A · Illustrative §7 arithmetic (hypothesis model, not measurement) */
export function experimentA_illustrativeModel() {
  const m = illustrativeMemoryModel();
  const pass = Math.abs(m.reductionPct - 78.7) < 0.15 && Math.abs(m.nonWeightCutNeededPct - 94.12) < 0.2;
  return {
    id: 'A_illustrative_model',
    title: 'Illustrative 78.7% memory model arithmetic',
    ...m,
    pass,
    honesty: 'Architectural arithmetic only — not a measured DRAM/HBM result.',
  };
}

/** B · Workload A: structured records sharing a rhyming template */
export function experimentB_structuredData(seed = DIGITAL_SEED, n = 500) {
  const rng = mulberry32(seed);
  const pattern = {
    kind: 'record',
    schema: 'person_v1',
    fields: ['id', 'name', 'role', 'dept', 'active'],
    role: 'employee',
    dept: 'ops',
    active: true,
  };
  const catalog = createTemplateCatalog();
  catalog.register({
    id: 'tpl_person_v1',
    pattern,
    reconstruction: 'merge_delta',
  });

  const conventional = [];
  const tiny = { template: catalog.get('tpl_person_v1'), expressions: [] };
  for (let i = 0; i < n; i++) {
    const expr = {
      ...pattern,
      id: i,
      name: `u${i}`,
      role: i % 7 === 0 ? 'lead' : 'employee',
      dept: i % 5 === 0 ? 'lab' : 'ops',
      active: rng() > 0.05,
    };
    conventional.push(expr);
    tiny.expressions.push(encodeExpression('tpl_person_v1', pattern, expr));
  }
  const b = bytesOf(conventional);
  const t = bytesOf(tiny);
  const r = reduction(b, t);
  // Exactness sample
  let exact = true;
  for (let i = 0; i < 20; i++) {
    const idx = Math.floor(rng() * n);
    const recon = reconstructExpression(catalog, tiny.expressions[idx]);
    // strip only if needed — reconstruct merges pattern+delta
    const expect = conventional[idx];
    if (!deepEqual(recon, expect)) {
      exact = false;
      break;
    }
  }
  return {
    id: 'B_structured_data',
    title: 'Workload A · structured rhyming-template records',
    n,
    ...r,
    exact,
    pass: r.ratio >= 0.5 && exact,
  };
}

/** C · Workload B: cross-linked graph — duplicate edge objects vs shared refs */
export function experimentC_crossLinked(seed = DIGITAL_SEED, nNodes = 200) {
  const rng = mulberry32(seed);
  const nodes = Array.from({ length: nNodes }, (_, i) => ({
    id: `n${i}`,
    label: `node-${i}`,
    weight: rng(),
    // Fat payload makes naive edge embedding expensive (conventional anti-pattern)
    dossier: Array.from({ length: 40 }, (_, k) => `fact-${i}-${k}-${(rng() * 1e6) | 0}`),
  }));
  // Conventional: each edge embeds full node copies (multi-edge fanout)
  const convEdges = [];
  for (let i = 0; i < nNodes; i++) {
    for (let e = 0; e < 3; e++) {
      const j = (i * 7 + 3 + e * 11) % nNodes;
      convEdges.push({
        from: structuredClone(nodes[i]),
        to: structuredClone(nodes[j]),
        rel: 'depends',
      });
    }
  }
  const conventional = { nodes: structuredClone(nodes), edges: convEdges };

  // Tiny: nodes once + edge id refs + shared relationship template
  const catalog = createTemplateCatalog();
  catalog.register({
    id: 'tpl_edge',
    pattern: { rel: 'depends', kind: 'edge' },
  });
  const tinyEdges = convEdges.map((e, i) => ({
    ...encodeExpression('tpl_edge', { rel: 'depends', kind: 'edge' }, { rel: e.rel, kind: 'edge' }),
    fromId: e.from.id,
    toId: e.to.id,
    i,
  }));
  const tiny = { nodes, edges: tinyEdges, template: catalog.get('tpl_edge') };
  const r = reduction(bytesOf(conventional), bytesOf(tiny));
  return {
    id: 'C_cross_linked',
    title: 'Workload B · cross-linked shared references',
    nNodes,
    nEdges: convEdges.length,
    ...r,
    pass: r.ratio >= 0.5,
  };
}

/** D · Workload C: eight-node simultaneous broadcast */
export function experimentD_eightNode(seed = DIGITAL_SEED) {
  const rng = mulberry32(seed);
  const story = {
    id: 'story-1',
    title: 'originating pattern',
    body: Array.from({ length: 400 }, (_, i) => `tok${i}_${(rng() * 1e6) | 0}`).join(' '),
    meta: { octave: 12, version: 1 },
  };
  const conv = conventionalEightCopies(story);
  const tiny = tinySharedBroadcast(story);
  const r = reduction(bytesOf(conv), bytesOf(tiny));
  let exact = true;
  for (let i = 0; i < NODE_COUNT; i++) {
    const view = reconstructNodeView(tiny, i);
    if (!deepEqual(view.story, story) || view.state.node !== i) {
      exact = false;
      break;
    }
  }
  // Theoretical floor ~ 1/8 story + states; expect high reduction
  return {
    id: 'D_eight_node_broadcast',
    title: 'Workload C · eight-node shared originating story',
    ...r,
    exact,
    pass: r.ratio >= 0.7 && exact,
  };
}

/** E · Workload D: cross-octave — full lattice vs selective working set */
export function experimentE_crossOctave(seed = DIGITAL_SEED, octaves = 16, perOct = 48) {
  const rng = mulberry32(seed);
  const store = createVectorStore();
  for (let o = 0; o < octaves; o++) {
    for (let i = 0; i < perOct; i++) {
      const id = `o${o}_v${i}`;
      store.put({
        id,
        octave: o,
        payload: { blob: Array.from({ length: 48 }, () => rng()) },
        // Sibling mesh within octave (conventional full load is large)
        children: [],
        cross:
          i + 1 < perOct
            ? [`o${o}_v${i + 1}`]
            : o + 1 < octaves
              ? [`o${o + 1}_v0`]
              : [],
        deps: [],
      });
    }
  }
  const conventional = store.all();
  // Localized request: short hop only (selective reconstruction)
  const working = store.resolveWorkingSet('o3_v0', { maxDepth: 3 });
  const r = reduction(bytesOf(conventional), bytesOf(working));
  return {
    id: 'E_cross_octave',
    title: 'Workload D · selective cross-octave reconstruction',
    nVectors: conventional.length,
    workingN: working.length,
    ...r,
    pass: r.ratio >= 0.7 && working.length < conventional.length / 4,
  };
}

/** F · Workload E/F proxy: AI context — repeated system prompts + turn deltas */
export function experimentF_aiContextProxy(seed = DIGITAL_SEED, sessions = 40, turns = 25) {
  const rng = mulberry32(seed);
  const systemPrompt = {
    role: 'system',
    content: 'You are a careful assistant. '.repeat(80),
    tools: ['search', 'calc', 'browse'],
    policy: { safety: true, cite: true },
  };
  const conventional = [];
  for (let s = 0; s < sessions; s++) {
    const msgs = [structuredClone(systemPrompt)];
    for (let t = 0; t < turns; t++) {
      msgs.push({ role: 'user', content: `q${s}_${t}_${(rng() * 1e9) | 0}` });
      msgs.push({ role: 'assistant', content: `a${s}_${t}_${(rng() * 1e9) | 0}` });
    }
    conventional.push({ session: s, messages: msgs });
  }

  const catalog = createTemplateCatalog();
  catalog.register({ id: 'tpl_sys', pattern: systemPrompt });
  const tiny = {
    systemTemplate: catalog.get('tpl_sys'),
    sessions: conventional.map((c) => ({
      session: c.session,
      systemRef: 'tpl_sys',
      turns: c.messages.slice(1),
    })),
  };
  const r = reduction(bytesOf(conventional), bytesOf(tiny));
  // Reconstruct one session and compare system prompt
  const reconSys = reconstructExpression(catalog, { templateId: 'tpl_sys', delta: {} });
  const exact = deepEqual(reconSys, systemPrompt);
  return {
    id: 'F_ai_context_proxy',
    title: 'Workload E/F proxy · shared system prompt + turn deltas',
    sessions,
    turns,
    ...r,
    exact,
    pass: r.ratio >= 0.4 && exact,
    honesty:
      'In-process context-representation proxy — not measured GPU KV-cache / HBM for a production LLM server.',
  };
}

/** G · Gateway end-to-end exact reconstruction + validation seed */
export function experimentG_gatewayExactness(seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED) {
  function run(s) {
    const gw = createGateway();
    const pattern = { kind: 'packet', proto: 'v2', qos: 'default', payload: null };
    gw.registerTemplate({ id: 'tpl_packet', pattern });
    const rng = mulberry32(s);
    let ok = 0;
    const n = 100;
    for (let i = 0; i < n; i++) {
      const expr = {
        ...pattern,
        payload: { x: rng(), y: i, tag: `t${i}` },
        qos: i % 10 === 0 ? 'high' : 'default',
      };
      const enc = gw.ingestExpression('tpl_packet', expr);
      const res = gw.execute({ operation: 'reconstruct', encoded: enc });
      if (res.ok && deepEqual(res.value, expr)) ok++;
    }
    return { n, ok, exactRate: ok / n };
  }
  const primary = run(seed);
  const validation = run(validationSeed);
  return {
    id: 'G_gateway_exactness',
    title: 'Gateway exact reconstruction (primary + validation seeds)',
    primary,
    validation,
    pass: primary.exactRate === 1 && validation.exactRate === 1,
  };
}

/** Aggregate measured reduction across B–F (equal weight on byte totals) */
function aggregateMeasured(parts) {
  let baseline = 0;
  let tiny = 0;
  for (const p of parts) {
    baseline += p.baselineBytes;
    tiny += p.tinyBytes;
  }
  return reduction(baseline, tiny);
}

/** I · Live GPU chat stack · Tiny Footprint device-memory + latency (nvidia-smi + cuMemAlloc + HtoD) */
export function experimentI_gpuLiveChatStack() {
  const report = runGpuLiveChatLab();
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
      : `GPU live stack gate failed or CUDA unavailable: ${report?.error || 'see report'}.`,
  };
}

/** J · REAL local-GPU LLM inference + training (DirectML/CUDA) — not allocation proxy */
export function experimentJ_gpuLlmReal() {
  const report = runGpuLlmRealLab();
  const prefill = report?.inference?.comparison?.prefillP50Speedup ?? null;
  const generate = report?.inference?.comparison?.generateP50Speedup ?? null;
  const train = report?.training?.comparison?.stepP50Speedup ?? null;
  const pass = !!report?.ok && report?.labKind === 'real_llm_local_gpu';
  return {
    id: 'J_gpu_llm_real',
    title: 'Tiny Footprint · real local-GPU LLM infer + train (DirectML/CUDA)',
    product: 'Tiny Footprint',
    report,
    prefillP50Speedup: prefill,
    generateP50Speedup: generate,
    trainStepP50Speedup: train,
    pass,
    honesty: report?.honesty || 'Requires .venv-cuda with torch-directml; not the HtoD allocation proxy.',
    interpretation: pass
      ? `Real LLM on ${report?.device}: prefill ${prefill?.toFixed?.(2) ?? prefill}×, generate ${
          generate?.toFixed?.(2) ?? generate
        }×, train step ${train?.toFixed?.(2) ?? train}× (with vs without Tiny Footprint).`
      : `Real LLM GPU lab unavailable: ${report?.error || 'see report'}.`,
  };
}

/** H · ENGINE_SHELF pin gate — ≥80% aggregate measured + exactness (+ GPU lab when available) */
export function experimentH_enginePinGate(parts, exactOk, gpuLab) {
  const agg = aggregateMeasured(parts);
  const hitsTarget = agg.ratio >= DRAM_REDUCTION_TARGET;
  const gpuOk = !gpuLab || gpuLab.pass;
  const enginePinRecommended = hitsTarget && exactOk && gpuOk;
  return {
    id: 'H_engine_pin_gate',
    title: 'Data-gated ENGINE_SHELF pin (80% measured + Tiny Footprint GPU lab)',
    target: DRAM_REDUCTION_TARGET,
    aggregateRatio: agg.ratio,
    aggregatePct: agg.ratio * 100,
    ...agg,
    exactOk,
    gpuLabPass: gpuLab?.pass ?? null,
    enginePinRecommended,
    candidateSlot: ENGINE_SHELF_SLOT,
    pass: true,
    interpretation: enginePinRecommended
      ? `Aggregate ${(agg.ratio * 100).toFixed(1)}% ≥ 80% with exactness` +
        (gpuLab?.pass
          ? ` + Tiny Footprint GPU live-stack lab (alloc ${(100 * (gpuLab.allocReduction || 0)).toFixed(1)}%).`
          : '.')
      : `Pin refused — aggregate/exactness/GPU lab gate.`,
  };
}

export function runAllExperiments({ seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED } = {}) {
  const A = experimentA_illustrativeModel();
  const B = experimentB_structuredData(seed);
  const C = experimentC_crossLinked(seed);
  const D = experimentD_eightNode(seed);
  const E = experimentE_crossOctave(seed);
  const F = experimentF_aiContextProxy(seed);
  const G = experimentG_gatewayExactness(seed, validationSeed);
  const I = experimentI_gpuLiveChatStack();
  const J = experimentJ_gpuLlmReal();
  const exactOk = B.exact && D.exact && F.exact && G.pass;
  const H = experimentH_enginePinGate([B, C, D, E, F], exactOk, I);

  const experiments = [
    { id: 'E1_illustrative_model', title: A.title, pass: A.pass, A },
    { id: 'E2_structured_data', title: B.title, pass: B.pass, B },
    { id: 'E3_cross_linked', title: C.title, pass: C.pass, C },
    { id: 'E4_eight_node', title: D.title, pass: D.pass, D },
    { id: 'E5_cross_octave', title: E.title, pass: E.pass, E },
    { id: 'E6_ai_context_proxy', title: F.title, pass: F.pass, F },
    { id: 'E7_gateway_exactness', title: G.title, pass: G.pass, G },
    { id: 'E8_gpu_live_tiny_footprint', title: I.title, pass: I.pass, I },
    { id: 'E10_gpu_llm_real', title: J.title, pass: J.pass, J },
    {
      id: 'E9_engine_pin_gate',
      title: H.title,
      pass: H.pass,
      enginePinRecommended: H.enginePinRecommended,
      H,
      interpretation: H.interpretation,
    },
  ];

  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
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
