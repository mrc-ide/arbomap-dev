import { test, expect } from "@playwright/test";

test("can see index page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("DengueMap")).toBeVisible();
});
