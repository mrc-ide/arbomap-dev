import { render, fireEvent } from "@testing-library/vue";
import ResetMapButton from "@/components/ResetMapButton.vue";
import { APP_BASE_ROUTE } from "@/router/utils";
import { mockRouter } from "../mocks/mockRouter";

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
    describe("when the current path is different from the home path", () => {
        beforeEach(async () => {
            await router.push("/some-other-route");
            await router.isReady();
        });

        it("should navigate to the home path when the reset button is clicked", async () => {
            const spyRouterPush = vi.spyOn(router, "push");
            const { getByTitle } = renderComponent();
            const resetButton = getByTitle("Reset map");
            await fireEvent.click(resetButton);
            expect(spyRouterPush).toHaveBeenCalledWith(`/${APP_BASE_ROUTE}/indicator`);
        });
    });

    describe("when the current path is the same as the home path", () => {
        let originalWindowLocation;
        beforeEach(async () => {
            originalWindowLocation = window.location;
            delete window.location;
            window.location = { ...originalWindowLocation, reload: vi.fn() };
        });

        afterEach(() => {
            window.location = originalWindowLocation;
        });

        it("should reload the page when the reset button is clicked", async () => {
            await router.push(`/${APP_BASE_ROUTE}/indicator/`);
            await router.isReady();

            const { getByTitle } = renderComponent();

            const resetButton = getByTitle("Reset map");

            await fireEvent.click(resetButton);

            expect(window.location.reload).toHaveBeenCalled();
        });
    });
});
