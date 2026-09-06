const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canMoveBishop, moveBishop, startingBoard, practiceBoard } = require('../../.test-build/bishop.js');

for (const color of ['white', 'black']) {
  test(`${color} bishop reaches exactly its diagonals from every board square`, () => {
    for (let from = 0; from < 64; from++) {
      const board = Array(64).fill(null);
      board[from] = { color, type: 'bishop' };
      for (let to = 0; to < 64; to++) {
        const diagonal = from !== to && Math.abs(Math.floor(from / 8) - Math.floor(to / 8)) === Math.abs(from % 8 - to % 8);
        assert.equal(canMoveBishop(board, from, to), diagonal, `${from} → ${to}`);
      }
    }
  });
}

test('pieces block all four diagonals; only opposing destinations can be captured', () => {
  for (const step of [-9, -7, 7, 9]) {
    for (const color of ['white', 'black']) {
      const board = Array(64).fill(null);
      board[35] = { color: 'white', type: 'bishop' };
      board[35 + step] = { color, type: 'pawn' };
      assert.equal(canMoveBishop(board, 35, 35 + step), color === 'black');
      assert.equal(canMoveBishop(board, 35, 35 + 2 * step), false);
    }
  }
});

test('moves and captures are immutable and invalid moves leave the position intact', () => {
  const board = practiceBoard();
  const moved = moveBishop(board, 35, 14);
  assert.equal(moved[35], null);
  assert.deepEqual(moved[14], { color: 'white', type: 'bishop' });
  assert.equal(moved.filter(Boolean).length, 2);
  assert.equal(board[14].color, 'black');
  assert.equal(board[35].color, 'white');
  assert.equal(moveBishop(board, 35, 36), board);
  const emptyMove = moveBishop(board, 35, 28);
  assert.equal(emptyMove[35], null);
  assert.deepEqual(emptyMove[28], board[35]);
});

test('rejects off-board indices, no-op, empty origins, other pieces and blocked starting bishops', () => {
  const board = startingBoard();
  for (const [from, to] of [[-1, 0], [2, 64], [2, NaN], [2.5, 20], [2, 2], [24, 33], [0, 9], [2, 20], [5, 19], [58, 44], [61, 43]]) {
    assert.equal(canMoveBishop(board, from, to), false);
  }
});
