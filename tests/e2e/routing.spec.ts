import { test, expect } from "@playwright/test";

const BASE_URL = "/dengue/may24";
const expectIndexPage = async (
    page,
    url: string,
    selectedIndicatorId: string,
    selectedIndicatorName: string,
    selectedCountry: string,
    scale: string,
    featureCount: number,
    selectedCountryFeatureCount: number,
    selectedCountryName: string
) => {
    await page.waitForURL(new RegExp(`${BASE_URL}${url}`));
    await expect(await page.locator(".indicator-menu-activator-desktop")).toContainText(selectedCountryName)
    await expect(await page.locator(".indicator-menu-activator-desktop")).toContainText(selectedIndicatorName)
    if (selectedCountry) {
      await expect(await page.locator(".indicator-menu-activator-desktop")).toContainText("Admin 2")
    } else {
      await expect(await page.locator(".indicator-menu-activator-desktop")).not.toContainText("Admin")
    }
    const summary = await page.locator(".choropleth-data-summary");
    await expect(await summary).toHaveAttribute("selected-indicator", selectedIndicatorId);
    await expect(await summary).toHaveAttribute("selected-country-id", selectedCountry);
    await expect(await summary).toHaveAttribute("color-scale", scale);
    await expect(await summary).toHaveAttribute("feature-count", featureCount.toString());
    await expect(await summary).toHaveAttribute(
        "selected-country-feature-count",
        selectedCountryFeatureCount.toString()
    );
};

const expectDefaultView = async (page) => {
    await expectIndexPage(page, "/FOI", "FOI", "Force of infection", "", "interpolateBlues", 1915, 0, "Global");
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
        await page.goto(`${BASE_URL}/serop9`);
        await expectIndexPage(
            page,
            "/serop9",
            "serop9",
            "Seroprevalence at age 9 years",
            "",
            "interpolateGreens",
            1915,
            0,
            "Global"
        );
    });

    test("browse to indicator and country loads expected data", async ({ page }) => {
        await page.goto(`${BASE_URL}/FOI/TZA`);
        await expectIndexPage(
            page,
            "/FOI/TZA",
            "FOI",
            "Force of infection",
            "TZA",
            "interpolateBlues",
            2070,
            186,
            "Tanzania"
        );
    });

    test("browse to indicator and country at admin1 loads expected data", async ({ page }) => {
        await page.goto(`${BASE_URL}/FOI/VEN/admin1`);
        await expect(await page.textContent(".indicator-menu-activator-desktop")).toContain("Venezuela");
        await expect(await page.textContent(".indicator-menu-activator-desktop")).toContain("Force of infection");
        await expect(await page.textContent(".indicator-menu-activator-desktop")).toContain("Admin 1");
        const summary = await page.locator(".choropleth-data-summary");
        await expect(await summary).toHaveAttribute("color-scale", "interpolateBlues");
        await expect(await summary).toHaveAttribute("selected-country-id", "VEN");
        await expect(await summary).toHaveAttribute("feature-count", "1915");
        await expect(await summary).toHaveAttribute("selected-country-feature-count", "25");
    });

    test("is case-insensitive", async ({ page }) => {
        await page.goto("/DENGUE/May24/SEROP9/tza");
        await page.waitForURL(/\/dengue\/may24\/serop9\/TZA/);
        await expect(await page.textContent(".indicator-menu-activator-desktop")).toContain("Tanzania");
        await expect(await page.textContent(".indicator-menu-activator-desktop")).toContain("Seroprevalence at age 9 years");
        await expect(await page.textContent(".indicator-menu-activator-desktop")).toContain("Admin 2");
        const summary = await page.locator(".choropleth-data-summary");
        await expect(await summary).toHaveAttribute("color-scale", "interpolateGreens");
        await expect(await summary).toHaveAttribute("feature-count", "2070");
        await expect(await summary).toHaveAttribute("selected-country-feature-count", "186");
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
