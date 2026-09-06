export default function Chessboard() {
  return (
    <div
      className="chessboard"
      role="img"
      aria-label="Chessboard: 8 by 8 equal squares, alternating light and dark, with a light square at each player's near right corner."
    >
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const color = (row + column) % 2 === 0 ? "light" : "dark";

        return (
          <div
            key={index}
            className={`square square--${color}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
