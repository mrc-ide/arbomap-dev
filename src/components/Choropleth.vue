<template>
    <div>
        <LMap ref="map" style="height: 100vh; width: 100%" @update:bounds="waitingForMapBounds = false">
            <LTileLayer v-once data-testid="tile-layer" v-bind="backgroundLayer"></LTileLayer>
        </LMap>
        <div style="visibility: hidden" class="choropleth-data-summary" v-bind="dataSummary"></div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { LatLngBounds, Layer, geoJSON, GeoJSON } from "leaflet";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { Feature, Geometry } from "geojson";
import { useRouter } from "vue-router";
import Color from "color";
import { useAppStore } from "../stores/appStore";
import { useColourScale } from "../composables/useColourScale";
import "leaflet/dist/leaflet.css";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";
import { APP_BASE_ROUTE } from "../router/utils";
import { debounce } from "../utils";

type Bounds = {west: number, east: number, south: number, north: number}

const backgroundLayer = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 10,
    minZoom: 3
};

const map = ref<typeof LMap | null>(null);
const bounds = ref<Bounds | null>(null);
const geoJsonLayer = ref<GeoJSON<any, Geometry>>(geoJSON(undefined));
const waitingForMapBounds = ref(true);

const router = useRouter();
const {
    selectedFeatures,
    selectedIndicators,
    selectedIndicator,
    selectedCountryId,
    appConfig,
    countryBoundingBoxes
} = storeToRefs(useAppStore());

useLoadingSpinner(map, waitingForMapBounds);

const { getColour } = useColourScale(selectedIndicators);

const featureProps = computed(() => appConfig.value?.geoJsonFeatureProperties);

const featureInSelectedCountry = (feature: Feature, selectedCountry) =>
    feature.properties[featureProps.value.country] === selectedCountry;
const getFeatureId = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value)
        ? feature.properties![featureProps.value.idAdm2]
        : feature.properties![featureProps.value.idAdm1];
const getFeatureName = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value)
        ? feature.properties![featureProps.value.nameAdm2]
        : feature.properties![featureProps.value.nameAdm1];

const getColourForFeature = (feature, indicator) => {
    const featureId = getFeatureId(feature);
    const featureIndicators = selectedIndicators.value[featureId];
    return getColour(indicator, featureIndicators);
};

// Useful for the e2e tests
const dataSummary = computed(() => ({
    "selected-indicator": selectedIndicator.value,
    "selected-country-id": selectedCountryId.value,
    "colour-scale": appConfig.value?.indicators[selectedIndicator.value]?.colourScale.name,
    "feature-count": selectedFeatures.value.length,
    "selected-country-feature-count": selectedFeatures.value.filter(
        f => f.properties![featureProps.value.country] === selectedCountryId.value
    ).length,
    bounds:
        `S: ${bounds.value?.south} W: ${bounds.value?.west} N: ${bounds.value?.north}` +
        `E: ${bounds.value?.east}`
}));

// TODO: pull out tooltips stuff into composable when fully implement
const tooltipForFeature = (feature: Feature) => {
    let indicatorValues = "";
    const fid = getFeatureId(feature);
    if (fid in selectedIndicators.value) {
        const featureValues = selectedIndicators.value[fid];
        indicatorValues = Object.keys(featureValues)
            .map((key) => {
                return `${key}: ${featureValues[key].mean}<br/>`;
            })
            .join("");
    }
    const name = getFeatureName(feature) || getFeatureId(feature);
    return `<div><strong>${name}</strong></div><div>${indicatorValues}</div>`;
};

const createTooltips = (feature: Feature, layer: Layer) => {
    layer.bindTooltip(tooltipForFeature(feature));
    layer.on({
        click: async () => {
            waitingForMapBounds.value = true;
            const country = feature.properties[featureProps.value.country];
            // select feature's country, or unselect if click on it when already selected
            const countryToSelect = country === selectedCountryId.value ? "" : country;
            debounce(() => router.push(`/${APP_BASE_ROUTE}/${selectedIndicator.value}/${countryToSelect}`))();
        }
    });
};

const fadeColour = (fillColor: string, desaturate = 0.7, fade = 0.7) => {
    // for drawing borders more subtly and fading our features, desaturate
    // and fade the color returned from color scale in rgb format
    const c = Color(fillColor);
    return c.desaturate(desaturate).fade(fade).rgb();
};

const style = (f: any) => {
    const isFaded = selectedCountryId.value &&
        f.properties![featureProps.value.country] !== selectedCountryId.value;
    const featureColour = getColourForFeature(f, selectedIndicator.value);
    const fillColor = isFaded ? fadeColour(featureColour, 0.5, 0.6) : featureColour;
    return { className: "geojson", fillColor, color: fadeColour(fillColor) };
}

const updateMap = async (newFeatures: Feature[]) => {
    if (!map.value) return;

    // remove layer from map
    geoJsonLayer.value.remove()

    // create new geojson and add to map
    geoJsonLayer.value = geoJSON(newFeatures, {
        style, onEachFeature: createTooltips
    }).addTo(map.value.leafletObject);

    // update bounds
    const country = selectedCountryId.value || "GLOBAL";
    const [west, east, south, north] = countryBoundingBoxes.value[country];
    const countryBounds = new LatLngBounds([south, west], [north, east]);
    await map.value.leafletObject.fitBounds(countryBounds);

    // record bounds for testing
    bounds.value = { west, east, south, north };
};


watch([selectedFeatures, selectedIndicator], async (newVal) => await updateMap(newVal[0]));
</script>
