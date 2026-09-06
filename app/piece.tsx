export const pieceSymbols = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
} as const;

export type PieceColor = keyof typeof pieceSymbols;
export type PieceType = keyof (typeof pieceSymbols)[PieceColor];

export const backRank: readonly PieceType[] = [
  "rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook",
];

export default function Piece({ color, type }: { color: PieceColor; type: PieceType }) {
  return (
    <span className={`piece piece--${color}`} role="img" aria-label={`${color} ${type}`}>
      {pieceSymbols[color][type]}
    </span>
  );
}
