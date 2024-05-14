import { render, screen, fireEvent } from "@testing-library/vue";
import HelpAlert from "@/components/HelpAlert.vue";
import { mockVuetify } from "../mocks/mockVuetify";

const vuetify = mockVuetify;
const renderComponent = () => {
    return render(HelpAlert, {
        global: { plugins: [vuetify] }
    });
};

let helpAlertHasBeenDismissed: string | null;
const localStorageMock = (() => {
    return {
        getItem: vi.fn(() => helpAlertHasBeenDismissed),
        setItem: vi.fn()
    };
})();

const originalLocalStorage = (window as any).localStorage;
beforeAll((): void => {
    (window as any).localStorage = localStorageMock;
});
afterAll((): void => {
    (window as any).localStorage = originalLocalStorage;
});

describe("HelpAlert", () => {
    describe("When the alert has not been dismissed before", () => {
        beforeAll((): void => {
            helpAlertHasBeenDismissed = null;
        });

        it("should show the alert", () => {
            renderComponent();
            expect(screen.getByRole("alert")).toBeVisible();
        });

        describe("When the alert is dismissed", () => {
            it("should call localStorage.setItem and not show alert", async () => {
                renderComponent();
                const closeButton = screen.getByLabelText("Close");
                await fireEvent.click(closeButton);
                expect(localStorageMock.setItem).toHaveBeenCalled();
                expect(screen.queryByRole("alert")).toBeNull();
            });
        });
    });

    describe("When the alert was dismissed in the past", () => {
        beforeAll((): void => {
            helpAlertHasBeenDismissed = "true";
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
