import { test, expect, beforeEach } from "@playwright/test";

test.describe("Index page", () => {
    const GEOJSON_SELECTOR = ".leaflet-pane path.geojson";

    test.beforeEach(async ({page}) => {
        await page.goto("/");
    });

    test("can see app title", async ({page}) => {
        await expect(await page.getByText("DengueMap")).toBeVisible();
    });

    test("background layer has been rendered", async ({page}) => {
        await expect(await page.locator(".leaflet-tile-pane")).toHaveCount(1);
    });

    test("geojson has been rendered", async ({page}) => {
        // do a very general test that some geojson regions have been rendered
        await expect(await page.locator(`:nth-match(${GEOJSON_SELECTOR}, 1)`)).toBeVisible();
        await expect(await page.locator(GEOJSON_SELECTOR).count()).toBeGreaterThan(10);
    });

    test("clicking on a geojson element selects country", async ({page}) => {
        // currently just check that clicking to select a country increases the number of rendered regions
        // (drills down to admin2 on selected country)
        const firstRegion = await page.locator(`:nth-match(${GEOJSON_SELECTOR}, 1)`);
        const allRegions = await page.locator(".leaflet-pane path.geojson");
        await expect(firstRegion).toBeVisible();
        const admin1Count = await allRegions.count();
        await firstRegion.click();
        await expect(firstRegion).toBeVisible(); // regions are removed before being re-rendered
        await expect(await allRegions.count()).toBeGreaterThan(admin1Count);
    });

    //test("changing selected indicator changes colours on map");

    //test("tooltips are shown");
});
