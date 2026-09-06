import { test, expect } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 900, name: "desktop" },
  { width: 375, height: 667, name: "mobile" },
]) {
  test(`board geometry, colors and pieces on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page).toHaveTitle("Chessboard");
    await expect(page.getByRole("group", { name: /^Chessboard:/ })).toBeVisible();
    const squares = page.locator(".square");
    await expect(squares).toHaveCount(64);
    const pieces = page.getByRole("img");
    await expect(pieces).toHaveCount(32);
    for (const color of ["white", "black"]) {
      for (const [type, count] of Object.entries({ king: 1, queen: 1, rook: 2, bishop: 2, knight: 2, pawn: 8 })) {
        await expect(page.getByRole("img", { name: `${color} ${type}`, exact: true })).toHaveCount(count);
      }
    }
    expect(await squares.allTextContents()).toEqual([
      ..."♜♞♝♛♚♝♞♜", ..."♟♟♟♟♟♟♟♟", ...Array(32).fill(""),
      ..."♙♙♙♙♙♙♙♙", ..."♖♘♗♕♔♗♘♖",
    ]);
    const pieceGeometry = await pieces.evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      const square = element.parentElement!.getBoundingClientRect();
      return { fits: rect.width > 0 && rect.height > 0 && rect.x >= square.x && rect.y >= square.y
        && rect.right <= square.right && rect.bottom <= square.bottom,
        color: getComputedStyle(element).color };
    }));
    for (const piece of pieceGeometry) expect(piece.fits).toBe(true);
    expect(new Set(pieceGeometry.map(piece => piece.color))).toEqual(new Set(["rgb(255, 255, 255)", "rgb(23, 26, 22)"]));
    const geometry = await squares.evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        color: getComputedStyle(element).backgroundColor };
    }));
    for (let index = 0; index < 64; index++) {
      const square = geometry[index];
      const row = Math.floor(index / 8);
      const column = index % 8;
      expect(square.width).toBeGreaterThan(0);
      expect(Math.abs(square.width - square.height)).toBeLessThan(1);
      expect(Math.abs(square.width - geometry[0].width)).toBeLessThan(1);
      expect(Math.abs(square.x - (geometry[0].x + column * geometry[0].width))).toBeLessThan(1);
      expect(Math.abs(square.y - (geometry[0].y + row * geometry[0].height))).toBeLessThan(1);
      expect(square.color).toBe((row + column) % 2 === 0 ? "rgb(240, 217, 181)" : "rgb(89, 106, 80)");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `docs/screenshots/chessboard-${viewport.name}.png`, fullPage: true });
  });
}

test('king interaction rejects blocked moves, supports keyboard moves, and castles both colors', async ({ page }) => {
  await page.goto('/');
  const square = (name: string) => page.getByRole('button', {name: new RegExp(`^${name}:`)});
  await square('e1').click();
  await expect(page.getByRole('status')).toHaveText('This king has no legal moves.');
  await square('e2').click();
  await expect(square('e1')).toHaveAttribute('aria-label','e1: white king');
  await page.getByRole('button', {name:'Practice king moves'}).click();
  await square('e1').focus();
  await page.keyboard.press('Enter');
  await expect(square('g1')).toHaveAttribute('data-legal','true');
  await page.screenshot({path:'docs/screenshots/king-legal-moves.png',fullPage:true});
  await square('g1').focus();
  await page.keyboard.press('Enter');
  await expect(square('g1')).toHaveAttribute('aria-label','g1: white king');
  await expect(square('f1')).toHaveAttribute('aria-label','f1: white rook');
  await expect(square('h1')).toHaveAttribute('aria-label','h1: empty');
  await expect(page.getByRole('status')).toContainText('(castling)');
  await square('e8').click();
  await square('c8').click();
  await expect(square('d8')).toHaveAttribute('aria-label','d8: black rook');
  await expect(square('c8')).toHaveAttribute('aria-label','c8: black king');
  await page.screenshot({path:'docs/screenshots/king-castling.png',fullPage:true});
  await square('g1').click();
  await square('g2').click();
  await expect(square('g2')).toHaveAttribute('aria-label','g2: white king');
  await page.getByRole('button',{name:'Reset board'}).click();
  await expect(page.getByRole('img')).toHaveCount(32);
});
