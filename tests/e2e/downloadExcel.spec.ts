import { test, expect, Page } from "@playwright/test";

test.describe("Excel download button", () => {
    const testCanDownloadFile = async (page: Page, expectedFilename: string, buttonLocator = "#download-excel-btn") => {
        const [download] = await Promise.all([
            // Start waiting for the download
            page.waitForEvent("download"),
            // Perform the action that initiates download
            page.click(buttonLocator)
        ]);
        // Wait for the download process to complete
        await download.path();

        expect(download.suggestedFilename()).toBe(expectedFilename);
    };

    test("can download global indicators without admin 2", async ({ page }) => {
        await page.goto("/");
        await page.click("#download-excel-btn");
        // Press 'No' from dialog
        await testCanDownloadFile(page, "arbomap_dengue_may24_GLOBAL_admin1.xlsx", "#confirm-excel-admin-1");
    });

    test("can download global indicators with admin 2", async ({ page }) => {
        await page.goto("/");
        await page.click("#download-excel-btn");
        // Press 'Yes' from dialog
        await testCanDownloadFile(page, "arbomap_dengue_may24_GLOBAL_admin2.xlsx", "#confirm-excel-admin-2");
    });

    test("can download country indicators", async ({ page }) => {
        await page.goto("/dengue/may24/FOI/MEX");
        await page.waitForURL(/dengue\/may24\/FOI\/MEX\/admin2/i);
        await testCanDownloadFile(page, "arbomap_dengue_may24_MEX.xlsx");
    });
});
