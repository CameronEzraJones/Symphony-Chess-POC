import Piece, { backRank } from "./piece";

export default function Chessboard() {
  return (
    <div
      className="chessboard"
      role="group"
      aria-label="Chessboard: 16 white pieces and 16 black pieces in their starting positions."
    >
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const color = (row + column) % 2 === 0 ? "light" : "dark";
        const type = row === 0 || row === 7 ? backRank[column]
          : row === 1 || row === 6 ? "pawn" : null;

        return (
          <div
            key={index}
            className={`square square--${color}`}
          >
            {type && <Piece color={row < 2 ? "black" : "white"} type={type} />}
          </div>
        );
      })}
    </div>
  );
}
