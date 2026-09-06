"use client";

import { useEffect, useRef, useState } from "react";
import Piece from "./piece";
import { movePawn, promotions, squareName, startingPosition, type Position, type Promotion } from "./pawn";

export default function Chessboard({ initialPosition }: { initialPosition?: Position } = {}) {
  const [position, setPosition] = useState(initialPosition ?? startingPosition);
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a pawn, then its destination.");
  const squares = useRef<(HTMLButtonElement | null)[]>([]);

  const focusAfterMove = useRef<number | null>(null);
  useEffect(() => {
    if (focusAfterMove.current !== null) squares.current[focusAfterMove.current]?.focus();
  }, [position]);

  function finish(to: number, promotion?: Promotion) {
    const next = movePawn(position, selected!, to, promotion);
    if (!next) {
      setMessage("That pawn cannot move there. Choose another square.");
      return;
    }
    setPosition(next);
    setMessage(`${position.turn === "white" ? "White" : "Black"} moved ${squareName(selected!)} to ${squareName(to)}${promotion ? ` and promoted to ${promotion}` : ""}.`);
    setSelected(null);
    setPending(null);
    focusAfterMove.current = to;
  }

  function choose(index: number) {
    if (pending !== null) return;
    if (selected === index) {
      setSelected(null);
      setMessage("Select a pawn, then its destination.");
      return;
    }
    const piece = position.board[index];
    if (piece?.color === position.turn && piece.type === "pawn") {
      setSelected(index);
      setMessage(`${squareName(index)} selected. Choose a destination.`);
    } else if (selected !== null) {
      const lastRank = Math.floor(index / 8) === (position.turn === "white" ? 0 : 7);
      if (lastRank && movePawn(position, selected, index, "queen")) {
        setPending(index);
        setMessage("Choose a piece to complete promotion.");
      } else finish(index);
    }
  }

  return (
    <>
      <p className="instructions">Move pawns by selecting a pawn and a destination. White moves first.</p>
      <div className="chessboard" role="group" aria-label="Chessboard: pawn movement">
        {position.board.map((piece, index) => (
          <button
            key={index}
            ref={element => { squares.current[index] = element; }}
            type="button"
            className={`square square--${(Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark"}`}
            aria-label={`${squareName(index)}: ${piece ? `${piece.color} ${piece.type}` : "empty"}`}
            aria-pressed={selected === index}
            disabled={pending !== null}
            onClick={() => choose(index)}
          >
            {piece && <Piece color={piece.color} type={piece.type} />}
          </button>
        ))}
      </div>
      <p role="status">{position.turn === "white" ? "White" : "Black"} to move. {message}</p>
      {pending !== null && (
        <div role="group" aria-label="Promotion" className="promotion">
          <span>Promote on {squareName(pending)}:</span>
          {promotions.map((type, index) => (
            <button key={type} type="button" ref={element => { if (index === 0) element?.focus(); }} onClick={() => finish(pending, type)}>
              {type}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
