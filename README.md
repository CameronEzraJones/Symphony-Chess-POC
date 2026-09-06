# Chessboard

A responsive 8 × 8 chessboard implementing FIDE Article 2.1: 64 equal squares alternate light and dark, with a light square at the near right corner for either player (bottom-right and top-left on screen).

Each side has the 16 pieces specified in FIDE Article 2.2: one king, one queen, two rooks, two bishops, two knights, and eight pawns, displayed in their starting positions. Pieces use the specified Unicode symbols, light/dark styling, and accessible names. Bishops can move any distance along an unobstructed diagonal, capture opposing pieces, and cannot land on friendly pieces. Select a bishop and then a highlighted destination using clicks, touch, or Tab and Enter/Space. Knights move two squares along one axis and one along the other (FIDE Article 3.6), jumping over intervening pieces. Select either color’s knight and a highlighted destination to move or capture an opposing piece. Friendly destinations are rejected. Select the same piece again to cancel. Other pieces do not move; turns and king safety are outside this movement-only implementation.

The starting position is preserved. Use **Practice bishop movement** to open the diagonals: a white bishop on d4, a black bishop on g7, and a friendly blocker on b2. **Reset starting position** restores all 32 pieces.

## Run

Requires Node.js 22 or later and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Verify

```sh
npm run build
npm run lint
npm run test:unit
npm run test:integration
npm run test:coverage
npx playwright install --with-deps chromium
npm run test:e2e
```

The end-to-end tests start the production server, verify piece symbols, counts, accessible names, visibility and fit, plus every square's dimensions, position and rendered color on desktop and mobile, and capture desktop and mobile screenshots. To use a locally installed Chrome, set `CHROME_PATH=/path/to/chrome`.

Coverage uses c8/V8 with source maps for all application components. CI publishes measured statement, branch, function and line totals in a `coverage` Check Run using the Symphony marker and the PR head SHA.

## Screenshots

Each CI run uploads desktop and mobile PNG screenshots in the `chessboard-screenshots` artifact on its Actions run page. Local end-to-end runs write the same images to `docs/screenshots/`.

![Desktop board with all 32 pieces](docs/screenshots/chessboard-desktop.png)

![Mobile board with all 32 pieces](docs/screenshots/chessboard-mobile.png)

## Bishop movement proof

![Selected bishop and legal diagonals](docs/screenshots/bishop-desktop-selected.png)

![Bishop after capturing on g7](docs/screenshots/bishop-desktop-moved.png)

Mobile proof is also captured in `docs/screenshots/bishop-mobile-selected.png` and `bishop-mobile-moved.png`.

## Knight movement proof

Browser tests verify valid and invalid moves, jumping over the starting pawns, captures, both colors, and keyboard controls on desktop and mobile.

![Selected knight on b1 with a3 and c3 highlighted](docs/screenshots/knight-selected-desktop.png)

![Knight moved from b1 to c3](docs/screenshots/knight-moved-desktop.png)

![Knight moved on mobile](docs/screenshots/knight-moved-mobile.png)
