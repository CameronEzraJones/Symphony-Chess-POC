import { kingMoves, squareName, startingBoard, type Board } from "./king";
import Piece from "./piece";
import { canMoveBishop } from "./bishop";

export function BoardView({ board = startingBoard(), selected = null, moves, onSquare }: {
  board?: Board;
  selected?: number | null;
  moves?: number[];
  onSquare?: (index: number) => void;
} = {}) {
  const king = selected !== null && board[selected]?.type === "king";
  const destinations = moves ?? (king ? kingMoves(board, selected!) : null);
  return (
    <div
      className="chessboard"
      role="group"
      aria-label="Chessboard: select a bishop or king, then a highlighted destination."
    >
      {board.map((piece, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const color = (row + column) % 2 === 0 ? "light" : "dark";
        const legal = destinations ? destinations.includes(index) : selected !== null && canMoveBishop(board, selected, index);
        return (
          <button
            type="button"
            key={index}
            className={`square square--${color}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}${legal ? (king ? ", legal move" : ", legal destination") : ""}`}
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

export default BoardView;
