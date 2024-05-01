import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => {
    server.listen();

    vi.mock("@vue-leaflet/vue-leaflet", () => {
        return {
            LMap: defineComponent({ template: "<l-map-stub><slot></slot></l-map-stub>" }),
            LTileLayer: defineComponent({ template: "<l-tile-layer-stub></l-tile-layer-stub>" }),
            LGeoJson: defineComponent({ template: "<l-geo-json-stub></l-geo-json-stub>" }),
            LControl: defineComponent({ template: "<l-control-stub></l-control-stub>" })
        };
    });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
