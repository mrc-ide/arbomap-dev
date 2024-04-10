import { describe, expect, test } from "vitest";
import { getAppConfig, getGeojson, getIndicators } from "../../../src/resources/utils";
import { MOCK_ADMIN1_GEOJSON, MOCK_ADMIN1_INDICATORS, MOCK_APP_CONFIG } from "../mocks/mockObjects";

describe("resources utils", async () => {
    test("loads app config", async () => {
        const appConfig = await getAppConfig();
        expect(appConfig).toStrictEqual(MOCK_APP_CONFIG);
    });
    test("loads indicators", async () => {
        const indicators = await getIndicators("MWI", 1);
        expect(indicators).toStrictEqual(MOCK_ADMIN1_INDICATORS.MWI);
    });
    test("loads geojson", async () => {
        const geojson = await getGeojson("MWI", 1);
        expect(geojson).toStrictEqual(MOCK_ADMIN1_GEOJSON.MWI, 1);
    });
});
