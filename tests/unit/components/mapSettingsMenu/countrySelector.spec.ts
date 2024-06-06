import { render } from "@testing-library/vue";
import { describe, expect, test } from "vitest";
import { mockMapSettings, mockPinia } from "../../mocks/mockPinia";
import CountrySelector from "../../../../src/components/mapSettingsMenu/CountrySelector.vue";
import { mockRouter } from "../../mocks/mockRouter";
import { mockVuetify } from "../../mocks/mockVuetify";

const router = mockRouter();

const renderComponent = (country) => {
    const store = mockPinia({
        mapSettings: mockMapSettings({ country })
    });
    return render(CountrySelector, {
        global: {
            plugins: [store, mockVuetify, router]
        }
    });
};

describe("CountrySelector", () => {
    test("renders as expected on the global view", async () => {
        const { findByText } = renderComponent("");
        expect(await findByText("Global")).toBeVisible();
    });

    test("renders as expected on country view", async () => {
        const { findByText } = renderComponent("MWI");
        expect(await findByText("Malawi")).toBeVisible();
    });
});
