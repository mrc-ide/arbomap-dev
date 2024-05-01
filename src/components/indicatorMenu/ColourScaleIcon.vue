<template>
    <svg :width="size" :height="size">
        <rect :width="size" :height="size" :fill="getColour(0.7)"/>
        <rect :width="size/2" :height="size" :fill="getColour(0.9)"/>
        <polygon :points="`0,0 0,${0.7 * size} ${halfway},${halfway} ${halfway},0`" :fill="getColour(0.4)" />
        <polygon :points="`${halfway},0 ${halfway},${halfway} ${size},${0.3 * size} ${size},0`" :fill="getColour(0.1)" />
    </svg>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useColourScale} from "../../composables/useColourScale";

const props = defineProps({
    size: {
        type: Number
    },
    indicator: {
        type: String
    }
});

const halfway = computed(() =>  props.size/2);
const {colourScales} = useColourScale();

const colourScale = computed(() => colourScales.value[props.indicator]);
const getColour = (value) => colourScale.value(value);
</script>
