import { describe, expect, test } from "vitest";
import {getAppConfig, getGeojson, getIndicators} from "../../../src/resources/utils";
import {MOCK_APP_CONFIG, MOCK_GEOJSON, MOCK_INDICATORS} from "../mocks/mockObjects";

describe("resources utils", async ()=> {
    test("loads app config", async () => {
        const appConfig = await getAppConfig();
        expect(appConfig).toStrictEqual(MOCK_APP_CONFIG);
    });
    test("loads indicators", async () => {
        const indicators = await getIndicators("MWI", 1);
        expect(indicators).toStrictEqual(MOCK_INDICATORS);
    });
    test("loads geojson", async () => {
        const geojson = await getGeojson("MWI");
        expect(geojson).toStrictEqual(MOCK_GEOJSON);
    });
});
