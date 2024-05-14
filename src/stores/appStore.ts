import { defineStore } from "pinia";
import { Feature } from "geojson";
import {
    getAppConfig,
    getCountryBoundingBoxes, getCountryNames,
    getGeojsonFeatures,
    getGlobalGeojsonFeatures,
    getGlobalIndicators,
    getIndicators
} from "../resources/utils";
import { AppState } from "../types/storeTypes";
import { FeatureIndicators } from "../types/resourceTypes";
import {IndicatorsExcelDownload} from "../excel/indicatorsExcelDownload";
import {debounce} from "../utils";

export const useAppStore = defineStore("app", {
    state: (): AppState => ({
        selectedIndicator: "",

        // When a country is selected, we display admin2 data for it.
        // We display admin1 data for all other countries
        selectedCountryId: "",

        appConfig: null,
        countryNames: null,

        countryBoundingBoxes: {},

        // We keep all data in dictionaries with country ids as keys, mirroring the resources on disk
        admin1Indicators: {},
        admin1Geojson: {},
        admin2Indicators: {},
        admin2Geojson: {},
        admin0GeojsonFeature: null
    }),
    getters: {
        selectedIndicators: (state): FeatureIndicators => {
            const { selectedCountryId, admin1Indicators, admin2Indicators } = state;
            // get single dictionary of feature id to indicator values for user selections
            if (!selectedCountryId) {
                return Object.assign({}, ...Object.values(admin1Indicators));
            }

            // Return admin1 indicators for countries other than the selected country, and
            // admin2 indicators for the selected country
            // NB we could return all indicators and look up values from features for the purposes of the map,
            // but it will be useful to directly access all selected indicators when exporting data.
            const filteredAdmin1 = Object.entries(admin1Indicators)
                .filter(([countryId]) => countryId !== selectedCountryId)
                .map(([, indicators]) => indicators);

            return Object.assign({}, admin2Indicators[selectedCountryId], ...filteredAdmin1);
        },
        selectedFeatures: (state): Feature[] => {
            const { selectedCountryId, admin1Geojson, admin2Geojson } = state;
            // get single array of all selected features
            if (!selectedCountryId) {
                return Object.values(admin1Geojson).flatMap((geojson) => geojson);
            }

            const filteredAdmin1 = Object.entries(admin1Geojson)
                .filter(([countryId]) => countryId !== selectedCountryId)
                .flatMap(([, geojson]) => geojson);

            return [...admin2Geojson[selectedCountryId], ...filteredAdmin1];
        }
    },
    actions: {
        async initialiseData() {
            this.appConfig = await getAppConfig();
            this.countryNames = await getCountryNames();

            // Read all adm1 indicators from a single file
            const allIndicators = await getGlobalIndicators(1);
            // Load all admin1 geojson - load simplified boundaries only, from a
            // single file,
            const allGeojson = await getGlobalGeojsonFeatures(1);

            this.countryBoundingBoxes = await getCountryBoundingBoxes();
            this.admin1Geojson = allGeojson;
            this.admin1Indicators = allIndicators;
        },
        async selectCountry(countryId: string) {
            if (countryId === this.selectedCountryId) {
                return;
            }

            if (!countryId) {
                this.selectedCountryId = "";
                this.admin0GeojsonFeature = null;
                return;
            }

            // Some countries do not have admin2 regions or data - if one of these is selected, we load
            // a more detailed geojson, and re-use its admin1 indicators as "admin2"
            const level = this.appConfig.countriesWithoutAdmin2.includes(countryId) ? 1 : 2;

            if (!(countryId in this.admin2Indicators)) {
                if (level === 1) {
                    this.admin2Indicators[countryId] = this.admin1Indicators[countryId];
                } else {
                    this.admin2Indicators[countryId] = await getIndicators(countryId, level);
                }
            }
            if (!(countryId in this.admin2Geojson)) {
                this.admin2Geojson[countryId] = await getGeojsonFeatures(countryId, level);
            }

            this.admin0GeojsonFeature = (await getGeojsonFeatures(countryId, 0))[0];
            this.selectedCountryId = countryId;
        },
        async downloadExcel() {
            // TODO: download selected country if there is one
            const download = new IndicatorsExcelDownload("arbomap.xlsx", this.appConfig, this.countryNames);
            debounce(() => {
                download.downloadGlobalIndicators(this.admin1Indicators, this.admin1Geojson);
            })();
        }
    }
});
