import {fireEvent, render, screen} from "@testing-library/vue";
import { describe, expect, test } from "vitest";
import Index from "@/pages/index.vue";
import {mockVuetify} from "../mocks/mockVuetify";
import {mockPinia} from "../mocks/mockPinia";

const store = mockPinia();
const renderPage = () => {
    return render(Index,  {
        global: {
            plugins: [mockVuetify, store],
            stubs: {
                Choropleth: true
            }
        }
    });
};

describe("Index page", () => {
    test("renders as expected", async () => {
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
    });
});
