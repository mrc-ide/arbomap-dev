import { storeToRefs } from "pinia";
import { Point } from "leaflet";
import { useAppStore } from "../stores/appStore";

// Notes for picking up in the future:
// - Mantra's branch (https://github.com/mrc-ide/arbomap/pull/13) obviates the need for updateTooltips, so wait
// till that one is merged, then return to this branch
// - Ensure we update the tooltips when the selected indicator changes

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
        let indicatorValues;
        // Default values for when the feature is not part of the selected country
        let content = "<div hidden></div>";
        let options = { sticky: true, offset: new Point(9999999, 9999999) }; // Hide container out of sight
        if (featureId in selectedIndicators.value) {
            const featureValues = selectedIndicators.value[featureId];
            indicatorValues = "";
            sortedIndicators.value.forEach((metadata, indicatorKey) => {
                const { mean } = featureValues[indicatorKey];
                const headlineNumber = mean.toPrecision(3);
                const line = `${metadata.humanReadableName}: ${headlineNumber}${metadata.unit}<br/>`;
                indicatorValues +=
                    indicatorKey.toLowerCase() === selectedIndicator.value.toLowerCase()
                        ? `<span class="font-weight-bold">${line}</span>`
                        : line;
            });
            content = `<div class="text-body-1">${featureName}</div><div class="text-body-2">${indicatorValues}</div>`;
            options = { sticky: true, offset: new Point(0, 0) };
        }

        return { content, options };
    };

    return {
        tooltipForFeature
    };
};
