const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startingBoard, practiceBoard, isAttacked, moveKing, kingMoves } = require('../../.test-build/king.js');
const piece = (type, color = 'black', moved = false) => ({ type, color, moved });
const position = (entries) => Object.assign(Array(64).fill(null), entries);

test('king moves to all eight neighbors, respecting edges, occupancy and captures', () => {
  const b = position({ 35: piece('king', 'white') });
  assert.deepEqual(kingMoves(b, 35), [26,27,28,34,36,42,43,44]);
  assert.deepEqual(kingMoves(position({0: piece('king')}), 0), [1,8,9]);
  b[36] = piece('pawn', 'white');
  assert.equal(moveKing(b,35,36), null);
  b[36] = piece('bishop');
  const next = moveKing(b,35,36);
  assert.equal(next[35], null);
  assert.equal(next[36].type, 'king');
  assert.equal(next[36].moved, true);
  assert.equal(b[36].type, 'bishop');
  for (const to of [-1,64,35,37,1.5]) assert.equal(moveKing(b,35,to),null);
  assert.equal(moveKing(b,12,13),null);
  assert.equal(moveKing(b,36,37),null);
  assert.deepEqual(kingMoves(startingBoard(),60),[]);
});

test('attack maps cover both pawn directions, knights, kings and blocked sliding rays', () => {
  for (const [type, from, target] of [['pawn',27,36],['knight',18,35],['king',27,36],['rook',3,35],['bishop',8,35],['queen',32,35]]) {
    const b = position({ [from]: piece(type) });
    assert.equal(isAttacked(b,target,'black'),true,type);
    assert.equal(isAttacked(b,target,'white'),false);
    assert.equal(isAttacked(b,from,'black'),false);
  }
  assert.equal(isAttacked(position({36:piece('pawn','white')}),27,'white'),true);
  assert.equal(isAttacked(position({27:piece('pawn')}),19,'black'),false);
  for (const type of ['rook','bishop','queen']) {
    const diagonal = type === 'bishop';
    const b = position({ [diagonal ? 8 : 3]: piece(type), [diagonal ? 17 : 19]: piece('pawn','white') });
    assert.equal(isAttacked(b,35,'black'),false,type);
  }
});

test('king cannot enter attacks, capture defended pieces, reveal a ray, or capture a king', () => {
  for (const [from, to, entries] of [
    [35,36,{19:piece('knight')}], [35,36,{27:piece('pawn')}],
    [35,36,{28:piece('king')}], [35,36,{4:piece('rook')}],
    [35,36,{9:piece('bishop')}], [35,36,{4:piece('rook'),36:piece('knight')}],
    [35,36,{32:piece('rook')}], [35,36,{36:piece('king')}],
  ]) {
    const b = position({[from]:piece('king','white'),...entries});
    assert.equal(moveKing(b,from,to),null,JSON.stringify(entries));
  }
  // A pinned knight still attacks f5.
  const b = position({4:piece('king'),20:piece('knight'),60:piece('rook','white'),38:piece('king','white')});
  assert.equal(moveKing(b,38,37),null);
});

for (const color of ['white','black']) for (const direction of [-1,1]) {
  const home = color === 'white' ? 60 : 4;
  const rook = home + (direction === 1 ? 3 : -4), to = home + direction * 2;
  const setup = () => position({[home]:piece('king',color),[rook]:piece('rook',color)});
  test(`${color} ${direction === 1 ? 'kingside' : 'queenside'} castling moves both pieces and preserves history`, () => {
    const b = setup(), next = moveKing(b,home,to);
    assert.equal(next[home],null); assert.equal(next[rook],null);
    assert.deepEqual(next[to],piece('king',color,true));
    assert.deepEqual(next[home+direction],piece('rook',color,true));
    assert.ok(b[home]); assert.ok(b[rook]);
    for (const index of [home,rook]) {
      const moved = setup(); moved[index].moved = true;
      assert.equal(moveKing(moved,home,to),null);
    }
    for (let i=home+direction;i!==rook;i+=direction) {
      const blocked=setup(); blocked[i]=piece('knight',color);
      assert.equal(moveKing(blocked,home,to),null);
    }
    for (const replacement of [null,piece('bishop',color),piece('rook',color==='white'?'black':'white')]) {
      const missing=setup();missing[rook]=replacement;
      assert.equal(moveKing(missing,home,to),null);
    }
    for (const square of [home,home+direction,to]) {
      const attacked=setup(); attacked[square+(color==='white'?-24:24)]=piece('rook',color==='white'?'black':'white');
      assert.equal(moveKing(attacked,home,to),null);
    }
  });
}

test('moving a king away and back permanently loses castling; rook attack alone does not prevent it', () => {
  let b = practiceBoard();
  b = moveKing(b,60,52); b = moveKing(b,52,60);
  assert.equal(moveKing(b,60,62),null);
  assert.ok(moveKing(practiceBoard(),60,62));
  assert.ok(moveKing(practiceBoard(),60,58));
  const offHome = position({52:piece('king','white'),55:piece('rook','white')});
  assert.equal(moveKing(offHome,52,54),null);
});
