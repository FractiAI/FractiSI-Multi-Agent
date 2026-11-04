# SDK

Import from the stable path:

```js
import { registerTemplate, sessionDelta, reconstruct, measureBytes, PRODUCT, VERSION } from './tiny-footprint/sdk/index.mjs';
```

This is a thin facade in Workstation 0.1: it builds descriptors for integrations to act on and holds no state. The engine itself is [`src/engine`](../../src/engine/README.md).

| Function | Returns |
|---|---|
| `registerTemplate(templateId, pattern)` | `{ templateId, pattern, registeredAt }` |
| `sessionDelta(templateId, delta)` | `{ templateId, delta, kind: 'session_delta' }` |
| `reconstruct(templateId, delta, opts?)` | `{ templateId, workingSet: { patternRef, delta, selective: true, ...opts } }` |
| `measureBytes(value)` | UTF-8 bytes of the value's JSON. Throws `TypeError` if the value has no JSON form |

`measureBytes` reports a serialized size. It is not resident memory, and the two can differ a great deal. See [the results](../benchmarks/RESULTS.md).

## The engine directly

```js
import { createTemplateCatalog, encodeExpression, reconstructExpression } from './src/engine/index.mjs';

const catalog = createTemplateCatalog();
const pattern = { kind: 'session', role: 'user', utterance: '' };
catalog.register({ id: 'session', pattern });

const encoded = encodeExpression('session', pattern, { kind: 'session', role: 'lead', utterance: 'hello' });
// { templateId: 'session', delta: { role: 'lead', utterance: 'hello' } }

reconstructExpression(catalog, encoded);
// { kind: 'session', role: 'lead', utterance: 'hello' }
```

**A limit to know.** A delta records overrides only, so an expression that omits a key the pattern defines comes back with that key present. `catalog.findMatch` excludes such expressions, because a shape match requires the same keys. If you call `encodeExpression` directly, pass only expressions with every key the pattern has.

**A cost to know.** `reconstructExpression` deep-clones with `structuredClone`, which is most of its measured latency. If callers do not mutate the result, a shallow merge is much cheaper.
