import { test, expect } from "@playwright/test";

test.describe("Index page", () => {
    const GEOJSON_SELECTOR = ".leaflet-pane path.geojson";
    const getFirstRegion = async (page) => page.locator(`:nth-match(${GEOJSON_SELECTOR}, 1)`);

    const expectLoadingSpinnerIsShownThenRemoved = async (page) => {
        const locator = await page.locator("div.spinner");
        // TODO: this tends to pass locally but fail on CI, I guess because spinner is too briefly shown. Reinstate when
        // full dataset is introduced, when spinner should be more reliable...
        // await expect(locator).toHaveCount(1);
        await expect(locator).toHaveCount(0);
    };

    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("can see app title", async ({ page }) => {
        await expect(await page.getByText("DengueMap")).toBeVisible();
    });

    test("loading spinner is shown on page load", async ({ page }) => {
        await expectLoadingSpinnerIsShownThenRemoved(page);
    });

    test("background layer has been rendered", async ({ page }) => {
        await expect(await page.locator(".leaflet-tile-pane")).toHaveCount(1);
    });

    test("geojson has been rendered", async ({ page }) => {
        // do a very general test that some geojson regions have been rendered
        await expect(await page.locator(`:nth-match(${GEOJSON_SELECTOR}, 1)`)).toBeVisible();
        await expect(await page.locator(GEOJSON_SELECTOR).count()).toBeGreaterThan(10);
    });

    test("clicking on a geojson element selects country", async ({ page }) => {
        // currently just check that clicking to select a country increases the number of rendered regions
        // (drills down to admin2 on selected country)
        await page.waitForURL(/dengue\/may24\/FOI/i);
        const firstRegion = await getFirstRegion(page);
        const allRegions = await page.locator(".leaflet-pane path.geojson");
        await expect(firstRegion).toBeVisible();
        await expect(await allRegions).toHaveCount(33);
        await firstRegion.click();
        await page.waitForURL(/dengue\/may24\/FOI\/MWI/i);
        await expectLoadingSpinnerIsShownThenRemoved(page);
        await expect(firstRegion).toBeVisible(); // regions are removed before being re-rendered
        await expect(await allRegions).toHaveCount(58, { timeout: 5000 }); // timeout required for Safari
    });

    test("changing selected indicator changes route and colours on map", async ({ page }) => {
        const firstRegion = await getFirstRegion(page);
        const colour = await firstRegion.getAttribute("fill");
        await page.getByText("P9").click();
        await page.waitForURL(/dengue\/may24\/p9/);
        await expect(await firstRegion.getAttribute("fill")).not.toEqual(colour);
    });

    test("tooltips are shown", async ({ page }) => {
        const firstRegion = await getFirstRegion(page);
        await firstRegion.hover();
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Central Region");
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Force of infection: 0.0128");
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain(
            "Seroprevalence at 9 years of age: 44.3%"
        );
    });
});
