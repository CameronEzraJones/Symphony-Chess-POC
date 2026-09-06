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

test('legal king transition renders relocated king and rook with accessible square names', () => {
  const { BoardView } = require('../../.test-build/chessboard.js');
  const { practiceBoard, moveKing, kingMoves } = require('../../.test-build/king.js');
  const board = practiceBoard();
  const selected = renderToStaticMarkup(React.createElement(BoardView, {board,selected:60,moves:kingMoves(board,60)}));
  assert.match(selected, /aria-label="g1: empty, legal move"/);
  const html = renderToStaticMarkup(React.createElement(BoardView, {board:moveKing(board,60,62)}));
  assert.match(html, /aria-label="g1: white king"/);
  assert.match(html, /aria-label="f1: white rook"/);
  assert.match(html, /aria-label="h1: empty"/);
  assert.match(html, /aria-label="e1: empty"/);
});


test('bishop moves preserve castling history and update king attack checks on the shared board', () => {
  const { practiceBoard, moveKing } = require('../../.test-build/king.js');
  const { moveBishop } = require('../../.test-build/bishop.js');
  let board = practiceBoard();
  board[26] = { color: 'black', type: 'bishop' }; // c5 attacks f2
  assert.equal(moveKing(board, 60, 53), null);
  board = moveBishop(board, 26, 19); // d6 clears f2
  board = moveKing(board, 60, 53);
  assert.ok(board);
  board = moveBishop(board, 19, 12);
  assert.equal(board[53].moved, true);
  board = moveKing(board, 53, 60);
  assert.ok(board);
  assert.equal(moveKing(board, 60, 62), null);
});
