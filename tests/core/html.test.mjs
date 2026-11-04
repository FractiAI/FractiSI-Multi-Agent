import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeHtml } from '../../src/core/html.mjs';

test('markup characters are escaped, including in non-strings', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(escapeHtml(5), '5');
});
