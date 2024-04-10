import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import { mockPinia } from "../mocks/mockPinia";
import Choropleth from "../../../src/components/Choropleth.vue";

vi.mock("@vue-leaflet/vue-leaflet", () => {
    return {
        LMap: defineComponent({ template: "<l-map-stub><slot></slot></l-map-stub>" }),
        LTileLayer: defineComponent({ template: "<l-tile-layer></l-tile-layer>" }),
        LGeoJson: defineComponent({ template: "<l-geo-json></l-geo-json>" })
    };
});

const store = mockPinia();
const renderComponent = async () => {
    const comp = await render(Choropleth, {
        global: {
            plugins: [store],
            stubs: {
                LMap: true,
                LTileLayer: true,
                LGeoJson: true
            }
        }
    });
    console.log(JSON.stringify(comp));
};

describe("Choropleth", () => {
    test("renders as expected", async () => {
        await renderComponent();
        const tileLayer = await screen.findByTestId("tile-layer");
        expect(tileLayer).toBeVisible();
        expect(tileLayer.getAttribute("max-zoom")).toBe("10");
        expect(tileLayer.getAttribute("min-zoom")).toBe("3");
        const region123Geojson = await screen.findByTestId("123");
        expect(region123Geojson).toBeVisible();
        expect(region123Geojson.getAttribute("geojson")).toBeTruthy();
        const region789Geojson = await screen.findByTestId("789");
        expect(region789Geojson).toBeVisible();
        expect(region789Geojson.getAttribute("geojson")).toBeTruthy();
    });
});
