/** F: chat sessions with a repeated system prompt and per-turn deltas. */
import { bytesOf, reduction } from '../core/bytes.mjs';
import { mulberry32 } from '../core/rng.mjs';
import { createTemplateCatalog, deepEqual, reconstructExpression } from '../engine/rhyming/index.mjs';
import { DIGITAL_SEED } from './constants.mjs';

export function buildAiContextWorkload(seed = DIGITAL_SEED, sessions = 40, turns = 25) {
  const rng = mulberry32(seed);
  const systemPrompt = {
    role: 'system',
    content: 'You are a careful assistant. '.repeat(80),
    tools: ['search', 'calc', 'browse'],
    policy: { safety: true, cite: true },
  };
  const conventional = [];
  for (let s = 0; s < sessions; s++) {
    const msgs = [structuredClone(systemPrompt)];
    for (let t = 0; t < turns; t++) {
      msgs.push({ role: 'user', content: `q${s}_${t}_${(rng() * 1e9) | 0}` });
      msgs.push({ role: 'assistant', content: `a${s}_${t}_${(rng() * 1e9) | 0}` });
    }
    conventional.push({ session: s, messages: msgs });
  }

  const catalog = createTemplateCatalog();
  catalog.register({ id: 'tpl_sys', pattern: systemPrompt });
  const tiny = {
    systemTemplate: catalog.get('tpl_sys'),
    sessions: conventional.map((c) => ({
      session: c.session,
      systemRef: 'tpl_sys',
      turns: c.messages.slice(1),
    })),
  };
  return { systemPrompt, catalog, conventional, tiny };
}

export function experimentF_aiContextProxy(seed = DIGITAL_SEED, sessions = 40, turns = 25) {
  const { systemPrompt, catalog, conventional, tiny } = buildAiContextWorkload(seed, sessions, turns);
  const r = reduction(bytesOf(conventional), bytesOf(tiny));
  // Reconstruct one session and compare system prompt
  const reconSys = reconstructExpression(catalog, { templateId: 'tpl_sys', delta: {} });
  const exact = deepEqual(reconSys, systemPrompt);
  return {
    id: 'F_ai_context_proxy',
    title: 'Workload E/F proxy · shared system prompt + turn deltas (prefix-reuse meter)',
    sessions,
    turns,
    ...r,
    exact,
    pass: r.ratio >= 0.4 && exact,
    honesty:
      'Prefix-reuse / shared-identical-system-prompt meter — not a holographic rhyme proof, and not measured GPU KV-cache / HBM for a production LLM server.',
  };
}
