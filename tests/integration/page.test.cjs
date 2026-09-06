const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
// Styles are checked in the browser; Node only renders the document here.
require.extensions['.css'] = () => {};
const { default: Home } = require('../../.test-build/page.js');
const { default: RootLayout, metadata } = require('../../.test-build/layout.js');

test('home and root layout render the accessible board in a complete document', () => {
  const html = renderToStaticMarkup(React.createElement(RootLayout, null, React.createElement(Home)));
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<main><h1>Chessboard<\/h1>/);
  assert.match(html, /role="img" aria-label="Chessboard: 8 by 8 equal squares/);
  assert.equal((html.match(/class="square square--/g) || []).length, 64);
  assert.equal((html.match(/aria-hidden="true"/g) || []).length, 64);
  assert.equal(metadata.title, 'Chessboard');
});
