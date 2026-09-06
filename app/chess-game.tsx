"use client";

import { moveRook, rookPractice } from "./movement";
import { useState } from "react";
import Chessboard from "./chessboard";
import { moveBishop, practiceBoard, squareName, startingBoard } from "./bishop";

export default function ChessGame() {
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a rook or bishop, then a highlighted square.");

  function selectSquare(index: number) {
    if (selected !== null) {
      if (selected === index) {
        setSelected(null);
        setMessage("Selection cleared.");
        return;
      }
      const isRook = board[selected]?.type === "rook";
      const next = isRook ? moveRook(board, selected, index) : moveBishop(board, selected, index);
      if (next !== board) {
        setBoard(next);
        setSelected(null);
        setMessage(`${isRook ? "Rook" : "Bishop"} moved from ${squareName(selected)} to ${squareName(index)}.`);
        return;
      }
    }
    if ((board[index]?.type === "bishop" || board[index]?.type === "rook")) {
      setSelected(index);
      setMessage(`${board[index]?.type === "rook" ? "Rook" : "Bishop"} on ${squareName(index)} selected. Choose a highlighted square.`);
    } else {
      setMessage(selected === null ? "Select a rook or bishop to move." : "Invalid move: that destination is unavailable. Choose a highlighted square.");
    }
  }

  return (
    <>
      <div className="board-controls">
        <button type="button" onClick={() => {
          setBoard(rookPractice());
          setSelected(null);
          setMessage("Rook practice: move along a rank or file. Pieces block the path; opposing pieces can be captured.");
        }}>Rook practice</button>
        <button type="button" onClick={() => {
          setBoard(practiceBoard());
          setSelected(null);
          setMessage("Practice position. Either bishop can move; the pawn is a blocker.");
        }}>Practice bishop movement</button>
        <button type="button" onClick={() => {
          setBoard(startingBoard());
          setSelected(null);
          setMessage("Starting position. Rooks and bishops are blocked by their own pieces.");
        }}>Reset starting position</button>
      </div>
      <Chessboard board={board} selected={selected} onSquare={selectSquare} />
      <p className="board-status" role="status">{message}</p>
    </>
  );
}
