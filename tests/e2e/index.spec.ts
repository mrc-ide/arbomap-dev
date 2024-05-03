import { test, expect } from "@playwright/test";

test.describe("Index page", () => {
    const GEOJSON_SELECTOR = ".leaflet-pane path.geojson";
    const getNthRegion = async (page, n) => page.locator(`:nth-match(${GEOJSON_SELECTOR}, ${n})`);

    const expectLoadingSpinnerIsShownThenRemoved = async (page) => {
        const locator = await page.locator("div.spinner");
        await expect(locator).toHaveCount(1);
        await expect(locator).toHaveCount(0);
    };

    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("can see app title", async ({ page }) => {
        await expect(await page.getByText("DengueMap")).toBeVisible();
    });

    test("loading spinner is shown on page load", async ({ page }) => {
        // page load is too fast sometimes producing a flaky test as
        // loading spinner is not found, have to reload the page here
        page.goto("/");
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
        const firstRegion = await getNthRegion(page, 1);
        const allRegions = await page.locator(GEOJSON_SELECTOR);
        await expect(firstRegion).toBeVisible();
        await expect(await allRegions).toHaveCount(1833);
        const summary = await page.locator(".choropleth-data-summary");
        const globalBounds = await summary.getAttribute("bounds");
        await firstRegion.click();
        await page.waitForURL(/dengue\/may24\/FOI\/AGO/i);
        await expectLoadingSpinnerIsShownThenRemoved(page);
        await expect(await allRegions).toHaveCount(1978, { timeout: 5000 }); // timeout required for Safari
        const newBounds = await summary.getAttribute("bounds");
        expect(newBounds).not.toEqual(globalBounds);
    });

    test("changing selected indicator changes route and colours on map", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        const colour = await firstRegion.getAttribute("fill");
        const stroke = await firstRegion.getAttribute("stroke");
        await page.getByText("SEROP9").click();
        await page.waitForURL(/dengue\/may24\/serop9/);
        await expect(await firstRegion.getAttribute("fill")).not.toEqual(colour);
        await expect(await firstRegion.getAttribute("stroke")).not.toEqual(stroke);
    });

    test("tooltips are shown", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        await firstRegion.hover();
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Bengo");
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("FOI: 0.0134");
    });

    test("selecting country fades colours of other countries", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        const colour = await firstRegion.getAttribute("fill");
        const stroke = await firstRegion.getAttribute("stroke");
        const lastRegion = await getNthRegion(page, 1833);
        await lastRegion.click();
        await page.waitForURL(/dengue\/may24\/FOI\/ZWE/i);
        await expect(await page.locator("div.spinner")).toHaveCount(0);
        await expect(await firstRegion.getAttribute("fill")).not.toEqual(colour);
        await expect(await firstRegion.getAttribute("stroke")).not.toEqual(stroke);
    });

    test("link to GADM is shown", async ({ page }) => {
        const gadmLink = await page.getByText("GADM");
        await expect(await gadmLink.getAttribute("href")).toBe("https://gadm.org");
    });

    test("resetMapButton click navigates to home page from country URL", async ({ page }) => {
        await page.waitForURL(/dengue\/may24\/FOI/i);
        const allRegions = await page.locator(GEOJSON_SELECTOR);
        await expect(await allRegions).toHaveCount(1833);
        await page.goto("/dengue/may24/serop9/MWI");
        await expect(await allRegions).toHaveCount(2060);
        await page.locator('a[title="Reset map"]').click();
        await expect(await allRegions).toHaveCount(1833);
        await expect(page).toHaveURL("/dengue/may24/serop9");
    });
});
