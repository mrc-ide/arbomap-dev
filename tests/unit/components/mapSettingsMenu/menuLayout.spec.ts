import { render } from "@testing-library/vue";
import MenuLayout from "../../../../src/components/mapSettingsMenu/MenuLayout.vue";
import { mockVuetify } from "../../mocks/mockVuetify";
import { mockMapSettings, mockPinia } from "../../mocks/mockPinia";
import router from "../../../../src/router";

const spyRouterPush = vi.spyOn(router, "push");

const renderComponent = (country = "") => {
    const store = mockPinia({
        mapSettings: mockMapSettings(country ? { country, adminLevel: 2 } : { country, adminLevel: 1 }),
        admin0GeojsonFeature: country ? ({ properties: { COUNTRY: "Tanzania" } } as any) : null
    });
    return render(MenuLayout, {
        global: {
            plugins: [mockVuetify, store, router]
        }
    });
};

describe("MenuLayout", () => {
    test("renders as expected on global view", async () => {
        const { findByText } = renderComponent();
        expect(await findByText("Global")).toBeVisible();
        expect(await findByText("Seroprevalence at 9 years of age")).toBeVisible();
        expect(await findByText("Hospital admissions")).toBeVisible();
        expect(await findByText("All ages")).toBeVisible();
        expect(await findByText("0-4")).toBeVisible();
        expect(await findByText("5-9")).toBeVisible();
    });

    test("renders as expected on country selected view", async () => {
        const { findByText } = renderComponent("TZA");
        expect(await findByText("Tanzania")).toBeVisible();
        expect(await findByText("Admin 1")).toBeVisible();
        expect(await findByText("Admin 2")).toBeVisible();
        expect(await findByText("Seroprevalence at 9 years of age")).toBeVisible();
        expect(await findByText("Hospital admissions")).toBeVisible();
        expect(await findByText("All ages")).toBeVisible();
        expect(await findByText("0-4")).toBeVisible();
        expect(await findByText("5-9")).toBeVisible();
    });

    test("routes to selected indicator from indicator group menu item", async () => {
        const { findByText } = renderComponent();
        const menuItem = await findByText("Seroprevalence at 9 years of age");
        menuItem.click();
        expect(spyRouterPush).toHaveBeenCalledWith("/dengue/may24/serop9/");
    });

    test("routes to selected indicator from indicator group sub-indicator slide group item", async () => {
        const { findByText } = renderComponent();
        const sliderItem = await findByText("5-9");
        sliderItem.click();
        expect(spyRouterPush).toHaveBeenCalledWith("/dengue/may24/hosp_5_9/");
    });
});
