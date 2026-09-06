import { test, expect } from "@playwright/test";

test('starting queens are blocked and pawns cannot move', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'd2: white pawn', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Select a bishop or queen to move.');
  await page.getByRole('button', { name: 'd1: white queen', exact: true }).click();
  await expect(page.locator('[data-destination="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'd3: empty', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Invalid move');
  await expect(page.getByRole('button', { name: 'd1: white queen', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'd1: white queen', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('deselected');
});

for (const viewport of [{ width: 1280, height: 900, name: 'desktop' }, { width: 375, height: 800, name: 'mobile' }]) {
  test(`queen moves along files, ranks and diagonals on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: 'Queen practice', exact: true }).click();
    const square = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}(, legal destination)?$`) });
    await square('d4: white queen').focus();
    await page.keyboard.press('Enter');
    await expect(square('d4: white queen')).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({ path: `docs/screenshots/queen-selected-${viewport.name}.png`, fullPage: true });
    await square('e6: empty').click();
    await expect(page.getByRole('status')).toContainText('Invalid move');
    await expect(square('d4: white queen')).toBeVisible();
    await square('d7: empty').focus();
    await page.keyboard.press('Space');
    await expect(square('d7: white queen')).toBeVisible();
    await expect(square('d4: empty')).toBeVisible();
    await square('d7: white queen').click();
    await square('a7: empty').click();
    await expect(square('a7: white queen')).toBeVisible();
    await square('a7: white queen').click();
    await square('f2: empty').click();
    await expect(square('f2: white queen')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Queen moved from a7 to f2.');
    await page.screenshot({ path: `docs/screenshots/queen-moved-${viewport.name}.png`, fullPage: true });
    await square('h8: black queen').click();
    await square('h2: empty').click();
    await square('h2: black queen').click();
    await square('f2: white queen').click();
    await expect(square('f2: black queen')).toBeVisible();
    await expect(page.getByRole('img')).toHaveCount(1);
    await page.getByRole('button', { name: 'Reset starting position' }).click();
    await expect(page.getByRole('img')).toHaveCount(32);
    await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  });
}

test('shared board switches between bishops and queens and clears practice selection', async ({ page }) => {
  await page.goto('/');
  const square = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}:`) });
  await square('c1').click();
  await expect(square('c1')).toHaveAttribute('aria-pressed', 'true');
  await square('d1').click();
  await expect(square('c1')).toHaveAttribute('aria-pressed', 'false');
  await expect(square('d1')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Queen practice', exact: true }).click();
  await square('d4').tap();
  await square('d7').tap();
  await expect(square('d7')).toContainText('♕');
  await square('d7').click();
  await page.getByRole('button', { name: 'Practice bishop movement' }).click();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await square('d4').click();
  await square('g7').click();
  await expect(square('g7')).toContainText('♗');
});
