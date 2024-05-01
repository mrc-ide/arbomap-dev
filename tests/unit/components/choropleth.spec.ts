import { render, screen } from "@testing-library/vue";
import { describe, expect, test } from "vitest";
import { mockPinia } from "../mocks/mockPinia";
import Choropleth from "../../../src/components/Choropleth.vue";

const store = mockPinia();
const renderComponent = () => {
    return render(Choropleth, {
        global: {
            plugins: [store],
            stubs: {
                LMap: true,
                LTileLayer: true,
                LGeoJson: true
            }
        }
    });
};

describe("Choropleth", () => {
    test("renders as expected", async () => {
        renderComponent();
        const tileLayer = screen.getByTestId("tile-layer");
        expect(tileLayer).toBeVisible();
    });
});
