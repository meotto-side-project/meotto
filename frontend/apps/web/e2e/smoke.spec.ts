import { expect, test } from "@playwright/test";

test("홈 페이지가 열린다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("멋토");
  await expect(page.getByRole("main")).toBeAttached();
});

test("API 목이 켜지면 MSW 워커가 활성화된다", async ({ page }) => {
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(
        () => navigator.serviceWorker.controller?.scriptURL ?? null,
      ),
    )
    .toContain("/mockServiceWorker.js");
});
