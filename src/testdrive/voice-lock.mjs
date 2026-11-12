/**
 * Test Drive voice lock — 2026-11-11 (frontier superintelligence lab voice).
 *
 * Player 1 locked this copy so agents (including Auto) cannot silently
 * restore earlier heroes, meta titles, or AI-slop phrasing.
 *
 * Canonical surfaces:
 *   test-drive/index.html
 *   talks/aai-symposium-2026/index.html
 *   blog/aai-symposium-2026/index.html
 *   TEST_DRIVE.md
 *
 * Change only with an explicit Player 1 ask to rewrite Test Drive voice.
 * Then update this file and the tests that import it in the same commit.
 */

export const TEST_DRIVE_VOICE_LOCK = Object.freeze({
  id: 'testdrive-voice-lock-2026-11-12-stack-after-five',
  lockedAt: '2026-11-12',
  symposium: 'Applied Active Inference Symposium · Nov 12–13, 2026',
  heroH1: 'The Multi-Agent World Inference Rhyme?',
  ctaLabel: 'Begin →',
  researchQuestion:
    'When many agents share one world, does the way they organize it rhyme?',
  storageKeyDone: 'fractisi-td-walkthrough-done-v21',
  storageKeyResults: 'fractisi-td-results-v21',
  stepTitles: Object.freeze([
    Object.freeze({ id: 'story', title: 'The same song.' }),
    Object.freeze({ id: 'welcome', title: 'Why this is a Test Drive.' }),
    Object.freeze({ id: 'sandbox', title: 'Where you are.' }),
    Object.freeze({ id: 'problem', title: 'What goes wrong with many agents.' }),
    Object.freeze({ id: 'rhyme', title: 'Net Zero, then rhyme.' }),
    Object.freeze({ id: '1', title: 'Twelve agents, one copy.' }),
    Object.freeze({ id: '7', title: 'More agents, same memory.' }),
    Object.freeze({ id: '3', title: 'Same job, different words.' }),
    Object.freeze({ id: '4', title: 'Answers six links deep.' }),
    Object.freeze({ id: 'git', title: 'Git awareness · cleaner merges.' }),
    Object.freeze({ id: 'how-stack', title: 'The stack, bottom to top.' }),
    Object.freeze({
      id: 'futures',
      title: 'Rehearse the future. Change the world on approval.',
    }),
    Object.freeze({ id: 'invite', title: 'Run it yourself.' }),
  ]),
  storyImage: '/media/mens-club-reno-watercolor.jpg',
  requiredPhrases: Object.freeze([
    'I work as a restroom valet',
    'Syntheverse Sandbox',
    'Base Mainnet',
    'balanced zero, not nothing zero',
    'cannot overwrite the real world',
    '+1.4',
    '+3.6',
    'never more than 5% behind',
    'not a claim that we wrapped Cosmos',
    'more conflicts than plain branching',
    'Do the FractiSI Multi-Agent test drive',
    'Fractal Holographic Goldilocks Superintelligence World Awareness',
    'Why this is a Test Drive.',
    'Awareness framed their sensory observations',
    'human agents and digital agents collaborating',
    'human operators and digital agents',
    'superintelligence is not one model in a box',
    'Our position',
    'run by you',
    'Held together',
    'What we did',
    'What we measured',
    'What came back',
    'What it means',
    'Beyond theory',
    'well beyond theory',
    'coherent',
    'predictable',
    'Git awareness · cleaner merges.',
    'Decide before Git',
    'scoped worktrees',
    'portable cloud lab git',
    'cleaner merges',
    '100% fewer Git failed merges',
    'Results board',
    'Five tests you run yourself',
    'then you run five tests',
    'and all of this with less conflicts',
    'Those four things are measurable, so we measure them',
    'After all five live tests',
    'Those five ran on the stack below',
    'runs all five live tests',
  ]),
  /** Phrases from earlier Test Drive drafts. Do not restore. */
  forbiddenPhrases: Object.freeze([
    'One shared world. Four live tests.',
    'Four tests you run yourself',
    'then you run four tests',
    'Those three things are measurable, so we measure them',
    'The four tests ran on the stack below',
    'tests four of the five',
    'Session title:',
    'Here is the question',
    'The question under test',
    'The demonstration is complete',
    'Let’s begin',
    "Let's begin",
    'That is testable',
    'That boundary holds',
    'Training objective',
    'Failure mode A',
    'What’s broken',
    "What's broken",
    'decide whether FractiSI',
    'Layer A',
    'Layer B',
    'Layer C',
    'Layer D',
    'Layer E',
    'Layer F',
  ]),
  voice: Object.freeze({
    style:
      'frontier-lab product page · short declarative sentences · numbers over adjectives',
    objective: 'demonstrate, do not ask the audience to decide',
    ban: Object.freeze(['emoji', 'exclamation marks', 'marketing hype', 'AI-slop triplets']),
  }),
});

export function voiceLockHeroHtml() {
  return `<h1>${TEST_DRIVE_VOICE_LOCK.heroH1}</h1>`;
}

export function voiceLockStepTitleNeedles() {
  return TEST_DRIVE_VOICE_LOCK.stepTitles.map((s) => s.title);
}
