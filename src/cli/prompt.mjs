/** Interactive question helper for `join` and `share`. */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export function openPrompt() {
  return readline.createInterface({ input, output });
}

export async function ask(rl, question, fallback = '') {
  const answer = (await rl.question(fallback ? `${question} [${fallback}]: ` : `${question}: `)).trim();
  return answer || fallback;
}

export function isYes(answer) {
  const normalized = answer.toLowerCase();
  return normalized === 'y' || normalized === 'yes';
}
