/**
 * Library papers must be titled as yes/no questions and open with a Yes/No short answer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

const YES_NO_STARTERS =
  /^(Can|Could|Do|Does|Did|Is|Are|Was|Were|Will|Would|Should|May|Might|Has|Have|Had|If|When|After|Given)\b/i;

const SHORT_ANSWER = /\*\*Short answer:\s*(YES|NO|Yes|No)\b/i;
const SHORT_ANSWER_HTML = /<strong>\s*Short answer:\s*(YES|NO|Yes|No)\b/i;

/** @param {string} title */
export function isYesNoQuestionTitle(title) {
  const t = String(title || '').trim();
  if (!t.endsWith('?')) return false;
  return YES_NO_STARTERS.test(t);
}

/** @param {string} text */
export function hasYesNoShortAnswer(text) {
  return SHORT_ANSWER.test(text) || SHORT_ANSWER_HTML.test(text);
}

/** @param {string} [root] */
export function checkYesNoPapers(root = REPO_ROOT) {
  const problems = [];
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/manifest.json'), 'utf8'));
  const papers = manifest.papers || [];
  for (const entry of papers) {
    if (!isYesNoQuestionTitle(entry.title)) {
      problems.push(`content/manifest.json papers[${entry.slug}]: title must be a yes/no question ending in ?`);
    }
    const md = path.join(root, 'content/papers', `${entry.slug}.md`);
    const html = path.join(root, 'content/papers', `${entry.slug}.html`);
    const src = fs.existsSync(md) ? md : fs.existsSync(html) ? html : null;
    if (!src) {
      problems.push(`content/papers/${entry.slug}: missing .md or .html source`);
      continue;
    }
    const text = fs.readFileSync(src, 'utf8');
    if (!hasYesNoShortAnswer(text)) {
      problems.push(`${path.relative(root, src)}: must begin with Short answer: Yes/No`);
    }
    // Markdown H1 must match the yes/no form when present
    const h1 = text.match(/^#\s+(.+)$/m);
    if (h1 && !isYesNoQuestionTitle(h1[1].trim())) {
      problems.push(`${path.relative(root, src)}: H1 must be a yes/no question ending in ?`);
    }
  }
  // Blog entries that share a paper slug must keep the same yes/no title contract.
  const paperSlugs = new Set(papers.map((p) => p.slug));
  for (const entry of manifest.blog || []) {
    if (!paperSlugs.has(entry.slug)) continue;
    if (!isYesNoQuestionTitle(entry.title)) {
      problems.push(`content/manifest.json blog[${entry.slug}]: paper-peer blog title must be a yes/no question`);
    }
    if (entry.answerHead && !/^Short answer:\s*(YES|NO|Yes|No)\b/i.test(entry.answerHead)) {
      problems.push(`content/manifest.json blog[${entry.slug}]: answerHead must start with Short answer: Yes/No`);
    }
  }
  // Built paper pages must place the Yes/No answer immediately under <h1>.
  for (const entry of papers) {
    const built = path.join(root, 'library/papers', entry.slug, 'index.html');
    if (!fs.existsSync(built)) {
      problems.push(`library/papers/${entry.slug}/index.html: missing built page`);
      continue;
    }
    const html = fs.readFileSync(built, 'utf8');
    const lead = html.match(/<h1>[\s\S]*?<\/h1>\s*([\s\S]{0,500})/);
    const after = lead?.[1] || '';
    if (!/class="answer"[\s\S]*?Short answer:\s*(YES|NO|Yes|No)\b/i.test(after)) {
      problems.push(
        `library/papers/${entry.slug}/index.html: Short answer Yes/No must sit immediately under the title`,
      );
    }
  }
  return { name: 'library papers are yes/no questions with Yes/No short answers', problems };
}
