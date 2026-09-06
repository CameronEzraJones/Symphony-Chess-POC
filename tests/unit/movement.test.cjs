const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startingBoard, attacksSquare, canMove, movePiece, squareName } = require('../../.test-build/movement.js');
const position = (...pieces) => {
  const board = Array(64).fill(null);
  for (const [square, color, type] of pieces) board[square] = { color, type };
  return board;
};

test('friendly destinations and invalid inputs never change the board', () => {
  const board = startingBoard();
  for (const [from, to] of [[56, 48], [57, 51], [0, 0], [20, 28], [-1, 0], [64, 0], [0, 64], [0.5, 8], [0, NaN]]) {
    assert.equal(canMove(board, from, to), false);
    assert.equal(movePiece(board, from, to), board);
  }
  assert.equal(squareName(0), 'a8');
  assert.equal(squareName(63), 'h1');
});

test('quiet moves and captures update both squares atomically without mutating the input', () => {
  for (const color of ['white', 'black']) {
    const enemy = color === 'white' ? 'black' : 'white';
    const board = position([35, color, 'rook'], [19, enemy, 'bishop']);
    const moved = movePiece(board, 35, 34);
    assert.equal(moved[35], null);
    assert.deepEqual(moved[34], board[35]);
    const captured = movePiece(board, 35, 19);
    assert.equal(captured[35], null);
    assert.deepEqual(captured[19], board[35]);
    assert.equal(captured.filter(Boolean).length, 1);
    assert.deepEqual(board[19], { color: enemy, type: 'bishop' });
    assert.equal(board.filter(Boolean).length, 2);
  }
});

test('capture geometry for every piece type rejects unrelated squares and board wrapping', () => {
  const cases = [
    ['rook', [3, 32, 39, 59], [26, 28, 18]],
    ['bishop', [8, 14, 28, 56, 62], [3, 32, 36]],
    ['queen', [8, 3, 14, 32, 39, 56, 59, 62], [18, 20]],
    ['knight', [18, 20, 25, 29, 41, 45, 50, 52], [27, 28, 36]],
    ['king', [26, 27, 28, 34, 36, 42, 43, 44], [19, 37]],
  ];
  for (const [type, yes, no] of cases) {
    const board = position([35, 'white', type]);
    for (const to of yes) assert.equal(attacksSquare(board, 35, to), true, `${type}: ${to}`);
    for (const to of no) assert.equal(attacksSquare(board, 35, to), false, `${type}: ${to}`);
    assert.equal(attacksSquare(board, 35, 35), false);
  }
  assert.equal(attacksSquare(position([7, 'white', 'king']), 7, 8), false);
  for (const [from, to] of [[-1, 8], [0, 64], [0, 0], [1, 8]]) {
    assert.equal(attacksSquare(position([0, 'white', 'rook']), from, to), false);
  }
});

test('sliders stop at the first occupied square of either colour; knights jump', () => {
  for (const color of ['white', 'black']) {
    for (const [type, blocker, beyond] of [['rook', 27, 19], ['bishop', 26, 17], ['queen', 36, 37]]) {
      const board = position([35, 'white', type], [blocker, color, 'pawn']);
      assert.equal(attacksSquare(board, 35, blocker), true);
      assert.equal(attacksSquare(board, 35, beyond), false);
      assert.equal(canMove(board, 35, blocker), color === 'black');
    }
  }
  assert.equal(canMove(startingBoard(), 57, 42), true);
});

test('pawns attack diagonally even on empty squares, but move forward only when clear', () => {
  for (const [color, from, step] of [['white', 51, -8], ['black', 11, 8]]) {
    const enemy = color === 'white' ? 'black' : 'white';
    const board = position([from, color, 'pawn']);
    assert.equal(canMove(board, from, from + step), true);
    assert.equal(canMove(board, from, from + 2 * step), true);
    assert.equal(canMove(board, from, from - step), false);
    assert.equal(attacksSquare(board, from, from + step), false);
    for (const delta of [-1, 1]) {
      const to = from + step + delta;
      assert.equal(attacksSquare(board, from, to), true);
      assert.equal(canMove(board, from, to), false);
      assert.equal(canMove(position([from, color, 'pawn'], [to, enemy, 'rook']), from, to), true);
    }
    const blocked = position([from, color, 'pawn'], [from + step, enemy, 'rook']);
    assert.equal(canMove(blocked, from, from + step), false);
    assert.equal(canMove(blocked, from, from + 2 * step), false);
    assert.equal(canMove(position([from + step, color, 'pawn']), from + step, from + 3 * step), false);
  }
  assert.equal(attacksSquare(position([32, 'white', 'pawn']), 32, 23), false);
});

test('a pinned piece still attacks: moving the blocker would expose its own king', () => {
  const board = position([60, 'white', 'king'], [52, 'white', 'rook'], [4, 'black', 'rook'], [51, 'black', 'bishop']);
  assert.equal(attacksSquare(board, 4, 60), false);
  assert.equal(attacksSquare(board, 52, 51), true);
  assert.equal(attacksSquare(board, 52, 53), true);
  const withoutBlocker = [...board];
  withoutBlocker[52] = null;
  assert.equal(attacksSquare(withoutBlocker, 4, 60), true);
});
