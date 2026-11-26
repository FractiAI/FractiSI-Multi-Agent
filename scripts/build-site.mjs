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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_VERSION = '50';
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
  ['/blog/', 'Blog'],
  ['/company/', 'Company'],
];

function sectionOf(path) {
  const hit = NAV.find(([href]) => href !== '/' && path.startsWith(href) && href !== '/product/');
  if (path.startsWith('/product/pricing')) return '/product/pricing/';
  if (path.startsWith('/product')) return '/product/';
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
        <a href="/blog/">Blog</a>
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

function paperHtmlFromSource(entry) {
  const mdPath = `content/papers/${entry.slug}.md`;
  const htmlPath = `content/papers/${entry.slug}.html`;
  if (existsSync(join(ROOT, mdPath))) {
    const { title, meta, body, shortAnswer } = parseSource(read(mdPath));
    const prefixed = shortAnswer ? `${shortAnswer}\n\n${body}` : body;
    let html = publicWording(marked.parse(prefixed));
    html = wrapHonesty(html);
    const abstract = firstParagraphAfter(html, 'abstract');
    return { title: entry.title || title, meta, html, dek: entry.dek || trimDek(abstract || entry.summary || '') };
  }
  const html = read(htmlPath).replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`);
  return { title: entry.title, meta: {}, html: wrapHonesty(publicWording(html)), dek: entry.dek || trimDek(entry.summary || '') };
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
    kind: kind === 'paper' ? 'Paper' : 'Blog',
    title: x.title,
  }));
}

function buildPaper(entry) {
  const { title, meta, html, dek } = paperHtmlFromSource(entry);
  const date = entry.date || null;
  const docId = meta['document id'] || entry.docId || '';
  const type = tidyClass(meta);
  const peerBlog = blogBySlug[entry.slug];
  const metaRows = [
    date ? ['Published', fmtDate(date)] : null,
    ['Type', type],
    docId ? ['Document ID', `<code>${esc(docId)}</code>`] : null,
    ['Reading time', `${Math.max(1, Math.round(words(html) / 220))} min`],
  ].filter(Boolean);
  const actions = [
    peerBlog ? `<a class="btn-primary" href="/blog/${entry.slug}/">Read the blog post</a>` : '',
    `<a class="btn-ghost" href="/library/">All papers</a>`,
  ].join('\n          ');
  const related = [];
  if (peerBlog) related.push({ href: `/blog/${entry.slug}/`, kind: 'Blog', title: peerBlog.title });
  related.push(...neighbors('paper', entry.slug, entry.group).slice(0, peerBlog ? 2 : 3));
  const body = `    <div class="doc-layout">
      <article class="doc doc-paper">
        <header class="doc-head">
          <p class="kicker">Paper · ${esc(entry.group)}</p>
          <h1>${esc(title)}</h1>
          ${dek ? `<p class="dek">${esc(dek)}</p>` : ''}
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
  const raw = read(`content/blog/${entry.slug}.html`);
  const longDek = (entry.dek || '').length > 240;
  const answer = entry.answerHead ? `<p class="answer"><strong>${esc(entry.answerHead)}</strong>${esc(entry.answerBody || '')}</p>\n` : '';
  const lead = answer + (longDek ? `<p class="lead">${esc(entry.dek)}</p>\n` : '');
  const body = lead + publicWording(raw).replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`);
  const peerPaper = paperBySlug[entry.slug];
  const actions = (entry.actions || []).slice(0, 3).map((a, i) =>
    `<a class="${i === 0 ? 'btn-primary' : 'btn-ghost'}" href="${a.href}">${esc(a.text)}</a>`).join('\n          ');
  const related = [];
  if (peerPaper) related.push({ href: `/library/papers/${entry.slug}/`, kind: 'Paper', title: peerPaper.title });
  related.push(...neighbors('blog', entry.slug).slice(0, peerPaper ? 2 : 3));
  const doc = `    <article class="doc doc-blog">
      <header class="doc-head">
        <p class="kicker">Blog${entry.label ? ' · ' + esc(entry.label) : ''}</p>
        <h1>${esc(entry.title)}</h1>
        ${entry.dek && !longDek ? `<p class="dek">${esc(entry.dek)}</p>` : ''}
        <dl class="doc-meta">
          <div><dt>Published</dt><dd>${fmtDate(entry.date)}</dd></div>
          <div><dt>By</dt><dd>FractiAI Research</dd></div>
          <div><dt>Reading time</dt><dd>${Math.max(1, Math.round(words(body) / 220))} min</dd></div>
        </dl>
        ${actions ? `<div class="doc-actions">\n          ${actions}\n        </div>` : ''}
      </header>
      <div class="prose">
${body}
      </div>
      ${relatedCards(related)}
    </article>`;
  write(
    `blog/${entry.slug}/index.html`,
    page({ path: `/blog/${entry.slug}/`, title: entry.title, description: trimDek(entry.dek || entry.title, 200), ogType: 'article', body: doc }),
  );
}

/* ——— Indexes ——— */

const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title);

function buildBlogIndex() {
  const posts = [...manifest.blog].sort(byDateDesc);
  const rows = posts.map((p) => `        <a class="row" href="/blog/${p.slug}/">
          <time datetime="${p.date}">${shortDate(p.date)}</time>
          <span class="row-main">
            <span class="row-title">${esc(p.title)}</span>
            <span class="row-dek">${esc(trimDek(p.dek || '', 180))}</span>
          </span>
          <span class="row-tag">${esc(p.label || '')}</span>
        </a>`).join('\n');
  const body = `    <section class="index-page">
      <header class="index-head">
        <p class="kicker">Blog</p>
        <h1>What we are testing, in plain language</h1>
        <p class="dek">Short research notes on the experiments behind FractiSI. Each links to the full paper and to the code that regenerates the numbers.</p>
      </header>
      <div class="index-list" aria-label="Posts">
${rows}
      </div>
    </section>`;
  write('blog/index.html', page({ path: '/blog/', title: 'Blog', description: 'Research notes on the experiments behind FractiSI Multi-Agent.', body }));
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
          <p class="paper-card-links"><a href="/library/papers/${p.slug}/">Paper</a>${blog ? ` · <a href="/blog/${p.slug}/">Blog</a>` : ''}</p>
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
