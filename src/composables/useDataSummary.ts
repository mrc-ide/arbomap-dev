import { storeToRefs } from "pinia";
import { LatLngBounds } from "leaflet";
import { useAppStore } from "../stores/appStore";
import { useSelectedMapInfo } from "./useSelectedMapInfo";

// This composable is only for e2e testing
export const useDataSummary = (bounds: Ref<LatLngBounds>) => {
    const { mapSettings, appConfig } = storeToRefs(useAppStore());
    const featureProperties = appConfig.value.geoJsonFeatureProperties;

    const { selectedFeatures } = useSelectedMapInfo();

    const dataSummary = computed(() => ({
        "selected-indicator": mapSettings.value.indicator,
        "selected-country-id": mapSettings.value.country,
        "color-scale": appConfig.value?.indicators[mapSettings.value.indicator]?.colorScale.name,
        "feature-count": selectedFeatures.value?.length,
        "selected-country-feature-count": selectedFeatures.value?.filter(
            (f) => f.properties![featureProperties.country] === mapSettings.value.country
        ).length,
        bounds:
            `S: ${bounds.value?.getSouth()} W: ${bounds.value?.getWest()} N: ${bounds.value?.getNorth()}` +
            `E: ${bounds.value?.getEast()}`
    }));

    return { dataSummary };
};
