"use client";

import { useState } from "react";
import Piece from "./piece";
import { type Board, canMoveQueen, moveQueen, practiceBoard, squareName, startingBoard } from "./queen";

export function BoardView({ board, selected = null, onSquareClick }: {
  board: Board;
  selected?: number | null;
  onSquareClick?: (index: number) => void;
}) {
  return (
    <div
      className="chessboard"
      role="group"
      aria-label="Chessboard: select a queen, then a destination square."
    >
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const color = (row + column) % 2 === 0 ? "light" : "dark";
        const piece = board[index];

        return (
          <button
            type="button"
            key={index}
            className={`square square--${color}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}`}
            aria-pressed={selected === index}
            data-destination={selected !== null && canMoveQueen(board, selected, index)}
            onClick={() => onSquareClick?.(index)}
          >
            {piece && <Piece color={piece.color} type={piece.type} />}
          </button>
        );
      })}
    </div>
  );
}

export default function Chessboard() {
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a queen, then a highlighted square. Try queen practice for open paths.");

  function selectSquare(index: number) {
    if (selected === index) {
      setSelected(null);
      setMessage("Queen deselected. Select a queen.");
    } else if (selected !== null && canMoveQueen(board, selected, index)) {
      setBoard(moveQueen(board, selected, index));
      setMessage(`Queen moved from ${squareName(selected)} to ${squareName(index)}.`);
      setSelected(null);
    } else if (board[index]?.type === "queen") {
      setSelected(index);
      setMessage(`Queen on ${squareName(index)} selected. Choose a highlighted square.`);
    } else {
      setMessage(selected === null ? "Select a queen to move."
        : "Invalid move. Choose a clear file, rank or diagonal without landing on your own piece.");
    }
  }

  function reset(practice: boolean) {
    setBoard(practice ? practiceBoard() : startingBoard());
    setSelected(null);
    setMessage(practice ? "Queen practice: select either queen to move along a file, rank or diagonal."
      : "Starting position restored. The queens are blocked by their own pieces.");
  }

  return <>
    <BoardView board={board} selected={selected} onSquareClick={selectSquare} />
    <p className="board-status" role="status">{message}</p>
    <div className="board-controls">
      <button type="button" onClick={() => reset(true)}>Queen practice</button>
      <button type="button" onClick={() => reset(false)}>Reset starting position</button>
    </div>
  </>;
}
