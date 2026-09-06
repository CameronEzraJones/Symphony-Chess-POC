const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { BoardView } = require('../../.test-build/chessboard.js');
const { practiceBoard, moveQueen } = require('../../.test-build/queen.js');

test('movement and board rendering agree on selection, destinations, relocation and capture', () => {
  const board = practiceBoard();
  const render = (position, selected = null) => renderToStaticMarkup(React.createElement(BoardView, { board: position, selected }));
  const selected = render(board, 35);
  assert.match(selected, /aria-label="d4: white queen" aria-pressed="true"/);
  assert.match(selected, /aria-label="a4: empty, legal destination" aria-pressed="false" data-destination="true"/);
  assert.match(selected, /aria-label="e6: empty" aria-pressed="false" data-destination="false"/);
  const moved = moveQueen(board, 35, 32);
  assert.match(render(moved), /aria-label="d4: empty"/);
  assert.match(render(moved), /aria-label="a4: white queen"/);
  assert.equal(render(moveQueen(moved, 32, 42)), render(moved));
  const captured = render(moveQueen(board, 35, 7));
  assert.match(captured, /aria-label="h8: white queen"/);
  assert.doesNotMatch(captured, /black queen/);
});
