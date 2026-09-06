"use client";

import { useState } from "react";
import Piece from "./piece";
import { type Board, startingBoard, practiceBoard, squareName, kingMoves, moveKing } from "./king";

export function BoardView({ board = startingBoard(), selected = null, moves = [], onSquare }: {
  board?: Board; selected?: number | null; moves?: number[]; onSquare?: (index: number) => void;
} = {}) {
  const initial = board.filter(Boolean).length === 32;
  return (
    <div className="chessboard" role="group" aria-label={initial
      ? "Chessboard: 16 white pieces and 16 black pieces in their starting positions."
      : "Chessboard: king movement practice."}>
      {board.map((piece, index) => (
        <button key={index} type="button"
          className={`square square--${(Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark"}`}
          aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}${moves.includes(index) ? ", legal move" : ""}`}
          aria-pressed={selected === index} data-legal={moves.includes(index)} onClick={() => onSquare?.(index)}>
          {piece && <Piece color={piece.color} type={piece.type} />}
        </button>
      ))}
    </div>
  );
}

export default function Chessboard() {
  const [board, setBoard] = useState(startingBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("Select either king. Only king moves are enabled.");
  const moves = selected === null ? [] : kingMoves(board, selected);
  function select(index: number) {
    if (selected !== null && moves.includes(index)) {
      setBoard(moveKing(board, selected, index)!);
      setMessage(`${board[selected]!.color} king moved from ${squareName(selected)} to ${squareName(index)}${Math.abs(index - selected) === 2 ? " (castling)" : ""}.`);
      setSelected(null);
    } else if (board[index]?.type === "king") {
      setSelected(index);
      setMessage(kingMoves(board, index).length ? "Choose a highlighted square." : "This king has no legal moves.");
    } else {
      setMessage(selected === null ? "Select a king to move." : "Illegal king move. Choose a highlighted square.");
    }
  }
  return <>
    <div className="controls">
      <button onClick={() => { setBoard(practiceBoard()); setSelected(null); setMessage("Practice: move either king or castle. Select a king."); }}>Practice king moves</button>
      <button onClick={() => { setBoard(startingBoard()); setSelected(null); setMessage("Starting position restored. Select either king."); }}>Reset board</button>
    </div>
    <p role="status">{message}</p>
    <BoardView board={board} selected={selected} moves={moves} onSquare={select} />
  </>;
}
