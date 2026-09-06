const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canMoveRook, moveRook, startingBoard, rookPractice, squareName } = require('../../.test-build/movement.js');

for (const color of ['white', 'black']) {
  test(`${color} rook can reach exactly its rank and file from every square`, () => {
    for (let from = 0; from < 64; from++) {
      const board = Array(64).fill(null);
      board[from] = { color, type: 'rook' };
      for (let to = 0; to < 64; to++) {
        const expected = from !== to && (Math.floor(from / 8) === Math.floor(to / 8) || from % 8 === to % 8);
        assert.equal(canMoveRook(board, from, to), expected, `${from} to ${to}`);
      }
    }
  });
}

test('each direction stops at friendly pieces and allows capturing the first enemy only', () => {
  for (const step of [-8, 8, -1, 1]) {
    for (const color of ['white', 'black']) {
      const board = Array(64).fill(null);
      board[27] = { color: 'white', type: 'rook' };
      board[27 + 2 * step] = { color, type: 'pawn' };
      assert.equal(canMoveRook(board, 27, 27 + step), true);
      assert.equal(canMoveRook(board, 27, 27 + 2 * step), color === 'black');
      assert.equal(canMoveRook(board, 27, 27 + 3 * step), false);
    }
  }
});

test('invalid inputs, empty squares and other pieces cannot move', () => {
  const board = startingBoard();
  for (const [from, to] of [[-1, 0], [0, 64], [64, 0], [0, -1], [0.5, 8], [0, 8.5], [NaN, 0], [0, Infinity], [0, 0], [16, 24], [2, 18], [8, 16]]) {
    assert.equal(canMoveRook(board, from, to), false);
    assert.equal(moveRook(board, from, to), board);
  }
  assert.equal(canMoveRook([], 0, 8), false);
  for (const from of [0, 7, 56, 63]) {
    for (let to = 0; to < 64; to++) assert.equal(canMoveRook(board, from, to), false);
  }
});

test('moves and captures update only source and destination without mutating the original', () => {
  const board = rookPractice();
  for (const to of [32, 19]) {
    const next = moveRook(board, 35, to);
    assert.equal(next[35], null);
    assert.deepEqual(next[to], { color: 'white', type: 'rook' });
    board.forEach((piece, index) => {
      if (index !== 35 && index !== to) assert.equal(next[index], piece);
    });
  }
  assert.equal(board[35].type, 'rook');
  assert.equal(board[19].type, 'pawn');
  assert.equal(squareName(0), 'a8');
  assert.equal(squareName(63), 'h1');
});
