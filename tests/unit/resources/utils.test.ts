import { describe, expect, test } from "vitest";
import {getAppConfig, getIndicators} from "../../../src/resources/utils";
import {MOCK_APP_CONFIG, MOCK_INDICATORS} from "../mocks/mockObjects";

describe("resources utils", async ()=> {
    test("loads app config", async () => {
        const appConfig = await getAppConfig();
        expect(appConfig).toStrictEqual(MOCK_APP_CONFIG);
    });
    test("loads indicators", async () => {
        const indicators = await getIndicators("MWI", 1);
        expect(indicators).toStrictEqual(MOCK_INDICATORS);
    });
});
