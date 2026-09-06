"use client";

import { useState } from "react";
import Chessboard from "./chessboard";
import { practiceBoard } from "./bishop";
import { movePiece, squareName, startingBoard } from "./movement";

export default function ChessGame() {
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
      <div className="board-controls">
        <button type="button" onClick={() => {
          setBoard(practiceBoard());
          setSelected(null);
          setMessage("Practice position. Select a piece, then a highlighted destination.");
        }}>Practice bishop movement</button>
        <button type="button" onClick={() => {
          setBoard(startingBoard());
          setSelected(null);
          setMessage("Starting position. Bishops are blocked by pawns.");
        }}>Reset starting position</button>
      </div>
      <Chessboard board={board} selected={selected} onSquare={selectSquare} />
      <p className="board-status" role="status">{message}</p>
    </>
  );
}
