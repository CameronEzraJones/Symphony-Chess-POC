"use client";

import { useState } from "react";
import Chessboard from "./chessboard";
import { kingMoves, moveKing, practiceBoard as kingPracticeBoard, startingBoard, type Board } from "./king";
import { moveBishop, practiceBoard, squareName } from "./bishop";

export default function BishopGame() {
  const [board, setBoard] = useState<Board>(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a bishop or king, then a highlighted square.");

  function selectSquare(index: number) {
    if (selected !== null) {
      if (selected === index) {
        setSelected(null);
        setMessage("Selection cleared.");
        return;
      }
      const isKing = board[selected]?.type === "king";
      const next = isKing ? moveKing(board, selected, index) : moveBishop(board, selected, index);
      if (next && next !== board) {
        setBoard(next);
        setSelected(null);
        setMessage(isKing
          ? `${board[selected]!.color} king moved from ${squareName(selected)} to ${squareName(index)}${Math.abs(index - selected) === 2 ? " (castling)" : ""}.`
          : `Bishop moved from ${squareName(selected)} to ${squareName(index)}.`);
        return;
      }
    }
    if (board[index]?.type === "king") {
      setSelected(index);
      setMessage(kingMoves(board, index).length ? "Choose a highlighted square." : "This king has no legal moves.");
    } else if (board[index]?.type === "bishop") {
      setSelected(index);
      setMessage(`Bishop on ${squareName(index)} selected. Choose a highlighted diagonal square.`);
    } else {
      setMessage(selected === null ? "Select a bishop or king to move." : "Invalid move. Choose a highlighted square.");
    }
  }

  return (
    <>
      <div className="board-controls">
        <button type="button" onClick={() => {
          setBoard(kingPracticeBoard());
          setSelected(null);
          setMessage("Practice: move either king or castle. Select a king.");
        }}>Practice king moves</button>
        <button type="button" onClick={() => {
          setBoard(practiceBoard());
          setSelected(null);
          setMessage("Practice position. Either bishop can move; the pawn is a blocker.");
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
