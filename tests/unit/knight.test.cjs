const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canMoveKnight, moveKnight, startingBoard, squareName } = require('../../.test-build/knight.js');

test('every square accepts exactly the eight L offsets that remain on the board, for either color', () => {
  for (const color of ['white', 'black']) {
    for (let from = 0; from < 64; from++) {
      const board = Array(64).fill(null);
      board[from] = { type: 'knight', color };
      const expected = new Set();
      for (const [r, f] of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) {
        const row = Math.floor(from / 8) + r;
        const file = from % 8 + f;
        if (row >= 0 && row < 8 && file >= 0 && file < 8) expected.add(row * 8 + file);
      }
      for (let to = 0; to < 64; to++) assert.equal(canMoveKnight(board, from, to), expected.has(to), `${color} ${from} -> ${to}`);
    }
  }
});

test('knights jump, reject friendly occupants, and capture enemies without mutating the board', () => {
  for (const [from, to, friendly] of [[57, 40, 51], [1, 16, 11]]) {
    const board = startingBoard();
    assert.equal(canMoveKnight(board, from, friendly), false);
    const moved = moveKnight(board, from, to);
    assert.equal(moved[from], null);
    assert.deepEqual(moved[to], board[from]);
    assert.ok(board[from]);
    assert.equal(board[to], null);
    const occupied = [...board];
    occupied[to] = { type: 'pawn', color: board[from].color === 'white' ? 'black' : 'white' };
    const captured = moveKnight(occupied, from, to);
    assert.deepEqual(captured[to], board[from]);
    assert.equal(captured.filter(Boolean).length, occupied.filter(Boolean).length - 1);
    for (let i = 0; i < 64; i++) if (i !== from && i !== to) assert.equal(captured[i], occupied[i]);
  }
});

test('invalid inputs and non-knights leave the position unchanged', () => {
  const board = startingBoard();
  for (const [from, to] of [[-1, 16], [1, 64], [64, 1], [1, -1], [1.5, 16], [1, NaN], [1, 1], [0, 17], [24, 41], [1, 9], [1, 19]]) {
    assert.equal(canMoveKnight(board, from, to), false);
    assert.equal(moveKnight(board, from, to), board);
  }
  assert.equal(squareName(0), 'a8');
  assert.equal(squareName(63), 'h1');
});
