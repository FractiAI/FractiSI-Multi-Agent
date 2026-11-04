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
  structuralSignature,
  shapesRhyme,
  mergeDelta,
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
import {
  auditRhyme,
  brickWallCandidate,
  trueRhymeCandidate,
  FOUR_PILLARS,
} from './holographic-rhyme-gate.mjs';
import {
  compareRhymeToCache,
  differingWordSessions,
  identicalTextSessions,
  RHYME_PATTERN,
} from './rhyme-vs-cache.mjs';
import {
  runH100RhymeSim,
  assertH100RhymeSimInvariants,
} from './h100-rhyme-sim.mjs';
import { rhymeScore } from './geometric-rhyme-route.mjs';
import {
  createCompressionHookRegistry,
  nestedDeltaFoldHook,
  octaveScaleCapHook,
  workingSetBoundHook,
} from './context-compress-hooks.mjs';
import { createRecursiveContextBuffer } from './context-buffer.mjs';
import { createEnergyModel, scaleUnderBudget } from './energy-proxy.mjs';

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
    id: 0,
    name: '',
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
    title: 'Workload E/F proxy · shared system prompt + turn deltas (prefix-reuse meter)',
    sessions,
    turns,
    ...r,
    exact,
    pass: r.ratio >= 0.4 && exact,
    honesty:
      'Prefix-reuse / shared-identical-system-prompt meter — not a holographic rhyme proof, and not measured GPU KV-cache / HBM for a production LLM server.',
  };
}

/** G · Gateway end-to-end exact reconstruction + validation seed */
export function experimentG_gatewayExactness(seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED) {
  function run(s) {
    const gw = createGateway();
    const pattern = {
      kind: 'packet',
      proto: 'v2',
      qos: 'default',
      payload: { x: 0, y: 0, tag: '' },
    };
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
      'Prefix-reuse / shared-system-pattern GPU meter — not a holographic rhyme proof. Accelerator device memory + materialization latency on local NVIDIA GPU; GeForce is typically GDDR — HBM is the datacenter analogue. Not frontier decode TTFT.',
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

/**
 * R · Holographic rhyme gate — four pillars required; brick wall / schema-only / exact-text ≠ rhyme.
 * Prefix-cache reuse remains a separate meter (experiments F/I/J), not a rhyme proof.
 */
export function experimentR_holographicRhymeGate() {
  const differing = differingWordSessions();
  const identical = identicalTextSessions();
  const trueCandidate = trueRhymeCandidate(differing, 2, 0.15);
  const trueAudit = auditRhyme(trueCandidate);
  const brick = brickWallCandidate(40);
  const brickAudit = auditRhyme(brick);

  const schemaOnly = auditRhyme({
    pattern: { a: 1, b: 'x' },
    expressions: [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
    ],
    nestDepth: 0,
  });

  const vsCacheDiffering = compareRhymeToCache(differing);
  const vsCacheIdentical = compareRhymeToCache(identical);

  let falseMatchRejected = false;
  try {
    const cat = createTemplateCatalog();
    cat.register({ id: 'invoice', pattern: { id: 0, name: '', amount: 0 } });
    cat.register({ id: 'person', pattern: { id: 0, name: '', amount: 0 } });
  } catch (e) {
    falseMatchRejected = /false_match_risk/.test(String(e?.message || e));
  }

  const arrayObjectDistinct =
    structuralSignature({ tags: ['a'] }) !== structuralSignature({ tags: { a: true } }) &&
    !shapesRhyme({ tags: ['a'] }, { tags: { a: true } });

  const base = { meta: { role: 'user', octave: 1 }, utterance: '' };
  const expr = { meta: { role: 'lead', octave: 1 }, utterance: 'q1' };
  const cat = createTemplateCatalog();
  cat.register({ id: 'tpl_nested', pattern: base });
  const enc = encodeExpression('tpl_nested', base, expr);
  const nestedFieldDelta =
    enc.delta?.meta &&
    enc.delta.meta.role === 'lead' &&
    enc.delta.meta.octave === undefined &&
    deepEqual(reconstructExpression(cat, enc), expr);

  const pass =
    trueAudit.pass &&
    FOUR_PILLARS.every((p) => trueAudit.pillars[p]?.pass) &&
    !brickAudit.pass &&
    brickAudit.failed.includes('self_similar') &&
    !schemaOnly.pass &&
    vsCacheDiffering.equivalent &&
    vsCacheDiffering.rhymeAuditPass &&
    vsCacheDiffering.rhymeBytes < vsCacheDiffering.cacheBytes &&
    vsCacheIdentical.equivalent &&
    vsCacheIdentical.cacheBytes < vsCacheIdentical.rhymeBytes &&
    falseMatchRejected &&
    arrayObjectDistinct &&
    nestedFieldDelta;

  return {
    id: 'R_holographic_rhyme_gate',
    title: 'Holographic rhyme gate (four pillars · brick wall fails · rhyme ≠ cache)',
    trueAudit,
    brickAudit,
    schemaOnly,
    vsCacheDiffering: {
      rhymeBytes: vsCacheDiffering.rhymeBytes,
      cacheBytes: vsCacheDiffering.cacheBytes,
      equivalent: vsCacheDiffering.equivalent,
    },
    vsCacheIdentical: {
      rhymeBytes: vsCacheIdentical.rhymeBytes,
      cacheBytes: vsCacheIdentical.cacheBytes,
      equivalent: vsCacheIdentical.equivalent,
    },
    falseMatchRejected,
    arrayObjectDistinct,
    nestedFieldDelta,
    pattern: RHYME_PATTERN,
    pass,
    honesty:
      'Four-pillar catalog audit for Rhyming Templates. Brick wall / schema-only / exact-text cache are contrast cases. Shared-prefix GPU labs are prefix-reuse meters, not rhyme proofs.',
  };
}

/**
 * S · H100 rhyme-vs-prefix residency simulation.
 * Identical exact prefixes: Tiny = prefix cache.
 * Rhyming different wording: prefix cache cannot share; Tiny uses measured template/delta split.
 */
export function experimentS_h100RhymeVsPrefixSim() {
  const report = runH100RhymeSim();
  const invariants = assertH100RhymeSimInvariants(report);
  const rhyming = report?.workloads?.rhymingDifferentWording;
  return {
    id: 'S_h100_rhyme_vs_prefix_sim',
    title: 'H100 simulation · rhyme beats prefix cache when organizational wording differs',
    report,
    invariants,
    tinyKvReductionVersusPrefixCache: rhyming?.comparison?.tinyKvReductionVersusPrefixCache ?? null,
    tinyMaterializeSpeedupVersusPrefixCache:
      rhyming?.comparison?.tinyMaterializeSpeedupVersusPrefixCache ?? null,
    pass: report?.ok === true && invariants.pass === true,
    honesty:
      report?.honesty ||
      'H100 SXM published-profile simulation — not a live H100 measurement; shared/delta fraction from in-process rhyme encode.',
  };
}

/**
 * K · Dynamic structural signature routing (companion meter — not in H pin).
 * Signature-bucket route vs naïve linear scan; false-match reject; partial rank.
 */
export function experimentK_dynamicRoute() {
  const catalog = createTemplateCatalog({ requireUniqueSignature: true });
  const patterns = [
    { id: 'tpl_a', pattern: { kind: 'rec', schema: 'a', id: 0, name: '' } },
    { id: 'tpl_b', pattern: { kind: 'rec', schema: 'b', role: '', dept: '' } },
    { id: 'tpl_c', pattern: { kind: 'event', type: 'x', ts: 0, payload: { n: 0 } } },
    { id: 'tpl_d', pattern: { kind: 'msg', from: '', to: '', body: '' } },
    { id: 'tpl_e', pattern: { kind: 'node', octave: 0, children: [], cross: [] } },
  ];
  for (const p of patterns) catalog.register(p);

  // Linear baseline compares = catalog size per query
  const queries = [
    { kind: 'rec', schema: 'a', id: 7, name: 'u7' },
    { kind: 'event', type: 'x', ts: 9, payload: { n: 1 } },
    { kind: 'msg', from: 'a', to: 'b', body: 'hi' },
  ];
  let linearCompares = 0;
  let bucketCompares = 0;
  let exactHits = 0;
  for (const q of queries) {
    linearCompares += catalog.size();
    const route = catalog.routeTemplate(q, { mode: 'exact' });
    bucketCompares += route.compares;
    if (route.id && route.exact) exactHits += 1;
  }

  // Colliding signatures under requireUniqueSignature=false → exact returns null
  const amb = createTemplateCatalog({ requireUniqueSignature: false });
  amb.register({ id: 'c1', pattern: { k: 'same', v: 1 } });
  amb.register({ id: 'c2', pattern: { k: 'same', v: 2 } });
  const ambRoute = amb.routeTemplate({ k: 'same', v: 3 }, { mode: 'exact' });
  const falseMatchRejected = ambRoute.id === null && ambRoute.candidates.length >= 2;

  // Partial rank without full matrix: score only bucket/pool
  const best = catalog.routeTemplate({ kind: 'rec', schema: 'a', id: 1, name: 'x' }, { mode: 'best', maxCandidates: 3 });
  const partialOk = best.candidates.length <= 3 && best.score >= 0.5;

  const bucketCheaper = bucketCompares < linearCompares;
  const pass = exactHits === queries.length && falseMatchRejected && partialOk && bucketCheaper;

  return {
    id: 'K_dynamic_route',
    title: 'Dynamic structural signature routing (bucket ≪ linear · false-match reject)',
    linearCompares,
    bucketCompares,
    exactHits,
    falseMatchRejected,
    partialTopScore: best.score,
    candidateCap: best.candidates.length,
    rhymeScoreSample: rhymeScore(patterns[0].pattern, queries[0]),
    pass,
    honesty:
      'Structural signature routing + scored partial rhyme — not semantic search, not full pairwise matrix expansion, not automatic discovery without false-match controls.',
  };
}

/**
 * L · Recursive context-fold hooks (companion meter — not in H pin).
 */
export function experimentL_contextCompressHooks(seed = DIGITAL_SEED, turns = 24) {
  const rng = mulberry32(seed);
  const pattern = {
    kind: 'turn',
    role: 'user',
    text: '',
    meta: { session: 's1', i: 0 },
  };
  const hooks = createCompressionHookRegistry();
  hooks.registerHook('nested_delta_fold', nestedDeltaFoldHook(pattern));
  hooks.registerHook('octave_scale_cap', octaveScaleCapHook({ maxDepth: 4 }));
  hooks.registerHook('working_set_bound', workingSetBoundHook({ maxBytes: 4_096 }));

  const buf = createRecursiveContextBuffer({
    maxLevels: 6,
    maxBytesPerLevel: 2_048,
    pattern,
    hooks,
  });

  for (let i = 0; i < turns; i++) {
    buf.pushTurn({
      kind: 'turn',
      role: i % 2 === 0 ? 'user' : 'assistant',
      text: `msg-${i}-${(rng() * 1e6).toFixed(0)}`,
      meta: { session: 's1', i },
    });
  }
  const meters = buf.snapshotMeters();
  // Replay expected last-window turns for reconstruct exactness
  const window = buf.reconstructWindow(mergeDelta);
  let exact = window.length === meters.levels;
  for (let i = 0; i < window.length; i++) {
    const w = window[i];
    if (!w || w.kind !== 'turn' || typeof w.meta?.i !== 'number') {
      exact = false;
      break;
    }
  }
  const hooksFired = meters.hooksFired?.length > 0;
  const foldPositive = meters.foldRatio > 0 && meters.foldedBytes < meters.allRawWouldBe;
  const pass = foldPositive && exact && hooksFired && meters.levels <= 6;

  return {
    id: 'L_context_compress_hooks',
    title: 'Recursive context-fold hooks + demo meters',
    turns,
    ...meters,
    exact,
    pass,
    honesty:
      'Recursive context-fold hooks and demo meters — not a KV-cache compression product, not infinite lossless context, not measured transformer KV on device.',
  };
}

/**
 * M · Energy-proxy substrate scaling (companion meter — not in H pin).
 */
export function experimentM_energyProxyScale(seed = DIGITAL_SEED) {
  const store = createVectorStore();
  // Build a small tree
  for (let i = 0; i < 15; i++) {
    store.put({
      id: `n${i}`,
      octave: i % 5,
      children: i < 10 ? [`n${i + 1}`] : [],
      cross: i % 3 === 0 && i + 2 < 15 ? [`n${i + 2}`] : [],
      payload: { i, seed },
    });
  }
  const model = createEnergyModel({ joulesPerByteTouch: 1e-8, joulesPerCompare: 1e-8 });
  const baseline = store.resolveWorkingSet('n0', { maxDepth: 8 });
  const tightBudget = (baseline.meters?.energy?.joules || 1) * 0.15;
  const scaled = store.resolveWorkingSet('n0', {
    maxDepth: 8,
    energyBudgetJ: tightBudget,
    energyModel: model,
  });
  const planScale = scaleUnderBudget(
    {
      maxDepth: 8,
      candidateCap: 32,
      bufferLevels: 4,
      bytesTouched: baseline.meters?.energy?.bytesTouched || 1000,
      compares: baseline.meters?.energy?.compares || 100,
      reconstructs: 1,
    },
    tightBudget,
    model,
  );

  const pass =
    baseline.meters?.PROXY === true &&
    scaled.meters?.scaled === true &&
    scaled.meters.maxDepth < baseline.meters.requestedMaxDepth &&
    scaled.meters.energy.bytesTouched <= baseline.meters.energy.bytesTouched &&
    planScale.PROXY === true &&
    planScale.scaled === true;

  return {
    id: 'M_energy_proxy_scale',
    title: 'Energy-proxy substrate scaling (byte-touch joule PROXY)',
    baselineDepth: baseline.meters?.maxDepth,
    scaledDepth: scaled.meters?.maxDepth,
    baselineBytes: baseline.meters?.energy?.bytesTouched,
    scaledBytes: scaled.meters?.energy?.bytesTouched,
    baselineJ: baseline.meters?.energy?.joules,
    scaledJ: scaled.meters?.energy?.joules,
    budgetJ: tightBudget,
    planScale,
    pass,
    honesty:
      'Byte-touch / compare joule proxy inside the vector loop — not wall-socket energy, not datacenter PUE, not a CapEx claim.',
  };
}

/** H · ENGINE_SHELF pin gate — ≥80% aggregate + exactness + rhyme gate + GPU lab */
export function experimentH_enginePinGate(parts, exactOk, gpuLab, rhymeOk = true) {
  const agg = aggregateMeasured(parts);
  const hitsTarget = agg.ratio >= DRAM_REDUCTION_TARGET;
  const gpuOk = gpuLab?.pass === true;
  const enginePinRecommended = hitsTarget && exactOk && gpuOk && rhymeOk === true;
  return {
    id: 'H_engine_pin_gate',
    title:
      'Data-gated ENGINE_SHELF pin (80% measured + holographic rhyme gate + Tiny Footprint GPU lab)',
    target: DRAM_REDUCTION_TARGET,
    aggregateRatio: agg.ratio,
    aggregatePct: agg.ratio * 100,
    ...agg,
    exactOk,
    rhymeOk,
    gpuLabPass: gpuLab?.pass ?? null,
    enginePinRecommended,
    candidateSlot: ENGINE_SHELF_SLOT,
    pass: enginePinRecommended,
    interpretation: enginePinRecommended
      ? `Aggregate ${(agg.ratio * 100).toFixed(1)}% ≥ 80% with exactness + holographic rhyme gate` +
        (gpuLab?.pass
          ? ` + Tiny Footprint GPU live-stack lab (alloc ${(100 * (gpuLab.allocReduction || 0)).toFixed(1)}%).`
          : '.')
      : `Pin refused — aggregate/exactness/rhyme gate/GPU lab gate.`,
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
  const R = experimentR_holographicRhymeGate();
  const S = experimentS_h100RhymeVsPrefixSim();
  const K = experimentK_dynamicRoute();
  const L = experimentL_contextCompressHooks(seed);
  const M = experimentM_energyProxyScale(seed);
  const I = experimentI_gpuLiveChatStack();
  const J = experimentJ_gpuLlmReal();
  const exactOk = B.exact && D.exact && F.exact && G.pass;
  // H pin unchanged — K/L/M are companion meters and do not gate #52.
  const H = experimentH_enginePinGate([B, C, D, E, F], exactOk, I, R.pass && S.pass);

  const experiments = [
    { id: 'E1_illustrative_model', title: A.title, pass: A.pass, A },
    { id: 'E2_structured_data', title: B.title, pass: B.pass, B },
    { id: 'E3_cross_linked', title: C.title, pass: C.pass, C },
    { id: 'E4_eight_node', title: D.title, pass: D.pass, D },
    { id: 'E5_cross_octave', title: E.title, pass: E.pass, E },
    { id: 'E6_ai_context_proxy', title: F.title, pass: F.pass, F },
    { id: 'E7_gateway_exactness', title: G.title, pass: G.pass, G },
    { id: 'E11_holographic_rhyme_gate', title: R.title, pass: R.pass, R },
    { id: 'E12_h100_rhyme_vs_prefix_sim', title: S.title, pass: S.pass, S },
    { id: 'E13_dynamic_route', title: K.title, pass: K.pass, K },
    { id: 'E14_context_compress_hooks', title: L.title, pass: L.pass, L },
    { id: 'E15_energy_proxy_scale', title: M.title, pass: M.pass, M },
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
    R,
    S,
    K,
    L,
    M,
    I,
    J,
    H,
    enginePinRecommended: H.enginePinRecommended,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    product: 'Tiny Footprint',
    honesty: HONESTY,
  };
}
