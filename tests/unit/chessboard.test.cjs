const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startingBoard } = require('../../.test-build/movement.js');

test('starting board has exactly the required army for each color', () => {
  const squares = startingBoard();
  const pieces = squares.filter(Boolean);
  assert.equal(pieces.length, 32);
  for (const color of ['white', 'black']) {
    const army = pieces.filter(piece => piece.color === color);
    assert.equal(army.length, 16);
    for (const [type, count] of Object.entries({ king: 1, queen: 1, rook: 2, bishop: 2, knight: 2, pawn: 8 })) {
      assert.equal(army.filter(piece => piece.type === type).length, count, `${color} ${type}`);
    }
  }
  const ranks = [
    ['black', 0, ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']],
    ['black', 8, Array(8).fill('pawn')],
    ['white', 48, Array(8).fill('pawn')],
    ['white', 56, ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']],
  ];
  for (const [color, start, types] of ranks) {
    types.forEach((type, file) => assert.deepEqual(squares[start + file], { color, type }));
  }
});
