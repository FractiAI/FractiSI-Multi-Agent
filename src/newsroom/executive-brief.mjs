/**
 * Fractal Goldilocks Channel (FGC) · executive intelligence brief grammar.
 *
 * Posts inherit this hierarchy from the build pipeline:
 *   EXECUTIVE BRIEF → BIRD'S-EYE SYNTHESIS → KEY INSIGHTS → IMPLICATIONS
 *   → WHAT TO WATCH/DO → RELATED RHYMES → SUPPORTING PAPERS
 *
 * Content fragments declare sections with data-brief="<id>".
 * Signal blocks use data-signal="fact|experimental|interpretation|hypothesis|speculation".
 * Do not invent empirical claims when assembling fallbacks — only reuse manifest + fragment text.
 */

export const FGC_NAME = 'Fractal Goldilocks Channel';
export const FGC_SHORT = 'FGC';

/** Canonical hierarchy labels (public chrome). */
export const BRIEF_HIERARCHY = Object.freeze([
  'EXECUTIVE BRIEF',
  "BIRD'S-EYE SYNTHESIS",
  'KEY INSIGHTS',
  'IMPLICATIONS',
  'WHAT TO WATCH/DO',
  'RELATED RHYMES',
  'SUPPORTING PAPERS',
]);

/** Body sections authors fill in content/blog/<slug>.html */
export const BRIEF_SECTIONS = Object.freeze([
  {
    id: 'birds-eye',
    hierarchy: "BIRD'S-EYE SYNTHESIS",
    title: "Bird's-eye view",
    required: true,
  },
  {
    id: 'synthesis',
    hierarchy: "BIRD'S-EYE SYNTHESIS",
    title: 'Fractal Holographic Goldilocks synthesis',
    required: true,
  },
  {
    id: 'insights',
    hierarchy: 'KEY INSIGHTS',
    title: 'Separate signal from noise',
    required: true,
  },
  {
    id: 'implications',
    hierarchy: 'IMPLICATIONS',
    title: 'Why it matters',
    required: true,
  },
  {
    id: 'orientation',
    hierarchy: 'WHAT TO WATCH/DO',
    title: 'Practical orientation',
    required: true,
  },
]);

export const SIGNAL_KINDS = Object.freeze([
  {
    id: 'fact',
    label: 'Fact',
    blurb: 'Established public or documented fact; not a FractiSI Soft Story board.',
  },
  {
    id: 'experimental',
    label: 'Experimental evidence',
    blurb: 'Measured lab / regenerable Soft Story / wet-lab receipt under a fixed seed.',
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
  'Read the brief → follow the rhyme → open the paper → use synthesis to navigate next.';

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
    return `<p>${esc(lead)}</p><p>This brief situates that finding in the larger emerging pattern of Fractal Holographic Goldilocks research — shared organizational rhymes across substrates — without upgrading Soft Story boards into settled physics.</p>`;
  }
  return `<p>${esc(entry.title || 'This development')} sits in the FractiSI research pattern of testing whether shared organizational structure travels across domains under regenerable lab conditions.</p>`;
}

/**
 * Default synthesis paragraph — framing only, not new measurements.
 */
export function fallbackSynthesis(entry) {
  const label = entry.label ? esc(entry.label) : 'this research thread';
  return `<p>Fractal Holographic Goldilocks synthesis treats <strong>${label}</strong> as one node in a nested rhyme: the same organizational questions recur in multi-agent systems, wet-lab wiring, sky panels, and genome boards. Cross-domain rhyme here means reusable structure under matched criteria — not identity of substrates.</p>
<p><strong>Interpretation (Fractal Holographic Goldilocks):</strong> read the lab receipts as evidence about organization and representation, then keep Soft Story, hypothesis, and speculation in separate lanes.</p>`;
}

/**
 * Wrap unstructured remainder as experimental / interpretive insight blocks.
 * @param {string} remainderHtml
 */
export function fallbackInsights(remainderHtml) {
  const cleaned = String(remainderHtml || '').trim();
  if (!cleaned) {
    return `<div data-signal="interpretation"><p>See the supporting paper for the full evidence table. This brief keeps Soft Story measurements and Fractal Holographic Goldilocks interpretation on separate rails.</p></div>`;
  }
  return `<div data-signal="experimental">${cleaned}</div>
<div data-signal="interpretation"><p><strong>Fractal Holographic Goldilocks interpretation:</strong> treat the blocks above as organizational evidence under regenerable conditions. Do not promote them into unfinished physics, clinical, or production claims.</p></div>`;
}

export function fallbackImplications() {
  return `<p><strong>Technology and systems.</strong> Shared worlds, wiring, and rhyme boards change how agents and instruments organize context — often more than how a single model scores in isolation.</p>
<p><strong>Organizations.</strong> Architecture beats personality swaps: the Rhyming World Model (roles, boundaries, shared maps) is the lever that keeps capable agents useful without suppressing them.</p>
<p><strong>Society and human life.</strong> Clearer signal/noise labeling reduces the cost of following research claims when rent, jobs, and trust already feel tight.</p>
<p><strong>AI.</strong> Dense briefs plus papers give downstream AIs a navigable catalog: brief for orientation, paper for regenerable depth.</p>`;
}

/**
 * @param {{ actions?: { href: string, text: string }[] }} entry
 */
export function fallbackOrientation(entry) {
  const actions = entry.actions || [];
  const lines = [
    '<ul class="brief-orientation-list">',
    '<li><strong>Understand.</strong> Keep the Short answer as the executive gate; open the paper for regenerable methods and honesty rails.</li>',
    '<li><strong>Reconsider.</strong> Ask whether your stack organizes relationships (shared world / wiring) or only streams linear tokens.</li>',
    '<li><strong>Watch.</strong> Kill boards, matched budgets, and seed-locked Soft Story receipts — not marketing scoreboards.</li>',
    '<li><strong>Prepare.</strong> Prefer architectures that cut redundancy without cutting accuracy under the same budget.</li>',
  ];
  if (actions.length) {
    const links = actions
      .map((a) => `<a href="${esc(a.href)}">${esc(a.text)}</a>`)
      .join(' · ');
    lines.push(`<li><strong>Do.</strong> ${links}.</li>`);
  } else {
    lines.push(
      '<li><strong>Do.</strong> Read the related briefs, then open the supporting paper before changing a production path.</li>',
    );
  }
  lines.push('</ul>');
  return lines.join('\n');
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
 * Build the in-brief hierarchy rail.
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
  return `<nav class="brief-rail" aria-label="Executive brief hierarchy">
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
  return `<aside class="brief-signal-legend" aria-label="Signal taxonomy">
        <p class="brief-section-kicker">Signal taxonomy</p>
        <ul>
          ${rows}
        </ul>
      </aside>`;
}

/**
 * Assemble prose sections into labeled brief body HTML.
 * @param {Record<string, string>} sections
 * @param {string} honestyHtml
 */
export function renderBriefBody(sections, honestyHtml = '') {
  const birdsInner = `
        <div class="brief-block" id="birds-eye">
          <h2>${esc(BRIEF_SECTIONS[0].title)}</h2>
          ${decorateSignalBlocks(sections['birds-eye'])}
        </div>
        <div class="brief-block" id="fgh-synthesis">
          <h2>${esc(BRIEF_SECTIONS[1].title)}</h2>
          ${decorateSignalBlocks(sections.synthesis)}
        </div>`;

  const insightsInner = `
        ${signalLegendHtml()}
        <div class="brief-block" id="signal-noise">
          <h2>${esc(BRIEF_SECTIONS[2].title)}</h2>
          ${decorateSignalBlocks(sections.insights)}
        </div>`;

  const implicationsInner = `
        <div class="brief-block" id="why-it-matters">
          <h2>${esc(BRIEF_SECTIONS[3].title)}</h2>
          ${decorateSignalBlocks(sections.implications)}
        </div>`;

  const orientationInner = `
        <div class="brief-block" id="practical-orientation">
          <h2>${esc(BRIEF_SECTIONS[4].title)}</h2>
          <p class="brief-core-path">${esc(CORE_ORIENTATION)}</p>
          ${decorateSignalBlocks(sections.orientation)}
        </div>`;

  const honesty = honestyHtml
    ? `\n      <div class="brief-honesty">\n${honestyHtml}\n      </div>`
    : '';

  return `<div class="brief-body prose">
      <section class="brief-section" id="birds-eye-synthesis" data-hierarchy="BIRD'S-EYE SYNTHESIS" aria-label="Bird's-eye synthesis">
        <p class="brief-section-kicker">Bird's-eye synthesis</p>
        ${birdsInner}
      </section>
      <section class="brief-section" id="key-insights" data-hierarchy="KEY INSIGHTS" aria-label="Key insights">
        <p class="brief-section-kicker">Key insights</p>
        ${insightsInner}
      </section>
      <section class="brief-section" id="implications" data-hierarchy="IMPLICATIONS" aria-label="Implications">
        <p class="brief-section-kicker">Implications</p>
        ${implicationsInner}
      </section>
      <section class="brief-section" id="what-to-watch-do" data-hierarchy="WHAT TO WATCH/DO" aria-label="What to watch and do">
        <p class="brief-section-kicker">What to watch / do</p>
        ${orientationInner}
      </section>${honesty}
    </div>`;
}

/**
 * Related rhymes + supporting papers footer blocks.
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

  return `<section class="brief-section related" id="related-rhymes" data-hierarchy="RELATED RHYMES" aria-label="Related rhymes">
      <p class="brief-section-kicker">Related rhymes</p>
      <h2>Connected pattern</h2>
      <p class="brief-closer-dek">Neighbor briefs in the Fractal Goldilocks Channel. Follow the rhyme before diving into methods.</p>
      <div class="related-grid">
          ${rhymeCards || '<p class="brief-empty">No peer briefs linked yet.</p>'}
      </div>
    </section>
    <section class="brief-section related" id="supporting-papers" data-hierarchy="SUPPORTING PAPERS" aria-label="Supporting papers">
      <p class="brief-section-kicker">Supporting papers</p>
      <h2>Deep evidence layer</h2>
      <p class="brief-closer-dek">The brief is synthesis. The paper carries regenerable methods, receipts, and honesty rails.</p>
      <div class="related-grid">
          ${paperCards || '<p class="brief-empty">Open the Library for the full paper set.</p>'}
      </div>
    </section>`;
}

/**
 * Dashboard strip copy for the FGC index.
 */
export function dashboardOrientationHtml() {
  const steps = [
    ['Read the brief', 'Executive gate + hierarchy'],
    ['Follow the rhyme', 'Cross-domain pattern'],
    ['Open the paper', 'Deep evidence'],
    ['Navigate next', 'Related briefs'],
  ]
    .map(
      ([t, s], i) =>
        `<div class="nr-path-step"><span class="nr-path-num">${i + 1}</span><span class="nr-path-title">${esc(t)}</span><span class="nr-path-sub">${esc(s)}</span></div>`,
    )
    .join('\n        ');
  return `<section class="nr-path" aria-label="How to use FGC">
      <h2 class="nr-section-title">How to use this channel</h2>
      <div class="nr-path-row">
        ${steps}
      </div>
      <p class="nr-path-line">${esc(CORE_ORIENTATION)}</p>
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
