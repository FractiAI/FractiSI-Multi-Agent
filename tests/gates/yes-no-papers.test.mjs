import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkYesNoPapers,
  hasYesNoShortAnswer,
  isYesNoQuestionTitle,
} from '../../src/gates/yes-no-papers.mjs';

test('yes/no question detector', () => {
  assert.equal(isYesNoQuestionTitle('Can shared worlds cut memory?'), true);
  assert.equal(isYesNoQuestionTitle('Did FractiSI close the challenge?'), true);
  assert.equal(isYesNoQuestionTitle('After a pass, does it still predict?'), true);
  assert.equal(isYesNoQuestionTitle('The Universal Rhyme Wet-Lab Proof'), false);
  assert.equal(isYesNoQuestionTitle('What should we do next?'), false);
});

test('short-answer detector', () => {
  assert.equal(hasYesNoShortAnswer('**Short answer: Yes.** Rest of paper.'), true);
  assert.equal(hasYesNoShortAnswer('<p><strong>Short answer: No.</strong> Rest.</p>'), true);
  assert.equal(hasYesNoShortAnswer('Abstract without an answer.'), false);
});

test('repository papers and blogs pass the yes/no gate', () => {
  const gate = checkYesNoPapers();
  assert.deepEqual(gate.problems, [], gate.problems.join('\n'));
});

test('voice-locked symposium blog title is accepted as a yes/no question', () => {
  assert.equal(isYesNoQuestionTitle('The Multi-Agent World Inference Rhyme?'), true);
});

test('announcement titles are declarative, not yes/no questions', () => {
  assert.equal(isYesNoQuestionTitle('Bach Cigar Lounge opens on SS Vibelandia'), false);
});
