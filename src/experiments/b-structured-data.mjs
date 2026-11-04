/** B: structured records sharing a rhyming template. */
import { bytesOf, reduction } from '../core/bytes.mjs';
import { mulberry32 } from '../core/rng.mjs';
import { createTemplateCatalog, deepEqual, encodeExpression, reconstructExpression } from '../engine/rhyming/index.mjs';
import { DIGITAL_SEED } from './constants.mjs';

export function buildStructuredWorkload(seed = DIGITAL_SEED, n = 500) {
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
  return { rng, catalog, conventional, tiny };
}

export function experimentB_structuredData(seed = DIGITAL_SEED, n = 500) {
  const { rng, catalog, conventional, tiny } = buildStructuredWorkload(seed, n);
  const r = reduction(bytesOf(conventional), bytesOf(tiny));
  // Exactness sample; the full round trip lives in src/benchmarks/deterministic/exactness.mjs.
  let exact = true;
  for (let i = 0; i < 20; i++) {
    const idx = Math.floor(rng() * n);
    const recon = reconstructExpression(catalog, tiny.expressions[idx]);
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
