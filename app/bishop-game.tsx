"use client";

import { useState } from "react";
import Chessboard from "./chessboard";
import PawnGame from "./pawn-game";
import { moveBishop, practiceBoard, squareName, startingBoard } from "./bishop";

export default function BishopGame() {
  const [practice, setPractice] = useState(false);
  const [reset, setReset] = useState(0);
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a bishop, then a highlighted diagonal square.");

  function selectSquare(index: number) {
    if (selected !== null) {
      if (selected === index) {
        setSelected(null);
        setMessage("Selection cleared.");
        return;
      }
      const next = moveBishop(board, selected, index);
      if (next !== board) {
        setBoard(next);
        setSelected(null);
        setMessage(`Bishop moved from ${squareName(selected)} to ${squareName(index)}.`);
        return;
      }
    }
    if (board[index]?.type === "bishop") {
      setSelected(index);
      setMessage(`Bishop on ${squareName(index)} selected. Choose a highlighted diagonal square.`);
    } else {
      setMessage(selected === null ? "Select a bishop to move." : "Invalid move. Choose an unobstructed diagonal square.");
    }
  }

  return (
    <>
      <div className="board-controls">
        <button type="button" onClick={() => {
          setPractice(true);
          setBoard(practiceBoard());
          setSelected(null);
          setMessage("Practice position. Either bishop can move; the pawn is a blocker.");
        }}>Practice bishop movement</button>
        <button type="button" onClick={() => {
          setPractice(false);
          setReset(value => value + 1);
          setBoard(startingBoard());
          setSelected(null);
          setMessage("Starting position. Bishops are blocked by pawns.");
        }}>Reset starting position</button>
      </div>
      {practice ? <>
      <Chessboard board={board} selected={selected} onSquare={selectSquare} />
      <p className="board-status" role="status">{message}</p>
      </> : <PawnGame key={reset} />}
    </>
  );
}
