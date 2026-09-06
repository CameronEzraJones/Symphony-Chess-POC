import { backRank, type PieceColor, type PieceType } from "./piece";

export type BoardPiece = { color: PieceColor; type: PieceType; hasMoved?: boolean };
export type Position = {
  board: (BoardPiece | null)[];
  turn: PieceColor;
  enPassant: { target: number; pawn: number } | null;
};
export const promotions = ["queen", "rook", "bishop", "knight"] as const;
export type Promotion = (typeof promotions)[number];
export const squareName = (index: number) => `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;

export function startingPosition(): Position {
  return {
    board: Array.from({ length: 64 }, (_, index) => {
      const row = Math.floor(index / 8);
      const type = row === 0 || row === 7 ? backRank[index % 8]
        : row === 1 || row === 6 ? "pawn" : null;
      return type ? { color: row < 2 ? "black" : "white", type } : null;
    }),
    turn: "white",
    enPassant: null,
  };
}

// Article 3.7 movement only; king safety and other pieces' moves are outside this feature.
// Invalid moves (including promotion without a choice) never mutate the position.
export function movePawn(position: Position, from: number, to: number, promotion?: Promotion): Position | null {
  if (![from, to].every(index => Number.isInteger(index) && index >= 0 && index < 64)) return null;
  const { board, turn, enPassant } = position;
  const piece = board[from];
  if (!piece || piece.type !== "pawn" || piece.color !== turn) return null;
  const direction = turn === "white" ? -1 : 1;
  const row = Math.floor(from / 8);
  const destinationRow = Math.floor(to / 8);
  const advance = (destinationRow - row) * direction;
  const fileDistance = Math.abs(to % 8 - from % 8);
  const target = board[to];
  let captured: number | null = null;
  if (fileDistance === 0 && !target) {
    if (advance !== 1 && !(advance === 2 && row === (turn === "white" ? 6 : 1)
      && !piece.hasMoved && !board[from + direction * 8])) return null;
  } else if (fileDistance === 1 && advance === 1) {
    if (target) {
      if (target.color === turn || target.type === "king") return null;
    } else {
      if (!enPassant || enPassant.target !== to || enPassant.pawn !== to - direction * 8) return null;
      const victim = board[enPassant.pawn];
      if (!victim || victim.type !== "pawn" || victim.color === turn) return null;
      captured = enPassant.pawn;
    }
  } else return null;
  const promotes = destinationRow === (turn === "white" ? 0 : 7);
  if (promotes ? !promotion || !promotions.includes(promotion) : promotion !== undefined) return null;
  const nextBoard = [...board];
  nextBoard[from] = null;
  if (captured !== null) nextBoard[captured] = null;
  nextBoard[to] = { color: turn, type: promotes ? promotion! : "pawn", hasMoved: true };
  return {
    board: nextBoard,
    turn: turn === "white" ? "black" : "white",
    enPassant: advance === 2 ? { target: from + direction * 8, pawn: to } : null,
  };
}
