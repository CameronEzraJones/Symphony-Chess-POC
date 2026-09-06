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

export function squareName(index: number): string {
  return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
}

function validSquare(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < 64;
}

// Capture geometry deliberately does not test whether the own king is exposed.
// Thus pinned pieces still attack squares (Article 3.1.3).
export function attacksSquare(board: Board, from: number, to: number): boolean {
  if (!validSquare(from) || !validSquare(to) || from === to) return false;
  const piece = board[from];
  if (!piece) return false;
  const dr = Math.floor(to / 8) - Math.floor(from / 8);
  const dc = to % 8 - from % 8;
  const ar = Math.abs(dr);
  const ac = Math.abs(dc);
  switch (piece.type) {
    case "pawn": return dr === (piece.color === "white" ? -1 : 1) && ac === 1;
    case "knight": return ar * ac === 2;
    case "king": return Math.max(ar, ac) === 1;
    case "bishop": if (ar !== ac) return false; break;
    case "rook": if (dr !== 0 && dc !== 0) return false; break;
    case "queen": if (ar !== ac && dr !== 0 && dc !== 0) return false; break;
  }
  const step = Math.sign(dr) * 8 + Math.sign(dc);
  for (let square = from + step; square !== to; square += step) {
    if (board[square]) return false;
  }
  return true;
}

export function canMove(board: Board, from: number, to: number): boolean {
  if (!validSquare(from) || !validSquare(to) || from === to) return false;
  const piece = board[from];
  if (!piece || board[to]?.color === piece.color) return false;
  if (piece.type !== "pawn" || board[to]) return attacksSquare(board, from, to);
  const step = piece.color === "white" ? -8 : 8;
  const startingRow = piece.color === "white" ? 6 : 1;
  return to === from + step || (
    Math.floor(from / 8) === startingRow && to === from + 2 * step && !board[from + step]
  );
}

// A capture replaces the opponent and clears the source in one immutable update.
export function movePiece(board: Board, from: number, to: number): Board {
  if (!canMove(board, from, to)) return board;
  const next = [...board];
  next[to] = next[from];
  next[from] = null;
  return next;
}
