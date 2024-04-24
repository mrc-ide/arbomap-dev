import { defineStore } from "pinia";
import { Feature } from "geojson";
import {
    getAppConfig, getCountryBoundingBoxes,
    getGeojsonFeatures,
    getGlobalGeojsonFeatures,
    getGlobalIndicators,
    getIndicators
} from "../resources/utils";
import { AppState } from "../types/storeTypes";
import {BoundingBox, FeatureIndicators} from "../types/resourceTypes";

export const useAppStore = defineStore("app", {
    state: (): AppState => ({
        loading: true,
        waitingForMapBounds: false,
        selectedIndicator: "",

        // When a country is selected, we display admin2 data for it.
        // We display admin1 data for all other countries
        selectedCountryId: "",

        appConfig: null,

        countryBoundingBoxes: {},

        // We keep all data in dictionaries with country ids as keys, mirroring the resources on disk
        admin1Indicators: {},
        admin1Geojson: {},
        admin2Indicators: {},
        admin2Geojson: {}
    }),
    getters: {
        selectedIndicators: (state): FeatureIndicators => {
            console.log(`getting selected indicators ${new Date().toLocaleString()}`)
            const { selectedCountryId, admin1Indicators, admin2Indicators } = state;
            // get single dictionary of feature id to indicator values for user selections
            if (!selectedCountryId) {
                const result =  Object.assign({}, ...Object.values(admin1Indicators));
                console.log(`Finished getting selected indicators ${new Date().toLocaleString()}`)
                return result;
            }

            // Return admin1 indicators for countries other than the selected country, and
            // admin2 indicators for the selected country
            // NB we could return all indicators and look up values from features for the purposes of the map,
            // but it will be useful to directly access all selected indicators when exporting data.
            const filteredAdmin1 = Object.entries(admin1Indicators)
                .filter(([countryId]) => countryId !== selectedCountryId)
                .map(([, indicators]) => indicators);

            const result = Object.assign({}, admin2Indicators[selectedCountryId], ...filteredAdmin1);
            console.log(`Finished getting selected indicators ${new Date().toLocaleString()}`)
            return result;
        },
        selectedFeatures: (state): Feature[] => {
            console.log(`getting selected features ${new Date().toLocaleString()}`)
            const { selectedCountryId, admin1Geojson, admin2Geojson } = state;
            // get single array of all selected features
            if (!selectedCountryId) {
                return Object.values(admin1Geojson).flatMap((geojson) => geojson);
            }

            const filteredAdmin1 = Object.entries(admin1Geojson)
                .filter(([countryId]) => countryId !== selectedCountryId)
                .flatMap(([, geojson]) => geojson);

            console.log(`finished getting selected features ${new Date().toLocaleString()}`)
            return [...admin2Geojson[selectedCountryId], ...filteredAdmin1];
        }
    },
    actions: {
        async initialiseData() {
            console.log(`Initialising data ${new Date().toLocaleString()}`)
            this.appConfig = await getAppConfig();
            const level = 1;

            // eslint-disable-next-line no-restricted-syntax
            /*for (const country of this.appConfig.countries) {
                allIndicators[country] = await getIndicators(country, level);
            }*/
            // Read all adm1 indicators from a single file
            const allIndicators = await getGlobalIndicators(1);

            this.countryBoundingBoxes = await getCountryBoundingBoxes();

            // Load all admin1 geojson - load simplified boundaries only, from a
            // single file,
            const allGeojson = await getGlobalGeojsonFeatures(1);

            //Object.assign(this.admin1Geojson, allGeojson);
            //Object.assign(this.admin1Indicators, allIndicators);
            this.admin1Geojson = allGeojson;
            this.admin1Indicators = allIndicators;

            this.loading = false;
            console.log(`Finished Initialising data ${new Date().toLocaleString()}`)
        },
        async selectCountry(countryId: string) {
            console.log(`selecting country ${new Date().toLocaleString()}`)
            if (countryId === this.selectedCountryId) {
                return;
            }

           // this.waitingForMapBounds = true;
            if (!countryId) {
                this.selectedCountryId = "";
                return;
            }

            this.loading = true;

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

            // TODO: take this out when we're more confident of  matching admin2 ids!
            // Do a quick audit
            /*const geojsonFeatureIds = this.admin2Geojson[countryId].map((feature) => feature.properties["GID_2"]);
            const indicatorFeatureIds = Object.keys(this.admin2Indicators[countryId]);
            console.log(`geo id count: ${geojsonFeatureIds.length}  ind id count: ${indicatorFeatureIds.length}`)
            const unfoundInd = indicatorFeatureIds.filter((id) => !geojsonFeatureIds.includes(id));
            const unFoundGeo = geojsonFeatureIds.filter((id) => !indicatorFeatureIds.includes(id));
            console.log("geojson ids which are not in indicators: " + JSON.stringify(unFoundGeo));
            console.log("indicator ids which are not in geogson: " + JSON.stringify(unfoundInd));*/

            this.selectedCountryId = countryId;
            this.loading = false;

            console.log(`Finished selecting country ${new Date().toLocaleString()}`)
        }
    }
});
