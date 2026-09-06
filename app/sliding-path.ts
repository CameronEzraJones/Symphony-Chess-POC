import type { PieceType } from "./piece";

/**
 * FIDE 3.5 path check, using row-major square indices (0 = a8, 63 = h1).
 * Only intervening squares are inspected. Destination ownership, captures,
 * turns and king safety must be checked separately by a move validator.
 */
export function hasClearSlidingPath(
  type: PieceType,
  from: number,
  to: number,
  isOccupied: (square: number) => boolean,
): boolean {
  if (!Number.isInteger(from) || !Number.isInteger(to)
    || from < 0 || from >= 64 || to < 0 || to >= 64 || from === to) return false;

  const rowDelta = Math.floor(to / 8) - Math.floor(from / 8);
  const columnDelta = to % 8 - from % 8;
  const diagonal = Math.abs(rowDelta) === Math.abs(columnDelta);
  const straight = rowDelta === 0 || columnDelta === 0;
  if (!(type === "bishop" && diagonal
    || type === "rook" && straight
    || type === "queen" && (diagonal || straight))) return false;

  const step = Math.sign(rowDelta) * 8 + Math.sign(columnDelta);
  for (let square = from + step; square !== to; square += step) {
    if (isOccupied(square)) return false;
  }
  return true;
}
