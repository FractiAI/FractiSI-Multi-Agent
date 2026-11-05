import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadProductConfig } from '../../src/core/config.mjs';
import { renderCustomerReport, writeCustomerReport } from '../../src/reporting/customer-report.mjs';

const config = loadProductConfig();
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tf-rep-'));

test('with no benchmark yet the report says so and invents nothing', () => {
  const html = renderCustomerReport({ reportsDir: tmp(), config, generatedAt: 'T' });
  assert.match(html, /no benchmark yet/);
  assert.doesNotMatch(html, /860M/);
  assert.match(html, /Generated T/);
});

test('a lab that did not run says so, with its reason', () => {
  const reportsDir = tmp();
  fs.writeFileSync(path.join(reportsDir, 'empirical_report.json'), JSON.stringify({
    host: { cpuModel: 'Test CPU', platform: 'p', arch: 'a' },
    results: {
      verdict: 'incomplete', n_pass: 7, n_fail: 0, n_not_run: 3,
      H: { aggregateRatio: 0.845 },
      I: { report: { status: 'not_run', reason: 'nvcuda_unavailable' } },
      J: { report: { status: 'not_run', reason: 'not_requested' } },
    },
  }));
  const html = renderCustomerReport({ reportsDir, config });
  assert.match(html, /incomplete/);
  assert.match(html, /84\.5%/);
  assert.match(html, /not run here \(nvcuda_unavailable\)/);
  assert.match(html, /Test CPU/);
});

test('a lab that passed shows its device', () => {
  const reportsDir = tmp();
  fs.writeFileSync(path.join(reportsDir, 'empirical_report.json'), JSON.stringify({
    results: {
      verdict: 'all_pass', n_pass: 10, n_fail: 0, n_not_run: 0, H: { aggregateRatio: 0.9 },
      I: { report: { status: 'pass', device: 'GPU X', cuMemAlloc: { reductionRatio: 0.5 } } },
      J: { report: { status: 'pass', device: 'GPU Y', inference: { comparison: { prefillP50Speedup: 2, decodeP50Speedup: 1 } } } },
    },
  }));
  const html = renderCustomerReport({ reportsDir, config });
  assert.match(html, /GPU X/);
  assert.match(html, /2\.00×/);
});

test('hostile values are escaped', () => {
  const reportsDir = tmp();
  fs.writeFileSync(path.join(reportsDir, 'empirical_report.json'), JSON.stringify({
    host: { cpuModel: '<script>alert(1)</script>', platform: 'p', arch: 'a' }, results: { verdict: 'x', H: {} },
  }));
  const html = renderCustomerReport({ reportsDir, config });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('writing creates the folder and the file', () => {
  const reportsDir = path.join(tmp(), 'nested');
  assert.ok(fs.existsSync(writeCustomerReport({ reportsDir, config })));
});
