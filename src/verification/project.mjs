/**
 * End-to-end provenance verification. Each check re-derives a value from its producer
 * and compares it with what is on disk, so a hand-edited or stale artifact fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { heapGrowthViolations } from '../analysis/measured-summary.mjs';
import { buildAnalysisSummary } from '../analysis/summary.mjs';
import { compressionReference, runDeterministicBenchmarks } from '../benchmarks/deterministic/index.mjs';
import { LLM_SOURCE_ROOTS, sourceFingerprint } from '../benchmarks/fingerprint.mjs';
import { llmRunSlug, loadPlan } from '../benchmarks/plan.mjs';
import { canonicalStringify, sha256, sha256File } from '../core/canonical-json.mjs';
import { PATHS, repoPath } from '../core/paths.mjs';
import { runAllGates } from '../gates/index.mjs';
import { scanManuscript } from '../manuscript/contract.mjs';
import { FORMALISM_LEDGER_NAME, buildFormalismLedger } from '../manuscript/formalism.mjs';
import { hydrateSections } from '../manuscript/hydrate.mjs';
import { readHydrationInputs } from '../manuscript/pipeline.mjs';
import { buildCatalog, variablesFrom } from '../manuscript/tokens.mjs';
import { renderEvidenceBlock, renderResultsDoc, replaceEvidenceBlock } from '../reporting/results-doc.mjs';

function check(name, run) {
  try {
    const detail = run();
    return { name, ok: true, detail: typeof detail === 'string' ? detail : undefined };
  } catch (error) {
    return { name, ok: false, detail: error.message };
  }
}

function requireEqual(actual, expected, what) {
  if (actual !== expected) throw new Error(`${what} does not match its producer`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * @param {object} [options]
 * @param {string} [options.outputDir]
 * @param {string} [options.sourceDir]
 * @param {boolean} [options.requireRender]
 * @param {boolean} [options.runGates]
 */
export function verifyProject({ outputDir = PATHS.output, sourceDir = PATHS.manuscriptSource, requireRender = true, runGates = true } = {}) {
  const dataDir = path.join(outputDir, 'data');
  const figuresDir = path.join(outputDir, 'figures');
  const manuscriptDir = path.join(outputDir, 'manuscript');
  const { plan, sha256: planSha256 } = loadPlan();
  const results = [];
  const add = (name, run) => results.push(check(name, run));

  add('deterministic receipts equal a fresh execution', () => {
    const stored = readJson(path.join(dataDir, 'deterministic', 'results.json'));
    const fresh = {
      schema: 'tiny-footprint-deterministic/v1',
      planSha256,
      sourceFingerprint: sourceFingerprint(),
      ...runDeterministicBenchmarks(plan),
    };
    requireEqual(canonicalStringify(fresh), canonicalStringify(stored), 'deterministic results');
    return `plan ${planSha256.slice(0, 12)}`;
  });

  add('compression reference equals a fresh execution', () => {
    const stored = readJson(path.join(dataDir, 'deterministic', 'compression.json'));
    if (stored.zlib !== process.versions.zlib) return `recorded under zlib ${stored.zlib}; this runtime has ${process.versions.zlib}, so not compared`;
    const fresh = { schema: 'tiny-footprint-compression-reference/v1', ...compressionReference({ seed: plan.seeds.primary }) };
    requireEqual(canonicalStringify(fresh), canonicalStringify(stored), 'compression reference');
    return undefined;
  });

  add('measured receipts were produced by the current source', () => {
    const current = sourceFingerprint().sha256;
    for (const name of ['heap', 'latency', 'rss', 'gpu_live']) {
      const receipt = readJson(path.join(dataDir, 'measured', `${name}.json`));
      if (receipt.sourceFingerprint?.sha256 !== current) throw new Error(`${name}.json is stale: its producer has changed`);
      if (receipt.planSha256 !== planSha256) throw new Error(`${name}.json was measured under another plan`);
    }
  });

  add('real-model receipts came from the current plan and lab code', () => {
    const dir = path.join(dataDir, 'measured', 'llm');
    const planned = plan.llm.runs.map(llmRunSlug);
    const stray = fs.readdirSync(dir).filter((name) => name.endsWith('.json') && !planned.includes(name.replace(/\.json$/, '')));
    if (stray.length > 0) throw new Error(`receipts outside the plan: ${stray.join(', ')}`);
    const current = sourceFingerprint(LLM_SOURCE_ROOTS).sha256;
    for (const run of planned) {
      const file = path.join(dir, `${run}.json`);
      if (!fs.existsSync(file)) throw new Error(`${run}: no receipt`);
      const receipt = readJson(file);
      if (receipt.planSha256 !== planSha256) throw new Error(`${run} was measured under another plan`);
      if (receipt.sourceFingerprint?.sha256 !== current) throw new Error(`${run} is stale: its producer has changed`);
    }
    return `${planned.length} runs`;
  });

  add('every real-model run that executed passed its equivalence check', () => {
    const { llm } = readJson(path.join(dataDir, 'analysis_summary.json'));
    const failed = llm.filter((run) => run.status === 'fail').map((run) => run.run);
    if (failed.length > 0) throw new Error(`failed equivalence: ${failed.join(', ')}`);
    for (const run of llm.filter((entry) => entry.status === 'pass')) {
      if (typeof run.equivalence.control?.detected !== 'boolean') throw new Error(`${run.run}: no wrong-prefix control`);
      if (!(run.residency.concatWorstAbsDifference <= plan.llm.logitTolerance)) throw new Error(`${run.run}: a rebuilt cache differs from a full prefill`);
    }
  });

  add('every materialization reproduced the original text', () => {
    for (const row of readJson(path.join(dataDir, 'analysis_summary.json')).latency.rows) {
      if (!(row.checkedReconstructions > 0) || row.exactReconstructions !== row.checkedReconstructions) {
        throw new Error(`${row.workload}/${row.condition}: ${row.exactReconstructions} of ${row.checkedReconstructions}`);
      }
    }
  });

  add('analysis summary equals a fresh reduction of the receipts', () => {
    const fresh = canonicalStringify(buildAnalysisSummary(plan, { dataDir }));
    requireEqual(fresh, fs.readFileSync(path.join(dataDir, 'analysis_summary.json'), 'utf8'), 'analysis summary');
  });

  add('heap readings grow with store size', () => {
    const violations = heapGrowthViolations(readJson(path.join(dataDir, 'analysis_summary.json')).heap.rows);
    if (violations.length > 0) throw new Error(violations.join('; '));
  });

  add('historical receipts reproduce where they can', () => {
    const { historical } = readJson(path.join(dataDir, 'analysis_summary.json'));
    if (!historical.allWorkloadsReproduced) throw new Error('a workload no longer matches its historical receipt');
    if (!historical.aggregate.reproduced) throw new Error('the aggregate no longer matches its historical receipt');
    if (!historical.gpuAllocation.reproducedByArithmetic) throw new Error('the GPU allocation no longer follows from its inputs');
  });

  add('every registered figure exists, has alternative text, and was drawn from this summary', () => {
    const registry = readJson(path.join(figuresDir, 'figure_registry.json'));
    const summaryHash = sha256File(path.join(dataDir, 'analysis_summary.json'));
    for (const [label, record] of Object.entries(registry)) {
      const file = path.join(figuresDir, record.filename);
      if (!fs.existsSync(file)) throw new Error(`${label}: missing ${record.filename}`);
      if (!record.metadata?.alt_text?.trim()) throw new Error(`${label}: no alternative text`);
      requireEqual(sha256File(file), record.metadata.sha256, `${label}'s image`);
      requireEqual(record.metadata.summary_sha256, summaryHash, `${label}'s source summary`);
    }
    return `${Object.keys(registry).length} figures`;
  });

  add('authored sections contain no hard-coded study values', () => {
    const findings = scanManuscript(sourceDir);
    if (findings.length > 0) throw new Error(`${findings.length} findings; first: ${JSON.stringify(findings[0])}`);
  });

  add('hydrated manuscript equals a fresh hydration', () => {
    const inputs = readHydrationInputs({ dataDir, figuresDir });
    const entries = buildCatalog(inputs.summary, { plan, planSha256, registry: inputs.registry, suite: inputs.suite });
    const variables = variablesFrom(entries);
    requireEqual(canonicalStringify(variables), fs.readFileSync(path.join(dataDir, 'manuscript_variables.json'), 'utf8'), 'manuscript variables');
    const sections = hydrateSections({ sourceDir, variables });
    for (const [name, content] of Object.entries(sections)) {
      requireEqual(content, fs.readFileSync(path.join(manuscriptDir, name), 'utf8'), `hydrated ${name}`);
    }
    requireEqual(canonicalStringify(buildFormalismLedger(sourceDir)), fs.readFileSync(path.join(dataDir, FORMALISM_LEDGER_NAME), 'utf8'), 'formalism ledger');
    return `${entries.length} tokens, ${Object.keys(sections).length} files`;
  });

  add('generated results page and README block are current', () => {
    const summary = readJson(path.join(dataDir, 'analysis_summary.json'));
    requireEqual(renderResultsDoc(summary), fs.readFileSync(repoPath('docs', 'benchmarks', 'RESULTS.md'), 'utf8'), 'docs/benchmarks/RESULTS.md');
    const readme = fs.readFileSync(repoPath('README.md'), 'utf8');
    requireEqual(replaceEvidenceBlock(readme, renderEvidenceBlock(summary)), readme, 'the README evidence block');
  });

  if (requireRender) {
    add('rendered PDF is bound to the hydrated manuscript', () => {
      const receipt = readJson(path.join(dataDir, 'render_receipt.json'));
      const pdf = path.join(outputDir, 'pdf', path.basename(receipt.pdf));
      requireEqual(sha256File(pdf), receipt.pdfSha256, 'PDF hash');
      requireEqual(sha256(fs.readFileSync(path.join(manuscriptDir, 'hydration_manifest.json'))), receipt.hydrationManifestSha256, 'hydration manifest hash');
      return `template ${receipt.templateCommit.slice(0, 12)}`;
    });

    add('the template validated this render, and its evidence is unchanged', () => {
      const report = readJson(path.join(outputDir, 'reports', 'validation_report.json'));
      if (report.summary?.all_passed !== true) throw new Error('the template validation report did not pass');
      const provenance = readJson(path.join(outputDir, 'reports', 'rendered_provenance.json'));
      const evidence = Object.values(provenance.evidence_files);
      for (const file of evidence) {
        requireEqual(sha256File(path.join(outputDir, path.relative('output', file.path))), file.sha256, file.path);
      }
      return `${report.summary.passed} checks, ${evidence.length} evidence files`;
    });
  }

  if (runGates) {
    for (const gate of runAllGates()) {
      results.push({ name: `gate: ${gate.name}`, ok: gate.problems.length === 0, detail: gate.problems.length > 0 ? `${gate.problems.length} problems: ${gate.problems.slice(0, 5).join('; ')}` : undefined });
    }
  }
  return results;
}

export const allPassed = (results) => results.every((result) => result.ok);
