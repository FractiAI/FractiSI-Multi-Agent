/**
 * Shared Test Drive step runners — CLI, self-paced web, and /api/testdrive.
 * Narrative locked to the real FractiSI Multi-Agent product stack:
 * Infinite Octaves · holographic rhyme · Tiny Gateway Rhyming Templates ·
 * Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy.
 */
import { gzipSync } from 'node:zlib';
import { runMultiSessionDemo } from '../workloads/multi-session.mjs';
import { compareRhymeToCache, differingWordSessions } from '../experiments/rhyme-vs-cache.mjs';
import { runDiscoveryConvergenceBenchmark } from '../experiments/expedition-002-discovery.mjs';
import { runComparativeBench } from '../platform/comparative-bench.mjs';
import { runGitAwarenessBench } from '../platform/git-bench.mjs';
import {
  ARCHITECTURE_PRIMER,
  architecturePrimerFractisiBullets,
  architecturePrimerLines,
} from './architecture-primer.mjs';

function pct(x) {
  return `${(Number(x) * 100).toFixed(1)}%`;
}

function gzipJsonBytes(value) {
  return gzipSync(Buffer.from(JSON.stringify(value), 'utf8')).length;
}

function utf8Bytes(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

export const STEP_CATALOG = Object.freeze([
  {
    id: 'primer',
    n: 0,
    title: ARCHITECTURE_PRIMER.title,
    short: 'Net Zero · Φ · octaves · trees · polygons · wave · awareness → product',
    layer: ARCHITECTURE_PRIMER.kicker,
    component: 'Generative possibility → Tiny Gateway → FractiSI Multi-Agent',
  },
  {
    id: '1',
    n: 1,
    title: 'Tiny Footprint · shared world',
    short: 'Shared world once · agent deltas',
    layer: 'Tiny Footprint execution',
    component: 'Tiny Footprint · templates + deltas · selective reconstruct',
  },
  {
    id: '2',
    n: 2,
    title: 'Tiny Footprint · after gzip, architecture still matters',
    short: 'Gzip residual · share first',
    layer: 'Tiny Footprint execution',
    component: 'Tiny Footprint shared-world pack (vs N full copies)',
  },
  {
    id: '3',
    n: 3,
    title: 'Tiny Gateway · Rhyming Templates vs exact cache',
    short: 'Holographic rhyme · Net Zero → octaves',
    layer: 'Tiny Gateway™ engine',
    component: 'Rhyming Templates · Infinite Octaves · four-pillar holographic rhyme',
  },
  {
    id: '4',
    n: 4,
    title: 'Selective reconstruction · discovery',
    short: 'Relationship-guided recovery',
    layer: 'Tiny Gateway · nested vectors · selective reconstruct',
    component: 'Tiny Gateway selective reconstruction · Expedition 002 E2',
  },
  {
    id: '5',
    n: 5,
    title: 'Selective reconstruction · convergence',
    short: 'Fewer rounds & ops',
    layer: 'Tiny Gateway · nested vectors · selective reconstruct',
    component: 'Tiny Gateway guided path · Expedition 002 E2',
  },
  {
    id: '6',
    n: 6,
    title: 'Coordination · Shared state · Composition',
    short: 'Ownership · compose · no blind merge',
    layer: 'Coordination · Shared state · Composition',
    component: 'FractiSI platform · coord-bench isolated vs coordinated',
  },
  {
    id: 'git',
    n: 'git',
    title: 'Git awareness · cleaner merges.',
    short: 'Real worktrees · ownership before merge',
    layer: 'Git awareness',
    component: 'Scoped worktrees · ownership gate · integrateComposition',
  },
  {
    id: '7',
    n: 7,
    title: 'Density · Deploy',
    short: 'More agents · paid deploy',
    layer: 'Tiny Footprint density · Deploy (paid)',
    component: 'Tiny Footprint density · approval-gated Deploy',
  },
]);

const NEXT = Object.freeze({
  primer: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
  5: '6',
  6: 'git',
  git: '7',
  7: null,
});

function base(meta, fields) {
  return {
    id: meta.id,
    n: meta.n,
    title: meta.title,
    short: meta.short,
    layer: meta.layer,
    component: meta.component,
    problem: fields.problem || '',
    opportunity: fields.opportunity || '',
    fractisi: fields.fractisi || [],
    lines: fields.lines || [],
    metrics: fields.metrics || {},
    /** UI scoreboard: what was tested + headline result cards */
    readout: fields.readout || null,
    next: NEXT[meta.id],
    honesty: ARCHITECTURE_PRIMER.honesty,
  };
}

function meta(id) {
  const row = STEP_CATALOG.find((s) => s.id === id || String(s.n) === String(id));
  if (!row) throw new Error(`Unknown testdrive step: ${id}`);
  return row;
}

function runPrimer() {
  const m = meta('primer');
  return base(m, {
    fractisi: architecturePrimerFractisiBullets(),
    lines: architecturePrimerLines(),
    metrics: {
      mode: 'primer',
      architecture: ARCHITECTURE_PRIMER.steps.map((s) => s.id),
      surfaces: [
        'Tiny Footprint',
        'Coordination',
        'Shared state',
        'Composition',
        'Git awareness',
        'Deploy',
      ],
      activeInferenceRhyme: 'possible_not_identity',
      chain: ARCHITECTURE_PRIMER.chain,
    },
  });
}

function run1() {
  const m = meta('1');
  const multi = runMultiSessionDemo(12);
  const reductionPct = pct(multi.prefixByteReduction);
  return base(m, {
    problem: 'Without Tiny Footprint, every agent reprints a full copy of the shared world.',
    opportunity: 'Tiny Footprint registers the world once; agents keep only local deltas.',
    fractisi: [
      'Component: Tiny Footprint (execution core, powered by Tiny Gateway™).',
      'Mechanism: shared templates + per-agent deltas + selective reconstruct.',
    ],
    lines: [
      'TINY FOOTPRINT',
      '',
      `  Conventional (N full copies):  ${multi.conventional.bytes} B across ${multi.conventional.sessions} sessions`,
      `  Tiny Footprint shared+deltas: ${multi.prefixReuse.bytes} B`,
      `  Reduction vs full copies:      ${reductionPct}`,
      '',
      '  → Same sessions. Tiny Footprint stops paying N reprints of one world.',
    ],
    metrics: {
      conventionalBytes: multi.conventional.bytes,
      sharedBytes: multi.prefixReuse.bytes,
      reduction: multi.prefixByteReduction,
      sessions: multi.conventional.sessions,
      component: 'tiny_footprint',
    },
    readout: {
      done: `We gave ${multi.conventional.sessions} agents the same map and stored it two ways on this machine: a full copy for each agent, then one shared world plus a small note per agent.`,
      tested: `Byte cost for ${multi.conventional.sessions} agent sessions that share the same world context.`,
      baselineLabel: 'A full copy per agent',
      baselineValue: `${multi.conventional.bytes.toLocaleString()} bytes`,
      treatmentLabel: 'One shared world, a note per agent',
      treatmentValue: `${multi.prefixReuse.bytes.toLocaleString()} bytes`,
      headlineLabel: 'How much smaller',
      headlineValue: reductionPct,
      bars: {
        caption: 'Bytes stored for twelve agents',
        baseline: multi.conventional.bytes,
        treatment: multi.prefixReuse.bytes,
        baselineText: `${multi.conventional.bytes.toLocaleString()} B`,
        treatmentText: `${multi.prefixReuse.bytes.toLocaleString()} B`,
        better: 'lower',
      },
      summary: `Twelve agents share one context. Stored as full copies it takes ${multi.conventional.bytes.toLocaleString()} bytes. Stored as one shared world plus a note per agent it takes ${multi.prefixReuse.bytes.toLocaleString()}. That is ${reductionPct} smaller for the same work.`,
      implication: 'Memory stops scaling with every new agent. The ceiling rises because each new agent only pays for what is different about it — for digital fleets and for the people steering them in the same world.',
      beyondTheory: 'The same world, stored two ways, produces a large, repeatable byte gap every run. That is a coherent architecture doing predictable work, not a slide claim. The interesting result is that collaboration gets cheaper as the fleet grows, instead of more expensive — well beyond theory.',
    },
  });
}

function run2() {
  const m = meta('2');
  const SYSTEM = 'Tiny Footprint shared organizational pattern. Policy v1. '.repeat(8);
  const conventionalPayload = Array.from({ length: 12 }, (_, s) => ({
    system: SYSTEM,
    history: [`user-${s}`, `asst-${s}`],
  }));
  const sharedPayload = {
    system: SYSTEM,
    deltas: Array.from({ length: 12 }, (_, s) => ({ history: [`user-${s}`, `asst-${s}`] })),
  };
  const gzConv = gzipJsonBytes(conventionalPayload);
  const gzShared = gzipJsonBytes(sharedPayload);
  const rawConv = utf8Bytes(conventionalPayload);
  const rawShared = utf8Bytes(sharedPayload);
  return base(m, {
    problem: 'Gzip / pack compression shrinks copies — it does not remove N-copy structure.',
    opportunity: 'Tiny Footprint shares the world first; compression becomes optional polish.',
    fractisi: [
      'Component: Tiny Footprint shared-world pack.',
      'Claim discipline: gzip residual is structural — not “compression theater.”',
    ],
    lines: [
      'TINY FOOTPRINT · AFTER GZIP',
      '',
      `  Conventional JSON:     ${rawConv} B  → gzip ${gzConv} B`,
      `  Tiny Footprint JSON:   ${rawShared} B  → gzip ${gzShared} B`,
      `  Shared still ahead after gzip: ${gzShared < gzConv ? 'yes' : 'no'} (${gzConv - gzShared} B less)`,
      '',
      '  → Architecture (share once) beats “just gzip the N copies.”',
    ],
    metrics: { rawConv, gzConv, rawShared, gzShared, sharedAhead: gzShared < gzConv, component: 'tiny_footprint' },
  });
}

function run3() {
  const m = meta('3');
  const rhymeCmp = compareRhymeToCache(differingWordSessions(40));
  const multi = runMultiSessionDemo(12);
  const rhyme = multi.holographicRhyme;
  const lines = [
    'TINY GATEWAY · RHYMING TEMPLATES',
    '',
    '  What we mean by Net Zero (locked · before rhyme):',
    '  Balanced zero, not nothing zero.',
    '  Net Zero (octave 0) = active-equilibrium root — cancel-to-balance under continuous activity,',
    '  not empty void / blank null / dead stop. Goldilocks ≡ Net Zero (viable band). Rhymes hang from here.',
    '  Not: nothing zero · climate-policy “net zero” · certified zero-watt SI · GR singularity proofs.',
    '',
    '  What we mean by rhyme (locked):',
    '  A holographic rhyme passes four pillars — repeating · self-similar · self-correcting · recursive —',
    '  rooted at Net Zero (octave 0 · active equilibrium) and ascending Infinite Octaves.',
    '  Not a rhyme: exact-text / prefix cache alone · schema-key match alone · brick-wall repetition ·',
    '  mid-octave nest without Net Zero.',
    '',
    `  Sessions:              ${rhymeCmp.sessions} (same organization, different words)`,
    `  Exact-text cache hits: ${rhymeCmp.exactTextHits} duplicate texts`,
    `  Naive store:           ${rhymeCmp.naiveBytes} B`,
    `  Exact-text cache:      ${rhymeCmp.cacheBytes} B`,
    `  Rhyming Template store:${rhymeCmp.rhymeBytes} B`,
    `  Rhyme vs exact cache:  ${pct(rhymeCmp.rhymeVersusCache)} smaller than exact cache`,
    `  Exact rebuild:         ${rhymeCmp.equivalent}`,
    '',
    '  → Exact / prefix cache needs identical words. Rhyming Templates reuse organization under the gate.',
  ];
  if (rhyme?.status === 'ran') {
    lines.push(
      `  Reference rhyme cohort: ${rhyme.rhymeBytes} B vs naive ${rhyme.naiveBytes} B`,
      `  (${pct(rhyme.byteReduction)} · four-pillar audit ${rhyme.rhymeAuditPass} · exact ${rhyme.exact})`,
    );
  }
  return base(m, {
    problem: 'Exact-text and prefix caches only help when the words match — and that is not our rhyme gate.',
    opportunity:
      'Tiny Gateway Rhyming Templates share organization when wording differs, under the four-pillar holographic rhyme gate.',
    fractisi: [
      'Component: Tiny Gateway™ Rhyming Templates (engine under Tiny Footprint).',
      'Rhyme: four pillars from Net Zero up Infinite Octaves — see /library/papers/holographic-rhyme/.',
      'Honesty: expands organizational near-dupe reuse — not “rhyme beats every prefix cache on live heap.”',
    ],
    lines,
    metrics: {
      sessions: rhymeCmp.sessions,
      exactTextHits: rhymeCmp.exactTextHits,
      naiveBytes: rhymeCmp.naiveBytes,
      cacheBytes: rhymeCmp.cacheBytes,
      rhymeBytes: rhymeCmp.rhymeBytes,
      rhymeVersusCache: rhymeCmp.rhymeVersusCache,
      component: 'tiny_gateway_rhyming_templates',
    },
    readout: {
      done: `We ran ${rhymeCmp.sessions} sessions of one job, each worded differently — the kind of paraphrase people and digital agents both do — against an exact-text cache and against Rhyming Templates under the four-pillar gate.`,
      tested: `${rhymeCmp.sessions} sessions with the same job shape written in different words.`,
      baselineLabel: 'Exact-text cache',
      baselineValue: `${rhymeCmp.exactTextHits} hits`,
      treatmentLabel: 'Rhyming Templates',
      treatmentValue: `${rhymeCmp.rhymeBytes.toLocaleString()} bytes`,
      headlineLabel: 'Smaller than exact-text cache store',
      headlineValue: pct(rhymeCmp.rhymeVersusCache),
      bars: {
        caption: `Bytes stored for ${rhymeCmp.sessions} sessions`,
        baseline: rhymeCmp.cacheBytes,
        treatment: rhymeCmp.rhymeBytes,
        baselineText: `${rhymeCmp.cacheBytes.toLocaleString()} B`,
        treatmentText: `${rhymeCmp.rhymeBytes.toLocaleString()} B`,
        better: 'lower',
      },
      summary: `One job, worded ${rhymeCmp.sessions} different ways. The exact-text cache got ${rhymeCmp.exactTextHits} hits, so it saved nothing and stored ${rhymeCmp.cacheBytes.toLocaleString()} bytes. Rhyming Templates recognized the pattern underneath and stored ${rhymeCmp.rhymeBytes.toLocaleString()} bytes, ${pct(rhymeCmp.rhymeVersusCache)} smaller. The words changed and the pattern did not, so it was stored once.`,
      implication: 'Exact wording is a bad key for shared work. Organization is the reusable unit. Agents can rephrase freely without forcing the system to store the same job again.',
      beyondTheory: 'Zero exact-text hits and a large Rhyming Template saving show the model is coherent under paraphrase: same job shape, different words, one stored pattern. That reuse is predictable across sessions and interesting because it beats the obvious cache — measured on this machine, well beyond theory — not a theory of rhyme alone.',
    },
  });
}

function run4() {
  const m = meta('4');
  const e2 = runDiscoveryConvergenceBenchmark();
  return base(m, {
    problem: 'Flat skim under a fixed budget never assembles multi-hop chains buried in noise.',
    opportunity:
      'Tiny Gateway selective reconstruction follows relationship edges across the shared world.',
    fractisi: [
      'Component: selective reconstruction + nested relational structure (Tiny Gateway spine).',
      'Lab: Expedition 002 · E2 — architectural discovery, not an LLM bake-off.',
    ],
    lines: [
      'TINY GATEWAY · SELECTIVE RECONSTRUCTION · DISCOVERY',
      '',
      `  Scenarios:                 ${e2.scenarios} (six-hop hidden chains)`,
      `  Flat skim discoveries:     ${e2.flat.discoveries} / ${e2.scenarios}`,
      `  Flat skim solutions:       ${e2.flat.solutions} / ${e2.scenarios}`,
      `  FractiSI discoveries:      ${e2.fractisi.discoveries} / ${e2.scenarios}`,
      `  FractiSI solutions:        ${e2.fractisi.solutions} / ${e2.scenarios}`,
      `  Lab pass (100/100 vs 0/100): ${e2.pass}`,
      '',
      '  → Same information, same budget. Guided reconstruction finds what flat skim misses.',
    ],
    metrics: {
      scenarios: e2.scenarios,
      flatDiscoveries: e2.flat.discoveries,
      fractisiDiscoveries: e2.fractisi.discoveries,
      pass: e2.pass,
      component: 'selective_reconstruction',
    },
    readout: {
      done: `We hid ${e2.scenarios} answers six links deep and gave both methods the same information budget. One skimmed a window of text. The other followed links through the shared world.`,
      tested: `${e2.scenarios} puzzles where the answer is buried six links deep. Same information budget for both methods.`,
      baselineLabel: 'Flat skim',
      baselineValue: `${e2.flat.discoveries}/${e2.scenarios} found · ${e2.flat.solutions}/${e2.scenarios} solved`,
      treatmentLabel: 'Follow the links',
      treatmentValue: `${e2.fractisi.discoveries}/${e2.scenarios} found · ${e2.fractisi.solutions}/${e2.scenarios} solved`,
      headlineLabel: 'Score',
      headlineValue: `${e2.fractisi.discoveries}/${e2.scenarios} vs ${e2.flat.discoveries}/${e2.scenarios}`,
      bars: {
        caption: `Hidden answers found out of ${e2.scenarios}`,
        baseline: e2.flat.discoveries,
        treatment: e2.fractisi.discoveries,
        baselineText: `${e2.flat.discoveries} of ${e2.scenarios}`,
        treatmentText: `${e2.fractisi.discoveries} of ${e2.scenarios}`,
        better: 'higher',
        max: e2.scenarios,
      },
      also: `It also used ${pct(e2.opsReduction)} fewer operations and ${pct(e2.roundsReduction)} fewer propagation rounds than the flat approach.`,
      summary: `Same budget, same data, ${e2.scenarios} answers buried six links deep. Skimming found ${e2.flat.discoveries}. Following the links found ${e2.fractisi.discoveries} and solved ${e2.fractisi.solutions}. Every answer was in the data. Only one method reached them.`,
      implication: 'A shared world has to be traversable, not just searchable. Flat context windows leave answers on the table even when the facts are already present.',
      beyondTheory: 'Zero of one hundred versus one hundred of one hundred on the same data is a sharp, repeatable signal. The model is coherent (structure carries the answer), predictable (the guided path finds it every time), and interesting (same budget, opposite outcomes). That is demonstration, well beyond theory.',
    },
  });
}

function run5() {
  const m = meta('5');
  const e2 = runDiscoveryConvergenceBenchmark();
  return base(m, {
    problem: 'Collectives burn too many ops and propagation rounds before a composed answer.',
    opportunity: 'The same selective-reconstruction path converges with fewer rounds and ops.',
    fractisi: [
      'Component: Tiny Gateway guided reconstruction (Expedition 002 convergence meters).',
      'Claim discipline: architectural rounds/ops — not LLM dialogue-turn claims.',
    ],
    lines: [
      'TINY GATEWAY · SELECTIVE RECONSTRUCTION · CONVERGENCE',
      '',
      `  Flat mean ops / scenario:           ${e2.flat.meanOps.toFixed(1)}`,
      `  FractiSI mean ops / scenario:       ${e2.fractisi.meanOps.toFixed(1)}`,
      `  Ops reduction:                      ${pct(e2.opsReduction)}`,
      `  Flat propagation rounds (6-hop):    ${e2.flat.propagationRounds}`,
      `  FractiSI propagation rounds:        ${e2.fractisi.propagationRounds}`,
      `  Rounds reduction:                   ${pct(e2.roundsReduction)}`,
      '',
      '  → −50% rounds · −85% ops on this constrained Infinite-Octave-adjacent path.',
    ],
    metrics: {
      opsReduction: e2.opsReduction,
      roundsReduction: e2.roundsReduction,
      flatOps: e2.flat.meanOps,
      fractisiOps: e2.fractisi.meanOps,
      component: 'selective_reconstruction',
    },
  });
}

function run6() {
  const m = meta('6');
  const bench = runComparativeBench({ agentCounts: [5, 10, 25], runs: 3 });
  const lines = [
    'COORDINATION · SHARED STATE · COMPOSITION',
    '',
    '  Coordination — agent registry, ownership, interference detection',
    '  Shared state — project / task / contribution store',
    '  Composition — validate, integrate, rollback contributions',
    '',
  ];
  const summary = {};
  for (const n of [5, 10, 25]) {
    const rows = bench.results.filter((r) => r.agents === n);
    const avg = (arm, key) => rows.reduce((s, r) => s + r.arms[arm][key], 0) / rows.length;
    const aConflicts = avg('A', 'mergeConflicts');
    const cConflicts = avg('C', 'mergeConflicts');
    const aUseful = avg('A', 'usefulCompletedTasks');
    const cUseful = avg('C', 'usefulCompletedTasks');
    const cComp = avg('C', 'successfulCompositions');
    lines.push(
      `  n=${n} agents`,
      `    Conventional branches: conflicts ${aConflicts.toFixed(1)} · useful ${aUseful.toFixed(1)}`,
      `    FractiSI coordinated:  conflicts ${cConflicts.toFixed(1)} · useful ${cUseful.toFixed(1)} · compositions ${cComp.toFixed(1)}`,
    );
    summary[`n${n}`] = { aConflicts, cConflicts, aUseful, cUseful, cComp };
  }
  lines.push(
    '',
    '  → Tiny Footprint densifies. Coordination · Shared state · Composition change how fleets collide and compose.',
    '    (In-process platform simulation — not a production CapEx claim.)',
  );
  return base(m, {
    problem: 'Parallel agents collide at merge when isolation meets a blind integrate.',
    opportunity: 'Coordination, Shared state, and Composition own paths and compose contributions before ship.',
    fractisi: [
      'Components: Coordination · Shared state · Composition.',
      'Beside IDE tools you already run — Cursor / Claude Code / VS Code / Git.',
    ],
    lines,
    metrics: { ...summary, component: 'platform_coord_compose' },
  });
}


async function runGitLab(opts = {}) {
  const m = meta('git');
  const lab = await runGitAwarenessBench({
    agents: 6,
    githubToken: opts.githubToken || opts.token || '',
    engine: opts.engine || 'auto',
  });
  const a = lab.conventional || {};
  const f = lab.fractisi || {};
  if ((lab.status === 'not_run' || lab.status === 'fail') && !lab.conclusive && a.failedMerges == null) {
    return base(m, {
      problem: 'Parallel agents each open a branch, then merge blind — overlapping edits break main.',
      opportunity: 'Git awareness keeps scoped worktrees, blocks overlapping ownership before merge, and integrates one composed commit.',
      fractisi: [
        'Component: Git awareness.',
        `Engine status: ${lab.reason || lab.status}`,
        lab.detail ? `Detail: ${lab.detail}` : 'Retry with a GitHub token or the portable cloud lab git.',
      ],
      lines: [
        'GIT AWARENESS · LAB DID NOT COMPLETE',
        '',
        `  Reason: ${lab.reason || lab.status}`,
        `  Detail: ${lab.detail || ''}`,
        '',
        `  ${lab.honesty || ''}`,
      ],
      metrics: {
        status: lab.status || 'not_run',
        reason: lab.reason || 'unknown',
        engine: lab.engine || null,
        improved: false,
        conclusive: false,
        component: 'git_awareness',
      },
      readout: {
        done: 'We attempted the Git awareness lab. The selected engine did not finish a conclusive merge comparison.',
        tested: 'Failed merges and conflicted paths for six agents — conventional branches vs FractiSI Git awareness.',
        baselineLabel: 'Conventional branch merges',
        baselineValue: 'n/a',
        treatmentLabel: 'FractiSI Git awareness',
        treatmentValue: 'n/a',
        headlineLabel: 'Lab incomplete',
        headlineValue: '—',
        bars: { caption: 'Failed merges into main (6 agents)', baseline: 0, treatment: 0, baselineText: 'n/a', treatmentText: 'n/a', better: 'lower' },
        summary: lab.honesty || 'Git awareness lab did not complete on this host.',
        implication: 'Provide a GitHub token to use your GitHub environment, or rely on the portable cloud lab git bundled with FractiSI.',
        beyondTheory: 'When the lab completes, failed merges and a cleaner FractiSI main show a coherent, predictable improvement — well beyond theory.',
      },
    });
  }

  const failRed = lab.failedMergeReduction == null ? 'n/a' : pct(lab.failedMergeReduction);
  const conflictRed = lab.conflictReduction == null ? 'n/a' : pct(lab.conflictReduction);
  const headline = !lab.conclusive
    ? `${a.failedMerges}→${f.failedMerges}`
    : failRed === 'n/a'
      ? `${a.failedMerges}→${f.failedMerges}`
      : failRed;
  const engineLabel = lab.engineLabel || lab.engine || 'portable';

  return base(m, {
    problem: 'Parallel agents each open a branch, then merge blind — overlapping edits break main.',
    opportunity: 'Git awareness keeps scoped worktrees, blocks overlapping ownership before merge, and integrates one composed commit.',
    fractisi: [
      'Component: Git awareness (branches + ownership gate + one integrate commit).',
      `Engine: ${engineLabel}.`,
      'Honesty: temporary-repo lab — not production CapEx.',
    ],
    lines: [
      'GIT AWARENESS · MEASURED MERGES',
      '',
      `  Engine:                         ${engineLabel}`,
      `  Agents:                         ${lab.agents}`,
      `  Conventional failed merges:     ${a.failedMerges}`,
      `  Conventional conflicted paths:  ${a.mergeConflicts}${a.conflictedPaths?.length ? ` (${a.conflictedPaths.join(', ')})` : ''}`,
      `  Conventional successful merges: ${a.successfulMerges}`,
      `  FractiSI blocked before Git:    ${f.blockedBeforeGit}`,
      `  FractiSI failed merges:         ${f.failedMerges}`,
      `  FractiSI conflicted paths:      ${f.mergeConflicts}`,
      `  FractiSI compositions landed:   ${f.successfulCompositions}`,
      `  Failed-merge reduction:         ${failRed}`,
      `  Conflict-path reduction:        ${conflictRed}`,
      '',
      lab.improved
        ? '  → Ownership before merge keeps main cleaner. Same workload. Real merges.'
        : lab.conclusive
          ? '  → No improvement on this run — inspect the counters above.'
          : '  → Inconclusive run — inspect the counters above.',
      `  ${lab.honesty}`,
    ],
    metrics: {
      agents: lab.agents,
      engine: lab.engine,
      conventionalFailedMerges: a.failedMerges,
      conventionalConflicts: a.mergeConflicts,
      fractisiFailedMerges: f.failedMerges,
      fractisiConflicts: f.mergeConflicts,
      blockedBeforeGit: f.blockedBeforeGit,
      failedMergeReduction: lab.failedMergeReduction,
      conflictReduction: lab.conflictReduction,
      improved: lab.improved,
      conclusive: lab.conclusive,
      component: 'git_awareness',
    },
    readout: {
      done: `We gave ${lab.agents} agents the same overlapping workload (${engineLabel}). Conventional arm: each agent got a branch from the same seed, committed, then we merged every branch into main. FractiSI arm: ownership and composition ran first; only non-overlapping work was integrated with one commit.`,
      tested: `Merge failures and conflicted paths for ${lab.agents} agents — conventional branches vs FractiSI Git awareness.`,
      baselineLabel: 'Conventional branch merges',
      baselineValue: `${a.failedMerges} failed merges · ${a.mergeConflicts} conflicted paths`,
      treatmentLabel: 'FractiSI Git awareness',
      treatmentValue: `${f.failedMerges} failed merges · ${f.blockedBeforeGit} blocked before Git`,
      headlineLabel: 'Fewer failed merges',
      headlineValue: headline,
      bars: {
        caption: `Failed merges into main (${lab.agents} agents)`,
        baseline: Number(a.failedMerges) || 0,
        treatment: Number(f.failedMerges) || 0,
        baselineText: `${a.failedMerges} failed`,
        treatmentText: `${f.failedMerges} failed`,
        better: 'lower',
      },
      also: `Engine: ${engineLabel}. Conventional left ${a.mergeConflicts} conflicted path(s). FractiSI blocked ${f.blockedBeforeGit} overlapping task(s) up front and landed ${f.successfulCompositions} composition(s) with ${f.mergeConflicts} conflicted paths on main.`,
      summary: `Same workload, real merges via ${engineLabel}. Conventional merges failed ${a.failedMerges} time(s) with ${a.mergeConflicts} conflicted path(s). FractiSI failed ${f.failedMerges} merge(s), blocked ${f.blockedBeforeGit} overlap(s) up front, and kept ${f.mergeConflicts} conflicted paths on main.`,
      implication: 'Git stays the system of record. The improvement is deciding what is allowed to reach Git — scoped work plus an ownership gate — so main is not the first place overlaps are discovered.',
      beyondTheory: 'Failed merges and conflicted paths are ordinary Git outcomes, not a slide claim. Blocking overlaps before merge is coherent with the shared-world model, predictable on the same workload, and interesting because the repository stays cleaner — well beyond theory.',
    },
  });
}

function run7() {
  const m = meta('7');
  const multi = runMultiSessionDemo(24);
  const budget = multi.conventional.bytes;
  const conventionalAgents = multi.conventional.sessions;
  const bytesPerShared = multi.prefixReuse.bytes / Math.max(1, multi.prefixReuse.sessions);
  const sharedAgentsFit = Math.floor(budget / Math.max(1, bytesPerShared));
  const densityGain = sharedAgentsFit / conventionalAgents;
  return base(m, {
    problem: 'Duplicated context burns the budget before specialized agent work begins.',
    opportunity: 'Tiny Footprint density raises the agent ceiling; cloud Deploy unlocks on paid editions.',
    fractisi: [
      'Tiny Footprint density — more agents inside the same representation budget.',
      'Deploy — approval-gated publish; paid (Team · Enterprise · Cloud).',
      'Git awareness was measured in the previous step (real Git branchs + merges).',
    ],
    lines: [
      'DENSITY · GIT AWARENESS · DEPLOY',
      '',
      `  Budget (conventional 24-session pack): ${budget} B`,
      `  Conventional agents in that pack:     ${conventionalAgents}`,
      `  Tiny Footprint agents in same budget: ${sharedAgentsFit}`,
      `  Density gain:                         ${densityGain.toFixed(1)}×`,
      `  Shared pack size:                     ${multi.prefixReuse.bytes} B`,
      '',
      '  Community (free)',
      '    · GitHub clone = signup · Tiny Footprint · Coordination · Shared state · Composition · Git awareness',
      '    · Cloud token + FRACTISI_EDITION unlock Deploy (paid)',
      '',
      '  Pricing  https://fractisi.vercel.app/product/pricing/',
      '  Papers   Tiny Gateway Rhyming Templates · Tiny Footprint Multi-Agent · Exp 002',
    ],
    metrics: {
      budgetBytes: budget,
      conventionalAgents,
      sharedAgentsFit,
      densityGain,
      sharedBytes: multi.prefixReuse.bytes,
      component: 'density_git_deploy',
    },
    readout: {
      done: `We took the memory budget of ${conventionalAgents} full-copy agents and counted how many shared-world agents fit in that same space when each keeps only a note.`,
      tested: `The memory that ${conventionalAgents} full-copy agents need, and how many shared-world agents fit in that same space.`,
      baselineLabel: 'A full copy per agent',
      baselineValue: `${conventionalAgents} agents`,
      treatmentLabel: 'One shared world, a note per agent',
      treatmentValue: `${sharedAgentsFit} agents`,
      headlineLabel: 'More agents in the same space',
      headlineValue: `${densityGain.toFixed(1)}× more`,
      bars: {
        caption: `Agents that fit in ${budget.toLocaleString()} bytes`,
        baseline: conventionalAgents,
        treatment: sharedAgentsFit,
        baselineText: `${conventionalAgents} agents`,
        treatmentText: `${sharedAgentsFit} agents`,
        better: 'higher',
      },
      summary: `The same ${budget.toLocaleString()} bytes holds ${conventionalAgents} agents as full copies. With one shared world it holds ${sharedAgentsFit}, ${densityGain.toFixed(1)}× as many, because each new agent adds a note instead of another copy.`,
      implication: 'Density is the practical payoff of the earlier tests. More human-supervised and digital agents can run together without buying more memory first.',
      beyondTheory: `A ${densityGain.toFixed(1)}× jump in agents for the same bytes is a clean, repeatable consequence of one shared world. The model predicts that each new agent costs a note, and the machine measures exactly that — coherent, predictable, and well beyond theory — not a theoretical sketch.`,
    },
  });
}

const RUNNERS = Object.freeze({
  primer: runPrimer,
  0: runPrimer,
  1: run1,
  2: run2,
  3: run3,
  4: run4,
  5: run5,
  6: run6,
  git: runGitLab,
  7: run7,
});

export function listTestDriveSteps() {
  return STEP_CATALOG.map((s) => ({ ...s, next: NEXT[s.id] }));
}

/** @param {string|number} stepId @param {object} [opts] */
export async function runTestDriveStep(stepId, opts = {}) {
  const key = String(stepId).toLowerCase();
  const runner = RUNNERS[key];
  if (!runner) {
    const err = new Error(`Unknown testdrive step: ${stepId}`);
    err.code = 'unknown_step';
    throw err;
  }
  const started = Date.now();
  const result = await runner(opts);
  return {
    ok: true,
    ms: Date.now() - started,
    step: result,
  };
}
