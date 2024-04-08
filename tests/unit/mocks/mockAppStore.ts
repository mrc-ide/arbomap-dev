import {vi} from "vitest";
import {AppState} from "../../../src/types/storeTypes";
import {defineStore} from "pinia";
import {MOCK_APP_CONFIG} from "./mockObjects";
import {useAppStore} from "../../../src/stores/appStore";

export default (state: Partial<AppState> = {}) => {
    vi.mock("@/stores/appStore", () => ({
        useAppStore: defineStore("app", {
            state: (): AppState => <AppState>({
                loading: false,
                selectedIndicator: "",
                appConfig: MOCK_APP_CONFIG,
                admin1Indicators: {},
                admin1Geojson: {},
                admin2Indicators: {},
                admin2Geojson: {},
                ...state
            }),
            actions: {
                async initialiseData(){ vi.fn() }
            }
        })
    }));
}
