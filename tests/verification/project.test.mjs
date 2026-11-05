import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { allPassed, verifyProject } from '../../src/verification/project.mjs';

function copyOutput() {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-ver-'));
  for (const sub of ['data', 'figures', 'manuscript']) fs.cpSync(path.join(PATHS.output, sub), path.join(outputDir, sub), { recursive: true });
  return outputDir;
}
const failing = (results) => results.filter((r) => !r.ok).map((r) => r.name);
const verify = (outputDir, sourceDir) => verifyProject({ outputDir, sourceDir, requireRender: false, runGates: false });

test('the committed chain verifies', () => {
  const results = verifyProject({ requireRender: true, runGates: false });
  assert.deepEqual(failing(results), []);
  assert.equal(allPassed(results), true);
});

test('negative control: a hand-edited deterministic receipt fails', () => {
  const dir = copyOutput();
  const file = path.join(dir, 'data/deterministic/results.json');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('"ratio": 0.5', '"ratio": 0.6').replace(/"baselineBytes": \d+/, '"baselineBytes": 1'));
  assert.ok(failing(verify(dir)).includes('deterministic receipts equal a fresh execution'));
});

test('negative control: a stale measured receipt fails', () => {
  const dir = copyOutput();
  const file = path.join(dir, 'data/measured/heap.json');
  const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
  receipt.sourceFingerprint.sha256 = 'stale';
  fs.writeFileSync(file, JSON.stringify(receipt));
  assert.ok(failing(verify(dir)).includes('measured receipts were produced by the current source'));
});

test('negative control: a misread heap cell fails, even with a consistent summary', () => {
  const dir = copyOutput();
  const file = path.join(dir, 'data/analysis_summary.json');
  const summary = JSON.parse(fs.readFileSync(file, 'utf8'));
  const row = summary.heap.rows.find((r) => r.workload === 'rhyme_differing' && r.condition === 'exact_cache' && r.sessions === 256);
  row.heap.estimate = 1;
  fs.writeFileSync(file, JSON.stringify(summary));
  assert.ok(failing(verify(dir)).includes('heap readings grow with store size'));
});

test('negative control: a hand-edited summary fails', () => {
  const dir = copyOutput();
  fs.appendFileSync(path.join(dir, 'data/analysis_summary.json'), ' ');
  assert.ok(failing(verify(dir)).includes('analysis summary equals a fresh reduction of the receipts'));
});

test('negative control: a hand-edited hydrated section fails', () => {
  const dir = copyOutput();
  fs.appendFileSync(path.join(dir, 'manuscript/04_results.md'), '\nA better number.\n');
  assert.ok(failing(verify(dir)).includes('hydrated manuscript equals a fresh hydration'));
});

test('negative control: a typed value in an authored section fails', () => {
  const dir = copyOutput();
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-src-'));
  fs.cpSync(PATHS.manuscriptSource, source, { recursive: true });
  fs.appendFileSync(path.join(source, '04_results.md'), '\nThe heap fell 42.7 percent.\n');
  assert.ok(failing(verify(dir, source)).includes('authored sections contain no hard-coded study values'));
});

test('negative control: a missing figure fails', () => {
  const dir = copyOutput();
  fs.rmSync(path.join(dir, 'figures/heap_vs_json.png'));
  assert.ok(failing(verify(dir)).includes('every registered figure exists, has alternative text, and was drawn from this summary'));
});

test('negative control: a swapped PDF fails the render binding', () => {
  const dir = copyOutput();
  fs.mkdirSync(path.join(dir, 'pdf'), { recursive: true });
  const receipt = JSON.parse(fs.readFileSync(path.join(dir, 'data/render_receipt.json'), 'utf8'));
  fs.writeFileSync(path.join(dir, 'pdf', path.basename(receipt.pdf)), 'another PDF');
  const results = verifyProject({ outputDir: dir, requireRender: true, runGates: false });
  assert.ok(failing(results).includes('rendered PDF is bound to the hydrated manuscript'));
});

function copyWithReports() {
  const dir = copyOutput();
  for (const sub of ['pdf', 'reports', 'web']) fs.cpSync(path.join(PATHS.output, sub), path.join(dir, sub), { recursive: true });
  return dir;
}
const TEMPLATE_CHECK = 'the template validated this render, and its evidence is unchanged';

test('negative control: a changed web edition fails the template binding', () => {
  const dir = copyWithReports();
  fs.appendFileSync(path.join(dir, 'web/_combined_manuscript.md'), '\nA sentence nobody validated.\n');
  assert.ok(failing(verifyProject({ outputDir: dir, requireRender: true, runGates: false })).includes(TEMPLATE_CHECK));
});

test('negative control: a failed template report fails verification', () => {
  const dir = copyWithReports();
  const file = path.join(dir, 'reports/validation_report.json');
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  report.summary.all_passed = false;
  fs.writeFileSync(file, JSON.stringify(report));
  assert.ok(failing(verifyProject({ outputDir: dir, requireRender: true, runGates: false })).includes(TEMPLATE_CHECK));
});

const FIGURE_CHECK = 'every registered figure exists, has alternative text, and was drawn from this summary';
const LLM_BINDING = 'real-model receipts came from the current plan and lab code';
const EQUIVALENCE = 'every real-model run that executed passed its equivalence check';

function editJson(file, change) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(value);
  fs.writeFileSync(file, JSON.stringify(value));
}

test('negative control: a hand-edited figure fails', () => {
  const dir = copyOutput();
  fs.appendFileSync(path.join(dir, 'figures/heap_vs_json.png'), 'x');
  assert.ok(failing(verify(dir)).includes(FIGURE_CHECK));
});

test('negative control: a figure drawn from another summary fails', () => {
  const dir = copyOutput();
  editJson(path.join(dir, 'figures/figure_registry.json'), (registry) => {
    registry['fig:heap_vs_json'].metadata.summary_sha256 = 'another';
  });
  assert.ok(failing(verify(dir)).includes(FIGURE_CHECK));
});

test('negative control: a real-model receipt from older lab code fails', () => {
  const dir = copyOutput();
  const llm = path.join(dir, 'data/measured/llm');
  const [first] = fs.readdirSync(llm).filter((name) => name.endsWith('.json'));
  editJson(path.join(llm, first), (receipt) => {
    receipt.sourceFingerprint.sha256 = 'stale';
  });
  assert.ok(failing(verify(dir)).includes(LLM_BINDING));
});

test('negative control: a real-model receipt outside the plan fails', () => {
  const dir = copyOutput();
  const llm = path.join(dir, 'data/measured/llm');
  const [first] = fs.readdirSync(llm).filter((name) => name.endsWith('.json'));
  fs.copyFileSync(path.join(llm, first), path.join(llm, 'old-model-cpu.json'));
  assert.ok(failing(verify(dir)).includes(LLM_BINDING));
});

test('negative control: a missing real-model receipt fails', () => {
  const dir = copyOutput();
  const llm = path.join(dir, 'data/measured/llm');
  const [first] = fs.readdirSync(llm).filter((name) => name.endsWith('.json'));
  fs.rmSync(path.join(llm, first));
  assert.ok(failing(verify(dir)).includes(LLM_BINDING));
});

test('negative control: a failed equivalence check fails verification', () => {
  const dir = copyOutput();
  editJson(path.join(dir, 'data/analysis_summary.json'), (summary) => {
    summary.llm[0].status = 'fail';
  });
  assert.ok(failing(verify(dir)).includes(EQUIVALENCE));
});

test('negative control: a stale GPU lab receipt fails', () => {
  const dir = copyOutput();
  editJson(path.join(dir, 'data/measured/gpu_live.json'), (receipt) => {
    receipt.sourceFingerprint.sha256 = 'stale';
  });
  assert.ok(failing(verify(dir)).includes('measured receipts were produced by the current source'));
});

test('negative control: a materialization that lost text fails', () => {
  const dir = copyOutput();
  editJson(path.join(dir, 'data/analysis_summary.json'), (summary) => {
    summary.latency.rows[0].exactReconstructions -= 1;
  });
  assert.ok(failing(verify(dir)).includes('every materialization reproduced the original text'));
});
