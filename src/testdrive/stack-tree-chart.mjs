/**
 * FractiSI Multi-Agent · stack tree chart (SING13 dendrochronology plate, updated).
 * Heritage plate from psw.vibelandia.sing13 Infinite Octave hero source tree;
 * product plate + SVG legend reflect the latest symposium stack.
 */

export const STACK_TREE_CHART = Object.freeze({
  title: 'FractiSI Multi-Agent · stack tree',
  subtitle: 'One shared world · many agents',
  heritageSrc: '/media/infinite-octave-hero-source-tree.jpg',
  heritageAlt:
    'SING13 heritage dendrochronology tree chart: SOURCE crowns Digits × Octaves rings with self-observation at the heartwood',
  plateSrc: '/media/fractisi-multi-agent-stack-tree.jpg',
  plateAlt:
    'Updated FractiSI Multi-Agent stack tree: Base Mainnet through Deploy on the trunk, Digits × Octaves rings, self-observation loop',
  svgSrc: '/media/fractisi-multi-agent-stack-tree.svg',
  svgAlt:
    'Readable FractiSI Multi-Agent stack tree SVG: Base Mainnet → Syntheverse Sandbox → Net Zero → Infinite Octaves → Holographic Rhyme Gate → Rhyming Templates · Tiny Gateway → Tiny Footprint → Coordination · Shared state · Composition → Git awareness → Deploy',
  /** Trunk plaques, roots → canopy (teaching order). */
  trunkBottomToTop: Object.freeze([
    'Base Mainnet',
    'Syntheverse Sandbox',
    'Net Zero · balanced zero',
    'Infinite Octaves',
    'Holographic rhyme gate',
    'Rhyming Templates · Tiny Gateway',
    'Tiny Footprint',
    'Coordination · Shared state · Composition',
    'Git awareness',
    'Deploy',
  ]),
  crown: 'FractiSI Multi-Agent',
  honesty:
    'Soft Story / catalog map plate adapted from SING13 Infinite Octave hero source tree. Not CapEx guarantees, not Active Inference identity, not infinite physical octave tiers.',
});

/** HTML figure block for Test Drive / deck embeds. */
export function stackTreeChartFigureHtml({ prefer = 'plate' } = {}) {
  const c = STACK_TREE_CHART;
  const src = prefer === 'svg' ? c.svgSrc : c.plateSrc;
  const alt = prefer === 'svg' ? c.svgAlt : c.plateAlt;
  const ladder = c.trunkBottomToTop
    .map((label, i) => `<li><span class="n">${i + 1}</span><span>${label}</span></li>`)
    .join('');
  return `
    <figure class="stack-tree-figure">
      <img src="${src}" alt="${alt}" width="864" height="1152" loading="lazy" decoding="async" />
      <figcaption>${c.title} — trunk from bedrock to Deploy. Readable ladder under the plate.</figcaption>
    </figure>
    <ol class="ladder stack-tree-ladder">${ladder}<li><span class="n">★</span><span>${c.crown}</span></li></ol>
    <p class="stack-tree-honesty">${c.honesty}</p>
  `;
}
