import { describe, expect, test } from "vitest";
import {
    getAppConfig,
    getCountryBoundingBoxes,
    getGeojsonFeatures,
    getGlobalGeojsonFeatures,
    getGlobalIndicators,
    getIndicators
} from "../../../src/resources/utils";
import { MOCK_ADMIN1_GEOJSON, MOCK_ADMIN1_INDICATORS, MOCK_APP_CONFIG, MOCK_BOUNDS } from "../mocks/mockObjects";

describe("resources utils", async () => {
    test("loads app config", async () => {
        const appConfig = await getAppConfig();
        expect(appConfig).toStrictEqual(MOCK_APP_CONFIG);
    });
    test("loads country indicators", async () => {
        const indicators = await getIndicators("MWI", 1);
        expect(indicators).toStrictEqual(MOCK_ADMIN1_INDICATORS.MWI);
    });
    test("loads country geojson", async () => {
        const geojson = await getGeojsonFeatures("MWI", 1);
        expect(geojson).toStrictEqual(MOCK_ADMIN1_GEOJSON.MWI.features, 1);
    });

    test("loads global indicators", async () => {
        const indicators = await getGlobalIndicators(1);
        expect(indicators).toStrictEqual(MOCK_ADMIN1_INDICATORS);
    });

    test("loads global geojson", async () => {
        const geojson = await getGlobalGeojsonFeatures(1);
        expect(geojson).toStrictEqual(MOCK_ADMIN1_GEOJSON);
    });

    test("loads country bounding boxes", async () => {
        const boxes = await getCountryBoundingBoxes();
        expect(boxes).toStrictEqual(MOCK_BOUNDS);
    });
});
