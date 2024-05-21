<template>
    <div class="legend-container">
        <div class="legend-element map-control">
            <div class="legend-item" v-for="(level, index) in scaleLevels" v-bind:key="index" data-testid="legendItem">
                <i v-bind:style="level.style"></i>
                <span class="level">{{ level.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { useIndicatorColors } from "../composables/useIndicatorColors";
import { useSelectedMapInfo } from "../composables/useSelectedMapInfo";

const { appConfig, mapSettings } = storeToRefs(useAppStore());
const { selectedIndicators } = useSelectedMapInfo();
const { getIndicatorValueColor, indicatorExtremes, getColorCategories } = useIndicatorColors(selectedIndicators);

const props = defineProps({
    numberOfSteps: {
        type: Number,
        default: 6,
        validator: (value: number) => value >= 2
    }
});

const indicatorUnit = computed(() => {
    const { unit } = appConfig.value.indicators[mapSettings.value.indicator];
    if (!unit) return "";
    return unit === "%" ? unit : ` ${unit}`;
});

const indicatorMin = computed(() => {
    return indicatorExtremes.value[mapSettings.value.indicator].min;
});

const indicatorMax = computed(() => {
    return indicatorExtremes.value[mapSettings.value.indicator].max;
});

const indicatorHasSomeVariance = computed(() => {
    return indicatorMax.value !== indicatorMin.value;
});

const roundToSensiblePrecision = (value: number, stepSize: number) => {
    const stepLeadingZeroes = stepSize.toPrecision(1).includes(".") ? stepSize.toPrecision(1).split(".")[1].length : 0;
    const roundingNum = 10 ** stepLeadingZeroes;
    return Math.round(value * roundingNum) / roundingNum;
};

const scaleStepStyle = (val: number) => {
    let valAsProportion = indicatorHasSomeVariance.value
        ? (val - indicatorMin.value) / (indicatorMax.value - indicatorMin.value)
        : 0;
    const color = getIndicatorValueColor(mapSettings.value.indicator, valAsProportion, false);
    return stepStyle(color);
};

const stepStyle = (color: string) => {
    return { background: color };
};

const scaleLevels = computed(() => {
    const indicator = mapSettings.value.indicator;
    if (!(indicator in indicatorExtremes.value)) return [];
    const stepSize = (indicatorMax.value - indicatorMin.value) / (props.numberOfSteps - 1);
    let steps;
    const { type } = appConfig.value.indicators[indicator].colors;
    if (type === "scale") {
        steps = Array.from({length: indicatorHasSomeVariance.value ? props.numberOfSteps : 1}, (_, index) => {
            const stepValue = indicatorMin.value + index * stepSize;
            return {
                label: roundToSensiblePrecision(stepValue, stepSize) + indicatorUnit.value,
                style: scaleStepStyle(stepValue)
            };
        });
    } else {
        steps = getColorCategories(indicator).map((category) => ({
            label: category.name,
            style: stepStyle(category.color)
        }));
    }
    return steps.reverse();
});
</script>

<style>
.legend-container {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    background-color: rgba(255, 255, 255, 0.6);
    padding: 0.2rem;
}

.legend-element {
    vertical-align: bottom;
}

.legend-item {
    height: 1.125rem;
    display: table-row;
    i {
        width: 1.125rem;
        height: 1.125rem;
        float: left;
    }
    span {
        display: table-cell;
        padding-left: 0.2rem;
        vertical-align: bottom;
        white-space: pre;
    }
}
</style>
