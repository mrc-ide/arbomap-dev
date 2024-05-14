import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

export const useSelectedMapInfo = () => {
    const { mapSettings, admin1Indicators, admin2Indicators, admin1Geojson, admin2Geojson } =
        storeToRefs(useAppStore());

    const selectedIndicators = computed(() => {
        // get single dictionary of feature id to indicator values

        // Return admin1 indicators for countries other than the selected country, and
        // admin2 indicators for the selected country
        if (mapSettings.value.adminLevel === 2 && mapSettings.value.country) {
            const filteredAdmin1Indicators = Object.entries(admin1Indicators.value)
                .filter(([countryId]) => countryId !== mapSettings.value.country)
                .map(([, indicators]) => indicators);

            return Object.assign({}, admin2Indicators.value[mapSettings.value.country], ...filteredAdmin1Indicators);
        }

        // return all admin 1 indicators by default
        return Object.assign({}, ...Object.values(admin1Indicators.value));
    });

    const selectedFeatures = computed(() => {
        // get single array of all selected features

        if (mapSettings.value.adminLevel === 2 && mapSettings.value.country) {
            const filteredAdmin1 = Object.entries(admin1Geojson.value)
                .filter(([countryId]) => countryId !== mapSettings.value.country)
                .flatMap(([, geojson]) => geojson);

            return [...admin2Geojson.value[mapSettings.value.country], ...filteredAdmin1];
        }

        return Object.values(admin1Geojson.value).flatMap((geojson) => geojson);
    });

    return {
        selectedFeatures,
        selectedIndicators
    };
};
