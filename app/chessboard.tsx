import { canMoveBishop } from "./bishop";
import Piece from "./piece";
import { type Board, startingBoard, squareName } from "./chess";

export default function Chessboard({ board = startingBoard(), selected = null, checkedKing = -1, onSquare, isLegal = canMoveBishop }: {
  isLegal?: (board: Board, from: number, to: number) => boolean;
  board?: Board;
  selected?: number | null;
  checkedKing?: number;
  onSquare?: (index: number) => void;
} = {}) {
  return (
    <div className="chessboard" role="group" aria-label="Chessboard: select a piece and its destination.">
      {board.map((piece, index) => {
        const color = (Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark";
        const legal = selected !== null && isLegal(board, selected, index);
        return (
          <button
            type="button"
            key={index}
            className={`square square--${color}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}${legal ? ", legal destination" : ""}${index === checkedKing ? ", in check" : ""}`}
            aria-pressed={selected === index}
            data-legal={legal || undefined}
            data-check={index === checkedKing || undefined}
            onClick={() => onSquare?.(index)}
          >
            {piece && <Piece color={piece.color} type={piece.type} />}
          </button>
        );
      })}
    </div>
  );
}
