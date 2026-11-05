/** Rewrite copied product HTML for offline viewing under docs/web/. */
const SITE = 'https://www.ssvibelandiaquestfest24x365.com';

export const LINK_REWRITES = Object.freeze([
  ['/interfaces/tiny-footprint-product.css', './tiny-footprint-product.css'],
  ['/interfaces/brand-gold-surfaces.css', './brand-gold-surfaces.css'],
  ['/interfaces/media/tiny-footprint/', './media/'],
  ['href="/tiny-footprint/simple"', 'href="./simple.html"'],
  ['href="/tiny-footprint/simple/"', 'href="./simple.html"'],
  ['href="/tiny-footprint"', 'href="./product-hub.html"'],
  ['href="/tiny-footprint/"', 'href="./product-hub.html"'],
  ['href="/tiny-footprint/brochure-print"', 'href="./commercial-brochure-print.html"'],
  ['href="/tiny-footprint/brochure-print/"', 'href="./commercial-brochure-print.html"'],
  ['href="/brochure/tiny-footprint"', 'href="./tech-brochure.html"'],
  ['href="/brochure/tiny-footprint/"', 'href="./tech-brochure.html"'],
  ['href="/tiny-footprint/tech"', 'href="./tech-brochure.html"'],
  ['href="/tiny-footprint/tech/"', 'href="./tech-brochure.html"'],
  ['href="/tiny-footprint/local"', `href="${SITE}/tiny-footprint/local"`],
  ['href="/tiny-footprint/server"', `href="${SITE}/tiny-footprint/server"`],
  ['href="/tiny-footprint/cloud"', `href="${SITE}/tiny-footprint/cloud"`],
  ['href="/tiny-footprint/workstation"', `href="${SITE}/tiny-footprint/workstation"`],
  ['href="/tiny-footprint/validation"', `href="${SITE}/tiny-footprint/validation"`],
  ['href="/tiny-footprint/download"', `href="${SITE}/tiny-footprint/download"`],
  ['href="/questfest"', `href="${SITE}/questfest"`],
  ['href="/whitepaper/tiny-gateway-rhyming-templates"', `href="${SITE}/whitepaper/tiny-gateway-rhyming-templates"`],
  ['href="/ship-blog/tiny-gateway-rhyming-templates"', `href="${SITE}/ship-blog/tiny-gateway-rhyming-templates"`],
  ['href="/journey/homeostasis-expedition"', `href="${SITE}/journey/homeostasis-expedition"`],
]);

/** @param {string} html */
export function localizeHtml(html) {
  let t = html;
  for (const [from, to] of LINK_REWRITES) t = t.replaceAll(from, to);
  t = t.replace(/<script src="\/interfaces\/vbi18n-failopen\.js"><\/script>\s*/g, '');
  t = t.replace(/<script src="\/interfaces\/i18n-auto\.js"[^>]*><\/script>\s*/g, '');
  t = t.replace(/<script src="\/interfaces\/site-quicklinks\.js"[^>]*><\/script>\s*/g, '');
  // Keep local kit pages offline: drop third-party fonts and site-only styles.
  t = t.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>\s*/g, '');
  t = t.replace(/<link[^>]+voyage-brochure-publication\.css[^>]*>\s*/g, '');
  // Banner for local kit viewers.
  if (!t.includes('tf-local-kit-banner')) {
    t = t.replace('<body', '<body data-tf-local-kit="1"');
    t = t.replace(
      /(<nav class="tf-nav"[^>]*>)/,
      '$1\n    <span class="tf-local-kit-banner" style="opacity:.85">Local kit docs · <a href="./simple.html">Plainspeak</a> · <a href="./tech-brochure.html">Tech brochure</a> · <a href="./commercial-brochure-print.html">Print brochure</a></span>',
    );
  }
  return t;
}
