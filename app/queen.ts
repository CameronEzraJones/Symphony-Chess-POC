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

export function practiceBoard(): Board {
  const board: (BoardPiece | null)[] = Array(64).fill(null);
  board[35] = { color: "white", type: "queen" }; // d4
  board[7] = { color: "black", type: "queen" }; // h8
  return board;
}

export function squareName(index: number): string {
  return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
}

// Queen movement only: turn order and king safety are outside this feature.
export function canMoveQueen(board: Board, from: number, to: number): boolean {
  if (board.length !== 64 || !Number.isInteger(from) || !Number.isInteger(to)
    || from < 0 || from >= 64 || to < 0 || to >= 64 || from === to) return false;
  const piece = board[from];
  if (piece?.type !== "queen") return false;
  if (board[to]?.color === piece.color || board[to]?.type === "king") return false;

  const rowDelta = Math.floor(to / 8) - Math.floor(from / 8);
  const columnDelta = to % 8 - from % 8;
  if (rowDelta !== 0 && columnDelta !== 0 && Math.abs(rowDelta) !== Math.abs(columnDelta)) return false;
  const step = Math.sign(rowDelta) * 8 + Math.sign(columnDelta);
  for (let square = from + step; square !== to; square += step) {
    if (board[square]) return false;
  }
  return true;
}

export function moveQueen(board: Board, from: number, to: number): Board {
  if (!canMoveQueen(board, from, to)) return board;
  const next = [...board];
  next[to] = next[from];
  next[from] = null;
  return next;
}
