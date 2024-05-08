import { render, screen } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test, vi, beforeEach, afterAll } from "vitest";
import Index from "@/pages/index.vue";
import router from "@/router";
import { flushPromises } from "@vue/test-utils";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockPinia } from "../mocks/mockPinia";
import { useAppStore } from "../../../src/stores/appStore";
import { PATHOGEN, VERSION } from "../../../src/router/utils";

const renderPage = async (indicator, country, pathogen = "dengue", version = "may24") => {
    await render(Index, {
        props: { pathogen, version, indicator, country },
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
        expect(await screen.findByText("Force of infection")).toBeVisible();
        expect(await screen.findByTestId("choropleth")).toBeVisible();
    });

    /*test("button click routes to selected indicator", async () => {
        // need to use real timers with userEvent...
        vi.useRealTimers();
        await renderPage("FOI");
        const p9Button = (await screen.findAllByRole("link"))[1];
        const user = userEvent.setup();
        await user.click(p9Button);
        expect(spyRouterPush).toHaveBeenCalledWith("/dengue/may24/serop9/");
    });*/

    test("selects indicator from props", async () => {
        await renderPage("serop9");
        expect(useAppStore().selectedIndicator).toBe("serop9");
    });

    test("selects country from props", async () => {
        await renderPage("serop9", "TZA");
        const { selectedIndicator, selectCountry } = useAppStore();
        vi.runAllTimers();
        expect(selectCountry).toHaveBeenCalledWith("TZA");
        expect(selectedIndicator).toBe("serop9");
    });

    test("does not unselect country if no country prop, and none set in store", async () => {
        await renderPage("serop9");
        const { selectedIndicator, selectCountry } = useAppStore();
        vi.runAllTimers();
        expect(selectCountry).not.toHaveBeenCalled();
        expect(selectedIndicator).toBe("serop9");
    });

    test("unselects country if empty country prop, and country is set in store", async () => {
        await render(Index, {
            props: { pathogen: PATHOGEN, version: VERSION, indicator: "serop9", country: "" },
            global: {
                plugins: [mockVuetify, mockPinia({ selectedCountryId: "MWI" }), router],
                stubs: {
                    Choropleth: true
                }
            }
        });
        const { selectedIndicator, selectCountry } = useAppStore();
        vi.runAllTimers();
        expect(selectCountry).toHaveBeenCalledWith("");
        expect(selectedIndicator).toBe("serop9");
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
