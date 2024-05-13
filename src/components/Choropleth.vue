<template>
    <div>
        <LMap
            class="map"
            ref="map"
            style="height: calc(100vh - 48px); width: 100%"
            @update:bounds="finishUpdatingMap"
            @ready="() => updateMap(selectedFeatures)"
            :max-bounds-viscosity="1"
        >
            <LTileLayer v-once data-testid="tile-layer" v-bind="backgroundLayer"></LTileLayer>
            <LControl position="bottomright">
                <Legend :numberOfSteps="6" />
            </LControl>
            <LControl position="topleft">
                <ResetMapButton :selected-indicator="selectedIndicator" @reset-view="updateRegionBounds" />
            </LControl>
            <LControl position="topright">
                <v-btn @click="downloadExcel()">Download Excel</v-btn>
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
import { useColourScale } from "../composables/useColourScale";
import { useLeaflet } from "../composables/useLeaflet";
import "leaflet/dist/leaflet.css";
import { useTooltips } from "../composables/useTooltips";
import { APP_BASE_ROUTE } from "../router/utils";
import { debounce } from "../utils";
import { backgroundLayer } from "./utils";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";

const mapLoading = ref(true);
const router = useRouter();
const { selectedFeatures, selectedIndicators, selectedIndicator, selectedCountryId, appConfig } =
    storeToRefs(useAppStore());
const { downloadExcel } = useAppStore();
const featureProperties = appConfig.value.geoJsonFeatureProperties;

const { tooltipForFeature } = useTooltips();
const { getFillAndOutlineColour } = useColourScale(selectedIndicators);

const featureInSelectedCountry = (feature: Feature, selectedCountry: string) =>
    feature.properties[featureProperties.country] === selectedCountry;

const getFeatureId = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value)
        ? feature.properties![featureProperties.idAdm2]
        : feature.properties![featureProperties.idAdm1];

const getFeatureName = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value)
        ? feature.properties![featureProperties.nameAdm2]
        : feature.properties![featureProperties.nameAdm1];

const style = (f: Feature) => {
    const isFaded = !!selectedCountryId.value && !featureInSelectedCountry(f, selectedCountryId.value);
    const styleColors = getFillAndOutlineColour(selectedIndicator.value, getFeatureId(f), isFaded);
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
            const countryToSelect = country === selectedCountryId.value ? "" : country;
            debounce(() => router.push(`/${APP_BASE_ROUTE}/${selectedIndicator.value}/${countryToSelect}`))();
        }
    };
};

const { map, dataSummary, lockBounds, updateLeafletMap, handleMapBoundsUpdated, updateRegionBounds } = useLeaflet(
    style,
    getTooltip,
    layerOnEvents
);
useLoadingSpinner(map, mapLoading);

const updateMap = (features: Feature[]) => {
    if (selectedCountryId.value) {
        lockBounds.value = true;
    }
    updateLeafletMap(features, selectedCountryId.value);
};

const finishUpdatingMap = () => {
    handleMapBoundsUpdated();
    mapLoading.value = false;
};

watch([selectedFeatures, selectedIndicator], ([newFeatures]) => updateMap(newFeatures));
</script>
