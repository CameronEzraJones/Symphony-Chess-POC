"use client";

import { useState } from "react";
import Piece from "./piece";
import { movePiece, squareName, startingBoard } from "./movement";

export default function Chessboard() {
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a piece, then a destination square.");

  function selectSquare(index: number) {
    if (selected === null) {
      if (board[index]) {
        setSelected(index);
        setMessage(`${squareName(index)} selected. Choose a destination, or select it again to cancel.`);
      }
      return;
    }
    if (selected === index) {
      setSelected(null);
      setMessage("Select a piece, then a destination square.");
      return;
    }
    const next = movePiece(board, selected, index);
    if (next === board) {
      setMessage(board[index]?.color === board[selected]?.color
        ? "You cannot move onto a piece of the same colour."
        : "That piece cannot move to this square.");
      return;
    }
    const captured = board[index];
    setMessage(`${squareName(selected)} to ${squareName(index)}${captured ? `: captured ${captured.color} ${captured.type}` : ""}.`);
    setBoard(next);
    setSelected(null);
  }

  return (
    <>
      <div className="chessboard" role="group" aria-label={`Chessboard: ${board.filter(p => p?.color === "white").length} white pieces and ${board.filter(p => p?.color === "black").length} black pieces.`}>
        {board.map((piece, index) => (
          <button
            key={index}
            type="button"
            className={`square square--${(Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark"}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}`}
            aria-pressed={selected === index}
            onClick={() => selectSquare(index)}
          >
            {piece && <Piece {...piece} />}
          </button>
        ))}
      </div>
      <p className="board-status" role="status">{message}</p>
    </>
  );
}
