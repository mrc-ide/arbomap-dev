<template>
    <svg role="presentation" :width="size" :height="size">
        <rect :width="size" :height="size" :fill="iconColors[0]" />
        <rect :width="size / 2" :height="size" :fill="iconColors[1]" />
        <polygon :points="`0,0 0,${0.7 * size} ${halfway},${halfway} ${halfway},0`" :fill="iconColors[2]" />
        <polygon :points="`${halfway},0 ${halfway},${halfway} ${size},${0.3 * size} ${size},0`" :fill="iconColors[3]" />
    </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useIndicatorColors } from "../../composables/useIndicatorColors";
import { ColorType } from "../../types/resourceTypes";
import {storeToRefs} from "pinia";
import {useAppStore} from "../../stores/appStore";

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

const { appConfig } = storeToRefs(useAppStore());
const { getIndicatorValueColor, getIndicatorColorType, getIndicatorColorCategories } = useIndicatorColors(appConfig);

const iconColors = computed(() => {
    if (getIndicatorColorType(props.indicator) === ColorType.Scale) {
        const colorScaleSampleValues = [0.7, 0.9, 0.4, 0.1];
        return colorScaleSampleValues.map((value) => getIndicatorValueColor(props.indicator, value, false));
    }
    const result = [];
    const categoryColors = getIndicatorColorCategories(props.indicator).map((cat) => cat.color);
    if (categoryColors.length === 0) {
        throw new Error(`Empty color categories config for ${props.indicator}`);
    }
    while (result.length < 4) {
        result.push(...categoryColors);
    }
    return result;
});
</script>
