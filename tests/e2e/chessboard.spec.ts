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
  test(`selection, friendly rejection and capture with ${mobile ? 'mobile clicks' : 'keyboard'}`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const square = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}:`) });
    const select = async (name: string) => {
      if (mobile) await square(name).click();
      else { await square(name).focus(); await page.keyboard.press('Enter'); }
    };
    await select('e4');
    await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
    await select('e2');
    await select('e1');
    await expect(page.getByRole('status')).toHaveText('You cannot move onto a piece of the same colour.');
    await expect(square('e2')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('img')).toHaveCount(32);
    await page.screenshot({ path: `docs/screenshots/friendly-rejection-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    await select('e5');
    await expect(page.getByRole('status')).toHaveText('That piece cannot move to this square.');
    await select('e2');
    await expect(square('e2')).toHaveAttribute('aria-pressed', 'false');
    await select('e2'); await select('e4');
    await expect(square('e2')).toHaveAccessibleName('e2: empty');
    await select('d7'); await select('d5');
    await select('e4'); await select('d5');
    await expect(square('e4')).toHaveAccessibleName('e4: empty');
    await expect(square('d5')).toHaveAccessibleName('d5: white pawn');
    await expect(page.getByRole('img')).toHaveCount(31);
    await expect(page.getByRole('img', { name: 'black pawn', exact: true })).toHaveCount(7);
    await expect(page.getByRole('status')).toHaveText('e4 to d5: captured black pawn.');
    await expect(page.getByRole('group')).toHaveAccessibleName('Chessboard: 16 white pieces and 15 black pieces.');
    await page.screenshot({ path: `docs/screenshots/capture-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
  });
}

for (const mobile of [false, true]) {
  test(`bishop interaction with ${mobile ? "touch" : "keyboard"}`, async ({ page }) => {
    await page.setViewportSize(mobile ? { width: 375, height: 667 } : { width: 1280, height: 1000 });
    await page.goto("/");
    const square = (name: string) => page.getByRole("button", { name: new RegExp(`^${name}:`) });
    const activate = async (name: string) => {
      if (mobile) await square(name).tap();
      else { await square(name).focus(); await page.keyboard.press("Enter"); }
    };
    await activate("c1");
    await activate("e3");
    await expect(square("c1")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status")).toHaveText("That piece cannot move to this square.");
    await page.getByRole("button", { name: "Practice bishop movement" }).click();
    await activate("d4");
    await expect(square("g7")).toHaveAttribute("data-legal", "true");
    await expect(square("a1")).not.toHaveAttribute("data-legal");
    await page.screenshot({ path: `docs/screenshots/bishop-${mobile ? "mobile" : "desktop"}-selected.png`, fullPage: true });
    await activate("d5");
    await expect(square("d4")).toContainText("♗");
    await activate("b2");
    await activate("a1");
    await expect(square("d4")).toContainText("♗");
    await activate("g7");
    await expect(square("d4")).toBeEmpty();
    await expect(square("g7")).toContainText("♗");
    await expect(page.getByRole("status")).toHaveText("d4 to g7: captured black bishop.");
    await page.screenshot({ path: `docs/screenshots/bishop-${mobile ? "mobile" : "desktop"}-moved.png`, fullPage: true });
    await page.getByRole("button", { name: "Practice bishop movement" }).click();
    await activate("g7");
    await activate("h8");
    await expect(square("h8")).toContainText("♝");
    await activate("h8");
    await activate("h8");
    await expect(square("h8")).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Reset starting position" }).click();
    await expect(page.getByRole("img")).toHaveCount(32);
    await activate("a2");
    await expect(square("a2")).toHaveAttribute("aria-pressed", "true");
  });
}
