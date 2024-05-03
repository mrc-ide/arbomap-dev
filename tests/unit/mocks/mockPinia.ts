import { createTestingPinia } from "@pinia/testing";
import { MOCK_ADMIN1_GEOJSON, MOCK_ADMIN1_INDICATORS, MOCK_APP_CONFIG } from "./mockObjects";
import { AppState } from "../../../src/types/storeTypes";

export const mockPinia = (appState: Partial<AppState> = {}) => {
    const initialState = {
        app: {
            selectedIndicator: "FOI",
            appConfig: MOCK_APP_CONFIG,
            admin1Indicators: MOCK_ADMIN1_INDICATORS,
            admin1Geojson: MOCK_ADMIN1_GEOJSON,
            admin2Indicators: {},
            admin2Geojson: {},
            ...appState
        }
    };

    return createTestingPinia({ initialState });
};
