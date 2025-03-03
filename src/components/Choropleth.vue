<template>
    <div style="display: flex; flex-direction: column; height: calc(100vh - 48px)">
        <LMap
            class="map"
            ref="map"
            style="width: 100%; flex: 1 1 100%"
            @update:bounds="finishUpdatingMap"
            @ready="updateMap"
            :max-bounds-viscosity="1"
        >
            <LTileLayer v-once data-testid="tile-layer" v-bind="backgroundLayer"></LTileLayer>
            <LControl position="bottomright">
                <Legend :numberOfSteps="6" />
            </LControl>
            <LControl position="topleft">
                <ResetMapButton :selected-indicator="mapSettings.indicator" @reset-view="updateRegionBounds" />
            </LControl>
            <LControl position="topright">
                <HelpAlert />
            </LControl>
            <LControl position="topright">
                <ExcelDownloadButton />
            </LControl>
            <LControl v-if="isLargeScreen" position="bottomleft" style="margin-left: 2rem; margin-bottom: 2rem">
                <map-settings-menu :is-large-screen="true"></map-settings-menu>
            </LControl>
        </LMap>
        <div v-if="!isLargeScreen">
            <map-settings-menu :is-large-screen="false"></map-settings-menu>
        </div>
        <div style="visibility: hidden" class="choropleth-data-summary" v-bind="dataSummary"></div>
    </div>
</template>
<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { LMap, LTileLayer, LControl } from "@vue-leaflet/vue-leaflet";
import { useRouter } from "vue-router";
import { useMediaQuery } from "@vueuse/core";
import { useAppStore } from "../stores/appStore";
import { useIndicatorColors } from "../composables/useIndicatorColors";
import { useLeaflet } from "../composables/useLeaflet";
import "leaflet/dist/leaflet.css";
import { useTooltips } from "../composables/useTooltips";
import { APP_BASE_ROUTE } from "../router/utils";
import { routerPush } from "../utils";
import { backgroundLayer } from "./utils";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";
import { useSelectedMapInfo } from "../composables/useSelectedMapInfo";
import MapSettingsMenu from "./mapSettingsMenu/MapSettingsMenu.vue";
import { MapFeature } from "../types/resourceTypes";
import ExcelDownloadButton from "./ExcelDownloadButton.vue";

const router = useRouter();
const { mapSettings, appConfig, mapLoading } = storeToRefs(useAppStore());
const featureProperties = appConfig.value.geoJsonFeatureProperties;
const { selectedFeatures, selectedIndicators } = useSelectedMapInfo();
const isLargeScreen = useMediaQuery("(min-width: 1024px)");

const { tooltipForFeature } = useTooltips(selectedIndicators);
const { getFillAndOutlineColor } = useIndicatorColors(appConfig, selectedIndicators);

const featureInSelectedCountry = (feature: MapFeature) =>
    feature.properties[featureProperties.country] === mapSettings.value.country;

const featureAdminLevel = (feature: MapFeature) =>
    featureInSelectedCountry(feature) && mapSettings.value.adminLevel === 2 ? 2 : 1;

const getFeatureId = (feature: MapFeature) =>
    featureAdminLevel(feature) === 2
        ? feature.properties[featureProperties.idAdm2]
        : feature.properties[featureProperties.idAdm1];

const getFeatureName = (feature: MapFeature) =>
    featureAdminLevel(feature) === 2
        ? feature.properties[featureProperties.nameAdm2]
        : feature.properties[featureProperties.nameAdm1];

const style = (f: MapFeature) => {
    const { country, indicator } = mapSettings.value;
    const isFaded = !!country && !featureInSelectedCountry(f);
    const styleColors = getFillAndOutlineColor(indicator, getFeatureId(f), isFaded);
    return { className: "geojson", fillColor: styleColors.fillColor, color: styleColors.outlineColor };
};

const getTooltip = (feature: MapFeature) => tooltipForFeature(getFeatureId(feature), getFeatureName(feature));

// when rendering the geojson, leaflet will attach event listener specified here to each feature.
// here we use it to control mapLoading element and changing the URL of the app when they click on
// a feature based on what country it is
const layerOnEvents = (feature: MapFeature) => {
    return {
        click: () => {
            mapLoading.value = true;
            const country = feature.properties[featureProperties.country];
            // select feature's country, or unselect if click on it when already selected
            const countryToSelect = country === mapSettings.value.country ? "" : country;
            routerPush(router, `/${APP_BASE_ROUTE}/${mapSettings.value.indicator}/${countryToSelect}`);
        }
    };
};

const { map, dataSummary, lockBounds, updateLeafletMap, handleMapBoundsUpdated, updateRegionBounds } = useLeaflet(
    style,
    getTooltip,
    layerOnEvents
);
useLoadingSpinner(map, mapLoading);

const updateMap = () => {
    lockBounds.value = !!mapSettings.value.country;
    updateLeafletMap(selectedFeatures.value, mapSettings.value.country);
};

const finishUpdatingMap = () => {
    handleMapBoundsUpdated();
    mapLoading.value = false;
};

watch(mapSettings, updateMap);
</script>
<style>
.leaflet-top.leaflet-right .leaflet-control {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    /* margin-left must belong here rather than HelpAlert, or HelpAlert's margin prevents clicks on zoom controls */
    margin-left: 55px;
}
</style>
