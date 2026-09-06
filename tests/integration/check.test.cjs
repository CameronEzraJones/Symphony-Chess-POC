const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { startingBoard, tryMove, isInCheck } = require('../../.test-build/chess.js');
const { default: Chessboard } = require('../../.test-build/chessboard.js');
const sq = name => (8 - Number(name[1])) * 8 + 'abcdefgh'.indexOf(name[0]);

test('played check, rejected reply, and legal block integrate with accessible board rendering', () => {
  let board = startingBoard();
  for (const [color, from, to] of [['white', 'e2', 'e4'], ['black', 'd7', 'd5'], ['white', 'f1', 'b5']]) {
    board = tryMove(board, color, sq(from), sq(to));
    assert.ok(board);
  }
  assert.equal(isInCheck(board, 'black'), true);
  assert.equal(tryMove(board, 'black', sq('a7'), sq('a6')), null);
  const html = renderToStaticMarkup(React.createElement(Chessboard, { board, checkedKing: sq('e8') }));
  assert.match(html, /aria-label="e8: black king, in check"/);
  assert.match(html, /data-check="true"/);
  board = tryMove(board, 'black', sq('c7'), sq('c6'));
  assert.ok(board);
  assert.equal(isInCheck(board, 'black'), false);
  const resolved = renderToStaticMarkup(React.createElement(Chessboard, { board }));
  assert.doesNotMatch(resolved, /data-check/);
  assert.match(resolved, /aria-label="c6: black pawn"/);
});
