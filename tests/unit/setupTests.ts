import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => {
    server.listen();

    vi.mock("@vue-leaflet/vue-leaflet", () => {
        return {
            LMap: defineComponent({ template: "<l-map-stub><slot></slot></l-map-stub>" }),
            LTileLayer: defineComponent({ template: "<l-tile-layer></l-tile-layer>" }),
            LGeoJson: defineComponent({ template: "<l-geo-json></l-geo-json>" })
        };
    });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
