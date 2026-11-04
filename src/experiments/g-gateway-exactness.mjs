/** G: gateway end-to-end exact reconstruction under primary and validation seeds. */
import { mulberry32 } from '../core/rng.mjs';
import { createGateway } from '../engine/gateway.mjs';
import { deepEqual } from '../engine/rhyming/index.mjs';
import { DIGITAL_SEED, VALIDATION_SEED } from './constants.mjs';

function runGatewayRoundTrips(seed) {
  const gw = createGateway();
  const pattern = { kind: 'packet', proto: 'v2', qos: 'default', payload: null };
  gw.registerTemplate({ id: 'tpl_packet', pattern });
  const rng = mulberry32(seed);
  let ok = 0;
  const n = 100;
  for (let i = 0; i < n; i++) {
    const expr = {
      ...pattern,
      payload: { x: rng(), y: i, tag: `t${i}` },
      qos: i % 10 === 0 ? 'high' : 'default',
    };
    const enc = gw.ingestExpression('tpl_packet', expr);
    const res = gw.execute({ operation: 'reconstruct', encoded: enc });
    if (res.ok && deepEqual(res.value, expr)) ok++;
  }
  return { n, ok, exactRate: ok / n };
}

export function experimentG_gatewayExactness(seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED) {
  const primary = runGatewayRoundTrips(seed);
  const validation = runGatewayRoundTrips(validationSeed);
  return {
    id: 'G_gateway_exactness',
    title: 'Gateway exact reconstruction (primary + validation seeds)',
    primary,
    validation,
    pass: primary.exactRate === 1 && validation.exactRate === 1,
  };
}
