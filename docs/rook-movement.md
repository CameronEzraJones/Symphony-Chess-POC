# Rook movement

Select a rook, then a highlighted square on the same rank or file. A rook cannot jump over pieces or land on a friendly piece; landing on an opposing piece captures it. Buttons support mouse, touch, Enter and Space.

The normal starting position remains available. Its rooks are blocked, so **Rook practice** opens a small position with both colors of rook, a friendly blocker on g4 and a capturable black pawn on d6. **Reset starting position** resets the board and selection.

This adds rook movement alongside the existing bishop movement, without turn enforcement, check validation or castling. Issue #8's title and quoted rook rule determine the scope; its reference to bishop movement is treated as a typo.

The Playwright suite captures these screenshots from the production build after verifying the position:

| Proof | Desktop | Mobile |
| --- | --- | --- |
| Selected rook and available destinations, after rejecting diagonal and blocked moves | [Screenshot](screenshots/rook-selected-desktop.png) | [Screenshot](screenshots/rook-selected-mobile.png) |
| Rook moved from d4 to d6 and captured the pawn | [Screenshot](screenshots/rook-capture-desktop.png) | [Screenshot](screenshots/rook-capture-mobile.png) |

Validation: `npm run build`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, and `npm run test:coverage`. Browser tests exercise horizontal and vertical movement, both colors, captures, invalid moves, deselection, reset and keyboard input on desktop and mobile. Unit tests check all 4,096 source/destination pairs for each color on an otherwise empty board, and blockers in all four directions. CI publishes measured statement, branch, function and line coverage as a `coverage` Check Run.
