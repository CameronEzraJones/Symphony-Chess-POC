import { test, expect, type Page } from "@playwright/test";
const square = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(`^${name}:`) });
async function move(page: Page, from: string, to: string) {
  await square(page, from).click();
  await square(page, to).click();
}

test('keyboard movement, turn enforcement, invalid moves and ordinary capture', async ({ page }) => {
  await page.goto('/');
  await move(page, 'a7', 'a6');
  await expect(square(page, 'a7')).toHaveAttribute('aria-label', 'a7: black pawn');
  await square(page, 'e2').focus();
  await page.keyboard.press('Enter');
  await square(page, 'e4').focus();
  await page.keyboard.press('Space');
  await expect(square(page, 'e2')).toHaveAttribute('aria-label', 'e2: empty');
  await move(page, 'd7', 'd5');
  await move(page, 'e4', 'e6');
  await expect(page.getByRole('status')).toContainText('cannot move');
  await move(page, 'e4', 'e4'); // deselect then reselect
  await square(page, 'd5').click();
  await expect(square(page, 'd5')).toHaveAttribute('aria-label', 'd5: white pawn');
  await expect(page.getByRole('img')).toHaveCount(31);
  await move(page, 'd8', 'd6');
  await expect(square(page, 'd8')).toHaveAttribute('aria-label', 'd8: black queen');
  await page.screenshot({ path: 'docs/screenshots/pawn-capture.png', fullPage: true });
});

test('en passant captures the pawn on its passed square', async ({ page }) => {
  await page.goto('/');
  for (const [from, to] of [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['e5', 'd6']]) await move(page, from, to);
  await expect(square(page, 'd5')).toHaveAttribute('aria-label', 'd5: empty');
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5: empty');
  await expect(square(page, 'd6')).toHaveAttribute('aria-label', 'd6: white pawn');
  await expect(page.getByRole('img')).toHaveCount(31);
  await page.screenshot({ path: 'docs/screenshots/pawn-en-passant.png', fullPage: true });
});

for (const type of ['queen', 'rook', 'bishop', 'knight']) {
  test(`promotion completes the capture with a ${type}`, async ({ page }) => {
    await page.goto('/');
    for (const [from, to] of [['a2', 'a4'], ['h7', 'h5'], ['a4', 'a5'], ['h5', 'h4'], ['a5', 'a6'], ['h4', 'h3'], ['a6', 'b7'], ['h3', 'g2'], ['b7', 'a8']]) await move(page, from, to);
    await expect(page.getByRole('group', { name: 'Promotion', exact: true })).toBeVisible();
    await expect(square(page, 'b7')).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('White to move');
    if (type === 'knight') await page.screenshot({ path: 'docs/screenshots/pawn-promotion-choice.png', fullPage: true });
    await page.getByRole('button', { name: type, exact: true }).click();
    await expect(square(page, 'a8')).toHaveAttribute('aria-label', `a8: white ${type}`);
    await expect(square(page, 'b7')).toHaveAttribute('aria-label', 'b7: empty');
    await expect(page.getByRole('status')).toContainText('Black to move');
    await expect(square(page, 'a8')).toBeFocused();
    if (type === 'knight') await page.screenshot({ path: 'docs/screenshots/pawn-promoted.png', fullPage: true });
  });
}


test('blocked advances and expired en passant leave the board and turn unchanged', async ({ page }) => {
  await page.goto('/');
  for (const [from, to] of [['e2', 'e4'], ['e7', 'e5']]) await move(page, from, to);
  await move(page, 'e4', 'e5');
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', 'e4: white pawn');
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5: black pawn');
  await expect(page.getByRole('status')).toContainText('White to move. That pawn cannot move');
  await page.reload();
  for (const [from, to] of [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['h2', 'h3'], ['a6', 'a5'], ['e5', 'd6']]) await move(page, from, to);
  await expect(square(page, 'd5')).toHaveAttribute('aria-label', 'd5: black pawn');
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5: white pawn');
  await expect(page.getByRole('status')).toContainText('White to move. That pawn cannot move');
});
