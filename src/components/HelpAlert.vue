<template>
    <v-alert
        v-model="isActive"
        class="elevation-1"
        color="blue-lighten-5"
        closable
        title="How to use this map"
        :text="helpText"
    />
    <v-btn id="helpButton" aria-label="Help" icon density="compact" v-show="!isActive" @click="isActive = !isActive">
        <v-icon>mdi-help-circle-outline</v-icon>
        <v-tooltip location="bottom" activator="parent">Help</v-tooltip>
    </v-btn>
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
<style lang="scss">
$v-alert-padding: 12px; // This is a little more compact than Vuetify's default (16px)
$leaflet-control-margin: 10px;
$leaflet-touch-bar-anchor-width: 30px;
$navbar-height: 48px;
$admin-toggle-height: 36px;
$admin-toggle-width: 198px;
/*
At time of writing, keeping constant the number of lines in the paragraph (3 at this width),
this max-width maximizes the efficient use of space within the alert. This optimal width will
be different if the help text is changed.
*/
$alert-max-width: 950px;
$large-screen-breakpoint: calc(
    (2 * $admin-toggle-width) + $alert-max-width + $leaflet-touch-bar-anchor-width + (4 * $leaflet-control-margin)
);
.v-alert {
    padding: $v-alert-padding;
    text-align: justify;
    max-width: $alert-max-width;

    /* Undo vuetify styling which is space-inefficient in that it gives close-button a whole grid-column */
    display: unset !important;

    /*
    Centering the alert (once the admin level toggle allows enough room)
    */
    @media screen and (min-width: $large-screen-breakpoint) {
        position: fixed !important;
        top: $navbar-height + $leaflet-control-margin;
        left: calc((100vw - $alert-max-width) / 2);
    }
}
.v-alert__close {
    position: absolute;
    top: $v-alert-padding;
    right: $v-alert-padding;
}
.v-alert-title {
    margin-bottom: 0.5rem;
}
#helpButton {
    align-self: flex-end;
}
</style>
