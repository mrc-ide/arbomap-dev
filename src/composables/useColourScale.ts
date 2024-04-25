import { Ref, computed } from "vue";
import { storeToRefs } from "pinia";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import { FeatureIndicatorValues, IndicatorValue } from "../types/resourceTypes";
import { Dict } from "../types/utilTypes";
import { useAppStore } from "../stores/appStore";
import Color from "color";

interface IndicatorRange {
    min: number;
    max: number;
    range: number;
}

export const useColourScale = (selectedIndicators: Ref<Dict<FeatureIndicatorValues>>) => {
    // TODO: we currently just scale colours to min and max in data, but
    // we can also provide option to scale to config
    const { appConfig } = storeToRefs(useAppStore());

    const colourScales = computed(() => {
        const result = {};
        if (appConfig.value) {
            const { indicators } = appConfig.value;
            Object.keys(indicators).forEach((key) => {
                const scaleName = indicators[key].colourScale?.name || "interpolateGreens";
                result[key] = d3ScaleChromatic[scaleName];
            });
        }
        return result;
    });

    const indicatorExtremes = computed((): Dict<IndicatorRange> => {
        const result = {};
        const allValues = Object.values(selectedIndicators.value);
        allValues.forEach((featureValues: FeatureIndicatorValues) => {
            Object.entries(featureValues).forEach(([indicator, indicatorValue]) => {
                const value = (indicatorValue as IndicatorValue).mean;
                if (!(indicator in result)) {
                    result[indicator] = { min: value, max: value };
                } else if (value > result[indicator].max) {
                    result[indicator].max = value;
                } else if (value < result[indicator].min) {
                    result[indicator].min = value;
                }
            });
        });
        Object.keys(result).forEach((key) => {
            const indicatorRange = result[key];
            indicatorRange.range =
                indicatorRange.max !== indicatorRange.min // Avoid dividing by zero if only one value...
                    ? indicatorRange.max - indicatorRange.min
                    : 1;
        });
        return result;
    });

    const getColour = (indicator: string, featureIndicators: FeatureIndicatorValues | undefined) => {
        // If indicators do not exist for this feature, return transparent
        if (!featureIndicators) {
            return "rgba(0, 0, 0, 0)";
        }

        const value = featureIndicators[indicator].mean;

        if (!indicatorExtremes.value || !colourScales.value) {
            return "rgb(200, 200, 200)";
        }

        const range = indicatorExtremes.value[indicator];

        let colorValue = (value - range.min) / range.range;
        if (colorValue > 1) {
            colorValue = 1;
        }
        if (colorValue < 0) {
            colorValue = 0;
        }

        const scale = colourScales.value[indicator];
        return scale(colorValue);
    };

    return {
        colourScales,
        getColour
    };
};
