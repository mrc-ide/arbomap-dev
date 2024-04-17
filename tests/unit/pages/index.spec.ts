import { fireEvent, render, screen } from "@testing-library/vue";
import { describe, expect, test, vi, beforeEach} from "vitest";
import Index from "@/pages/index.vue";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockPinia } from "../mocks/mockPinia";
import router from "@/router";
import {flushPromises} from "@vue/test-utils";
import {useAppStore} from "../../../src/stores/appStore";

const store = mockPinia();
const renderPage = async (indicator, country) => {
    await render(Index, {
        props: { indicator, country },
        global: {
            plugins: [mockVuetify, mockPinia(), router],
            stubs: {
                Choropleth: true
            }
        }
    });
};

const spyRouterPush = vi.spyOn(router, "push");

describe("Index page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /*test("renders as expected", async () => {
        await renderPage();
        const indicatorButtons = await screen.findAllByRole("button");
        expect(indicatorButtons.length).toBe(2);
        expect((indicatorButtons[0] as HTMLButtonElement).textContent).toBe("FOI");
        expect((indicatorButtons[0] as HTMLButtonElement).classList).toContain("bg-blue");
        expect((indicatorButtons[1] as HTMLButtonElement).textContent).toBe("p9");
        expect((indicatorButtons[1] as HTMLButtonElement).classList).toContain("bg-black");
        expect(await screen.findByTestId("choropleth")).toBeVisible();
    });

    test("button click updates selected indicator", async () => {
        await renderPage();
        const p9Button = (await screen.findAllByRole("button"))[1];
        await fireEvent.click(p9Button);

        expect(store.state.value.app.selectedIndicator).toBe("p9");
    });*/

    test("selects indicator from props", async () => {
        await renderPage("p9");
        expect(useAppStore().selectedIndicator).toBe("p9");
    });

    test("selects country from props", async () => {
        await renderPage("p9", "TZA");
        const { selectedIndicator, selectCountry } = useAppStore();
        expect(selectCountry).toHaveBeenCalledWith("TZA");
        expect(selectedIndicator).toBe("p9");
    });

    test("unselects country if no country prop", async () => {
        await renderPage("p9");
        const { selectedIndicator, selectCountry } = useAppStore();
        expect(selectCountry).toHaveBeenCalledWith("");
        expect(selectedIndicator).toBe("p9");
    });

    test("routes to first indicator if none provided", async () => {
        await renderPage();
        await flushPromises();
        expect(spyRouterPush).toHaveBeenCalledWith("/FOI");
    });

    test("renders notFound if unknown indicator", async () => {
        await renderPage("NotAnIndicator");
        expect(await screen.findByText("Unknown indicator: NotAnIndicator.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });

    test("renders notFound if unknown country", async () => {
        await renderPage("FOI", "NotACountry");
        expect(await screen.findByText("Unknown country ISO: NotACountry.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });

    test("renders notFound if unknown indicator and unknown country", async () => {
        await renderPage("NotAnIndicator", "NotACountry");
        expect(await screen.findByText("Unknown indicator: NotAnIndicator. Unknown country ISO: NotACountry.")).toBeVisible();
        expect(await screen.queryAllByRole("button").length).toBe(0);
    });
});
