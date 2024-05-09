import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";

export const useTooltips = () => {
    const { selectedIndicators, selectedIndicator, appConfig } = storeToRefs(useAppStore());

    const sortedIndicators = computed(() => {
        // We show currently selected indicator first, then each configured indicator group's
        // main indicator, as long as that is not the selected indicator
        const sortedKeys = [
            selectedIndicator.value,
            ...appConfig.value.indicatorGroups.map((g) => g.mainIndicator).filter((i) => i !== selectedIndicator.value)
        ];

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
            if (!featureValues[indicatorKey]) {
                return; // shouldn't really occur, but may sometimes not have all indicator values for a feature
            }
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
