const { test } = require('node:test');
const assert = require('node:assert/strict');
const { default: Chessboard } = require('../../.test-build/chessboard.js');
const { hasClearSlidingPath } = require('../../.test-build/sliding-path.js');

test('path rule consumes the actual starting board without changing its pieces', () => {
  const squares = Chessboard().props.children;
  const occupied = squares.map(square => Boolean(square.props.children));
  const original = [...occupied];
  for (const [type, from, to, blocker] of [
    ['rook', 56, 32, 48], ['bishop', 58, 40, 49], ['queen', 59, 35, 51],
    ['rook', 0, 24, 8], ['bishop', 2, 20, 11], ['queen', 3, 27, 11],
  ]) {
    assert.equal(squares[from].props.children.props.type, type);
    assert.equal(hasClearSlidingPath(type, from, to, square => occupied[square]), false);
    const cleared = [...occupied];
    cleared[blocker] = false;
    assert.equal(hasClearSlidingPath(type, from, to, square => cleared[square]), true);
  }
  assert.deepEqual(occupied, original);
});
