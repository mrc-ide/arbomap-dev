import { render, screen, fireEvent } from "@testing-library/vue";
import HelpAlert from "@/components/HelpAlert.vue";
import { mockVuetify } from "../mocks/mockVuetify";

const vuetify = mockVuetify;
const renderComponent = () => {
    return render(HelpAlert, {
        global: { plugins: [vuetify] }
    });
};

describe("HelpAlert", () => {
    describe("When the alert has not been dismissed before", () => {
        it("should show the alert", () => {
            renderComponent();
            expect(screen.getByRole("alert")).toBeVisible();
        });
    });

    describe("When the alert was dismissed in the past", () => {
        let originalLocalStorage;

        beforeAll((): void => {
            const localStorageMock = (() => {
                return {
                    getItem: vi.fn(() => "true"),
                    setItem: vi.fn()
                };
            })();

            originalLocalStorage = window.localStorage;
            (window as any).localStorage = localStorageMock;
        });

        afterAll((): void => {
            (window as any).localStorage = originalLocalStorage;
        });

        it("should not show the alert", () => {
            renderComponent();
            expect(screen.queryByRole("alert")).toBeNull();
        });

        it("can show the alert when the help button is clicked", async () => {
            renderComponent();
            expect(screen.queryByRole("alert")).toBeNull();
            const helpButton = screen.getByRole("button");
            await fireEvent.click(helpButton);
            expect(screen.getByRole("alert")).toBeVisible();
        });
    });
});
