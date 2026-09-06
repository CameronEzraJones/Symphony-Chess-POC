const { test } = require('node:test');
const assert = require('node:assert/strict');
const { movePiece } = require('../../.test-build/move.js');
const { startingPosition } = require('../../.test-build/pawn.js');

test('pawn and bishop moves share turns and expire en passant', () => {
  const initial = startingPosition();
  const white = movePiece(initial, 52, 36);
  const black = movePiece(white, 11, 27);
  assert.deepEqual(black.enPassant, { target: 19, pawn: 27 });
  assert.equal(movePiece(black, 2, 20), null); // wrong color
  const bishop = movePiece(black, 61, 34);
  assert.equal(bishop.board[61], null);
  assert.equal(bishop.board[34].type, 'bishop');
  assert.equal(bishop.turn, 'black');
  assert.equal(bishop.enPassant, null);
  assert.equal(black.board[61].type, 'bishop'); // immutable
  const reply = movePiece(bishop, 2, 20);
  assert.equal(reply.turn, 'white');
});

test('bishop rejects blocked moves, promotion arguments and king captures', () => {
  const position = startingPosition();
  assert.equal(movePiece(position, 58, 40), null);
  position.board[49] = null;
  assert.equal(movePiece(position, 58, 40, 'queen'), null);
  position.board[40] = { color: 'black', type: 'king' };
  assert.equal(movePiece(position, 58, 40), null);
});
