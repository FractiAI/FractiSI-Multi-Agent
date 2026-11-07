/**
 * Self-paced Test Drive runner.
 * GET/POST /api/testdrive?step=primer|1…7|list
 */
import { listTestDriveSteps, runTestDriveStep } from '../src/testdrive/run-step.mjs';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readStep(req) {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const q = url.searchParams.get('step') || url.searchParams.get('id');
    if (q) return q;
  } catch {
    /* ignore */
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    send(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  let step = readStep(req);
  if (!step && req.method === 'POST') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw) {
        const body = JSON.parse(raw);
        step = body.step || body.id;
      }
    } catch {
      send(res, 400, { ok: false, error: 'invalid_json' });
      return;
    }
  }

  if (!step || step === 'list') {
    send(res, 200, {
      ok: true,
      product: 'FractiSI Multi-Agent',
      mode: 'self-paced',
      steps: listTestDriveSteps(),
    });
    return;
  }

  try {
    const out = runTestDriveStep(step);
    send(res, 200, out);
  } catch (err) {
    const unknown = err?.code === 'unknown_step';
    send(res, unknown ? 404 : 500, {
      ok: false,
      error: unknown ? 'unknown_step' : 'step_failed',
      detail: String(err?.message || err),
      steps: listTestDriveSteps().map((s) => s.id),
    });
  }
}
