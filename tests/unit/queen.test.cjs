const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canMoveQueen, moveQueen, startingBoard, practiceBoard, squareName } = require('../../.test-build/queen.js');

for (const color of ['white', 'black']) {
  test(`${color} queen movement matches files, ranks and diagonals for every board pair`, () => {
    for (let from = 0; from < 64; from++) {
      const board = Array(64).fill(null);
      board[from] = { color, type: 'queen' };
      for (let to = 0; to < 64; to++) {
        const row = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
        const column = Math.abs(from % 8 - to % 8);
        assert.equal(canMoveQueen(board, from, to), from !== to && (row === 0 || column === 0 || row === column), `${from} -> ${to}`);
      }
    }
  });
}

test('blockers stop all eight rays, friendly pieces cannot be captured, enemies can', () => {
  for (const step of [-9, -8, -7, -1, 1, 7, 8, 9]) {
    for (const color of ['white', 'black']) {
      const board = Array(64).fill(null);
      board[27] = { color: 'white', type: 'queen' };
      board[27 + step] = { color, type: 'pawn' };
      assert.equal(canMoveQueen(board, 27, 27 + step), color === 'black');
      assert.equal(canMoveQueen(board, 27, 27 + 2 * step), false);
      const next = moveQueen(board, 27, 27 + step);
      if (color === 'black') {
        assert.equal(next[27], null);
        assert.deepEqual(next[27 + step], board[27]);
        assert.equal(board[27 + step].type, 'pawn');
      } else assert.equal(next, board);
    }
  }
});

test('invalid input, non-queens, same square and king captures leave the board untouched', () => {
  const board = startingBoard();
  for (const [from, to] of [[59, 59], [-1, 3], [3, 64], [64, 3], [3, -1], [3.5, 19], [3, NaN], [3, 19.5], [32, 40], [48, 40], [59, 43], [3, 19]]) {
    assert.equal(moveQueen(board, from, to), board);
  }
  assert.equal(canMoveQueen([], 0, 1), false);
  const kings = [...practiceBoard()];
  kings[27] = { color: 'black', type: 'king' };
  assert.equal(moveQueen(kings, 35, 27), kings);
});

test('successful moves are immutable and preserve every unrelated square', () => {
  const board = Object.freeze(practiceBoard());
  const next = moveQueen(board, 35, 32);
  assert.notEqual(next, board);
  assert.equal(next[35], null);
  assert.equal(next[32], board[35]);
  for (let i = 0; i < 64; i++) if (i !== 35 && i !== 32) assert.equal(next[i], board[i]);
  assert.equal(squareName(0), 'a8');
  assert.equal(squareName(63), 'h1');
});
