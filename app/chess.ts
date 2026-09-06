import { backRank, type PieceColor, type PieceType } from "./piece";

export type ChessPiece = { color: PieceColor; type: PieceType };
export type Board = readonly (ChessPiece | null)[];
export const opposite = (color: PieceColor): PieceColor => color === "white" ? "black" : "white";
export const squareName = (index: number) => `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
const onBoard = (index: number) => Number.isInteger(index) && index >= 0 && index < 64;

export function startingBoard(): Board {
  return Array.from({ length: 64 }, (_, index) => {
    const row = Math.floor(index / 8);
    const type = row === 0 || row === 7 ? backRank[index % 8]
      : row === 1 || row === 6 ? "pawn" : null;
    return type ? { color: row < 2 ? "black" : "white", type } : null;
  });
}

// Geometric attacks deliberately ignore the attacker's own king safety (FIDE 3.9).
export function attacks(board: Board, from: number, to: number): boolean {
  if (!onBoard(from) || !onBoard(to) || from === to || !board[from]) return false;
  const piece = board[from]!;
  const dr = Math.floor(to / 8) - Math.floor(from / 8);
  const dc = to % 8 - from % 8;
  switch (piece.type) {
    case "pawn": return dr === (piece.color === "white" ? -1 : 1) && Math.abs(dc) === 1;
    case "knight": return Math.abs(dr) * Math.abs(dc) === 2;
    case "king": return Math.max(Math.abs(dr), Math.abs(dc)) === 1;
    case "bishop": if (Math.abs(dr) !== Math.abs(dc)) return false; break;
    case "rook": if (dr !== 0 && dc !== 0) return false; break;
    case "queen": if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
  }
  const step = Math.sign(dr) * 8 + Math.sign(dc);
  for (let square = from + step; square !== to; square += step) {
    if (board[square]) return false;
  }
  return true;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const king = board.findIndex(piece => piece?.color === color && piece.type === "king");
  if (king === -1) throw new Error(`Missing ${color} king`);
  return board.some((piece, from) => piece?.color === opposite(color) && attacks(board, from, king));
}

// Ordinary moves only. Special moves need additional history and are outside this feature.
export function tryMove(board: Board, color: PieceColor, from: number, to: number): Board | null {
  if (!onBoard(from) || !onBoard(to) || from === to) return null;
  const piece = board[from];
  const target = board[to];
  if (!piece || piece.color !== color || target?.color === color || target?.type === "king") return null;
  if (piece.type === "pawn") {
    const direction = color === "white" ? -8 : 8;
    const startRow = color === "white" ? 6 : 1;
    const distance = to - from;
    if (target ? !attacks(board, from, to)
      : !(distance === direction || (distance === 2 * direction
        && Math.floor(from / 8) === startRow && !board[from + direction]))) return null;
    if (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7) return null;
  } else if (!attacks(board, from, to)) return null;
  const next = [...board];
  next[to] = piece;
  next[from] = null;
  return isInCheck(next, color) ? null : next;
}
