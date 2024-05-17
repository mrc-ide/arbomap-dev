import { render } from "@testing-library/vue";
import { describe, expect, test } from "vitest";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";
import AdminLevelToggle from "../../../src/components/AdminLevelToggle.vue";
import { mockVuetify } from "../mocks/mockVuetify";

const renderComponent = (adminLevel: number, missingAdmin2Data = false) => {
    const store = mockPinia({
        mapSettings: mockMapSettings({ country: "TZA", adminLevel }),
        appConfig: {
            countriesWithoutAdmin2: missingAdmin2Data ? ["TZA"] : []
        } as any
    });
    return render(AdminLevelToggle, {
        global: {
            plugins: [store, mockVuetify]
        }
    });
};

describe("AdminLevelToggle", () => {
    test("renders as expected with admin level 1", async () => {
        const { findAllByRole } = renderComponent(1);
        const buttons = await findAllByRole("button");
        expect(buttons.length).toBe(2);
        const [admin1Button] = buttons;
        expect(admin1Button).toHaveClass("selected-button");
    });

    test("renders as expected with admin level 2", async () => {
        const { findAllByRole } = renderComponent(2);
        const buttons = await findAllByRole("button");
        const [, admin2Button] = buttons;
        expect(admin2Button).toHaveClass("selected-button");
    });

    test("admin level 2 is disabled if country missing admin 2 data", async () => {
        const { findAllByRole } = renderComponent(2, true);
        const buttons = await findAllByRole("button");
        const [admin1Button, admin2Button] = buttons;
        expect(admin1Button).toHaveClass("selected-button");
        expect(admin2Button).toBeDisabled();
    });

    test("emits when button is changed", async () => {
        const { findAllByRole, emitted } = renderComponent(2, true);
        const buttons = await findAllByRole("button");
        const [admin1Button] = buttons;
        admin1Button.click();
        expect(emitted()).toHaveProperty("change-admin-level", [[1]]);
    });
});
