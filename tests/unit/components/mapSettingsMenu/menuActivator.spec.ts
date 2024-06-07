import { render } from "@testing-library/vue";
import MenuActivator from "../../../../src/components/mapSettingsMenu/MenuActivator.vue";
import { mockMapSettings, mockPinia } from "../../mocks/mockPinia";
import { mockVuetify } from "../../mocks/mockVuetify";

const renderComponent = (country = "") => {
    const store = mockPinia({
        mapSettings: mockMapSettings(country ? { country, adminLevel: 2 } : { country, adminLevel: 1 }),
        admin0GeojsonFeature: country ? ({ properties: { COUNTRY: "Tanzania" } } as any) : null
    });
    return render(MenuActivator, {
        global: {
            plugins: [store, mockVuetify]
        },
        slots: {
            default: '<div data-testid="test-slot"></div>'
        }
    });
};

describe("MenuActivator", () => {
    test("renders as expected global level", async () => {
        const { findByRole, queryByTestId, findByTestId } = renderComponent();
        const button = await findByRole("button");
        expect(button.textContent).toContain("Force of infection");
        expect(button.textContent).toContain("Global");
        expect(button).toBeVisible();
        expect(queryByTestId("test-slot")).toBe(null);
        button.click();
        expect(await findByTestId("test-slot")).toBeVisible();
    });

    test("renders as expected", async () => {
        const { findByRole, queryByTestId, findByTestId } = renderComponent("TZA");
        const button = await findByRole("button");
        expect(button.textContent).toContain("Force of infection");
        expect(button.textContent).toContain("Tanzania");
        expect(button.textContent).toContain("Admin 2");
        expect(button).toBeVisible();
        expect(queryByTestId("test-slot")).toBe(null);
        button.click();
        expect(await findByTestId("test-slot")).toBeVisible();
    });
});
