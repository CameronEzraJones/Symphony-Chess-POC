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
  assert.match(html, /role="group" aria-label="Chessboard: select a bishop/);
  assert.equal((html.match(/class="square square--/g) || []).length, 64);
  assert.equal((html.match(/class="piece piece--/g) || []).length, 32);
  const types = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
  for (const [color, symbols] of [['white', '♔♕♖♗♘♙'], ['black', '♚♛♜♝♞♟']]) {
    [...symbols].forEach((symbol, index) => {
      const markup = `class="piece piece--${color}" role="img" aria-label="${color} ${types[index]}">${symbol}</span>`;
      assert.equal(html.split(markup).length - 1, [1, 1, 2, 2, 2, 8][index]);
    });
  }
  assert.equal(metadata.title, 'Chessboard');
});

test('bishop rules drive accessible selection, destinations and the rendered move', () => {
  const { default: Chessboard } = require('../../.test-build/chessboard.js');
  const { practiceBoard, moveBishop } = require('../../.test-build/bishop.js');
  const board = practiceBoard();
  const html = renderToStaticMarkup(React.createElement(Chessboard, { board, selected: 35 }));
  assert.match(html, /aria-label="d4: white bishop" aria-pressed="true"/);
  assert.match(html, /aria-label="g7: black bishop, legal destination"/);
  assert.match(html, /aria-label="b2: white pawn"/);
  assert.doesNotMatch(html, /a1: empty, legal destination/);
  const moved = renderToStaticMarkup(React.createElement(Chessboard, { board: moveBishop(board, 35, 14) }));
  assert.match(moved, /aria-label="d4: empty"/);
  assert.match(moved, /aria-label="g7: white bishop"/);
  assert.doesNotMatch(moved, /role="img" aria-label="black bishop"/);
});

test('knight rules drive accessible destinations and rendered captures alongside bishops', () => {
  const { default: Chessboard } = require('../../.test-build/chessboard.js');
  const { startingBoard, moveKnight } = require('../../.test-build/knight.js');
  const board = startingBoard();
  const html = renderToStaticMarkup(React.createElement(Chessboard, { board, selected: 57 }));
  assert.match(html, /aria-label="b1: white knight" aria-pressed="true"/);
  assert.match(html, /aria-label="c3: empty, legal destination"/);
  assert.match(html, /aria-label="a3: empty, legal destination"/);
  assert.doesNotMatch(html, /d2: white pawn, legal destination/);
  const moved = moveKnight(moveKnight(moveKnight(board, 57, 42), 42, 27), 27, 12);
  const result = renderToStaticMarkup(React.createElement(Chessboard, { board: moved }));
  assert.match(result, /aria-label="b1: empty"/);
  assert.match(result, /aria-label="e7: white knight"/);
  assert.equal((result.match(/role="img"/g) || []).length, 31);
});
