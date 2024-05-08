<template>
    <v-btn aria-label="Help" icon density="compact" v-show="!isActive" @click="isActive = true">
        <v-icon>mdi-help-circle-outline</v-icon>
        <v-tooltip activator="parent">Help</v-tooltip>
    </v-btn>
    <v-alert
        v-model="isActive"
        class="elevation-1"
        color="blue-lighten-5"
        closable
        title="How to use this map"
        :text="helpText"
    >
    </v-alert>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const helpText = `
    DengueMap provides high-resolution estimates of dengue transmission intensity in countries where
    dengue is endemic. View estimated values for a region by hovering your cursor over it on the map.
    Click on a region to view that country's values at higher resolution. Click on the selected
    country again to return to default view. Use buttons at the bottom left to select estimate indicator,
    and at the top left to control the zoom level. To toggle admin level when viewing a selected country,
    use the controls in the top right.
`;
// Initialize alert as open or closed based on localStorage
const isActive = ref(localStorage.getItem("helpAlertHasBeenDismissed") !== "true");

// Update localStorage when alert is dismissed
watch(isActive, (newValue) => {
    if (newValue === false) {
        localStorage.setItem("helpAlertHasBeenDismissed", "true");
    }
});
</script>

<style>
.v-alert {
    position: fixed !important;
    top: 58px;
    left: 55px;
    max-width: calc(100vw - (55px + 5px));
}
.v-alert-title {
    margin-bottom: 0.5rem;
}
</style>
