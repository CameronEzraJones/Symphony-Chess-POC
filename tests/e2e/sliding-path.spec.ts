import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import type { hasClearSlidingPath } from "../../app/sliding-path";

test('browser verifies blocked and cleared paths against the rendered board', async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.square')).toHaveCount(64);
  // Execute all three sliding-piece rules against rendered occupancy.
  // Bishop gameplay is also exercised by the interaction tests.
  const compiled = ts.transpileModule(readFileSync('app/sliding-path.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  await page.addScriptTag({ content: `window.pathRules = (() => { const exports = {}; ${compiled}; return exports; })();` });
  const results = await page.evaluate(() => {
    const rule = (window as unknown as {
      pathRules: { hasClearSlidingPath: typeof hasClearSlidingPath };
    }).pathRules.hasClearSlidingPath;
    const occupied = Array.from(document.querySelectorAll('.square'), square => !!square.querySelector('.piece'));
    return ([
      ['rook', 56, 32, 48, 'a1 → a4; pawn on a2'],
      ['bishop', 58, 40, 49, 'c1 → a3; pawn on b2'],
      ['queen', 59, 35, 51, 'd1 → d4; pawn on d2'],
    ] as const).map(([type, from, to, blocker, description]) => {
      const blocked = rule(type, from, to, square => occupied[square]);
      const cleared = [...occupied];
      cleared[blocker] = false;
      return { type, description, blocked, clear: rule(type, from, to, square => cleared[square]) };
    });
  });
  for (const result of results) {
    expect(result.blocked, result.description).toBe(false);
    expect(result.clear, result.description).toBe(true);
  }
  // Label the screenshot as test evidence, not an application move interface.
  await page.evaluate(results => {
    const report = document.createElement('section');
    report.setAttribute('aria-label', 'Automated path rule verification');
    report.style.cssText = 'padding:16px;background:white;border:1px solid #596a50;line-height:1.6';
    const title = document.createElement('strong');
    title.textContent = 'Automated path rule verification (browser harness)';
    report.append(title);
    for (const result of results) {
      const line = document.createElement('div');
      line.textContent = `${result.type}: ${result.description} — ${result.blocked ? 'FAIL' : 'BLOCKED'}; cleared fixture: ${result.clear ? 'CLEAR' : 'FAIL'}`;
      report.append(line);
    }
    document.querySelector('main')!.append(report);
  }, results);
  await page.screenshot({ path: 'docs/screenshots/sliding-path-verification.png', fullPage: true });
});
