import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

export const useTooltips = () => {
    const { selectedIndicators, selectedIndicator, appConfig } = storeToRefs(useAppStore());

    const sortedIndicators = computed(() => {
        const sortedKeys = Object.keys(appConfig.value.indicators).sort((indicatorName) =>
            indicatorName.toLowerCase() === selectedIndicator.value.toLowerCase() ? -1 : 1
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
                indicatorKey.toLowerCase() === selectedIndicator.value.toLowerCase()
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
