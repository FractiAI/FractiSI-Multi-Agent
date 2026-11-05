import assert from 'node:assert/strict';
import test from 'node:test';
import { LINK_REWRITES, localizeHtml } from '../../src/docs_tools/localize-web.mjs';

test('site links become local or absolute', () => {
  const html = localizeHtml('<body><a href="/tiny-footprint/simple">a</a><a href="/questfest">b</a></body>');
  assert.match(html, /href="\.\/simple\.html"/);
  assert.match(html, /href="https:\/\/www\.ssvibelandiaquestfest24x365\.com\/questfest"/);
});

test('third-party fonts and site scripts are removed so pages work offline', () => {
  const html = localizeHtml('<link href="https://fonts.googleapis.com/css" rel="stylesheet"><script src="/interfaces/i18n-auto.js"></script><body></body>');
  assert.doesNotMatch(html, /fonts\.googleapis|i18n-auto/);
});

test('the local banner is added once', () => {
  const once = localizeHtml('<body><nav class="tf-nav"></nav></body>');
  assert.match(once, /tf-local-kit-banner/);
  assert.equal(localizeHtml(once), once);
});

test('every rewrite maps to something different', () => {
  for (const [from, to] of LINK_REWRITES) assert.notEqual(from, to);
});
