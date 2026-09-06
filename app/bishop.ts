import { backRank, type PieceColor, type PieceType } from "./piece";
import { hasClearSlidingPath } from "./sliding-path";

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

export function practiceBoard(): Board {
  const board: (BoardPiece | null)[] = Array(64).fill(null);
  board[35] = { color: "white", type: "bishop" }; // d4
  board[14] = { color: "black", type: "bishop" }; // g7
  board[49] = { color: "white", type: "pawn" }; // b2
  return board;
}

export function squareName(index: number): string {
  return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
}

export function canMoveBishop(board: Board, from: number, to: number): boolean {
  if (![from, to].every(index => Number.isInteger(index) && index >= 0 && index < 64)) return false;
  const piece = board[from];
  if (piece?.type !== "bishop" || from === to) return false;
  if (board[to]?.color === piece.color) return false;
  return hasClearSlidingPath("bishop", from, to, index => Boolean(board[index]));
}

export function moveBishop(board: Board, from: number, to: number): Board {
  if (!canMoveBishop(board, from, to)) return board;
  const next = [...board];
  next[to] = next[from];
  next[from] = null;
  return next;
}
