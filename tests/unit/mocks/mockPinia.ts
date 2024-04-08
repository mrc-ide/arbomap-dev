import {MOCK_APP_CONFIG} from "./mockObjects";
import {createTestingPinia} from "@pinia/testing";
import {AppState} from "../../../src/types/storeTypes";

export const mockPinia = (appState: Partial<AppState> = {}) => {
    const initialState = {
        app: {
            loading: false,
            selectedIndicator: "",
            appConfig: MOCK_APP_CONFIG,
            admin1Indicators: {},
            admin1Geojson: {},
            admin2Indicators: {},
            admin2Geojson: {},
            ...appState
        }
    };

    return createTestingPinia({ initialState });
};
