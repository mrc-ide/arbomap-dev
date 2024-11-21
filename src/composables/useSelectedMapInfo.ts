import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { FeatureIndicators } from "../types/resourceTypes";

export const useSelectedMapInfo = () => {
    const { mapSettings, admin1Indicators, admin2Indicators } =
        storeToRefs(useAppStore());

    const selectedIndicators = computed<FeatureIndicators>(() => {
        // get single dictionary of feature id to indicator values

        // Return admin1 indicators for countries other than the selected country, and
        // admin2 indicators for the selected country
        // note: if the country does not have admin 2 data then the adminLevel in mapSettings
        // will be 1 so we will return admin 1 indicators in that case too
        if (mapSettings.value.adminLevel === 2 && mapSettings.value.country) {
            const filteredAdmin1Indicators = Object.entries(admin1Indicators.value)
                .filter(([countryId]) => countryId !== mapSettings.value.country)
                .map(([, indicators]) => indicators);

            return Object.assign({}, admin2Indicators.value[mapSettings.value.country], ...filteredAdmin1Indicators);
        }

        // return all admin 1 indicators by default
        return Object.assign({}, ...Object.values(admin1Indicators.value));
    });

    return {
        selectedIndicators
    };
};
