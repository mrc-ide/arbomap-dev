import { describe, expect, test } from "vitest";
import {getAppConfig} from "../../../src/resources/utils";

describe("resources utils", async ()=> {
    test("loads app config", async () => {
        const appConfig = await getAppConfig();
        expect(appConfig).toStrictEqual({test: "value"});
    });
});
