/**
 * Locked audience framing: Base Mainnet · Syntheverse Sandbox · enter/exit awareness.
 *
 * Canonical peers (do not invent alternatives):
 * - Base Mainnet = on-chain bedrock / genesis receipts (nest-basenet-genesis)
 * - Syntheverse = sandbox world built above that bedrock (nest-syntheverse · Synthio sandbox)
 * - Awareness = how a participant holds / chooses the shared world — enter and exit are voluntary
 *
 * For Test Drive / symposium: exposure only — not a wallet requirement, not a lock-in claim.
 */

export const SANDBOX_FRAME = Object.freeze({
  title: 'Where this peek sits',
  punch: 'You are looking into a sandbox you can enter and leave.',
  baseMainnet: Object.freeze({
    name: 'Base Mainnet',
    body:
      'On-chain bedrock under the ship — chain receipts the sandbox can match. Not a requirement to buy anything to take this peek.',
  }),
  syntheverse: Object.freeze({
    name: 'Syntheverse Sandbox',
    body:
      'The sandbox world this Test Drive lives inside. Safe room for shared-world experiments. You choose when to step in and when to step out.',
  }),
  awareness: Object.freeze({
    name: 'Awareness (your choice)',
    body:
      'How you show up — observations, beliefs, actions, ownership, or simply curiosity. Use whichever awareness you choose to enter, stay, or leave. Not phenomenal consciousness. Not a trap door.',
  }),
  stackPrefix: 'Base Mainnet → Syntheverse Sandbox',
  honesty:
    'Sandbox framing for voluntary enter/exit. Not a claim you must hold crypto to evaluate FractiSI. Not identity with Active Inference. Not clinical Synthio MRI.',
});

export function sandboxFrameLines() {
  const d = SANDBOX_FRAME;
  return [
    d.title.toUpperCase(),
    '',
    `  ${d.punch}`,
    '',
    `  ${d.baseMainnet.name}`,
    `    ${d.baseMainnet.body}`,
    '',
    `  ${d.syntheverse.name}`,
    `    ${d.syntheverse.body}`,
    '',
    `  ${d.awareness.name}`,
    `    ${d.awareness.body}`,
    '',
    `  ${d.honesty}`,
  ];
}
