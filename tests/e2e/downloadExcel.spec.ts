import { test, expect, Page } from "@playwright/test";

test.describe("Excel download button", () => {
    const testCanDownloadFile = async (page: Page, expectedFilename: string) => {
        const [download] = await Promise.all([
            // Start waiting for the download
            page.waitForEvent("download"),
            // Perform the action that initiates download
            page.click("#download-excel-btn")
        ]);
        // Wait for the download process to complete
        await download.path();

        expect(download.suggestedFilename()).toBe(expectedFilename);
    };

    test("can download global indicators", async ({ page }) => {
        await page.goto("/");
        await testCanDownloadFile(page, "arbomap_dengue_may24_GLOBAL.xlsx");
    });

    test("can download country indicators", async ({ page }) => {
        await page.goto("/dengue/may24/FOI/MEX");
        await page.waitForURL(/dengue\/may24\/FOI\/MEX\/admin2/i);
        await testCanDownloadFile(page, "arbomap_dengue_may24_MEX.xlsx");
    });
});
