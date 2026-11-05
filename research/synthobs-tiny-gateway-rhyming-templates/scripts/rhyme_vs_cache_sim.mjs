#!/usr/bin/env node
/** Thin orchestrator: print the rhyme-versus-cache comparison. In-process JSON bytes, not a GPU measurement. */
import { compareRhymeToCache, differingWordSessions, identicalTextSessions } from '../../../src/experiments/rhyme-vs-cache.mjs';

const report = {
  ok: true,
  kind: 'simulation',
  simulator: 'rhyming-template shape match versus exact-text cache',
  notAMeasurement: true,
  notGpu: true,
  definition: 'Rhyme = same fields and same value kinds. Cache = identical JSON text stored once.',
  cases: [
    { name: 'sameShapeDifferentWords', ...compareRhymeToCache(differingWordSessions()) },
    { name: 'identicalText', ...compareRhymeToCache(identicalTextSessions()) },
  ],
};
if (report.cases.some((c) => !c.equivalent)) process.exit(1);
console.log(JSON.stringify(report, null, 2));
