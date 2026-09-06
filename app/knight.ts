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

export function canMoveKnight(board: Board, from: number, to: number): boolean {
  if (![from, to].every(index => Number.isInteger(index) && index >= 0 && index < 64)) return false;
  const piece = board[from];
  if (piece?.type !== "knight" || board[to]?.color === piece.color) return false;
  const ranks = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
  const files = Math.abs(from % 8 - to % 8);
  return (ranks === 2 && files === 1) || (ranks === 1 && files === 2);
}

export function moveKnight(board: Board, from: number, to: number): Board {
  if (!canMoveKnight(board, from, to)) return board;
  const next = [...board];
  next[to] = next[from];
  next[from] = null;
  return next;
}

export function squareName(index: number): string {
  return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
}
