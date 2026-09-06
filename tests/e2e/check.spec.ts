import { test, expect } from "@playwright/test";

test("check is announced, unrelated replies are rejected, and blocking clears check", async ({ page }) => {
  await page.goto("/");
  const square = (name: string) => page.getByRole("button", { name: new RegExp(`^${name}:`) });
  const move = async (from: string, to: string) => {
    await square(from).click();
    await square(to).click();
  };
  await move("e2", "e4");
  await move("d7", "d5");
  await move("f1", "b5");
  await expect(page.getByRole("status")).toHaveText("Black to move — Check!");
  await expect(square("e8")).toHaveAttribute("data-check", "true");
  await square("a7").click();
  await expect(square("a6")).not.toHaveAttribute("data-legal");
  await square("a6").click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Illegal move");
  await expect(square("a7")).toHaveAccessibleName("a7: black pawn");
  await expect(square("a6")).toHaveAccessibleName("a6: empty");
  await page.screenshot({ path: "docs/screenshots/check-rejected.png", fullPage: true });
  await square("c7").click();
  await expect(square("c6")).toHaveAttribute("data-legal", "true");
  await square("c6").click();
  await expect(page.getByRole("status")).toHaveText("White to move.");
  await expect(page.locator("[data-check]")).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await page.screenshot({ path: "docs/screenshots/check-resolved.png", fullPage: true });
});

test("a pinned piece cannot expose its king, including with keyboard controls", async ({ page }) => {
  await page.goto("/");
  const square = (name: string) => page.getByRole("button", { name: new RegExp(`^${name}:`) });
  for (const [from, to] of [["e2", "e4"], ["d7", "d5"], ["f1", "b5"], ["b8", "c6"], ["a2", "a3"]]) {
    await square(from).click();
    await square(to).click();
  }
  await square("c6").focus();
  await page.keyboard.press("Enter");
  await square("b4").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Illegal move");
  await expect(square("c6")).toHaveAccessibleName("c6: black knight");
  await expect(page.getByRole("status")).toHaveText("Black to move.");
  await page.screenshot({ path: "docs/screenshots/check-pinned.png", fullPage: true });
});


test("bishop practice preserves the game position and checking enforcement on return", async ({ page }) => {
  await page.goto("/");
  const square = (name: string) => page.getByRole("button", { name: new RegExp(`^${name}:`) });
  for (const [from, to] of [["e2", "e4"], ["d7", "d5"], ["f1", "b5"]]) {
    await square(from).click();
    await square(to).click();
  }
  await page.getByRole("button", { name: "Bishop practice", exact: true }).click();
  await page.getByRole("button", { name: "Practice bishop movement" }).click();
  await square("d4").click();
  await square("g7").click();
  await expect(square("g7")).toContainText("♗");
  await page.getByRole("button", { name: "Return to game" }).click();
  await expect(page.getByRole("status")).toHaveText("Black to move — Check!");
  await expect(square("b5")).toContainText("♗");
  await square("a7").click();
  await square("a6").click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Illegal move");
});
