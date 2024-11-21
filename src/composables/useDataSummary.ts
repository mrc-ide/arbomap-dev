import { storeToRefs } from "pinia";
import { LatLngBounds } from "leaflet";
import { useAppStore } from "../stores/appStore";
import { useSelectedMapInfo } from "./useSelectedMapInfo";
import { IndicatorColorCategories, IndicatorColorScale } from "../types/resourceTypes";

// This composable is only for e2e testing
export const useDataSummary = (bounds: Ref<LatLngBounds>) => {
    const { mapSettings, appConfig } = storeToRefs(useAppStore());
    const featureProperties = appConfig.value.geoJsonFeatureProperties;

   // const { selectedFeatures } = useSelectedMapInfo();

    const dataSummary = computed(() => {
        const { colors } = appConfig.value.indicators[mapSettings.value.indicator];
        return {
            "selected-indicator": mapSettings.value.indicator,
            "selected-country-id": mapSettings.value.country,
            "color-type": colors.type,
            "color-scale": (colors as IndicatorColorScale).colorScale?.name,
            "color-categories": (colors as IndicatorColorCategories).categories?.map((c) => c.name).join(","),
            /*"feature-count": selectedFeatures.value?.length,
            "selected-country-feature-count": selectedFeatures.value?.filter(
                (f) => f.properties![featureProperties.country] === mapSettings.value.country
            ).length,*/
            bounds:
                `S: ${bounds.value?.getSouth()} W: ${bounds.value?.getWest()} N: ${bounds.value?.getNorth()}` +
                `E: ${bounds.value?.getEast()}`
        };
    });

    return { dataSummary };
};
