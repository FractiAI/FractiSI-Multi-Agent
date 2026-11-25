/**
 * Groq LLM client for ζ-23 FractiSI invent (OpenAI-compatible chat).
 * Reads GROQ_API_KEY from the environment. Never logs the key.
 */
import { spawnSync } from 'node:child_process';

export const GROQ_DEFAULT_MODEL = 'qwen/qwen3.8-27b';
export const GROQ_FALLBACK_MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

export function groqKeyPresent() {
  return Boolean(process.env.GROQ_API_KEY && String(process.env.GROQ_API_KEY).trim());
}

export function listLlmKeysPresent() {
  return {
    GROQ_API_KEY: groqKeyPresent(),
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
  };
}

const LEAN_TACTIC_START =
  /^(intro|intros|aesop|simp|simp_all|exact|refine|have|obtain|use|apply|rw|rwa|calc|constructor|funext|ext|by_cases|contradiction|trivial|linarith|nlinarith|omega|ring|ring_nf|norm_num|decide|rfl|show|suffices|convert|change|specialize|cases|induction|first|try|skip|all_goals|·|\.|\{|←|simp_rw)\b/;

function looksLikeLeanTactic(body) {
  const lines = String(body)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return false;
  // Reject English essay dumps
  const proseHits = lines.filter((l) =>
    /\b(we could|however|therefore|thus we|cannot|actually|better:|wait)\b/i.test(l),
  ).length;
  if (proseHits >= 2) return false;
  return LEAN_TACTIC_START.test(lines[0].replace(/^by\s+/, ''));
}

/** Extract Lean tactic body from model text (strip fences / theorem wrappers). */
export function extractLeanTacticBody(text) {
  let t = String(text || '').trim();
  if (!t) return null;
  const fence = t.match(/```(?:lean)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  // Drop leading theorem ... := by
  const byIdx = t.search(/:=\s*by\b/);
  if (byIdx >= 0) {
    t = t.slice(byIdx).replace(/^:=\s*by\b/, '').trim();
  }
  // Drop a solitary leading `by`
  t = t.replace(/^by\b\s*/i, '');
  // Drop import / theorem headers / markdown if model echoed them
  t = t
    .split('\n')
    .filter((line) => {
      const s = line.trim();
      if (!s) return true;
      if (/^import\b/.test(s)) return false;
      if (/^theorem\b/.test(s)) return false;
      if (/^\/-/.test(s)) return false;
      if (/^#/.test(s)) return false;
      return true;
    })
    .join('\n')
    .trim();
  if (!t) return null;
  if (/^\bsorry\b/.test(t) && t.length < 40) return null;
  if (!looksLikeLeanTactic(t)) return null;
  return t;
}

/**
 * Chat completion via Groq. Returns { ok, content, model, error, status }.
 */
export function groqChat({
  messages,
  model = GROQ_DEFAULT_MODEL,
  maxTokens = 2048,
  temperature = 0.2,
  timeoutMs = 120_000,
}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { ok: false, error: 'missing_GROQ_API_KEY', status: 0 };

  const payload = JSON.stringify({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const r = spawnSync(
    'curl',
    [
      '-sS',
      'https://api.groq.com/openai/v1/chat/completions',
      '-H',
      `Authorization: Bearer ${key}`,
      '-H',
      'Content-Type: application/json',
      '-d',
      payload,
      '--max-time',
      String(Math.ceil(timeoutMs / 1000)),
    ],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );

  if (r.error) return { ok: false, error: String(r.error.message || r.error), status: 0 };
  let data;
  try {
    data = JSON.parse(r.stdout || '{}');
  } catch {
    return { ok: false, error: 'invalid_json', status: 0, raw: (r.stdout || '').slice(0, 400) };
  }
  if (data.error) {
    return {
      ok: false,
      error: data.error.message || JSON.stringify(data.error),
      code: data.error.code,
      status: 400,
      model,
    };
  }
  const choice = data.choices?.[0]?.message || {};
  // gpt-oss may put text in reasoning; prefer content, else reasoning.
  const content = String(choice.content || choice.reasoning || '').trim();
  return {
    ok: Boolean(content),
    content,
    model: data.model || model,
    usage: data.usage || null,
    status: 200,
    error: content ? null : 'empty_content',
  };
}

/**
 * Build FractiSI Multi-Agent shared-world awareness text for LLM invent prompts.
 * Agents see one Solution board, peer attempts, contributions, and lake feedback —
 * not N private full copies.
 */
export function buildFractisiInventAwareness({
  platform,
  agentName,
  theorem,
  proofs,
  attempts,
  round,
  priorError,
} = {}) {
  const banner =
    platform?.banner ||
    'FractiSI · FractiSI Multi-Agent · Tiny Footprint shared world';
  const version = platform?.version || 'unknown';
  const status = typeof platform?.status === 'function' ? platform.status() : {};
  const snap = typeof platform?.store?.snapshot === 'function' ? platform.store.snapshot() : null;

  const board = [];
  if (proofs && typeof proofs.entries === 'function') {
    for (const [name, p] of proofs.entries()) {
      const statusLabel = p.closed ? 'CLOSED' : p.body && p.body !== 'sorry' ? 'OPEN+draft' : 'OPEN+sorry';
      const preview = String(p.body || 'sorry')
        .replace(/\s+/g, ' ')
        .slice(0, 120);
      board.push(`- ${name}: ${statusLabel} · tactic=${p.tacticId || '?'} · ${preview}`);
    }
  }

  const peerAttempts = (attempts || [])
    .filter((a) => a.theorem !== theorem)
    .slice(-12)
    .map(
      (a) =>
        `- r${a.round} ${a.agent} → ${a.theorem}: ${a.strategy}${a.ok === false ? ' (llm_fail)' : ''}`,
    );

  const contribLines = (snap?.contributions || [])
    .slice(-8)
    .map((c) => `- ${c.summary || c.id} · state=${c.state || '?'}`);

  const agentLines = (snap?.agents || []).map(
    (a) => `- ${a.name} (${a.status}) framework=${a.framework || '?'}`,
  );

  const parts = [
    '=== FractiSI Multi-Agent shared World Awareness ===',
    banner,
    `productVersion=${version} · inventRound=${round ?? '?'} · claimingAgent=${agentName || '?'} · focusTheorem=${theorem || '?'}`,
    `capabilities: shared_state · multi_agent_coordination · dependency_awareness · work_composition · Tiny Footprint (one Solution.lean, not N private copies)`,
    `platformStatus: agents=${status.agents ?? agentLines.length} active=${status.activeAgents ?? '?'} tasks=${status.tasks ?? '?'} contributions=${status.contributions ?? contribLines.length} compositions=${status.compositions ?? '?'}`,
    '',
    'Shared invent board (all agents see this same world):',
    ...(board.length ? board : ['- (empty)']),
    '',
    'Registered agents:',
    ...(agentLines.length ? agentLines : ['- (none yet)']),
    '',
    'Recent peer invent attempts (rhyme / reuse patterns; do not copy sealed Anthropic Zeta23):',
    ...(peerAttempts.length ? peerAttempts : ['- (none yet)']),
    '',
    'Recent FractiSI contributions:',
    ...(contribLines.length ? contribLines : ['- (none yet)']),
  ];

  if (priorError) {
    parts.push('', 'Shared lake build feedback (world error, not private):', priorError.slice(0, 2500));
  }

  parts.push(
    '',
    'Invent inside this shared world: improve the focus theorem so the whole Solution may compose.',
  );
  return parts.join('\n');
}

export function inventProofWithGroq({
  theorem,
  binders,
  stmt,
  priorError,
  model,
  awareness,
  agentName,
  platform,
  proofs,
  attempts,
  round,
}) {
  const models = [model || GROQ_DEFAULT_MODEL, ...GROQ_FALLBACK_MODELS].filter(
    (m, i, a) => a.indexOf(m) === i,
  );
  const binderLine = binders ? ` ${binders}` : '';
  const awarenessText =
    awareness ||
    buildFractisiInventAwareness({
      platform,
      agentName,
      theorem,
      proofs,
      attempts,
      round,
      priorError,
    });

  const system = `You are a Lean 4 + Mathlib invent agent inside FractiSI Multi-Agent shared World Awareness.
You share one Solution.lean with peer agents (Tiny Footprint — not N private full copies).
Use the shared board, peer attempts, and lake feedback when inventing.
Output ONLY executable Lean tactic lines for the body after := by.
ABSOLUTE RULES:
- First token must be a Lean tactic (intro, aesop, simp, exact, refine, have, …).
- No English prose, no explanations, no markdown.
- Do NOT import Zeta23 or any Anthropic sealed library. Do NOT use sorry.
- Prefer short scripts that could compose with peers; if stuck output: aesop`;

  const userParts = [
    awarenessText,
    '',
    '=== Focus invent target ===',
    `Invent a proof for this Challenge theorem (Mathlib riemannZeta critical-line proportion):`,
    `theorem ${theorem}${binderLine} :`,
    `    ${stmt} := by`,
    '',
    'Context: ChallengeDeps already defines Ncount, N0star, N0simple, Ndist, cMT, and Dirichlet variants.',
    'Independent invent — do not assume Anthropic Zeta23 lemmas exist.',
  ];

  let last = null;
  for (const m of models) {
    const res = groqChat({
      model: m,
      maxTokens: 2500,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userParts.join('\n') },
      ],
    });
    last = res;
    if (!res.ok) continue;
    const body = extractLeanTacticBody(res.content);
    if (body) {
      return {
        ok: true,
        body,
        model: res.model,
        usage: res.usage,
        awarenessInjected: true,
        awarenessChars: awarenessText.length,
        rawPreview: res.content.slice(0, 400),
      };
    }
  }
  return {
    ok: false,
    error: last?.error || 'no_tactic_extracted',
    model: last?.model || models[0],
    awarenessInjected: true,
    awarenessChars: awarenessText.length,
    rawPreview: (last?.content || last?.raw || '').slice(0, 400),
  };
}
