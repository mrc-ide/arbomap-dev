<template>
    <div>
        <LMap
            class="map"
            ref="map"
            style="height: calc(100vh - 48px); width: 100%"
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
                <AdminLevelToggle @change-admin-level="handleChangeAdminLevel" v-if="mapSettings.country" />
                <HelpAlert />
            </LControl>
        </LMap>
        <div style="visibility: hidden" class="choropleth-data-summary" v-bind="dataSummary"></div>
    </div>
</template>
<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { LMap, LTileLayer, LControl } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import { useColorScale } from "../composables/useColorScale";
import { useLeaflet } from "../composables/useLeaflet";
import "leaflet/dist/leaflet.css";
import { useTooltips } from "../composables/useTooltips";
import { APP_BASE_ROUTE } from "../router/utils";
import { routerPush, AdminLevel } from "../utils";
import { backgroundLayer } from "./utils";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";
import { useSelectedMapInfo } from "../composables/useSelectedMapInfo";
import AdminLevelToggle from "./AdminLevelToggle.vue";

const mapLoading = ref(true);
const router = useRouter();
const { mapSettings, appConfig } = storeToRefs(useAppStore());
const featureProperties = appConfig.value.geoJsonFeatureProperties;
const { selectedFeatures, selectedIndicators } = useSelectedMapInfo();

const { tooltipForFeature } = useTooltips(selectedIndicators);
const { getFillAndOutlineColor } = useColorScale(selectedIndicators);

const featureInSelectedCountry = (feature: Feature) =>
    feature.properties[featureProperties.country] === mapSettings.value.country;

const featureAdminLevel = (feature: Feature) =>
    featureInSelectedCountry(feature) && mapSettings.value.adminLevel === 2 ? 2 : 1;

const getFeatureId = (feature: Feature) =>
    featureAdminLevel(feature) === 2
        ? feature.properties[featureProperties.idAdm2]
        : feature.properties[featureProperties.idAdm1];

const getFeatureName = (feature: Feature) =>
    featureAdminLevel(feature) === 2
        ? feature.properties[featureProperties.nameAdm2]
        : feature.properties[featureProperties.nameAdm1];

const handleChangeAdminLevel = (level: number) => {
    mapLoading.value = true;
    const { indicator, country } = mapSettings.value;
    const adminLevel = level === 1 ? AdminLevel.ONE : AdminLevel.TWO;
    routerPush(router, `/${APP_BASE_ROUTE}/${indicator}/${country}/${adminLevel}`);
};

const style = (f: Feature) => {
    const { country, indicator } = mapSettings.value;
    const isFaded = !!country && !featureInSelectedCountry(f);
    const styleColors = getFillAndOutlineColor(indicator, getFeatureId(f), isFaded);
    return { className: "geojson", fillColor: styleColors.fillColor, color: styleColors.outlineColor };
};

const getTooltip = (feature: Feature) => tooltipForFeature(getFeatureId(feature), getFeatureName(feature));

// when rendering the geojson, leaflet will attach event listener specified here to each feature.
// here we use it to control mapLoading element and changing the URL of the app when they click on
// a feature based on what country it is
const layerOnEvents = (feature: Feature) => {
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
