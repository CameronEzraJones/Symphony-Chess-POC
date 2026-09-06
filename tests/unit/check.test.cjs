const { test } = require('node:test');
const assert = require('node:assert/strict');
const { attacks, isInCheck, tryMove, startingBoard } = require('../../.test-build/chess.js');
const sq = name => (8 - Number(name[1])) * 8 + 'abcdefgh'.indexOf(name[0]);
function position(entries) {
  const board = Array(64).fill(null);
  for (const [square, color, type] of entries) board[sq(square)] = { color, type };
  return board;
}
const move = (board, from, to, color = 'white') => tryMove(board, color, sq(from), sq(to));

test('all six pieces attack the king geometrically, for both colors', () => {
  for (const color of ['white', 'black']) {
    for (const [type, square] of [['rook', 'e8'], ['bishop', 'h7'], ['queen', 'a4'], ['knight', 'f6'], ['king', 'd5'], ['pawn', color === 'black' ? 'd5' : 'd3']]) {
      const defender = color === 'white' ? 'black' : 'white';
      assert.equal(isInCheck(position([['e4', defender, 'king'], [square, color, type]]), defender), true, `${color} ${type}`);
    }
  }
});

test('sliding attacks stop at either color of blocker; non-rays do not attack', () => {
  for (const type of ['rook', 'bishop', 'queen']) {
    const from = type === 'bishop' ? 'a8' : 'e8';
    const block = type === 'bishop' ? 'c6' : 'e6';
    for (const color of ['white', 'black']) {
      const board = position([[from, 'black', type], [block, color, 'pawn'], ['e4', 'white', 'king']]);
      assert.equal(isInCheck(board, 'white'), false);
      assert.equal(attacks(board, sq(from), sq('f5')), false);
    }
  }
});

test('pawn forward moves are not attacks; knights jump; kings do not wrap or attack at distance', () => {
  assert.equal(attacks(position([['e5', 'black', 'pawn']]), sq('e5'), sq('e4')), false);
  assert.equal(attacks(position([['e5', 'white', 'pawn']]), sq('e5'), sq('d4')), false);
  assert.equal(attacks(position([['h4', 'black', 'king']]), sq('h4'), sq('a3')), false);
  assert.equal(attacks(position([['e8', 'black', 'king']]), sq('e8'), sq('e4')), false);
  assert.equal(isInCheck(position([['e4', 'white', 'king'], ['f6', 'black', 'knight'], ['f5', 'black', 'pawn']]), 'white'), true);
});

test('pinned enemy pieces still give check and prohibit king moves', () => {
  const board = position([['h5', 'white', 'king'], ['e1', 'white', 'rook'], ['e7', 'black', 'knight'], ['e8', 'black', 'king']]);
  assert.equal(isInCheck(board, 'white'), false);
  assert.equal(move(board, 'h5', 'f6'), null); // Invalid king geometry.
  const near = position([['g5', 'white', 'king'], ['e1', 'white', 'rook'], ['e7', 'black', 'knight'], ['e8', 'black', 'king']]);
  assert.equal(move(near, 'g5', 'f5'), null);
  near[sq('g5')] = null;
  near[sq('f5')] = { color: 'white', type: 'king' };
  assert.equal(isInCheck(near, 'white'), true);
});

test('moving a pinned defender or exposing a king by capture is rejected without mutation', () => {
  const board = position([['e1', 'white', 'king'], ['e2', 'white', 'rook'], ['e8', 'black', 'rook'], ['a8', 'black', 'king'], ['d2', 'black', 'knight']]);
  const before = structuredClone(board);
  assert.equal(move(board, 'e2', 'd2'), null);
  assert.deepEqual(board, before);
  assert.ok(move(board, 'e2', 'e3'));
});

test('check can be resolved by blocking, capturing the attacker, or moving the king', () => {
  const board = position([['e1', 'white', 'king'], ['d2', 'white', 'rook'], ['e8', 'black', 'rook'], ['a8', 'black', 'king']]);
  assert.equal(isInCheck(board, 'white'), true);
  assert.equal(move(board, 'd2', 'd3'), null);
  for (const [from, to] of [['d2', 'e2'], ['e1', 'f1']]) {
    const next = move(board, from, to);
    assert.ok(next);
    assert.equal(isInCheck(next, 'white'), false);
  }
  const capture = position([['e1', 'white', 'king'], ['d8', 'white', 'rook'], ['e8', 'black', 'rook'], ['a8', 'black', 'king']]);
  assert.ok(move(capture, 'd8', 'e8'));
});

test('double check must resolve every attack; king cannot capture a defended checker', () => {
  const board = position([['e1', 'white', 'king'], ['d3', 'white', 'rook'], ['e8', 'black', 'rook'], ['b4', 'black', 'bishop'], ['a8', 'black', 'king']]);
  assert.equal(move(board, 'd3', 'e3'), null);
  assert.ok(move(board, 'e1', 'f1'));
  const defended = position([['e1', 'white', 'king'], ['e2', 'black', 'rook'], ['h5', 'black', 'bishop'], ['a8', 'black', 'king']]);
  assert.equal(move(defended, 'e1', 'e2'), null);
});

test('adjacent kings and capturing the enemy king are forbidden', () => {
  const board = position([['e1', 'white', 'king'], ['e3', 'black', 'king'], ['a3', 'white', 'rook']]);
  assert.equal(move(board, 'e1', 'e2'), null);
  assert.equal(move(board, 'a3', 'e3'), null);
});

test('ordinary movement validates ownership, paths, pawn movement, and board boundaries', () => {
  const board = startingBoard();
  assert.equal(isInCheck(board, 'white'), false);
  assert.equal(isInCheck(board, 'black'), false);
  for (const [from, to] of [['a1', 'a3'], ['e2', 'd3'], ['e2', 'e5'], ['e2', 'e1'], ['e7', 'e6'], ['e3', 'e4'], ['e2', 'e2']]) assert.equal(move(board, from, to), null);
  assert.ok(move(board, 'e2', 'e4'));
  assert.ok(move(board, 'g1', 'f3'));
  assert.ok(move(board, 'e7', 'e5', 'black'));
  const pawns = position([['e1', 'white', 'king'], ['a8', 'black', 'king'], ['e2', 'white', 'pawn'], ['e3', 'black', 'pawn'], ['d3', 'black', 'pawn']]);
  assert.equal(move(pawns, 'e2', 'e4'), null);
  assert.equal(move(pawns, 'e2', 'e3'), null);
  assert.ok(move(pawns, 'e2', 'd3'));
  for (const index of [-1, 64, 0.5, NaN]) {
    assert.equal(tryMove(board, 'white', index, 0), null);
    assert.equal(attacks(board, 0, index), false);
  }
  assert.equal(attacks(board, 0, 0), false);
  assert.equal(attacks(board, 32, 33), false);
  assert.throws(() => isInCheck(Array(64).fill(null), 'white'), /Missing white king/);
});
