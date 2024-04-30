import { describe, test, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAppStore } from "../../../src/stores/appStore";
import {
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
                "123": {
                    FOI: { mean: 0.1, sd: 0.01 },
                    p9: { mean: 0.2, sd: 0.02 }
                },
                "789": {
                    FOI: { mean: 0.3, sd: 0.03 },
                    p9: { mean: 0.4, sd: 0.04 }
                }
            });
        });

        test("selectedFeatures includes selected country's admin2 features, and admin1 for all others", async () => {
            const store = useAppStore();
            await store.initialiseData();
            await store.selectCountry("TZA");
            expect(store.selectedIndicators).toStrictEqual({
                "123": {
                    FOI: { mean: 0.1, sd: 0.01 },
                    p9: { mean: 0.2, sd: 0.02 }
                },
                "789-a": {
                    FOI: { mean: 0.31, sd: 0.031 },
                    p9: { mean: 0.41, sd: 0.041 }
                },
                "789-b": {
                    FOI: { mean: 0.32, sd: 0.032 },
                    p9: { mean: 0.42, sd: 0.042 }
                }
            });
        });
    });
});
