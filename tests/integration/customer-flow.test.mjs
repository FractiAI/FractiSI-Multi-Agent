import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { benchmark } from '../../src/cli/commands/benchmark.mjs';
import { writeReport } from '../../src/cli/commands/report.mjs';
import { createContext } from '../../src/cli/context.mjs';
import { repoPath } from '../../src/core/paths.mjs';

const hasNvidia = spawnSync('nvidia-smi', ['-L'], { encoding: 'utf8' }).status === 0;

test('regression: benchmark on this host names this host and no stored laptop', { skip: hasNvidia && 'this host has an NVIDIA GPU' }, () => {
  const reports = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-flow-'));
  // Planted stale receipts in the working folder must not leak into the result.
  fs.writeFileSync(path.join(reports, 'gpu_llm_real_lab.json'), JSON.stringify({ ok: true, device: 'NVIDIA GeForce GTX 860M' }));
  const lines = [];
  const ctx = { ...createContext({ argv: ['node', 'tiny', 'benchmark'], log: (line) => lines.push(line) }), reports };
  assert.equal(benchmark(ctx), 0);

  const empirical = JSON.parse(fs.readFileSync(path.join(reports, 'empirical_report.json'), 'utf8'));
  assert.equal(empirical.results.verdict, 'incomplete');
  assert.equal(empirical.results.enginePinRecommended, false);
  assert.equal(empirical.results.I.status, 'not_run');
  assert.equal(empirical.results.J.status, 'not_run');
  assert.equal(empirical.host.cpuModel, os.cpus()[0].model);
  assert.equal(JSON.parse(fs.readFileSync(path.join(reports, 'gpu_llm_real_lab.json'), 'utf8')).status, 'not_run');

  const heap = JSON.parse(fs.readFileSync(path.join(reports, 'heap_benchmark.json'), 'utf8'));
  assert.ok(heap.samples.length > 0);
  assert.ok(heap.summary.every((row) => row.duplicatedMedian > 0));

  const html = fs.readFileSync(writeReport(ctx), 'utf8');
  assert.doesNotMatch(html, /860M/);
  assert.match(html, /not run here/);
  assert.match(html, /Real V8 heap/);
  assert.ok(lines.some((line) => line.includes('Pin withheld')));
});

test('the thin entry points work end to end', () => {
  const run = (...args) => spawnSync(process.execPath, args, { encoding: 'utf8', cwd: repoPath() });
  const doctor = run('scripts/tiny.mjs', 'doctor');
  assert.equal(doctor.status, 0, doctor.stderr);
  assert.match(doctor.stdout, /doctor complete/);
  for (const entry of [['scripts/tiny.mjs', 'demo'], ['workloads/multi-session/run.mjs']]) {
    const demo = run(...entry);
    assert.equal(demo.status, 0, demo.stderr);
    assert.match(demo.stdout, /prefix-reuse/);
    assert.match(demo.stdout, /rhyme audit true · Net Zero true · brick wall false/);
  }
  const unknown = run('scripts/tiny.mjs', 'nope');
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /Unknown command/);
});
