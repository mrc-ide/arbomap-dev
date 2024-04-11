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
        const region123Geojson = screen.getByTestId("123");
        expect(region123Geojson).toBeVisible();
        expect(region123Geojson.getAttribute("geojson")).toBeTruthy();
        const region789Geojson = screen.getByTestId("789");
        expect(region789Geojson).toBeVisible();
        expect(region789Geojson.getAttribute("geojson")).toBeTruthy();
    });
});
