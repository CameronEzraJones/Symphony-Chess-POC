"use client";

import { useState } from "react";
import Piece from "./piece";
import { type Board, canMoveRook, moveRook, rookPractice, squareName, startingBoard } from "./movement";

export function BoardView({ board = startingBoard(), selected = null, onSquare = () => {} }: {
  board?: Board;
  selected?: number | null;
  onSquare?: (index: number) => void;
}) {
  return (
    <div className="chessboard" role="group" aria-label="Chessboard: select a rook, then a square on its rank or file.">
      {board.map((piece, index) => {
        const color = (Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark";
        const destination = selected !== null && canMoveRook(board, selected, index);
        return (
          <button
            key={index}
            type="button"
            className={`square square--${color}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}${destination ? ", available move" : ""}`}
            aria-pressed={selected === index}
            data-destination={destination || undefined}
            onClick={() => onSquare(index)}
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
  const [message, setMessage] = useState("Select a rook. Try Rook practice to explore an open position.");

  function onSquare(index: number) {
    if (selected === index) {
      setSelected(null);
      setMessage("Selection cleared.");
    } else if (selected !== null && canMoveRook(board, selected, index)) {
      setBoard(moveRook(board, selected, index));
      setSelected(null);
      setMessage(`Rook moved from ${squareName(selected)} to ${squareName(index)}.`);
    } else if (board[index]?.type === "rook") {
      setSelected(index);
      setMessage(`Rook selected on ${squareName(index)}. Choose a highlighted square.`);
    } else {
      setMessage(selected === null ? "Select a rook to move." : "That move is unavailable. Choose a highlighted square.");
    }
  }

  function reset(practice: boolean) {
    setBoard(practice ? rookPractice() : startingBoard());
    setSelected(null);
    setMessage(practice ? "Rook practice: move along a rank or file. Pieces block the path; opposing pieces can be captured." : "Starting position restored. The rooks are blocked by their own pieces.");
  }

  return (
    <>
      <div className="board-controls">
        <button type="button" onClick={() => reset(true)}>Rook practice</button>
        <button type="button" onClick={() => reset(false)}>Starting position</button>
      </div>
      <BoardView board={board} selected={selected} onSquare={onSquare} />
      <p className="board-status" role="status">{message}</p>
    </>
  );
}
