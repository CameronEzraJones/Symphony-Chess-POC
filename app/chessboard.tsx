import Piece from "./piece";
import { type Board, canMove, squareName, startingBoard } from "./movement";

export default function Chessboard({ board = startingBoard(), selected = null, onSquare }: {
  board?: Board;
  selected?: number | null;
  onSquare?: (index: number) => void;
} = {}) {
  return (
    <div
      className="chessboard"
      role="group"
      aria-label={`Chessboard: ${board.filter(p => p?.color === "white").length} white pieces and ${board.filter(p => p?.color === "black").length} black pieces.`}
    >
      {board.map((piece, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const color = (row + column) % 2 === 0 ? "light" : "dark";
        const legal = selected !== null && canMove(board, selected, index);
        return (
          <button
            type="button"
            key={index}
            className={`square square--${color}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}${legal ? ", legal destination" : ""}`}
            aria-pressed={selected === index}
            data-legal={legal || undefined}
            onClick={() => onSquare?.(index)}
          >
            {piece && <Piece color={piece.color} type={piece.type} />}
          </button>
        );
      })}
    </div>
  );
}
