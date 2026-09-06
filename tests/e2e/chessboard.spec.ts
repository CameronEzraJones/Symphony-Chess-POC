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

for (const mobile of [false, true]) {
  test(`rook movement, blocking, capture and reset ${mobile ? 'mobile' : 'desktop'}`, async ({ page }) => {
    await page.setViewportSize(mobile ? { width: 375, height: 812 } : { width: 1280, height: 1000 });
    await page.goto('/');
    const square = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}:`) });
    await square('a1').click();
    await expect(page.locator('[data-destination]')).toHaveCount(0);
    await square('a3').click();
    await expect(square('a1')).toHaveAttribute('aria-label', 'a1: white rook');
    await page.getByRole('button', { name: 'Rook practice', exact: true }).click();
    await square('d4').focus();
    await page.keyboard.press('Enter');
    await expect(square('d4')).toHaveAttribute('aria-pressed', 'true');
    await expect(square('d6')).toHaveAttribute('data-destination', 'true');
    for (const name of ['e5', 'g4', 'h4', 'd7']) {
      await square(name).click();
      await expect(square('d4')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('status')).toContainText('unavailable');
    }
    await page.screenshot({ path: `docs/screenshots/rook-selected-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    await square('a4').click();
    await expect(square('d4')).toHaveAttribute('aria-label', 'd4: empty');
    await expect(square('a4')).toHaveAttribute('aria-label', 'a4: white rook');
    await square('a4').click();
    await square('d4').click();
    await square('d4').click();
    await square('d6').focus();
    await page.keyboard.press('Space');
    await expect(square('d6')).toHaveAttribute('aria-label', 'd6: white rook');
    await expect(page.getByRole('img', { name: 'black pawn', exact: true })).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('Rook moved from d4 to d6.');
    await page.screenshot({ path: `docs/screenshots/rook-capture-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    await square('h8').click();
    await square('h1').click();
    await expect(square('h1')).toHaveAttribute('aria-label', 'h1: black rook');
    await square('h1').click();
    await square('h1').click();
    await expect(square('h1')).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Starting position', exact: true }).click();
    await expect(page.getByRole('img')).toHaveCount(32);
    await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  });
}
