<template>
    <svg role="presentation" :width="size" :height="size">
        <rect :width="size" :height="size" :fill="getColor(sampleValues[0])" />
        <rect :width="size / 2" :height="size" :fill="getColor(sampleValues[1])" />
        <polygon :points="`0,0 0,${0.7 * size} ${halfway},${halfway} ${halfway},0`" :fill="getColor(sampleValues[2])" />
        <polygon :points="`${halfway},0 ${halfway},${halfway} ${size},${0.3 * size} ${size},0`" :fill="getColor(sampleValues[3])" />
    </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useIndicatorColors } from "../../composables/useIndicatorColors";
import {useAppStore} from "../../stores/appStore";
import {ColorType} from "../../types/resourceTypes";

const props = defineProps({
    size: {
        type: Number,
        required: true
    },
    indicator: {
        type: String,
        required: true
    }
});

const halfway = computed(() => props.size / 2);
const { appConfig } = useAppStore();
const { getIndicatorValueColor, getIndicatorColorType, getIndicatorColorCategories } = useIndicatorColors();

const sampleValues = computed(() => {
    if (getIndicatorColorType(props.indicator) === ColorType.Category) {
        // Use the limits of the categories to build the icon
        const categories = getIndicatorColorCategories(props.indicator);
        // Assume our scale starts at 0
        const result = [0];
        let categoryIdx= 0;
        while (result.length < 4) {
            if (categoryIdx >= categories.length) {
                categoryIdx = 0;
            }
            const { upperLimit } = categories[categoryIdx];
            // upper limit is null for final category - just set to any higher value than previous
            const value = upperLimit || result[result.length-1] + 1;
            result.push(value);
            categoryIdx++;
        }
        return result;
    } else {
        // Return some sample values from the scale to build the icon
        return [0.7, 0.9, 0.4, 0.1];
    }
});

const getColor = (value) => {
    // We get away with using the hardcoded values in the svg, because our only
    // colour categories are in the 0-1 range - a more generic solution would
    // pick values from the categories using the upperLimits - but let's implement
    // that when we need to
    return getIndicatorValueColor(props.indicator, value, false);
};
</script>
