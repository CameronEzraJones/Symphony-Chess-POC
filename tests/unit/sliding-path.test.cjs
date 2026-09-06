const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hasClearSlidingPath } = require('../../.test-build/sliding-path.js');

const directions = {
  bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
};
directions.queen = [...directions.bishop, ...directions.rook];

for (const [type, vectors] of Object.entries(directions)) {
  test(`${type}: every direction, distance and intervening blocker`, () => {
    for (let from = 0; from < 64; from++) {
      for (const [dr, dc] of vectors) {
        const path = [];
        for (let distance = 1; distance < 8; distance++) {
          const row = Math.floor(from / 8) + dr * distance;
          const col = from % 8 + dc * distance;
          if (row < 0 || row > 7 || col < 0 || col > 7) break;
          const to = row * 8 + col;
          const visited = [];
          assert.equal(hasClearSlidingPath(type, from, to, square => {
            visited.push(square);
            // Occupied endpoints are not intervening pieces.
            return square === from || square === to;
          }), true);
          assert.deepEqual(visited, path);
          for (const blocker of path) {
            for (const color of ['white', 'black']) {
              const board = new Map([[blocker, { color, type: 'pawn' }]]);
              assert.equal(hasClearSlidingPath(type, from, to, square => board.has(square)), false);
            }
          }
          path.push(to);
        }
      }
    }
  });
}

test('rejects invalid squares, zero moves, non-sliders and incorrect geometry', () => {
  const unused = () => assert.fail('invalid paths must not inspect occupancy');
  for (const bad of [-1, 64, 1.5, NaN, Infinity]) {
    assert.equal(hasClearSlidingPath('queen', bad, 27, unused), false);
    assert.equal(hasClearSlidingPath('queen', 27, bad, unused), false);
  }
  for (const [type, from, to] of [
    ['queen', 27, 27], ['bishop', 27, 29], ['rook', 27, 45],
    ['queen', 27, 44], ['bishop', 7, 8], ['rook', 7, 8],
    ['king', 27, 28], ['knight', 27, 44], ['pawn', 27, 35],
  ]) assert.equal(hasClearSlidingPath(type, from, to, unused), false);
});

test('ignores pieces outside the path and stops at the first blocker', () => {
  assert.equal(hasClearSlidingPath('rook', 0, 7, square => square === 8), true);
  const visited = [];
  assert.equal(hasClearSlidingPath('queen', 0, 63, square => {
    visited.push(square);
    return square === 18;
  }), false);
  assert.deepEqual(visited, [9, 18]);
});
