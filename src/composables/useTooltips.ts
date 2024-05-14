import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { useSelectedMapInfo } from "./useSelectedMapInfo";

export const useTooltips = () => {
    const { mapSettings, appConfig, admin1Indicators, admin2Indicators } = storeToRefs(useAppStore());

    const { selectedIndicators } = useSelectedMapInfo();

    const sortedIndicators = computed(() => {
        const sortedKeys = Object.keys(appConfig.value.indicators).sort((indicatorId) =>
            indicatorId.toLowerCase() === mapSettings.value.indicator.toLowerCase() ? -1 : 1
        );

        const sortedMap = new Map();

        sortedKeys.forEach((key) => {
            sortedMap.set(key, appConfig.value.indicators[key]);
        });

        return sortedMap;
    });

    const tooltipForFeature = (featureId: string, featureName: string) => {
        const tooltipOptions = { sticky: true };
        if (!(featureId in selectedIndicators.value)) return null;
        const featureValues = selectedIndicators.value[featureId];
        let indicatorValues = "";
        sortedIndicators.value.forEach((metadata, indicatorKey) => {
            const { mean } = featureValues[indicatorKey];
            const headlineNumber = mean.toPrecision(3);
            const line = `${metadata.humanReadableName}: ${headlineNumber}${metadata.unit}<br/>`;
            indicatorValues +=
                indicatorKey.toLowerCase() === mapSettings.value.indicator.toLowerCase()
                    ? `<span class="font-weight-bold">${line}</span>`
                    : line;
        });
        return {
            content: `<div class="text-body-1">${featureName}</div><div class="text-body-2">${indicatorValues}</div>`,
            options: tooltipOptions
        };
    };

    return {
        tooltipForFeature
    };
};
