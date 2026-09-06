"use client";

import { useState } from "react";
import Piece from "./piece";
import { canMoveKnight, moveKnight, squareName, startingBoard } from "./knight";

export default function Chessboard() {
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a knight, then a highlighted square to move.");

  function choose(index: number) {
    if (selected !== null && canMoveKnight(board, selected, index)) {
      setBoard(moveKnight(board, selected, index));
      setMessage(`Knight moved from ${squareName(selected)} to ${squareName(index)}.`);
      setSelected(null);
    } else if (selected === index) {
      setSelected(null);
      setMessage("Select a knight, then a highlighted square to move.");
    } else if (board[index]?.type === "knight") {
      setSelected(index);
      setMessage(`${board[index].color} knight on ${squareName(index)} selected. Choose a highlighted square.`);
    } else {
      setMessage(selected === null ? "Select a knight to move." : "That square is not a valid knight destination. Choose a highlighted square.");
    }
  }

  return (
    <>
      <div className="chessboard" role="group" aria-label="Chessboard: knight movement">
        {board.map((piece, index) => {
          const color = (Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark";
          const destination = selected !== null && canMoveKnight(board, selected, index);
          return (
            <button
              key={index}
              type="button"
              className={`square square--${color}`}
              aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}${destination ? ", possible destination" : ""}`}
              aria-pressed={selected === index}
              data-destination={destination || undefined}
              onClick={() => choose(index)}
            >
              {piece && <Piece {...piece} />}
            </button>
          );
        })}
      </div>
      <p className="move-status" role="status">{message}</p>
    </>
  );
}
