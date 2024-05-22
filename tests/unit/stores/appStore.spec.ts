import { describe, test, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAppStore } from "../../../src/stores/appStore";
import {
    MOCK_ADMIN0_GEOJSON,
    MOCK_ADMIN1_GEOJSON,
    MOCK_ADMIN1_INDICATORS,
    MOCK_ADMIN2_GEOJSON,
    MOCK_ADMIN2_INDICATORS,
    MOCK_BOUNDS
} from "../mocks/mockObjects";
import { mockMapSettings } from "../mocks/mockPinia";

describe("appStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe("actions", () => {
        test("initialises admin1 data", async () => {
            const store = useAppStore();
            await store.initialiseData();
            expect(store.admin1Indicators).toStrictEqual(MOCK_ADMIN1_INDICATORS);
            expect(store.admin1Geojson).toStrictEqual(MOCK_ADMIN1_GEOJSON);
            expect(store.countryBoundingBoxes).toStrictEqual(MOCK_BOUNDS);
            expect(store.admin2Indicators).toStrictEqual({});
            expect(store.admin2Geojson).toStrictEqual({});
            expect(store.initialisationComplete).toStrictEqual(true);
        });

        test("updateMapSettings selects country, admin level and loads data", async () => {
            const store = useAppStore();
            await store.initialiseData();
            const newMapSettings = mockMapSettings({ country: "TZA", adminLevel: 2 });
            await store.updateMapSettings(newMapSettings);
            expect(store.mapSettings).toStrictEqual(newMapSettings);
            expect(store.admin2Indicators).toStrictEqual({ TZA: MOCK_ADMIN2_INDICATORS.TZA });
            expect(store.admin2Geojson).toStrictEqual({ TZA: MOCK_ADMIN2_GEOJSON.TZA.features });
            expect(store.admin0GeojsonFeature).toStrictEqual(MOCK_ADMIN0_GEOJSON.features[0]);
        });
    });
});
