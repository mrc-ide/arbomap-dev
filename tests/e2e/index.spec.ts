import { test, expect, Page, Locator } from "@playwright/test";

test.describe("Index page", () => {
    const GEOJSON_SELECTOR = ".leaflet-pane path.geojson";
    const COUNTRY_OUTLINE_SELECTOR = ".leaflet-pane path.country-outline";
    const getNthRegion = async (page: Page, n: number): Promise<Locator> =>
        page.locator(`:nth-match(${GEOJSON_SELECTOR}, ${n})`);

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
        const color = await firstRegion.getAttribute("fill");
        const stroke = await firstRegion.getAttribute("stroke");
        // open menu
        await page.click(".indicator-menu-activator");
        // click menu item
        await page.getByText("Seroprevalence at 9 years of age").click();
        await page.waitForURL(/dengue\/may24\/serop9/);
        await expect(await firstRegion.getAttribute("fill")).not.toEqual(color);
        await expect(await firstRegion.getAttribute("stroke")).not.toEqual(stroke);
    });

    test("tooltips are shown", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        await firstRegion.hover();
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Bengo");
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Force of infection: 0.0455");
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain(
            "Seroprevalence at 9 years of age: 33.5%"
        );
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Hospital admissions: 126");
    });

    test("if no data, no data tooltip is shown", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 30);
        await firstRegion.hover();
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("Mendoza");
        await expect(await page.innerText(".leaflet-tooltip-pane")).toContain("No data");
    });

    test("selecting country fades colours of other countries", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        const color = await firstRegion.getAttribute("fill");
        const stroke = await firstRegion.getAttribute("stroke");
        const lastRegion = await getNthRegion(page, 1833);
        await lastRegion.click();
        await page.waitForURL(/dengue\/may24\/FOI\/ZWE/i);
        await expect(await page.locator("div.spinner")).toHaveCount(0);
        await expect(await firstRegion.getAttribute("fill")).not.toEqual(color);
        await expect(await firstRegion.getAttribute("stroke")).not.toEqual(stroke);
    });

    test("country outline is shown", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        await expect(await page.locator("div.spinner")).toHaveCount(0);
        await expect(await page.locator(COUNTRY_OUTLINE_SELECTOR)).toHaveCount(0);
        await firstRegion.click();
        await page.waitForURL(/dengue\/may24\/FOI\/AGO/i);
        await expect(await page.locator("div.spinner")).toHaveCount(0);
        await expect(await page.locator(COUNTRY_OUTLINE_SELECTOR)).toHaveCount(1);
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

    test("indicator menu renders as expected", async ({ page }) => {
        await page.click(".indicator-menu-activator");
        await expect(await page.locator(".v-menu .v-list-item").count()).toBe(3);
        const foiMenuItem = await page.locator(":nth-match(.v-menu .v-list-item, 1)");
        await expect(await foiMenuItem.locator(".v-list-item-title").innerText()).toBe("Force of infection");
        await expect(await foiMenuItem.locator(".v-list-item-subtitle").innerText()).toBe(
            "Annual per capita risk of dengue infection for a susceptible person"
        );
        const hospMenuItem = await page.locator(":nth-match(.v-menu .v-list-item, 3)");
        await expect(await hospMenuItem.locator(".v-list-item-title").innerText()).toBe("Hospital admissions");
        await expect(await hospMenuItem.locator(".v-list-item-subtitle").innerText()).toBe(
            "Annual number of hospital admissions per 100,000 population by age group"
        );

        const ageGroupButtons = await page.locator(".v-slide-group button");
        await expect(await ageGroupButtons.count()).toBe(21);
        await expect(await ageGroupButtons.first().innerText()).toBe("ALL AGES");
        await expect(await ageGroupButtons.nth(1).innerText()).toBe("0-4");
        await expect(await ageGroupButtons.last().innerText()).toBe("95-99");
    });

    test("clicking hospitalisation age group browses to indicator", async ({ page }) => {
        await page.click(".indicator-menu-activator");
        await page.locator(":nth-match(.v-slide-group button, 3)").click();
        await page.waitForURL(/dengue\/may24\/hosp_5_9/i);
    });

    test("after selecting country, user can't zoom out", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        await firstRegion.click();
        await expect(await page.locator("div.spinner")).toHaveCount(0);
        // zoom out is disabled in leaflet
        await expect(await page.locator(".leaflet-control-zoom-out.leaflet-disabled")).toHaveCount(1);
    });

    test("user can't zoom out after selecting country and changing indicator", async ({ page }) => {
        const firstRegion = await getNthRegion(page, 1);
        await firstRegion.click();
        await expect(await page.locator("div.spinner")).toHaveCount(0);
        await expect(await page.locator(".leaflet-control-zoom-out.leaflet-disabled")).toHaveCount(1);
        await page.click(".indicator-menu-activator");
        await page.locator(":nth-match(.v-menu .v-list-item, 2)").click();
        await page.waitForURL(/dengue\/may24\/serop9/);
        await expect(await page.locator(".leaflet-control-zoom-out.leaflet-disabled")).toHaveCount(1);
    });

    test("admin level toggle works", async ({ page }) => {
        const adminToggle = await page.locator("#admin-toggle");

        await expect(adminToggle).toHaveCount(0);

        const allRegions = await page.locator(GEOJSON_SELECTOR);
        const firstRegion = await getNthRegion(page, 1);
        await firstRegion.click();
        await page.waitForURL(/dengue\/may24\/FOI\/AGO\/admin2/i);

        await expect(await allRegions).toHaveCount(1978);

        await expect(adminToggle).toHaveCount(1);
        await adminToggle.getByRole("button", { name: "Admin 1" }).click();
        await page.waitForURL(/dengue\/may24\/FOI\/AGO\/admin1/i);

        await expect(await allRegions).toHaveCount(1833);
    });

    test("admin level defaults to 1 for countries with missing admin 2 data", async ({ page }) => {
        // ATG has missing admin level 2 data
        page.goto("dengue/may24/FOI/ATG");
        await page.waitForURL(/dengue\/may24\/FOI\/ATG\/admin1/i);
    });
});
