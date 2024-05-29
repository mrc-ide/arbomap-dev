import { createTestingPinia } from "@pinia/testing";
import { MOCK_ADMIN1_GEOJSON, MOCK_ADMIN1_INDICATORS, MOCK_APP_CONFIG } from "./mockObjects";
import { AppState } from "../../../src/types/storeTypes";
import { MapSettings } from "../../../src/types/resourceTypes";
import { PATHOGEN, VERSION } from "../../../src/router/utils";

export const mockMapSettings = (mapSettings: Partial<MapSettings> = {}): MapSettings => {
    return {
        pathogen: PATHOGEN,
        version: VERSION,
        indicator: "FOI",
        country: "",
        adminLevel: 1,
        ...mapSettings
    };
};

export const mockPinia = (appState: Partial<AppState> = {}) => {
    const initialState = {
        app: {
            appConfig: MOCK_APP_CONFIG,
            admin1Indicators: MOCK_ADMIN1_INDICATORS,
            admin1Geojson: MOCK_ADMIN1_GEOJSON,
            admin2Indicators: {},
            admin2Geojson: {},
            mapSettings: mockMapSettings(),
            countryNames: {
                MWI: "Malawi",
                TZA: "Tanzania"
            },
            ...appState
        }
    };

    return createTestingPinia({ initialState });
};
