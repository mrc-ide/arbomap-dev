<template>
    <svg role="presentation" :width="size" :height="size">
        <rect :width="size" :height="size" :fill="getColor(0.7)" />
        <rect :width="size / 2" :height="size" :fill="getColor(0.9)" />
        <polygon :points="`0,0 0,${0.7 * size} ${halfway},${halfway} ${halfway},0`" :fill="getColor(0.4)" />
        <polygon :points="`${halfway},0 ${halfway},${halfway} ${size},${0.3 * size} ${size},0`" :fill="getColor(0.1)" />
    </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useIndicatorColors } from "../../composables/useIndicatorColors";
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
const { appConfig } = useAppStore();
const { getIndicatorValueColor } = useIndicatorColors();

const getColor = (value) => {
    // We get away with using the hardcoded values in the svg, because our only
    // colour categories are in the 0-1 range - a more generic solution would
    // pick values from the categories using the upperLimits - but let's implement
    // that when we need to
    return getIndicatorValueColor(props.indicator, value, false);
};
</script>
