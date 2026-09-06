"use client";

import { moveQueen, practiceBoard as queenPracticeBoard } from "./queen";
import { useState } from "react";
import Chessboard from "./chessboard";
import { moveBishop, practiceBoard, squareName, startingBoard } from "./bishop";

export default function BishopGame() {
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a bishop or queen, then a highlighted square.");

  function selectSquare(index: number) {
    if (selected !== null) {
      if (selected === index) {
        setSelected(null);
        setMessage("Piece deselected. Select a bishop or queen.");
        return;
      }
      const isQueen = board[selected]?.type === "queen";
      const next = isQueen ? moveQueen(board, selected, index) : moveBishop(board, selected, index);
      if (next !== board) {
        setBoard(next);
        setSelected(null);
        setMessage(`${isQueen ? "Queen" : "Bishop"} moved from ${squareName(selected)} to ${squareName(index)}.`);
        return;
      }
    }
    if ((board[index]?.type === "bishop" || board[index]?.type === "queen")) {
      setSelected(index);
      setMessage(`${board[index]?.type === "queen" ? "Queen" : "Bishop"} on ${squareName(index)} selected. Choose a highlighted square.`);
    } else {
      setMessage(selected === null ? "Select a bishop or queen to move." : "Invalid move. Choose a highlighted destination along a clear path.");
    }
  }

  return (
    <>
      <div className="board-controls">
        <button type="button" onClick={() => {
          setBoard(practiceBoard());
          setSelected(null);
          setMessage("Practice position. Either bishop can move; the pawn is a blocker.");
        }}>Practice bishop movement</button>
        <button type="button" onClick={() => {
          setBoard(queenPracticeBoard());
          setSelected(null);
          setMessage("Queen practice: select either queen to move along a file, rank or diagonal.");
        }}>Queen practice</button>
        <button type="button" onClick={() => {
          setBoard(startingBoard());
          setSelected(null);
          setMessage("Starting position. Bishops and queens are blocked by their own pieces.");
        }}>Reset starting position</button>
      </div>
      <Chessboard board={board} selected={selected} onSquare={selectSquare} />
      <p className="board-status" role="status">{message}</p>
    </>
  );
}
