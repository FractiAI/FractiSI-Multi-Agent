/**
 * Library papers and blog posts must be titled as yes/no questions and open
 * with a Yes/No short answer immediately under the title.
 *
 * Exception: the voice-locked symposium blog title
 * (`The Multi-Agent World Inference Rhyme?`) stays as locked — it already ends
 * in `?` and must keep Short answer: No under the h1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

const YES_NO_STARTERS =
  /^(Can|Could|Do|Does|Did|Is|Are|Was|Were|Will|Would|Should|May|Might|Has|Have|Had|If|When|After|Given)\b/i;

const SHORT_ANSWER = /\*\*Short answer:\s*(YES|NO|Yes|No)\b/i;
const SHORT_ANSWER_HTML = /<strong>\s*Short answer:\s*(YES|NO|Yes|No)\b/i;
const ANSWER_HEAD = /^Short answer:\s*(YES|NO|Yes|No)\b/i;

/** Mirrors Test Drive voice-lock hero — do not import testdrive (same layer). */
const VOICE_LOCKED_BLOG_SLUG = 'aai-symposium-2026';
const VOICE_LOCKED_BLOG_TITLE = 'The Multi-Agent World Inference Rhyme?';

/** @param {string} title */
export function isYesNoQuestionTitle(title) {
  const t = String(title || '').trim();
  if (!t.endsWith('?')) return false;
  if (t === VOICE_LOCKED_BLOG_TITLE) return true;
  return YES_NO_STARTERS.test(t);
}

/** @param {string} text */
export function hasYesNoShortAnswer(text) {
  return SHORT_ANSWER.test(text) || SHORT_ANSWER_HTML.test(text);
}

function builtLeadHasAnswer(html) {
  const lead = html.match(/<h1>[\s\S]*?<\/h1>\s*([\s\S]{0,500})/);
  const after = lead?.[1] || '';
  return /class="answer"[\s\S]*?Short answer:\s*(YES|NO|Yes|No)\b/i.test(after);
}

/** @param {string} [root] */
export function checkYesNoPapers(root = REPO_ROOT) {
  const problems = [];
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/manifest.json'), 'utf8'));
  const papers = manifest.papers || [];
  const blogs = manifest.blog || [];

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
    const h1 = text.match(/^#\s+(.+)$/m);
    if (h1 && !isYesNoQuestionTitle(h1[1].trim())) {
      problems.push(`${path.relative(root, src)}: H1 must be a yes/no question ending in ?`);
    }
    const built = path.join(root, 'library/papers', entry.slug, 'index.html');
    if (!fs.existsSync(built)) {
      problems.push(`library/papers/${entry.slug}/index.html: missing built page`);
    } else if (!builtLeadHasAnswer(fs.readFileSync(built, 'utf8'))) {
      problems.push(
        `library/papers/${entry.slug}/index.html: Short answer Yes/No must sit immediately under the title`,
      );
    }
  }

  for (const entry of blogs) {
    if (entry.slug === VOICE_LOCKED_BLOG_SLUG) {
      if (entry.title !== VOICE_LOCKED_BLOG_TITLE) {
        problems.push(
          `content/manifest.json blog[${entry.slug}]: title must stay voice-locked as "${VOICE_LOCKED_BLOG_TITLE}"`,
        );
      }
    } else if (!isYesNoQuestionTitle(entry.title)) {
      problems.push(`content/manifest.json blog[${entry.slug}]: title must be a yes/no question ending in ?`);
    }
    if (!entry.answerHead || !ANSWER_HEAD.test(entry.answerHead)) {
      problems.push(`content/manifest.json blog[${entry.slug}]: answerHead must start with Short answer: Yes/No`);
    }
    if (entry.dek && !/^(YES|NO)\b/.test(entry.dek)) {
      problems.push(`content/manifest.json blog[${entry.slug}]: dek must begin with YES or NO`);
    }
    const built = path.join(root, 'blog', entry.slug, 'index.html');
    if (!fs.existsSync(built)) {
      problems.push(`blog/${entry.slug}/index.html: missing built page`);
    } else if (!builtLeadHasAnswer(fs.readFileSync(built, 'utf8'))) {
      problems.push(`blog/${entry.slug}/index.html: Short answer Yes/No must sit immediately under the title`);
    }
  }

  return { name: 'library papers and blogs are yes/no questions with Yes/No short answers', problems };
}
