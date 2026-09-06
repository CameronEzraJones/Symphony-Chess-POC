const { test } = require('node:test');
const assert = require('node:assert/strict');
const { BoardView } = require('../../.test-build/chessboard.js');
const { startingBoard } = require('../../.test-build/queen.js');
const Chessboard = () => BoardView({ board: startingBoard() });

test('board has 64 squares, with both axes alternating and light on each player’s right', () => {
  const board = Chessboard();
  const squares = board.props.children;
  assert.equal(squares.length, 64);
  const colors = squares.map(square => square.props.className);
  assert.equal(colors.filter(color => color === 'square square--light').length, 32);
  assert.equal(colors.filter(color => color === 'square square--dark').length, 32);
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const index = row * 8 + column;
      if (row >= 2 && row <= 5) assert.equal(squares[index].props.children, null);
      if (column < 7) assert.notEqual(colors[index], colors[index + 1]);
      if (row < 7) assert.notEqual(colors[index], colors[index + 8]);
    }
  }
  assert.equal(colors[0], 'square square--light');
  assert.equal(colors[63], 'square square--light');
  assert.equal(colors[7], 'square square--dark');
  assert.equal(colors[56], 'square square--dark');
});


test('starting board has exactly the required army for each color', () => {
  const squares = Chessboard().props.children;
  const pieces = squares.map(square => square.props.children).filter(Boolean);
  assert.equal(pieces.length, 32);
  for (const color of ['white', 'black']) {
    const army = pieces.filter(piece => piece.props.color === color);
    assert.equal(army.length, 16);
    for (const [type, count] of Object.entries({ king: 1, queen: 1, rook: 2, bishop: 2, knight: 2, pawn: 8 })) {
      assert.equal(army.filter(piece => piece.props.type === type).length, count, `${color} ${type}`);
    }
  }
  const ranks = [
    ['black', 0, ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']],
    ['black', 8, Array(8).fill('pawn')],
    ['white', 48, Array(8).fill('pawn')],
    ['white', 56, ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']],
  ];
  for (const [color, start, types] of ranks) {
    types.forEach((type, file) => assert.deepEqual(squares[start + file].props.children.props, { color, type }));
  }
});
