import assert from 'node:assert/strict';
import { experimentS_h100RhymeVsPrefixSim } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';

const S = experimentS_h100RhymeVsPrefixSim();
assert.equal(S.pass, true, 'H100 rhyme-vs-prefix simulation must pass');
assert.equal(
  S.report.workloads.identicalPrefix.comparison.tinyVersusPrefixCacheResidentBytes,
  0,
  'identical exact prefix: Tiny must tie prefix cache',
);
assert.ok(
  S.tinyKvReductionVersusPrefixCache > 0.3,
  'rhyming different wording must cut KV vs prefix cache',
);
assert.ok(
  S.tinyMaterializeSpeedupVersusPrefixCache > 1.2,
  'rhyming different wording must improve materialize bandwidth proxy vs prefix cache',
);
assert.equal(
  S.report.workloads.rhymingDifferentWording.arms.tinyFootprintRhyme.sameResidentSetAsPrefixCache,
  false,
);

console.log(
  'h100 rhyme sim ok',
  `kvCut=${(S.tinyKvReductionVersusPrefixCache * 100).toFixed(1)}%`,
  `matSpeedup=${S.tinyMaterializeSpeedupVersusPrefixCache.toFixed(2)}x`,
);
