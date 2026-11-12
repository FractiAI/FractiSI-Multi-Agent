/**
 * Symposium / Test Drive opening story — awareness before the stack.
 *
 * Plain tell from Player 1 (Valet Pru): AI-generated music in the restroom
 * where he works as a restroom valet; opinions flip the moment listeners
 * become aware. That light on awareness opens the FractiSI Multi-Agent peek.
 */

export const OPENING_STORY = Object.freeze({
  title: 'A restroom valet story',
  kicker: 'Before the stack · the power of awareness',
  tell: Object.freeze([
    'I work as a restroom valet. In that room I play AI-generated music — the same tracks people hear as ordinary background until something shifts.',
    'The moment listeners become aware the music is AI-generated, opinions change — often immediately. Same sound. Awareness framed the sensory observations.',
    'That is the power of awareness: it frames sensory observations before any note changes. Not a lecture on consciousness — a floor-level fact from a working restroom.',
  ]),
  bridge:
    'With that in mind, we introduce FractiSI Multi-Agent as a shared Fractal Holographic Goldilocks Superintelligence World Awareness — not as theory, but as a coherent operating demonstration. That is why we call this a Test Drive.',
  productName: 'FractiSI Multi-Agent',
  honesty:
    'Story is lived floor experience used as an awareness bridge — not a controlled psych study, not a claim that awareness is only “AI labeling.” Product demos that follow are in-process architectural labs, not CapEx guarantees. Possible rhyme with Active Inference ≠ framework identity.',
});

export function openingStoryLines() {
  const d = OPENING_STORY;
  const lines = [d.title.toUpperCase(), '', `  ${d.kicker}`, ''];
  for (const p of d.tell) lines.push(`  ${p}`, '');
  lines.push(`  ${d.bridge}`, '', `  ${d.honesty}`);
  return lines;
}
