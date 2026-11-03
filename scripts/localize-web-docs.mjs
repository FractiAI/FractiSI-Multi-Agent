#!/usr/bin/env node
/** Rewrite copied product HTML for offline viewing under docs/web/ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(__dirname, '../docs/web');

const pairs = [
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
  [
    'href="/tiny-footprint/local"',
    'href="https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/local"',
  ],
  [
    'href="/tiny-footprint/server"',
    'href="https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/server"',
  ],
  [
    'href="/tiny-footprint/cloud"',
    'href="https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/cloud"',
  ],
  [
    'href="/tiny-footprint/workstation"',
    'href="https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/workstation"',
  ],
  [
    'href="/tiny-footprint/validation"',
    'href="https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/validation"',
  ],
  [
    'href="/tiny-footprint/download"',
    'href="https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/download"',
  ],
  ['href="/questfest"', 'href="https://www.ssvibelandiaquestfest24x365.com/questfest"'],
  [
    'href="/whitepaper/tiny-gateway-rhyming-templates"',
    'href="https://www.ssvibelandiaquestfest24x365.com/whitepaper/tiny-gateway-rhyming-templates"',
  ],
  [
    'href="/ship-blog/tiny-gateway-rhyming-templates"',
    'href="https://www.ssvibelandiaquestfest24x365.com/ship-blog/tiny-gateway-rhyming-templates"',
  ],
  [
    'href="/journey/homeostasis-expedition"',
    'href="https://www.ssvibelandiaquestfest24x365.com/journey/homeostasis-expedition"',
  ],
];

for (const file of fs.readdirSync(web).filter((f) => f.endsWith('.html'))) {
  let t = fs.readFileSync(path.join(web, file), 'utf8');
  for (const [a, b] of pairs) t = t.replaceAll(a, b);
  t = t.replace(/<script src="\/interfaces\/vbi18n-failopen\.js"><\/script>\s*/g, '');
  t = t.replace(/<script src="\/interfaces\/i18n-auto\.js"[^>]*><\/script>\s*/g, '');
  t = t.replace(/<script src="\/interfaces\/site-quicklinks\.js"[^>]*><\/script>\s*/g, '');
  // banner for local kit viewers
  if (!t.includes('tf-local-kit-banner')) {
    t = t.replace(
      '<body',
      `<body data-tf-local-kit="1"`,
    );
    t = t.replace(
      /(<nav class="tf-nav"[^>]*>)/,
      `$1\n    <span class="tf-local-kit-banner" style="opacity:.85">Local kit docs · <a href="./simple.html">Plainspeak</a> · <a href="./tech-brochure.html">Tech brochure</a> · <a href="./commercial-brochure-print.html">Print brochure</a></span>`,
    );
  }
  fs.writeFileSync(path.join(web, file), t, 'utf8');
  console.log('localized', file);
}
