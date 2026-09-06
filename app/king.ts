import { backRank, type PieceColor, type PieceType } from "./piece";

export type ChessPiece = { color: PieceColor; type: PieceType; moved?: boolean };
export type Board = readonly (ChessPiece | null)[];
export const squareName = (index: number) => `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
export function startingBoard(): Board {
  return Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8);
    const type = row === 0 || row === 7 ? backRank[i % 8] : row === 1 || row === 6 ? "pawn" : null;
    return type ? { color: row < 2 ? "black" : "white", type } : null;
  });
}
export function practiceBoard(): Board {
  const board: (ChessPiece | null)[] = Array(64).fill(null);
  for (const [index, color, type] of [
    [4, "black", "king"], [0, "black", "rook"], [7, "black", "rook"],
    [60, "white", "king"], [56, "white", "rook"], [63, "white", "rook"],
  ] as const) board[index] = { color, type };
  return board;
}

// Attacks are geometric, even when the attacking piece is pinned to its king.
export function isAttacked(board: Board, target: number, by: PieceColor): boolean {
  return board.some((piece, from) => {
    if (!piece || piece.color !== by || from === target) return false;
    const dr = Math.floor(target / 8) - Math.floor(from / 8);
    const dc = target % 8 - from % 8;
    const ar = Math.abs(dr), ac = Math.abs(dc);
    if (piece.type === "pawn") return dr === (by === "white" ? -1 : 1) && ac === 1;
    if (piece.type === "knight") return ar * ac === 2;
    if (piece.type === "king") return Math.max(ar, ac) === 1;
    const diagonal = ar === ac;
    const straight = dr === 0 || dc === 0;
    if (!(piece.type === "queen" ? diagonal || straight : piece.type === "rook" ? straight : diagonal)) return false;
    const step = Math.sign(dr) * 8 + Math.sign(dc);
    for (let i = from + step; i !== target; i += step) if (board[i]) return false;
    return true;
  });
}

export function moveKing(board: Board, from: number, to: number): Board | null {
  if (![from, to].every(i => Number.isInteger(i) && i >= 0 && i < 64) || from === to) return null;
  const king = board[from], destination = board[to];
  if (!king || king.type !== "king" || destination?.color === king.color || destination?.type === "king") return null;
  const enemy = king.color === "white" ? "black" : "white";
  const dr = Math.floor(to / 8) - Math.floor(from / 8), dc = to % 8 - from % 8;
  const next = board.slice();
  next[from] = null;
  next[to] = { ...king, moved: true };
  if (Math.max(Math.abs(dr), Math.abs(dc)) === 1) return isAttacked(next, to, enemy) ? null : next;
  const home = king.color === "white" ? 60 : 4;
  if (from !== home || king.moved || dr !== 0 || Math.abs(dc) !== 2) return null;
  const direction = Math.sign(dc), rookSquare = home + (direction === 1 ? 3 : -4);
  const rook = board[rookSquare];
  if (!rook || rook.type !== "rook" || rook.color !== king.color || rook.moved) return null;
  for (let i = from + direction; i !== rookSquare; i += direction) if (board[i]) return null;
  if (isAttacked(board, from, enemy)) return null;
  const crossing = board.slice();
  crossing[from] = null;
  crossing[from + direction] = king;
  if (isAttacked(crossing, from + direction, enemy)) return null;
  next[rookSquare] = null;
  next[from + direction] = { ...rook, moved: true };
  return isAttacked(next, to, enemy) ? null : next;
}
export function kingMoves(board: Board, from: number): number[] {
  return Array.from({ length: 64 }, (_, to) => to).filter(to => moveKing(board, from, to) !== null);
}
