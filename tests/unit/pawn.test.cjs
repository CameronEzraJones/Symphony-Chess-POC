const { test } = require('node:test');
const assert = require('node:assert/strict');
const { movePawn, startingPosition, promotions } = require('../../.test-build/pawn.js');
const at = name => (8 - Number(name[1])) * 8 + 'abcdefgh'.indexOf(name[0]);
function position(turn, pieces) {
  const board = Array(64).fill(null);
  for (const [square, color, type = 'pawn', hasMoved = false] of pieces) board[at(square)] = { color, type, hasMoved };
  return { board, turn, enPassant: null };
}
const move = (p, from, to, promotion) => movePawn(p, at(from), at(to), promotion);

for (const color of ['white', 'black']) {
  const opponent = color === 'white' ? 'black' : 'white';
  const [start, one, two, back, last, penultimate] = color === 'white' ? [2, 3, 4, 1, 8, 7] : [7, 6, 5, 8, 1, 2];
  test(`${color}: forward moves, blockers, first move and invalid directions`, () => {
    const p = position(color, [[`d${start}`, color]]);
    const snapshot = structuredClone(p);
    for (const rank of [one, two]) {
      const next = move(p, `d${start}`, `d${rank}`);
      assert.equal(next.board[at(`d${start}`)], null);
      assert.equal(next.board[at(`d${rank}`)].color, color);
      assert.equal(next.turn, opponent);
    }
    for (const square of [`d${back}`, `d${start}`, `e${start}`, `e${one}`, `d${last}`]) assert.equal(move(p, `d${start}`, square), null);
    for (const blockerColor of [color, opponent]) {
      for (const rank of [one, two]) {
        const blocked = position(color, [[`d${start}`, color], [`d${rank}`, blockerColor]]);
        assert.equal(move(blocked, `d${start}`, `d${two}`), null);
        if (rank === one) assert.equal(move(blocked, `d${start}`, `d${one}`), null);
      }
    }
    assert.equal(move(position(color, [[`d${start}`, color, 'pawn', true]]), `d${start}`, `d${two}`), null);
    assert.equal(move(position(color, [[`d${one}`, color]]), `d${one}`, `d${one + (color === 'white' ? 2 : -2)}`), null);
    assert.deepEqual(p, snapshot);
  });
  test(`${color}: diagonal captures on either side only against opponents`, () => {
    for (const file of ['c', 'e']) {
      const p = position(color, [[`d${start}`, color], [`${file}${one}`, opponent, 'rook']]);
      const result = move(p, `d${start}`, `${file}${one}`);
      assert.equal(result.board[at(`${file}${one}`)].type, 'pawn');
      assert.equal(result.board.filter(Boolean).length, 1);
      p.board[at(`${file}${one}`)].color = color;
      assert.equal(move(p, `d${start}`, `${file}${one}`), null);
    }
    assert.equal(move(position(color, [[`a${start}`, color], [`h${one}`, opponent]]), `a${start}`, `h${one}`), null);
  });
  test(`${color}: mandatory promotion to each allowed piece, with or without capture`, () => {
    for (const type of promotions) {
      for (const file of ['d', 'e']) {
        const p = position(color, [[`d${penultimate}`, color], ...(file === 'e' ? [[`e${last}`, opponent, 'rook']] : [])]);
        assert.equal(move(p, `d${penultimate}`, `${file}${last}`), null);
        const next = move(p, `d${penultimate}`, `${file}${last}`, type);
        assert.deepEqual(next.board[at(`${file}${last}`)], { color, type, hasMoved: true });
        assert.equal(next.board[at(`d${penultimate}`)], null);
        assert.equal(next.turn, opponent);
        for (const invalid of ['king', 'pawn', 'dragon']) assert.equal(move(p, `d${penultimate}`, `${file}${last}`, invalid), null);
      }
    }
    assert.equal(move(position(color, [[`d${start}`, color]]), `d${start}`, `d${one}`, 'queen'), null);
  });
  test(`${color}: en passant removes the passed pawn and expires after the next move`, () => {
    const rank = color === 'white' ? 5 : 4;
    const opponentStart = color === 'white' ? 7 : 2;
    const landing = color === 'white' ? 6 : 3;
    for (const file of ['c', 'e']) {
      const p = position(opponent, [[`d${rank}`, color], [`${file}${opponentStart}`, opponent], [`a${start}`, color], [`h${opponentStart}`, opponent]]);
      const advanced = move(p, `${file}${opponentStart}`, `${file}${rank}`);
      assert.equal(move(advanced, `d${rank}`, `d${rank}`), null);
      const captured = move(advanced, `d${rank}`, `${file}${landing}`);
      assert.equal(captured.board[at(`${file}${rank}`)], null);
      assert.equal(captured.board[at(`d${rank}`)], null);
      assert.equal(captured.board[at(`${file}${landing}`)].color, color);
      assert.equal(captured.enPassant, null);
      const delayed = move(move(advanced, `a${start}`, `a${one}`), `h${opponentStart}`, `h${opponentStart + (color === 'white' ? -1 : 1)}`);
      assert.equal(move(delayed, `d${rank}`, `${file}${landing}`), null);
      assert.equal(move({ ...advanced, enPassant: null }, `d${rank}`, `${file}${landing}`), null);
    }
  });
}

test('rejects empty origins, non-pawns, wrong turns, king captures and invalid coordinates', () => {
  const p = startingPosition();
  for (const [from, to] of [[-1, 0], [48, 64], [1.5, 2], [NaN, 2], [48, Infinity], [32, 24], [56, 40], [8, 16]]) assert.equal(movePawn(p, from, to), null);
  assert.equal(move(position('white', [['d4', 'white'], ['e5', 'black', 'king']]), 'd4', 'e5'), null);
});
