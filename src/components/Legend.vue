<template>
    <div class="legend-container">
        <div class="legend-element map-control">
            <div class="legend-item" v-for="(level, index) in scaleLevels" v-bind:key="index" data-testid="legendItem">
                <i v-bind:style="level.style"></i>
                <span class="level">{{ level.label }}</span>
                <br />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/appStore";
import { useColourScale } from "../composables/useColourScale";

const { appConfig, selectedIndicators, selectedIndicator } = storeToRefs(useAppStore());

const { colourScales, indicatorExtremes } = useColourScale(selectedIndicators);

const props = defineProps({
    numberOfSteps: {
        type: Number,
        default: 6,
        validator: (value: number) => value >= 2
    }
});

const colourFunction = computed(() => {
    return colourScales.value[selectedIndicator.value];
});

const indicatorUnit = computed(() => {
    const { unit } = appConfig.value.indicators[selectedIndicator.value];
    if (!unit) return "";
    return unit === "%" ? unit : ` ${unit}`;
});

const indicatorMin = computed(() => {
    return indicatorExtremes.value[selectedIndicator.value].min;
});

const indicatorMax = computed(() => {
    return indicatorExtremes.value[selectedIndicator.value].max;
});

const indicatorHasSomeVariance = computed(() => {
    return indicatorMax.value !== indicatorMin.value;
});

const roundToSensiblePrecision = (value: number, stepSize: number) => {
    const stepLeadingZeroes = stepSize.toPrecision(1).includes(".") ? stepSize.toPrecision(1).split(".")[1].length : 0;
    const roundingNum = 10 ** stepLeadingZeroes;
    return Math.round(value * roundingNum) / roundingNum;
};

const stepStyle = (val: number) => {
    const valAsProportion = indicatorHasSomeVariance.value
        ? (val - indicatorMin.value) / (indicatorMax.value - indicatorMin.value)
        : 0;
    return { background: colourFunction.value(valAsProportion) };
};

const scaleLevels = computed(() => {
    if (!(selectedIndicator.value in indicatorExtremes.value)) return [];
    const stepSize = (indicatorMax.value - indicatorMin.value) / (props.numberOfSteps - 1);
    return Array.from({ length: indicatorHasSomeVariance.value ? props.numberOfSteps : 1 }, (_, index) => {
        const stepValue = indicatorMin.value + index * stepSize;
        return {
            label: roundToSensiblePrecision(stepValue, stepSize) + indicatorUnit.value,
            style: stepStyle(stepValue)
        };
    }).reverse();
});
</script>

<style>
.legend-container {
    display: table-cell;
    position: absolute;
    left: -4rem;
    bottom: 0.5rem;
}
.legend-element {
    vertical-align: bottom;
    display: inline-block;
}
.legend-item {
    height: 1.125rem;

    i {
        width: 1.125rem;
        height: 1.125rem;
        float: left;
        margin-right: 0.5rem;
    }
}
</style>
