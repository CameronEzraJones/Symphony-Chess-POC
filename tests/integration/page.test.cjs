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
  assert.match(html, /role="group" aria-label="Chessboard: knight movement/);
  assert.equal((html.match(/class="square square--/g) || []).length, 64);
  assert.equal((html.match(/class="piece piece--/g) || []).length, 32);
  const types = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
  for (const [color, symbols] of [['white', '♔♕♖♗♘♙'], ['black', '♚♛♜♝♞♟']]) {
    [...symbols].forEach((symbol, index) => {
      const markup = `class="piece piece--${color}" role="img" aria-label="${color} ${types[index]}">${symbol}</span>`;
      assert.equal(html.split(markup).length - 1, [1, 1, 2, 2, 2, 8][index]);
    });
  }
  assert.equal((html.match(/<button/g) || []).length, 64);
  assert.match(html, /aria-label="b1: white knight"/);
  assert.match(html, /role="status"/);
  assert.equal(metadata.title, 'Chessboard');
});
