import { render, fireEvent } from "@testing-library/vue";
import ResetMapButton from "@/components/ResetMapButton.vue";
import { APP_BASE_ROUTE } from "../../../src/router/utils";
import { mockRouter } from "../mocks/mockRouter";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";
import { flushPromises } from "@vue/test-utils";

const router = mockRouter();

const renderComponent = () => {
    return render(ResetMapButton, {
        global: { plugins: [router] },
        props: {
            selectedIndicator: "indicator"
        }
    });
};

describe("ResetMapButton", () => {
    describe("when a country has been selected", () => {
        beforeAll(() => {
            mockPinia({
                mapSettings: mockMapSettings({ country: "MWI" })
            });
        });

        it("should navigate to the home path when the reset button is clicked", async () => {
            vi.useFakeTimers();
            const spyRouterPush = vi.spyOn(router, "push");
            const { getByTitle, emitted } = renderComponent();
            const resetButton = getByTitle("Reset map");
            await fireEvent.click(resetButton);
            vi.runAllTimers();
            expect(spyRouterPush).toHaveBeenCalledWith(`/${APP_BASE_ROUTE}/indicator`);
            expect(emitted()).not.toHaveProperty("resetView");
            vi.useRealTimers();
        });
    });

    describe("when no country has been selected", () => {
        beforeAll(() => {
            mockPinia();
        });

        it("should emit resetView when the reset button is clicked", async () => {
            const spyRouterPush = vi.spyOn(router, "push");
            const { getByTitle, emitted } = renderComponent();
            const resetButton = getByTitle("Reset map");
            await fireEvent.click(resetButton);
            expect(spyRouterPush).not.toHaveBeenCalled();
            expect(emitted()).toHaveProperty("resetView");
        });
    });
});
