"use client";

import { useState } from "react";
import BishopGame from "./bishop-game";
import Chessboard from "./chessboard";
import { isInCheck, opposite, startingBoard, tryMove } from "./chess";
import type { PieceColor } from "./piece";

export default function Game() {
  const [practice, setPractice] = useState(false);
  const [board, setBoard] = useState(startingBoard);
  const [turn, setTurn] = useState<PieceColor>("white");
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inCheck = isInCheck(board, turn);

  function select(index: number) {
    setError("");
    if (board[index]?.color === turn) {
      setSelected(index === selected ? null : index);
      return;
    }
    if (selected === null) return;
    const next = tryMove(board, turn, selected, index);
    if (!next) {
      setError("Illegal move. Your king must remain safe; if in check, you must resolve it.");
      return;
    }
    setBoard(next);
    setTurn(opposite(turn));
    setSelected(null);
  }

  if (practice) return <>
    <div className="board-controls"><button onClick={() => setPractice(false)}>Return to game</button></div>
    <BishopGame />
  </>;

  return <>
    <div className="board-controls"><button onClick={() => setPractice(true)}>Bishop practice</button></div>
    <p role="status">{turn === "white" ? "White" : "Black"} to move{inCheck ? " — Check!" : "."}</p>
    <Chessboard isLegal={(position, from, to) => tryMove(position, turn, from, to) !== null} board={board} selected={selected} onSquare={select}
      checkedKing={inCheck ? board.findIndex(piece => piece?.color === turn && piece.type === "king") : -1} />
    <p className="move-help">Select a piece, then its destination.</p>
    {error && <p role="alert">{error}</p>}
  </>;
}
