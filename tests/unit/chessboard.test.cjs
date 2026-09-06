const { test } = require('node:test');
const assert = require('node:assert/strict');
const { default: Chessboard } = require('../../.test-build/chessboard.js');

test('board has 64 empty squares, with both axes alternating and light on each player’s right', () => {
  const board = Chessboard();
  const squares = board.props.children;
  assert.equal(squares.length, 64);
  const colors = squares.map(square => square.props.className);
  assert.equal(colors.filter(color => color === 'square square--light').length, 32);
  assert.equal(colors.filter(color => color === 'square square--dark').length, 32);
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const index = row * 8 + column;
      assert.equal(squares[index].props.children, undefined);
      if (column < 7) assert.notEqual(colors[index], colors[index + 1]);
      if (row < 7) assert.notEqual(colors[index], colors[index + 8]);
    }
  }
  assert.equal(colors[0], 'square square--light');
  assert.equal(colors[63], 'square square--light');
  assert.equal(colors[7], 'square square--dark');
  assert.equal(colors[56], 'square square--dark');
});
