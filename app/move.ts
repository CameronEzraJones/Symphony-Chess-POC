import { canMoveBishop } from "./bishop";
import { movePawn, type Position, type Promotion } from "./pawn";

// Share turn and en passant state when the existing bishop movement is used.
export function movePiece(position: Position, from: number, to: number, promotion?: Promotion): Position | null {
  if (position.board[from]?.type !== "bishop") return movePawn(position, from, to, promotion);
  if (position.board[from]?.color !== position.turn || promotion !== undefined
    || position.board[to]?.type === "king" || !canMoveBishop(position.board, from, to)) return null;
  const board = [...position.board];
  board[to] = board[from];
  board[from] = null;
  return { board, turn: position.turn === "white" ? "black" : "white", enPassant: null };
}
