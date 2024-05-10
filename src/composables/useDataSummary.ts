import { storeToRefs } from "pinia";
import { LatLngBounds } from "leaflet";
import { useAppStore } from "../stores/appStore";

// This composable is only for e2e testing
export const useDataSummary = (bounds: Ref<LatLngBounds>) => {
    const { selectedFeatures, selectedIndicator, selectedCountryId, appConfig } = storeToRefs(useAppStore());
    const featureProperties = appConfig.value.geoJsonFeatureProperties;

    const dataSummary = computed(() => ({
        "selected-indicator": selectedIndicator.value,
        "selected-country-id": selectedCountryId.value,
        "colour-scale": appConfig.value?.indicators[selectedIndicator.value]?.colourScale.name,
        "feature-count": selectedFeatures.value.length,
        "selected-country-feature-count": selectedFeatures.value.filter(
            (f) => f.properties![featureProperties.country] === selectedCountryId.value
        ).length,
        bounds:
            `S: ${bounds.value?.getSouth()} W: ${bounds.value?.getWest()} N: ${bounds.value?.getNorth()}` +
            `E: ${bounds.value?.getEast()}`
    }));

    return { dataSummary };
};
