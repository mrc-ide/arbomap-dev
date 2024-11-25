import { storeToRefs } from "pinia";
import { LatLngBounds } from "leaflet";
import { useAppStore } from "../stores/appStore";
import { useSelectedMapInfo } from "./useSelectedMapInfo";
import { IndicatorColorCategories, IndicatorColorScale } from "../types/resourceTypes";

// This composable is only for e2e testing
export const useDataSummary = (bounds: Ref<LatLngBounds>) => {
    const { mapSettings, appConfig } = storeToRefs(useAppStore());

    const dataSummary = computed(() => {
        const { colors } = appConfig.value.indicators[mapSettings.value.indicator];
        return {
            "selected-indicator": mapSettings.value.indicator,
            "selected-country-id": mapSettings.value.country,
            "color-type": colors.type,
            "color-scale": (colors as IndicatorColorScale).colorScale?.name,
            "color-categories": (colors as IndicatorColorCategories).categories?.map((c) => c.name).join(","),
            /* For tiling proof of concept, removed selected feature summary here, as we have removed selected Features from store*/
            bounds:
                `S: ${bounds.value?.getSouth()} W: ${bounds.value?.getWest()} N: ${bounds.value?.getNorth()}` +
                `E: ${bounds.value?.getEast()}`
        };
    });

    return { dataSummary };
};
