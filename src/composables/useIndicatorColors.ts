import {computed, ComputedRef} from "vue";
import { storeToRefs } from "pinia";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import Color from "color";
import {FeatureIndicatorValues, FeatureIndicators, IndicatorValue, ColorType} from "../types/resourceTypes";
import { Dict } from "../types/utilTypes";
import { useAppStore } from "../stores/appStore";

interface IndicatorRange {
    min: number;
    max: number;
    range: number;
}

type FillAndOutlineColor = {
    fillColor: string;
    outlineColor: string;
};

export const useIndicatorColors = (selectedIndicators: ComputedRef<FeatureIndicators>) => {
    // TODO: we currently just scale colours to min and max in data, but
    // we can also provide option to scale to config
    const { appConfig } = storeToRefs(useAppStore());

    const getIndicatorColorType = (indicator: string) => appConfig.value.indicators[indicator].colors.type;

    const getIndicatorColorScale = (indicator: string) => {
        if (appConfig.value) {
            const { colors } = appConfig.value.indicators[indicator];

            if (colors.type !== ColorType.Scale) {
                throw Error("indicator colors are not scale type");
            }
            const scaleName = colors.colorScale?.name || "interpolateGreens";
            return d3ScaleChromatic[scaleName];
        }
        return null;
    };

    const getIndicatorColorCategories = (indicator: string) => {
        if (appConfig.value) {
            const { colors } = appConfig.value.indicators[indicator];

            if (colors.type != ColorType.Category) {
                throw Error("indicator colors are not category type");
            }

            return colors.categories;
        }
        return null;
    };

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

    const getScaleColor = (indicator: string, value: number, scaleToExtremes = true) => {
        let colorValue;
        if (scaleToExtremes) {
            const range = indicatorExtremes.value[indicator];
            colorValue = (value - range.min) / range.range;
            colorValue = Math.min(1, colorValue);
            colorValue = Math.max(0, colorValue);
        } else {
            colorValue = value;
        }

        const scale = getIndicatorColorScale(indicator);

        const reverse = appConfig.value.indicators[indicator].colors.colorScale?.reverse;
        if (reverse) {
            colorValue = 1 - colorValue;
        }

        return scale(colorValue);
    };

    const getIndicatorValueColorCategory = (indicator: string, value: number) => {
        // We currently assume that indicators in config are in the correct order!
        const categories = getIndicatorColorCategories(indicator);
        for (const category of categories) {
            if (value < category.upperLimit || category.upperLimit === null) {
                return category;
            }
        }
    };

    const getIndicatorValueColor = (indicator: string, value: number, scaleToExtremes = true) => {
        const type = getIndicatorColorType(indicator);
        return type === ColorType.Scale ? getScaleColor(indicator, value, scaleToExtremes) : getIndicatorValueColorCategory(indicator, value).color;
    }

    const fadeColor = (fillColor: string, desaturate = 0.5, fade = 0.6) => {
        // for drawing borders more subtly and fading our features, desaturate
        // and fade the color returned from color scale in rgb format
        const c = Color(fillColor);
        return c.desaturate(desaturate).fade(fade).rgb().string();
    };

    const noIndicatorsColor = "transparent";
    const noScalesColor = "rgb(200, 200, 200)";
    const noScalesColorFaded = fadeColor("rgb(200, 200, 200)");

    const getFillAndOutlineColor = (
        indicator: string,
        featureId: string,
        isFaded: boolean = false
    ): FillAndOutlineColor => {
        const featureIndicators = selectedIndicators.value[featureId] as FeatureIndicatorValues | undefined;

        // If indicators do not exist for this feature, return transparent
        if (!featureIndicators || !featureIndicators[indicator]) {
            return {
                fillColor: noIndicatorsColor,
                outlineColor: noIndicatorsColor
            };
        }

        if (!indicatorExtremes.value || !appConfig.value) {
            const baseColor = isFaded ? noScalesColorFaded : noScalesColor;
            return {
                fillColor: baseColor,
                outlineColor: fadeColor(baseColor)
            };
        }

        const value = featureIndicators[indicator].mean;
        const color = getIndicatorValueColor(indicator, value);

        const baseColor = isFaded ? fadeColor(color) : color;
        return {
            fillColor: baseColor,
            outlineColor: fadeColor(baseColor)
        };
    };

    return {
        getIndicatorColorType,
        getIndicatorColorCategories,
        getIndicatorValueColor,
        getIndicatorValueColorCategory,
        getFillAndOutlineColor,
        indicatorExtremes
    };
};
