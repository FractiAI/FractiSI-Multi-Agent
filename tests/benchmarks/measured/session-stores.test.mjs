import assert from 'node:assert/strict';
import test from 'node:test';
import { WORKLOADS, buildConditionFor, getWorkload } from '../../../src/benchmarks/measured/session-stores.mjs';

const conditionsOf = (workload) => Object.keys(workload.materialize);

test('every store of every workload reconstructs each session to its exact wire text', () => {
  for (const [name, workload] of Object.entries(WORKLOADS)) {
    const wires = workload.wires({ sessions: 12, seed: 3, turns: 2 });
    for (const condition of conditionsOf(workload)) {
      const store = workload.build[buildConditionFor(condition)](wires);
      wires.forEach((wire, i) => assert.equal(workload.materialize[condition](store, i), wire, `${name}/${condition}/${i}`));
    }
  }
});

test('the aliased store really shares and the duplicated store really does not', () => {
  const workload = getWorkload('ai_context');
  const wires = workload.wires({ sessions: 3, seed: 1, turns: 1 });
  const aliased = workload.build.aliased(wires);
  assert.equal(aliased[0].messages[0], aliased[1].messages[0]);
  const duplicated = workload.build.duplicated(wires);
  assert.notEqual(duplicated[0].messages[0], duplicated[1].messages[0]);
});

test('the exact cache keeps one record per distinct text', () => {
  const identical = getWorkload('rhyme_identical');
  assert.equal(identical.build.exact_cache(identical.wires({ sessions: 10 })).byDigest.size, 1);
  const differing = getWorkload('rhyme_differing');
  assert.equal(differing.build.exact_cache(differing.wires({ sessions: 10 })).byDigest.size, 10);
});

test('the serializable view of a store is smaller only where the design shares', () => {
  const workload = getWorkload('rhyme_differing');
  const wires = workload.wires({ sessions: 40 });
  const size = (condition) => JSON.stringify(workload.serializable[condition](workload.build[condition](wires))).length;
  assert.ok(size('tiny') < size('duplicated'));
  assert.ok(size('tiny_compact') < size('tiny'));
  assert.equal(size('aliased'), size('duplicated'), 'JSON cannot see a shared reference');
});

test('an unknown workload is refused', () => {
  assert.throws(() => getWorkload('nope'), /unknown workload/);
});
