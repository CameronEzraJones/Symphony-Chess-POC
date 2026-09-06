import { backRank, type PieceColor, type PieceType } from "./piece";

export type BoardPiece = { color: PieceColor; type: PieceType };
export type Board = readonly (BoardPiece | null)[];

export function startingBoard(): Board {
  return Array.from({ length: 64 }, (_, index) => {
    const row = Math.floor(index / 8);
    const type = row === 0 || row === 7 ? backRank[index % 8]
      : row === 1 || row === 6 ? "pawn" : null;
    return type ? { color: row < 2 ? "black" : "white", type } : null;
  });
}

export function rookPractice(): Board {
  const board: (BoardPiece | null)[] = Array(64).fill(null);
  board[35] = { color: "white", type: "rook" }; // d4
  board[19] = { color: "black", type: "pawn" }; // d6
  board[38] = { color: "white", type: "pawn" }; // g4
  board[7] = { color: "black", type: "rook" }; // h8
  return board;
}

export function squareName(index: number): string {
  return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
}

export function canMoveRook(board: Board, from: number, to: number): boolean {
  if (board.length !== 64 || !Number.isInteger(from) || !Number.isInteger(to)
    || from < 0 || from >= 64 || to < 0 || to >= 64 || from === to) return false;
  const piece = board[from];
  if (piece?.type !== "rook" || board[to]?.color === piece.color) return false;
  const sameRank = Math.floor(from / 8) === Math.floor(to / 8);
  if (!sameRank && from % 8 !== to % 8) return false;
  const step = Math.sign(to - from) * (sameRank ? 1 : 8);
  for (let square = from + step; square !== to; square += step) {
    if (board[square]) return false;
  }
  return true;
}

export function moveRook(board: Board, from: number, to: number): Board {
  if (!canMoveRook(board, from, to)) return board;
  const next = [...board];
  next[to] = next[from];
  next[from] = null;
  return next;
}
