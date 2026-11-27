#!/usr/bin/env node
/**
 * Builds the FractiSI public surfaces from content/.
 *
 *   content/manifest.json        index of blog posts and papers
 *   content/blog/<slug>.html     blog body fragments
 *   content/papers/<slug>.md     paper sources (rendered with marked)
 *   content/papers/<slug>.html   paper body fragments (no markdown source)
 *
 * Writes blog/<slug>/, library/papers/<slug>/, blog/index.html, library/index.html,
 * then applies the shared header, footer, and stylesheet link to every page.
 *
 *   node scripts/build-site.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { newsroomTickerHtml } from '../src/newsroom/ticker.mjs';
import { recentNewsroomItems } from '../src/newsroom/headlines.mjs';
import {
  briefRailHtml,
  dashboardOrientationHtml,
  renderBriefBody,
  renderBriefClosers,
  resolveBriefContent,
  FGC_NAME,
  CORE_ORIENTATION,
} from '../src/newsroom/executive-brief.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_VERSION = '55';
const SITE = 'https://fractisi.vercel.app';

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => {
  mkdirSync(dirname(join(ROOT, p)), { recursive: true });
  writeFileSync(join(ROOT, p), s);
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const slugify = (s) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${MONTHS[+m - 1]} ${+d}, ${y}`;
};
const shortDate = (iso) => {
  const [, m, d] = iso.split('-');
  return `${MONTHS[+m - 1].slice(0, 3)} ${+d}`;
};
const words = (html) => strip(html).split(/\s+/).filter(Boolean).length;

const manifest = JSON.parse(read('content/manifest.json'));

/* ——— Shared chrome ——— */

const NAV = [
  ['/product/', 'Product'],
  ['/product/pricing/', 'Pricing'],
  ['/research/', 'Research'],
  ['/library/', 'Library'],
  ['/blog/', 'FGC'],
  ['/company/', 'Company'],
];

const TICKER = newsroomTickerHtml(manifest);

function sectionOf(path) {
  if (path.startsWith('/product/pricing')) return '/product/pricing/';
  if (path.startsWith('/product')) return '/product/';
  if (path.startsWith('/blog') || path.startsWith('/newsroom')) return '/blog/';
  const hit = NAV.find(([href]) => href !== '/' && path.startsWith(href) && href !== '/product/');
  return hit ? hit[0] : null;
}

function headerHtml(path) {
  const current = sectionOf(path);
  const links = NAV.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  return `<header class="nav">
    <a class="wordmark" href="/">FractiSI</a>
    <nav class="nav-links" aria-label="Primary">
      ${links}
      <a class="button" href="/test-drive/">Start Test Drive</a>
    </nav>
  </header>`;
}

const FOOTER = `<footer class="site-footer">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="wordmark" href="/">FractiSI</a>
        <p>The Fractal Holographic Goldilocks Rhyming World Model for digital and human agents.</p>
      </div>
      <nav aria-label="Product">
        <h2>Product</h2>
        <a href="/product/">Overview</a>
        <a href="/product/pricing/">Pricing</a>
        <a href="/test-drive/">Test Drive</a>
        <a href="/open/">Open source</a>
      </nav>
      <nav aria-label="Research">
        <h2>Research</h2>
        <a href="/research/">Overview</a>
        <a href="/library/">Library</a>
        <a href="/blog/">FGC</a>
        <a href="/rhyming-vs-non-rhyming/">Rhyming vs non-rhyming</a>
      </nav>
      <nav aria-label="Company">
        <h2>Company</h2>
        <a href="/company/">About</a>
        <a href="/recruit/">Founding CEO role</a>
        <a href="https://github.com/FractiAI/FractiSI-Multi-Agent">GitHub</a>
        <a href="mailto:valetpru@gmail.com">valetpru@gmail.com</a>
      </nav>
    </div>
    <p class="foot-base">FractiSI Multi-Agent · Lab results, not production benchmarks · Open source</p>
  </footer>`;

function page({ path, title, description, ogType = 'website', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · FractiSI</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${SITE}${path}">
  <link rel="canonical" href="${SITE}${path}">
  <link rel="stylesheet" href="/css/site.css?v=${CSS_VERSION}">
</head>
<body>
  ${headerHtml(path)}

  <main class="wrap">
${body}
  </main>

  ${FOOTER}
  ${TICKER}
</body>
</html>
`;
}

/* ——— Markdown → paper ——— */

const renderer = new marked.Renderer();
renderer.heading = function heading({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const id = slugify(text);
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};
renderer.table = function table(token) {
  const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
  const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
};
marked.use({ gfm: true, breaks: false, renderer });

const DROP_H2 = /^(reader checklist|fair exchange|document close|closing line)$/i;

function parseSource(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const titleIdx = lines.findIndex((l) => /^# /.test(l));
  const title = titleIdx >= 0 ? lines[titleIdx].replace(/^# /, '').trim() : '';
  const firstH2 = lines.findIndex((l, i) => i > titleIdx && /^## /.test(l));
  const head = lines.slice(titleIdx + 1, firstH2 < 0 ? lines.length : firstH2);
  const meta = {};
  const shortAnswerLines = [];
  for (const l of head) {
    if (/\*\*Short answer:\s*(YES|NO|Yes|No)\b/i.test(l) || /^Short answer:\s*(YES|NO|Yes|No)\b/i.test(l)) {
      shortAnswerLines.push(l);
      continue;
    }
    let m = l.match(/^\*\*([^*:]+):\*\*\s*(.+?)\s*$/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].replace(/`/g, '').trim();
    m = l.match(/^\|\s*\*\*([^*|]+)\*\*\s*\|\s*(.+?)\s*\|\s*$/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();
  }
  const headText = head.join(' ');
  const dateMatch = headText.match(/(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})/);
  if (!meta.date && dateMatch) meta.date = dateMatch[0];
  let body = lines.slice(firstH2 < 0 ? lines.length : firstH2).join('\n');

  const sections = body.split(/^(?=## )/m);
  body = sections
    .filter((s) => {
      const h = s.match(/^## (.+)$/m);
      return !(h && DROP_H2.test(h[1].replace(/[*`]/g, '').trim()));
    })
    .join('');
  body = body
    .replace(/^→ ∞\^∞\s*$/gm, '')
    .replace(/^.*intentionally long-form so QUESTFEST.*$/gm, '')
    .replace(/^### (?:What “full paper” means here|Seed and environment|Interpretation discipline)\s*\n[\s\S]*?(?=^#{2,3} )/gm, '')
    .replace(/^---\s*$/gm, '');
  const shortAnswer = shortAnswerLines.join('\n').trim();
  return { title, meta, body, shortAnswer };
}

function publicWording(html) {
  return html
    .split(/(<code>[\s\S]*?<\/code>|<pre>[\s\S]*?<\/pre>)/)
    .map((part, i) => (i % 2 ? part : part
      .replace(/Soft Story\s*\/\s*/g, '')
      .replace(/Soft Story\b/g, 'computational')
      .replace(/ENGINE_SHELF/g, 'engine shelf')))
    .join('');
}

function wrapHonesty(html) {
  return html.replace(/(<h2 id="honesty-boundary">[\s\S]*?)(?=<h2 id=|$)/, '<section class="callout" aria-label="Honesty boundary">$1</section>\n');
}

function firstParagraphAfter(html, headingId) {
  const re = new RegExp(`<h2 id="${headingId}">[\\s\\S]*?<p>([\\s\\S]*?)</p>`);
  const m = html.match(re);
  return m ? strip(m[1]) : '';
}

function trimDek(text, max = 280) {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text];
  let out = '';
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break;
    out += sentence;
    if (out.trim().length >= 150) break;
  }
  if (out.trim().length >= 60) return out.trim();
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function tidyClass(meta) {
  const raw = (meta.classification || meta['engine role'] || '').toLowerCase();
  if (/engine_shelf #|engine shelf #/.test(raw) || /engine pin/.test(raw)) return 'Engine paper';
  if (/application companion/.test(raw)) return 'Application companion';
  if (/methodology/.test(raw)) return 'Methodology';
  return 'Research paper';
}

const DOC_PEER = {
  blog: (slug) => `/library/papers/${slug}/`,
  paper: (slug) => `/blog/${slug}/`,
};

function shortAnswerToHtml(mdLine) {
  if (!mdLine) return '';
  const html = publicWording(marked.parse(mdLine)).trim();
  return html.replace(/^<p>/, '<p class="answer">');
}

function extractHtmlShortAnswer(html) {
  const m = html.match(
    /<p>\s*<strong>\s*Short answer:\s*(YES|NO|Yes|No)[\s\S]*?<\/strong>[\s\S]*?<\/p>/i,
  );
  if (!m) return { answerHtml: '', bodyHtml: html };
  const answerHtml = m[0].replace(/^<p>/i, '<p class="answer">');
  const bodyHtml = html.replace(m[0], '').replace(/^\s+/, '');
  return { answerHtml, bodyHtml };
}

function paperHtmlFromSource(entry) {
  const mdPath = `content/papers/${entry.slug}.md`;
  const htmlPath = `content/papers/${entry.slug}.html`;
  if (existsSync(join(ROOT, mdPath))) {
    const { title, meta, body, shortAnswer } = parseSource(read(mdPath));
    let html = publicWording(marked.parse(body));
    html = wrapHonesty(html);
    const answerHtml = shortAnswerToHtml(shortAnswer);
    const abstract = firstParagraphAfter(html, 'abstract');
    const plainAnswer = shortAnswer
      ? shortAnswer.replace(/^\*\*Short answer:\s*/i, '').replace(/\*\*$/, '').trim()
      : '';
    return {
      title: entry.title || title,
      meta,
      html,
      answerHtml,
      dek: entry.dek || plainAnswer || trimDek(abstract || entry.summary || ''),
    };
  }
  let html = read(htmlPath).replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`);
  html = wrapHonesty(publicWording(html));
  const pulled = extractHtmlShortAnswer(html);
  return {
    title: entry.title,
    meta: {},
    html: pulled.bodyHtml,
    answerHtml: pulled.answerHtml,
    dek: entry.dek || trimDek(entry.summary || ''),
  };
}

function tocHtml(html) {
  const items = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => `<a href="#${m[1]}">${strip(m[2])}</a>`);
  if (items.length < 3) return '';
  return `<nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p>${items.join('')}</nav>`;
}

function relatedCards(items) {
  if (!items.length) return '';
  return `<section class="related" aria-label="Related">
      <h2>Continue reading</h2>
      <div class="related-grid">
        ${items.map((i) => `<a class="related-card" href="${i.href}"><span class="related-kind">${esc(i.kind)}</span><span class="related-title">${esc(i.title)}</span></a>`).join('\n        ')}
      </div>
    </section>`;
}

const paperBySlug = Object.fromEntries(manifest.papers.map((p) => [p.slug, p]));
const blogBySlug = Object.fromEntries(manifest.blog.map((b) => [b.slug, b]));

function neighbors(kind, slug, group) {
  const pool = (kind === 'paper' ? manifest.papers : manifest.blog)
    .filter((x) => x.slug !== slug && (kind === 'paper' ? x.group === group : true))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 2);
  return pool.map((x) => ({
    href: kind === 'paper' ? `/library/papers/${x.slug}/` : `/blog/${x.slug}/`,
    kind: kind === 'paper' ? 'Paper' : 'FGC brief',
    title: x.title,
  }));
}

function buildPaper(entry) {
  const { title, meta, html, dek, answerHtml } = paperHtmlFromSource(entry);
  const date = entry.date || null;
  const docId = meta['document id'] || entry.docId || '';
  const type = tidyClass(meta);
  const peerBlog = blogBySlug[entry.slug];
  const standaloneRaw = meta.standalone || '';
  const standaloneHref =
    standaloneRaw.match(/\((https:\/\/github\.com\/[^)\s]+)\)/)?.[1] ||
    (standaloneRaw.match(/FractiAI\/[A-Za-z0-9._-]+/)
      ? `https://github.com/${standaloneRaw.match(/FractiAI\/[A-Za-z0-9._-]+/)[0]}`
      : '');
  const standaloneLabel =
    standaloneRaw.match(/FractiAI\/[A-Za-z0-9._-]+/)?.[0] || standaloneRaw.replace(/[\[\]()`]/g, '').trim();
  const metaRows = [
    date ? ['Published', fmtDate(date)] : null,
    ['Type', type],
    docId ? ['Document ID', `<code>${esc(docId)}</code>`] : null,
    standaloneHref
      ? ['Standalone', `<a href="${esc(standaloneHref)}"><code>${esc(standaloneLabel)}</code></a>`]
      : null,
    ['Reading time', `${Math.max(1, Math.round(words(`${answerHtml || ''}${html}`) / 220))} min`],
  ].filter(Boolean);
  const actions = [
    peerBlog ? `<a class="btn-primary" href="/blog/${entry.slug}/">Read the FGC brief</a>` : '',
    `<a class="btn-ghost" href="/library/">All papers</a>`,
  ].join('\n          ');
  const related = [];
  if (peerBlog) related.push({ href: `/blog/${entry.slug}/`, kind: 'FGC brief', title: peerBlog.title });
  related.push(...neighbors('paper', entry.slug, entry.group).slice(0, peerBlog ? 2 : 3));
  if (!answerHtml) {
    throw new Error(`paper ${entry.slug}: missing Yes/No short answer lead under title`);
  }
  // Yes/No short answer must sit directly under the title — never an abstract dek first.
  const body = `    <div class="doc-layout">
      <article class="doc doc-paper">
        <header class="doc-head">
          <p class="kicker">Paper · ${esc(entry.group)}</p>
          <h1>${esc(title)}</h1>
          ${answerHtml}
          <dl class="doc-meta">
            ${metaRows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n            ')}
          </dl>
          <div class="doc-actions">
          ${actions}
          </div>
        </header>
        <div class="prose">
${html}
        </div>
        ${relatedCards(related)}
      </article>
      ${tocHtml(html)}
    </div>`;
  write(
    `library/papers/${entry.slug}/index.html`,
    page({ path: `/library/papers/${entry.slug}/`, title, description: dek || title, ogType: 'article', body }),
  );
}

function buildBlog(entry) {
  if (!entry.answerHead || !/^Short answer:\s*(YES|NO|Yes|No)\b/i.test(entry.answerHead)) {
    throw new Error(`blog ${entry.slug}: answerHead must start with Short answer: Yes/No`);
  }
  const raw = read(`content/blog/${entry.slug}.html`);
  // Strip duplicate Short answer blocks from source HTML — header owns the lead.
  const stripped = raw
    .replace(/<section[^>]*aria-label="Short answer"[^>]*>[\s\S]*?<\/section>\s*/gi, '')
    .replace(/<p class="answer">[\s\S]*?<\/p>\s*/gi, '');
  const prepared = publicWording(stripped).replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`);
  const { sections, honesty } = resolveBriefContent(prepared, entry);
  const briefBody = renderBriefBody(sections, honesty);
  const answerHtml = `<p class="answer"><strong>${esc(entry.answerHead)}</strong>${esc(entry.answerBody || '')}</p>`;
  const peerPaper = paperBySlug[entry.slug];
  const actions = (entry.actions || []).slice(0, 3).map((a, i) =>
    `<a class="${i === 0 ? 'btn-primary' : 'btn-ghost'}" href="${a.href}">${esc(a.text)}</a>`).join('\n          ');
  const relatedRhymes = neighbors('blog', entry.slug).slice(0, 3);
  const papers = [];
  if (peerPaper) {
    papers.push({ href: `/library/papers/${entry.slug}/`, kind: 'Supporting paper', title: peerPaper.title });
  }
  for (const a of entry.actions || []) {
    if (/\/library\/papers\//.test(a.href) && !papers.some((p) => p.href === a.href)) {
      papers.push({ href: a.href, kind: 'Supporting paper', title: a.text });
    }
  }
  if (!papers.length) {
    papers.push({ href: '/library/', kind: 'Library', title: 'All FractiSI papers' });
  }
  const doc = `    <article class="doc doc-blog doc-brief">
      <header class="doc-head brief-head" id="executive-brief">
        <p class="kicker">${FGC_NAME}${entry.label ? ' · ' + esc(entry.label) : ''}</p>
        <h1>${esc(entry.title)}</h1>
        ${answerHtml}
        <p class="brief-path-line">${esc(CORE_ORIENTATION)}</p>
        <dl class="doc-meta">
          <div><dt>Published</dt><dd>${fmtDate(entry.date)}</dd></div>
          <div><dt>By</dt><dd>FractiAI Research</dd></div>
          <div><dt>Reading time</dt><dd>${Math.max(1, Math.round(words(`${answerHtml}${briefBody}`) / 220))} min</dd></div>
        </dl>
        ${actions ? `<div class="doc-actions">\n          ${actions}\n        </div>` : ''}
        ${briefRailHtml()}
      </header>
${briefBody}
      ${renderBriefClosers({ relatedRhymes, papers })}
    </article>`;
  const description = trimDek(
    `${entry.answerHead}${entry.answerBody || ''}`.replace(/^Short answer:\s*/i, '') || entry.dek || entry.title,
    200,
  );
  write(
    `blog/${entry.slug}/index.html`,
    page({ path: `/blog/${entry.slug}/`, title: entry.title, description, ogType: 'article', body: doc }),
  );
}

/* ——— Indexes ——— */

const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title);

function buildBlogIndex() {
  const posts = [...manifest.blog].sort(byDateDesc);
  const live = recentNewsroomItems(manifest, { maxItems: 8 });
  const liveSlugs = new Set(live.map((i) => i.slug));

  const briefing = live
    .map(
      (i) => `        <a class="nr-brief" href="${esc(i.href)}">
          <span class="nr-brief-kicker">Active brief</span>
          <span class="nr-brief-headline">${esc(i.headline)}</span>
          <time datetime="${esc(i.date)}">${esc(shortDate(i.date))}</time>
        </a>`,
    )
    .join('\n');

  const instruments = [
    ['Yes/No gate', 'Short answer under the title'],
    ['Wire body', 'Lede, context, numbers — no README headers'],
    ['Signal rails', 'Fact · experimental · interpretation · hypothesis · speculation'],
    ['Papers', 'Brief = wire · paper = deep evidence'],
  ]
    .map(
      ([name, line]) =>
        `        <div class="nr-instrument"><span class="nr-instrument-name">${esc(name)}</span><span class="nr-instrument-line">${esc(line)}</span></div>`,
    )
    .join('\n');

  const bulletin = posts
    .map((p) => {
      const headline = live.find((i) => i.slug === p.slug)?.headline;
      const liveTag = liveSlugs.has(p.slug) ? '<span class="nr-tag">24h</span>' : '';
      const yesNo = /^(YES|NO)\b/i.test(p.dek || '') ? String(p.dek).slice(0, 3).toUpperCase() : '';
      const gate = yesNo ? `<span class="nr-gate">${esc(yesNo)}</span>` : '';
      return `        <a class="nr-bulletin-row" href="/blog/${p.slug}/">
          <time datetime="${p.date}">${shortDate(p.date)}</time>
          <span class="nr-bulletin-main">
            <span class="nr-bulletin-headline">${esc(headline || trimDek(p.dek || p.title, 140))}</span>
            <span class="nr-bulletin-title">${esc(p.title)}</span>
          </span>
          ${gate}${liveTag}
        </a>`;
    })
    .join('\n');

  const body = `    <section class="newsroom nr-dashboard">
      <header class="nr-hero">
        <p class="kicker">Fractal Goldilocks Channel · FGC · Executive intelligence</p>
        <h1>Living executive intelligence dashboard</h1>
        <p class="dek">CNBC-style wire briefs for leaders, explorers, scientists, builders, technologists, and AIs. Each note opens with a Yes/No gate, then punchy context and labeled evidence — Fractal Holographic Goldilocks synthesis without README hierarchy banners. Papers remain the authoritative deep-research layer.</p>
      </header>
      ${dashboardOrientationHtml()}
      <section class="nr-instruments" aria-label="Brief reading rails">
        <h2 class="nr-section-title">Brief reading rails</h2>
        <div class="nr-instrument-row">
${instruments}
        </div>
      </section>
      <section class="nr-live" aria-label="Active briefs">
        <h2 class="nr-section-title">Active briefs · past 24 hours</h2>
        <div class="nr-briefing">
${briefing}
        </div>
      </section>
      <section class="nr-bulletin" aria-label="Brief archive">
        <h2 class="nr-section-title">Brief archive</h2>
        <div class="nr-bulletin-list">
${bulletin}
        </div>
      </section>
    </section>`;

  const newsroomPage = {
    path: '/blog/',
    title: 'Fractal Goldilocks Channel',
    description:
      'Fractal Goldilocks Channel (FGC): executive intelligence briefs on Fractal Holographic Goldilocks research. Read the brief, follow the rhyme, open the paper.',
    body,
  };
  write('blog/index.html', page(newsroomPage));
  write('newsroom/index.html', page({ ...newsroomPage, path: '/newsroom/' }));
}

const GROUP_ORDER = ['Multi-agent research', 'Wiring wet lab', 'Product papers', 'Tiny Gateway labs', 'Architecture'];

function buildLibraryIndex() {
  const groups = {};
  for (const p of manifest.papers) (groups[p.group] ||= []).push(p);
  const names = [...GROUP_ORDER.filter((g) => groups[g]), ...Object.keys(groups).filter((g) => !GROUP_ORDER.includes(g))];
  const sections = names.map((g) => {
    const items = groups[g].sort(byDateDesc);
    const cards = items.map((p) => {
      const blog = blogBySlug[p.slug];
      return `        <article class="paper-card">
          <h3><a href="/library/papers/${p.slug}/">${esc(p.title)}</a></h3>
          <p>${esc(trimDek(p.summary || p.dek || '', 200))}</p>
          <p class="paper-card-links"><a href="/library/papers/${p.slug}/">Paper</a>${blog ? ` · <a href="/blog/${p.slug}/">FGC brief</a>` : ''}</p>
        </article>`;
    }).join('\n');
    return `      <section class="index-group">
        <h2>${esc(g)}</h2>
        <div class="paper-grid">
${cards}
        </div>
      </section>`;
  }).join('\n');
  const body = `    <section class="index-page">
      <header class="index-head">
        <p class="kicker">Library</p>
        <h1>Papers</h1>
        <p class="dek">The public papers behind FractiSI Multi-Agent. Every paper states its honesty boundary first and ships the code that regenerates its numbers.</p>
      </header>
${sections}
    </section>`;
  write('library/index.html', page({ path: '/library/', title: 'Library', description: 'Papers behind FractiSI Multi-Agent: shared-world research, wiring wet lab, Tiny Gateway labs, and architecture.', body }));
}

/* ——— Apply chrome to hand-written pages ——— */

const SKIP_DIRS = new Set(['node_modules', 'output', '.git', 'docs', 'experiments', 'workloads', 'tiny-gateway', 'tiny-footprint', 'benchmarks', 'content']);

function* walk(dir) {
  for (const name of readdirSync(join(ROOT, dir))) {
    if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
    const rel = dir ? `${dir}/${name}` : name;
    const st = statSync(join(ROOT, rel));
    if (st.isDirectory()) yield* walk(rel);
    else if (name === 'index.html') yield rel;
  }
}

function applyChrome(rel) {
  let html = read(rel);
  if (!/<header class="nav">/.test(html)) return false;
  const path = '/' + rel.replace(/index\.html$/, '');
  const before = html;
  html = html.replace(/<header class="nav">[\s\S]*?<\/header>/, headerHtml(path));
  if (/<footer class="site-footer">/.test(html)) html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, FOOTER);
  else html = html.replace(/<\/body>/, `  ${FOOTER}\n</body>`);
  html = html.replace(/href="(?:\.\.\/)*\/?css\/site\.css\?v=\d+"/, `href="/css/site.css?v=${CSS_VERSION}"`);
  if (TICKER) {
    if (/<aside class="news-ticker"/.test(html)) {
      html = html.replace(/<aside class="news-ticker"[\s\S]*?<\/aside>/, TICKER.trim());
    } else {
      html = html.replace(/<\/body>/, `  ${TICKER}\n</body>`);
    }
  }
  if (html !== before) write(rel, html);
  return html !== before;
}

/* ——— Run ——— */

for (const b of manifest.blog) buildBlog(b);
for (const p of manifest.papers) buildPaper(p);
buildBlogIndex();
buildLibraryIndex();

const generated = new Set([
  'blog/index.html',
  'newsroom/index.html',
  'library/index.html',
  ...manifest.blog.map((b) => `blog/${b.slug}/index.html`),
  ...manifest.papers.map((p) => `library/papers/${p.slug}/index.html`),
]);
let touched = 0;
for (const rel of walk('')) {
  if (generated.has(rel)) continue;
  if (applyChrome(rel)) touched += 1;
}
console.log(`built ${manifest.blog.length} blog posts, ${manifest.papers.length} papers; chrome applied to ${touched} pages`);
