# SDK

Import from the stable path:

```js
import { registerTemplate, sessionDelta, reconstruct, measureBytes, PRODUCT, VERSION } from './tiny-footprint/sdk/index.mjs';
```

The SDK wires to the engine in [`src/engine`](../../src/engine/README.md) and holds one catalog per process. It also re-exports the engine's catalog, codec, gate, route, context and energy functions.

| Function | Does |
|---|---|
| `registerTemplate(templateId, pattern, rhymeEvidence?)` | Registers the pattern, auditing `rhymeEvidence` first if given. Returns `{ templateId, pattern, registeredAt, structuralSignature, rhymePass }`. Throws if the audit fails, or if another template has the same signature |
| `sessionDelta(templateId, expression, state?)` | Returns `{ templateId, delta, kind: 'session_delta', state }`. Takes the full expression, and throws if it does not rhyme with the template |
| `reconstruct(templateId, delta, opts?)` | Returns `{ templateId, value, workingSet }`, or `{ value, state }` with `withState: true` |
| `discover(shape)`, `routeTemplate(shape, opts?)` | Find a registered template by structural signature |
| `createContextBuffer(opts?)`, `registerCompressionHook(registry, name, handlers)`, `withEnergyBudget(plan, budgetJ, model?)` | Lab meters. They count bytes and comparisons in process, and they are not KV compression or energy readings |
| `measureBytes(value)` | UTF-8 bytes of the value's JSON. Throws `TypeError` if the value has no JSON form |

`measureBytes` reports a serialized size. It is not resident memory, and the two can differ a great deal. See [the results](../benchmarks/RESULTS.md).

## The engine directly

```js
import { createTemplateCatalog, encodeExpression, reconstructExpression } from './src/engine/index.mjs';

const catalog = createTemplateCatalog();
const pattern = { kind: 'session', meta: { role: 'user', octave: 1 }, utterance: '' };
catalog.register({ id: 'session', pattern });

const encoded = encodeExpression('session', pattern, { kind: 'session', meta: { role: 'lead', octave: 1 }, utterance: 'hello' });
// { templateId: 'session', delta: { meta: { role: 'lead' }, utterance: 'hello' } }

reconstructExpression(catalog, encoded);
// { kind: 'session', meta: { role: 'lead', octave: 1 }, utterance: 'hello' }
```

**Limits to know.** An expression must have the same keys and kinds of values as its template, or `encodeExpression` throws. `reconstructExpression` returns the value alone: state travels separately, through `reconstructExpressionWithState`. A catalog refuses two templates with one structural signature unless created with `requireUniqueSignature: false`, and then an ambiguous match returns nothing.

**A cost to know.** `reconstructExpression` deep-clones with `structuredClone` at each level of the merge, which is most of its measured latency. If callers do not mutate the result, a merge that shares the template's objects is much cheaper.
