import { defineStore } from "pinia";
import {
    getAppConfig,
    getCountryBoundingBoxes,
    getGeojsonFeatures,
    getGlobalGeojsonFeatures,
    getGlobalIndicators,
    getIndicators
} from "../resources/utils";
import { AppState } from "../types/storeTypes";
import { MapSettings } from "../types/resourceTypes";

export const useAppStore = defineStore("app", {
    state: (): AppState => ({
        appConfig: null,
        countryBoundingBoxes: {},
        admin1Indicators: {},
        admin1Geojson: {},
        initialisationComplete: false,

        admin2Indicators: {},
        admin2Geojson: {},

        mapSettings: null,
        admin0GeojsonFeature: null,
        mapLoading: false
    }),
    actions: {
        async initialiseData() {
            const state = this as AppState;
            state.appConfig = await getAppConfig();
            state.countryBoundingBoxes = await getCountryBoundingBoxes();
            state.admin1Geojson = await getGlobalGeojsonFeatures(1);
            state.admin1Indicators = await getGlobalIndicators(1);

            state.initialisationComplete = true;
        },
        async updateMapSettings(newMapSettings: MapSettings) {
            const state = this as AppState;
            const { country, adminLevel } = newMapSettings;

            if (!country) {
                state.mapSettings = newMapSettings;
                state.admin0GeojsonFeature = null;
                return;
            }

            let level = adminLevel;
            // Some countries do not have admin2 regions or data - if one of these is selected, we load
            // a more detailed admin1 geojson, and re-use its admin1 indicators as "admin2"
            const admin2DataMissing = state.appConfig.countriesWithoutAdmin2.includes(country);
            if (level === 2) {
                if (admin2DataMissing) {
                    // The more detailed level (2) was requested but we actually need to load level 1 for this country
                    level = 1;
                    state.admin2Indicators[country] = state.admin1Indicators[country];
                } else {
                    state.admin2Indicators[country] =
                        state.admin2Indicators[country] || (await getIndicators(country, level));
                }

                state.admin2Geojson[country] =
                    state.admin2Geojson[country] || (await getGeojsonFeatures(country, level));
            }

            state.admin0GeojsonFeature = (await getGeojsonFeatures(country, 0))[0];
            // account for the fact that some countries do not have admin level 2 data
            const finalMapSettings: MapSettings = { ...newMapSettings, adminLevel: level };
            state.mapSettings = finalMapSettings;
        }
    }
});
