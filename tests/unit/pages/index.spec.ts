import { render, screen } from "@testing-library/vue";
import { describe, expect, test, vi, beforeEach, afterAll } from "vitest";
import Index from "@/pages/index.vue";
import { flushPromises } from "@vue/test-utils";
import router from "@/router";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";
import { useAppStore } from "../../../src/stores/appStore";
import { PATHOGEN, VERSION } from "../../../src/router/utils";

const renderPage = async (
    indicator?: string,
    country: string = "",
    pathogen = "dengue",
    version = "may24",
    adminLevel = ""
) => {
    await render(Index, {
        props: { pathogen, version, indicator, country, adminLevel },
        global: {
            plugins: [mockVuetify, mockPinia(), router],
            stubs: {
                Choropleth: true
            }
        }
    });
};

const spyRouterReplace = vi.spyOn(router, "replace");

describe("Index page", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    test("renders as expected", async () => {
        await renderPage("FOI");
        expect(await screen.findByTestId("choropleth")).toBeVisible();
    });

    test("selects indicator from props", async () => {
        await renderPage("serop9");
        const { updateMapSettings } = useAppStore();
        vi.runAllTimers();
        expect(updateMapSettings).toHaveBeenCalledWith(mockMapSettings({ indicator: "serop9" }));
    });

    test("selects country from props", async () => {
        await renderPage("serop9", "TZA", "dengue", "may24", "admin2");
        const { updateMapSettings } = useAppStore();
        vi.runAllTimers();
        expect(updateMapSettings).toHaveBeenCalledWith(
            mockMapSettings({
                country: "TZA",
                indicator: "serop9",
                adminLevel: 2
            })
        );
    });

    test("unselects country if empty country prop, and country is set in store", async () => {
        await render(Index, {
            props: { pathogen: PATHOGEN, version: VERSION, indicator: "serop9", country: "" },
            global: {
                plugins: [mockVuetify, mockPinia({ mapSettings: mockMapSettings({ country: "MWI" }) }), router],
                stubs: {
                    Choropleth: true
                }
            }
        });
        const { updateMapSettings } = useAppStore();
        vi.runAllTimers();
        expect(updateMapSettings).toHaveBeenCalledWith(mockMapSettings({ indicator: "serop9" }));
    });

    test("routes to first indicator if none provided", async () => {
        await renderPage();
        await flushPromises();
        expect(spyRouterReplace).toHaveBeenCalledWith("/dengue/may24/FOI");
    });

    test("renders notFound if unknown indicator", async () => {
        await renderPage("NotAnIndicator");
        expect(await screen.findByText("Unknown indicator: NotAnIndicator.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });

    test("renders notFound if unknown country", async () => {
        await renderPage("FOI", "NotACountry");
        expect(await screen.findByText("Unknown country: NotACountry.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });

    test("renders notFound if unknown pathogen", async () => {
        await renderPage("FOI", "", "malaria");
        expect(await screen.findByText("Unknown pathogen: malaria.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });

    test("renders notFound if unknown version", async () => {
        await renderPage("FOI", "", "dengue", "may23");
        expect(await screen.findByText("Unknown version: may23.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });

    test("renders notFound if unknown indicator and unknown country", async () => {
        await renderPage("NotAnIndicator", "NotACountry");
        expect(
            await screen.findByText("Unknown indicator: NotAnIndicator. Unknown country: NotACountry.")
        ).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });
});
