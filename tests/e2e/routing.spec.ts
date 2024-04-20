import { test, expect } from "@playwright/test";

const BASE_URL = "/dengue/may24";
const expectIndexPage = async (
    page,
    url: string,
    selectedIndicator: string,
    selectedCountry: string,
    scale: string,
    featureCount: number,
    selectedCountryFeatureCount: number
) => {
    await page.waitForURL(new RegExp(`${BASE_URL}${url}`));
    await expect(await page.textContent("button.bg-blue")).toBe(selectedIndicator);
    const summary = await page.locator(".choropleth-data-summary");
    await expect(await summary.getAttribute("selected-indicator")).toBe(selectedIndicator);
    await expect(await summary.getAttribute("selected-country-id")).toBe(selectedCountry);
    await expect(await summary.getAttribute("colour-scale")).toBe(scale);
    await expect(await summary.getAttribute("feature-count")).toBe(featureCount.toString());
    await expect(await summary.getAttribute("selected-country-feature-count")).toBe(
        selectedCountryFeatureCount.toString()
    );
};

const expectDefaultView = async (page) => {
    await expectIndexPage(page, "/FOI", "FOI", "", "interpolateReds", 33, 0);
};

test.describe("Router", () => {
    test("browse to root redirects to base url with first indicator", async ({ page }) => {
        await page.goto("/");
        await expectDefaultView(page);
    });

    test("browse to /dengue redirects to base url with first indicator", async ({ page }) => {
        await page.goto("/dengue");
        await expectDefaultView(page);
    });

    test("browse to /dengue/may24 redirects to include first indicator", async ({ page }) => {
        await page.goto(BASE_URL);
        await expectDefaultView(page);
    });

    test("browse to indicator loads expected data", async ({ page }) => {
        await page.goto(`${BASE_URL}/p9`);
        await expectIndexPage(page, "/p9", "p9", "", "interpolateBlues", 33, 0);
    });

    test("browse to indicator and country loads expected data", async ({ page }) => {
        await page.goto(`${BASE_URL}/FOI/TZA`);
        await expectIndexPage(page, "/FOI/TZA", "FOI", "TZA", "interpolateReds", 173, 170);
    });

    test("is case-insensitive", async ({ page }) => {
        await page.goto("/DENGUE/May24/P9/tza");
        await expectIndexPage(page, "/dengue/may24/P9/TZA", "p9", "TZA", "interpolateBlues", 173, 170);
    });

    test("shows not found message when browse to non-existent route", async ({ page }) => {
        await page.goto("/route/does/not/exist");
        await expect(await page.getByText("Sorry, this page does not exist!")).toBeVisible();
        await expect(await page.getByText("Go to the DengueMap home page instead.")).toBeVisible();
        const link = await page.locator(".not-found a");
        await expect(await link.getAttribute("href")).toBe("/dengue/may24");
    });

    test("shows not found details when non-existent indicator", async ({ page }) => {
        await page.goto(`${BASE_URL}/notAnIndicator/TZA`);
        await expect(await page.getByText("Unknown indicator: notAnIndicator.")).toBeVisible();
    });

    test("shows not found details when non-existent country", async ({ page }) => {
        await page.goto(`${BASE_URL}/FOI/notAnISO`);
        await expect(await page.getByText("Unknown country: notAnISO.")).toBeVisible();
    });

    test("shows not found details when non-existent pathogen", async ({ page }) => {
        // Try for pathogen only, and when other route props specified
        await page.goto("/malaria");
        await expect(await page.getByText("Unknown pathogen: malaria.")).toBeVisible();

        await page.goto("/malaria/may24/FOI/MWI");
        await expect(await page.getByText("Unknown pathogen: malaria.")).toBeVisible();
    });

    test("shows not found details when non-existent version", async ({ page }) => {
        // Try for version only, and when other route props specified
        await page.goto("/dengue/may23");
        await expect(await page.getByText("Unknown version: may23.")).toBeVisible();

        await page.goto("/dengue/may23/FOI/MWI");
        await expect(await page.getByText("Unknown version: may23.")).toBeVisible();
    });

    test("shows not found details when non-existent indicator and country", async ({ page }) => {
        await page.goto(`${BASE_URL}/notAnIndicator/notAnISO`);
        await expect(
            await page.getByText("Unknown indicator: notAnIndicator. Unknown country: notAnISO.")
        ).toBeVisible();
    });
});
