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
            expect(store.selectedIndicator).toBe("");
            expect(store.selectedCountryId).toBe("");
        });

        test("selectCountry selects country and loads data", async () => {
            const store = useAppStore();
            await store.initialiseData();
            await store.selectCountry("TZA");
            expect(store.selectedCountryId).toBe("TZA");
            expect(store.admin2Indicators).toStrictEqual({ TZA: MOCK_ADMIN2_INDICATORS.TZA });
            expect(store.admin2Geojson).toStrictEqual({ TZA: MOCK_ADMIN2_GEOJSON.TZA.features });
            expect(store.admin0GeojsonFeature).toStrictEqual(MOCK_ADMIN0_GEOJSON.features[0]);
        });
    });

    describe("getters", () => {
        test("selectedFeatures includes all admin 1 features when there is no selected country", async () => {
            const store = useAppStore();
            await store.initialiseData();
            expect(store.selectedFeatures).toStrictEqual([
                { properties: { shapeID: "123", shapeName: "Test123", shapeGroup: "MWI" } },
                { properties: { shapeID: "789", shapeName: "Test789", shapeGroup: "TZA" } }
            ]);
        });

        test("selectedFeatures includes selected country's admin2 features, and admin1 for all others", async () => {
            const store = useAppStore();
            await store.initialiseData();
            await store.selectCountry("TZA");
            expect(store.selectedFeatures).toStrictEqual([
                { properties: { shapeID: "789-a", shapeName: "Test789-a", shapeGroup: "TZA" } },
                { properties: { shapeID: "789-b", shapeName: "Test789-b", shapeGroup: "TZA" } },
                { properties: { shapeID: "123", shapeName: "Test123", shapeGroup: "MWI" } }
            ]);
        });

        test("selectedIndicators includes all admin 1 features when there is no selected country", async () => {
            const store = useAppStore();
            await store.initialiseData();
            expect(store.selectedIndicators).toStrictEqual({
                "123": MOCK_ADMIN1_INDICATORS.MWI["123"],
                "789": MOCK_ADMIN1_INDICATORS.TZA["789"]
            });
        });

        test("selectedFeatures includes selected country's admin2 features, and admin1 for all others", async () => {
            const store = useAppStore();
            await store.initialiseData();
            await store.selectCountry("TZA");
            expect(store.selectedIndicators).toStrictEqual({
                "123": MOCK_ADMIN1_INDICATORS.MWI["123"],
                ...MOCK_ADMIN2_INDICATORS.TZA
            });
        });
    });
});
