/**
 * Fractal Goldilocks Channel (FGC) · executive news brief grammar.
 *
 * Public chrome is Yes/No title + Short answer + flowing prose.
 * No README-style ALL-CAPS hierarchy banners (EXECUTIVE BRIEF / KEY INSIGHTS).
 *
 * Content fragments declare sections with data-brief="<id>".
 * Signal blocks use data-signal="fact|experimental|interpretation|hypothesis|speculation".
 * Do not invent empirical claims when assembling fallbacks — only reuse manifest + fragment text.
 */

export const FGC_NAME = 'Fractal Goldilocks Channel';
export const FGC_SHORT = 'FGC';

/**
 * Soft on-page anchors (wire-service labels — not README ALL-CAPS banners).
 * Order matches built section ids used by gates and tests.
 */
export const BRIEF_HIERARCHY = Object.freeze([
  'Lead',
  'Context',
  'Evidence',
  'Why it matters',
  'Next steps',
  'Related stories',
  'Papers',
]);

/** Body sections authors fill in content/blog/<slug>.html */
export const BRIEF_SECTIONS = Object.freeze([
  {
    id: 'birds-eye',
    hierarchy: 'Lead',
    title: 'Lead',
    required: true,
  },
  {
    id: 'synthesis',
    hierarchy: 'Context',
    title: 'Context',
    required: true,
  },
  {
    id: 'insights',
    hierarchy: 'Evidence',
    title: 'Evidence',
    required: true,
  },
  {
    id: 'implications',
    hierarchy: 'Why it matters',
    title: 'Why it matters',
    required: true,
  },
  {
    id: 'orientation',
    hierarchy: 'Next steps',
    title: 'Next steps',
    required: true,
  },
]);

export const SIGNAL_KINDS = Object.freeze([
  {
    id: 'fact',
    label: 'Fact',
    blurb: 'Established public or documented fact; not a FractiSI lab board.',
  },
  {
    id: 'experimental',
    label: 'Experimental evidence',
    blurb: 'Measured lab or wet-lab evidence under matched conditions.',
  },
  {
    id: 'interpretation',
    label: 'Interpretation',
    blurb: 'Reading of evidence; Fractal Holographic Goldilocks framing when labeled as such.',
  },
  {
    id: 'hypothesis',
    label: 'Hypothesis',
    blurb: 'Testable claim that could lose under a kill board.',
  },
  {
    id: 'speculation',
    label: 'Speculation',
    blurb: 'Forward-looking or pattern-level conjecture; not evidence.',
  },
]);

export const CORE_ORIENTATION =
  'Read the story → follow the rhyme → open the paper → use synthesis to navigate next.';

const SIGNAL_BY_ID = Object.fromEntries(SIGNAL_KINDS.map((s) => [s.id, s]));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Extract honesty block (p.honesty or h2 Honesty…) from fragment HTML.
 * @param {string} html
 * @returns {{ honesty: string, rest: string }}
 */
export function extractHonesty(html) {
  let rest = String(html || '');
  let honesty = '';
  const pMatch = rest.match(/<p\s+class="honesty"[^>]*>[\s\S]*?<\/p>\s*/i);
  if (pMatch) {
    honesty = pMatch[0].trim();
    rest = rest.replace(pMatch[0], '');
  }
  const h2Match = rest.match(/<h2[^>]*>\s*Honesty\b[\s\S]*?(?=<h2\b|$)/i);
  if (h2Match) {
    const block = h2Match[0].trim();
    const inner = block.replace(/^<h2[^>]*>[\s\S]*?<\/h2>\s*/i, '');
    honesty = honesty || `<p class="honesty">${inner.replace(/^<p>|<\/p>$/gi, '').trim()}</p>`;
    // Prefer keeping a clean honesty paragraph; drop the h2 section from rest.
    rest = rest.replace(h2Match[0], '');
  }
  return { honesty, rest };
}

/**
 * Parse data-brief sections from a content fragment.
 * @param {string} html
 * @returns {{ sections: Record<string, string>, remainder: string, structured: boolean }}
 */
export function parseBriefSections(html) {
  const sections = {};
  let remainder = String(html || '');
  let structured = false;
  for (const { id } of BRIEF_SECTIONS) {
    const re = new RegExp(
      `<section\\b[^>]*\\bdata-brief=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`,
      'i',
    );
    const m = remainder.match(re);
    if (m) {
      structured = true;
      sections[id] = m[1].trim();
      remainder = remainder.replace(m[0], '');
    }
  }
  remainder = remainder.replace(/^\s+|\s+$/g, '');
  return { sections, remainder, structured };
}

/**
 * Rewrite data-signal blocks into labeled callouts.
 * @param {string} html
 */
export function decorateSignalBlocks(html) {
  return String(html || '').replace(
    /<div\b([^>]*\bdata-signal=["']([a-z]+)["'][^>]*)>([\s\S]*?)<\/div>/gi,
    (_, attrs, kind, inner) => {
      const meta = SIGNAL_BY_ID[kind.toLowerCase()];
      if (!meta) {
        return `<div${attrs}>${inner}</div>`;
      }
      let cleaned = String(attrs)
        .replace(/\s*\bdata-signal=["'][^"']*["']/gi, '')
        .replace(/\s*\bclass=["']([^"']*)["']/i, (_, c) => {
          const parts = new Set(`${c} brief-signal`.trim().split(/\s+/).filter(Boolean));
          return ` class="${[...parts].join(' ')}"`;
        });
      if (!/\bclass=/.test(cleaned)) cleaned += ' class="brief-signal"';
      return `<div${cleaned} data-signal="${meta.id}">
  <p class="brief-signal-label"><span class="brief-signal-kind">${esc(meta.label)}</span><span class="brief-signal-blurb">${esc(meta.blurb)}</span></p>
  <div class="brief-signal-body">${inner.trim()}</div>
</div>`;
    },
  );
}

/**
 * Default bird's-eye prose from manifest when the fragment omits the section.
 * Uses only answerBody / dek — no new empirical claims.
 * @param {{ answerBody?: string, dek?: string, title?: string }} entry
 */
export function fallbackBirdsEye(entry) {
  const body = String(entry.answerBody || '').trim();
  const dek = String(entry.dek || '').replace(/^(YES|NO)\s*[—–-]\s*/i, '').trim();
  const lead = body || dek;
  if (lead) {
    return `<p>${esc(lead)}</p><p>That is the takeaway from this Fractal Goldilocks Channel (FGC) news story. Lab figures cited here were measured under locked conditions — useful for organization and representation decisions, not an upgrade into settled physics or production SLAs.</p>`;
  }
  return `<p>${esc(entry.title || 'This development')} asks whether shared organizational structure travels across domains under locked FractiSI lab conditions. Read the Short answer as the gate; open the paper for methods and honesty rails.</p>`;
}

/**
 * Default synthesis paragraph — framing only, not new measurements.
 * Prefer authoring a topic-specific synthesis in the fragment; this is a last resort.
 */
export function fallbackSynthesis(entry) {
  const label = entry.label ? esc(entry.label) : 'this research thread';
  return `<p><strong>${label}</strong> fits the Fractal Holographic Goldilocks reading only as organizational structure under matched criteria — the same class of question that shows up in multi-agent coordination, wet-lab wiring, sky panels, and genome boards. Rhyme means reusable structure, not identity of substrates.</p>
<p><strong>Interpretation (Fractal Holographic Goldilocks):</strong> treat locked lab measurements as evidence about how information is organized, then keep measurement, hypothesis, and speculation in separate lanes from settled fact.</p>`;
}

/**
 * Wrap unstructured remainder as experimental / interpretive insight blocks.
 * @param {string} remainderHtml
 */
export function fallbackInsights(remainderHtml) {
  const cleaned = String(remainderHtml || '').trim();
  if (!cleaned) {
    return `<div data-signal="interpretation"><p>See the supporting paper for the full evidence table. This story keeps measured results and Fractal Holographic Goldilocks interpretation on separate rails.</p></div>`;
  }
  return `<div data-signal="experimental">${cleaned}</div>
<div data-signal="interpretation"><p><strong>Fractal Holographic Goldilocks interpretation:</strong> treat the blocks above as organizational evidence under locked conditions. Do not promote them into unfinished physics, clinical, or production claims.</p></div>`;
}

export function fallbackImplications() {
  return `<p><strong>Technology and systems.</strong> How you organize shared context often moves the needle more than swapping a single model scoreboard.</p>
<p><strong>Organizations.</strong> Architecture — roles, boundaries, shared maps — is the lever that keeps capable agents useful without suppressing them. Personality swaps rarely fix a brittle world model.</p>
<p><strong>Society and human life.</strong> Clear labels on what is measured versus what is interpretation cut the cost of trusting research claims when budgets, jobs, and public trust already feel tight.</p>
<p><strong>AI.</strong> FGC stories orient; papers carry depth. Downstream agents and human readers both need that split.</p>`;
}

/**
 * @param {{ actions?: { href: string, text: string }[] }} entry
 */
export function fallbackOrientation(entry) {
  const actions = entry.actions || [];
  const parts = [
    '<p>Treat the Short answer as the gate, then open the paper for methods and honesty rails. Ask whether your stack organizes relationships in a shared world, or only streams private copies.</p>',
    '<p>Prefer matched budgets and seed-locked lab measurements over marketing scoreboards. Favor architectures that cut redundancy without cutting accuracy under the same budget.</p>',
  ];
  if (actions.length) {
    const links = actions
      .map((a) => `<a href="${esc(a.href)}">${esc(a.text)}</a>`)
      .join(' · ');
    parts.push(`<p>${links}</p>`);
  } else {
    parts.push(
      '<p>Read the related FGC stories, then open the supporting paper before changing a production path.</p>',
    );
  }
  return parts.join('\n');
}

/**
 * Ensure every required section exists; fill gaps without inventing measurements.
 * @param {string} fragmentHtml
 * @param {object} entry
 */
export function resolveBriefContent(fragmentHtml, entry) {
  const { honesty, rest } = extractHonesty(fragmentHtml);
  const parsed = parseBriefSections(rest);
  const sections = { ...parsed.sections };

  if (!sections['birds-eye']) sections['birds-eye'] = fallbackBirdsEye(entry);
  if (!sections.synthesis) sections.synthesis = fallbackSynthesis(entry);
  if (!sections.insights) {
    sections.insights = fallbackInsights(parsed.remainder);
  } else if (parsed.remainder && !parsed.structured) {
    // Unstructured leftovers after partial markers — append under experimental.
    sections.insights += `\n<div data-signal="experimental">${parsed.remainder}</div>`;
  }
  if (!sections.implications) sections.implications = fallbackImplications();
  if (!sections.orientation) sections.orientation = fallbackOrientation(entry);

  return { sections, honesty, structured: parsed.structured };
}

/**
 * Soft on-page jump links (sentence case — no README ALL-CAPS banners).
 */
export function briefRailHtml() {
  const items = BRIEF_HIERARCHY.map((label, i) => {
    const id = [
      'executive-brief',
      'birds-eye-synthesis',
      'key-insights',
      'implications',
      'what-to-watch-do',
      'related-rhymes',
      'supporting-papers',
    ][i];
    return `<a class="brief-rail-item" href="#${id}">${esc(label)}</a>`;
  }).join('\n        ');
  return `<nav class="brief-rail" aria-label="On this page">
        ${items}
      </nav>`;
}

/**
 * Signal legend shown once per brief.
 */
export function signalLegendHtml() {
  const rows = SIGNAL_KINDS.map(
    (s) =>
      `<li data-signal="${s.id}"><span class="brief-signal-kind">${esc(s.label)}</span><span class="brief-signal-blurb">${esc(s.blurb)}</span></li>`,
  ).join('\n          ');
  return `<aside class="brief-signal-legend" aria-label="How claims are labeled">
        <p class="brief-legend-intro">How claims are labeled</p>
        <ul>
          ${rows}
        </ul>
      </aside>`;
}

/**
 * Assemble prose sections into wire-service brief body HTML.
 * No README hierarchy kickers; section ids stay for anchors and gates.
 * @param {Record<string, string>} sections
 * @param {string} honestyHtml
 */
export function renderBriefBody(sections, honestyHtml = '') {
  const birdsInner = `
        <div class="brief-block" id="birds-eye">
          ${decorateSignalBlocks(sections['birds-eye'])}
        </div>
        <div class="brief-block" id="fgh-synthesis">
          ${decorateSignalBlocks(sections.synthesis)}
        </div>`;

  const insightsInner = `
        ${signalLegendHtml()}
        <div class="brief-block" id="signal-noise">
          ${decorateSignalBlocks(sections.insights)}
        </div>`;

  const implicationsInner = `
        <div class="brief-block" id="why-it-matters">
          ${decorateSignalBlocks(sections.implications)}
        </div>`;

  const orientationInner = `
        <div class="brief-block" id="practical-orientation">
          <p class="brief-core-path">${esc(CORE_ORIENTATION)}</p>
          ${decorateSignalBlocks(sections.orientation)}
        </div>`;

  const honesty = honestyHtml
    ? `\n      <div class="brief-honesty">\n${honestyHtml}\n      </div>`
    : '';

  return `<div class="brief-body prose brief-wire">
      <section class="brief-section" id="birds-eye-synthesis" aria-label="Lead and context">
        ${birdsInner}
      </section>
      <section class="brief-section" id="key-insights" aria-label="Evidence">
        ${insightsInner}
      </section>
      <section class="brief-section" id="implications" aria-label="Why it matters">
        ${implicationsInner}
      </section>
      <section class="brief-section" id="what-to-watch-do" aria-label="Next steps">
        ${orientationInner}
      </section>${honesty}
    </div>`;
}

/**
 * Related stories + papers footer blocks (wire closers — no README kickers).
 * @param {{ relatedRhymes: {href:string,kind:string,title:string}[], papers: {href:string,kind:string,title:string}[] }} opts
 */
export function renderBriefClosers({ relatedRhymes = [], papers = [] }) {
  const rhymeCards = relatedRhymes
    .map(
      (r) =>
        `<a class="related-card" href="${esc(r.href)}"><span class="related-kind">${esc(r.kind)}</span><span class="related-title">${esc(r.title)}</span></a>`,
    )
    .join('\n          ');
  const paperCards = papers
    .map(
      (r) =>
        `<a class="related-card" href="${esc(r.href)}"><span class="related-kind">${esc(r.kind)}</span><span class="related-title">${esc(r.title)}</span></a>`,
    )
    .join('\n          ');

  return `<section class="brief-section related" id="related-rhymes" aria-label="Related stories">
      <h2>Related stories</h2>
      <p class="brief-closer-dek">More FGC stories. Follow the rhyme before diving into methods.</p>
      <div class="related-grid">
          ${rhymeCards || '<p class="brief-empty">No peer briefs linked yet.</p>'}
      </div>
    </section>
    <section class="brief-section related" id="supporting-papers" aria-label="Papers">
      <h2>Papers</h2>
      <p class="brief-closer-dek">The story is the news. The paper carries methods, receipts, and honesty rails.</p>
      <div class="related-grid">
          ${paperCards || '<p class="brief-empty">Open the Library for the full paper set.</p>'}
      </div>
    </section>`;
}

/**
 * Lightweight structural check for a built brief page.
 * @param {string} html
 */
export function builtBriefLooksComplete(html) {
  const missing = [];
  for (const id of [
    'executive-brief',
    'birds-eye-synthesis',
    'key-insights',
    'implications',
    'what-to-watch-do',
    'related-rhymes',
    'supporting-papers',
  ]) {
    if (!html.includes(`id="${id}"`)) missing.push(id);
  }
  if (!/class="answer"[\s\S]*?Short answer:\s*(YES|NO|Yes|No)\b/i.test(html)) {
    missing.push('short-answer');
  }
  return { ok: missing.length === 0, missing };
}
