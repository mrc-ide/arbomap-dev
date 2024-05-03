<template>
    <div>
        <LMap
            class="map"
            ref="map"
            style="height: calc(100vh - 48px); width: 100%"
            @update:bounds="lockBounds"
            @ready="() => updateMap(selectedFeatures)"
            :max-bounds-viscosity="1"
        >
            <LTileLayer v-once data-testid="tile-layer" v-bind="backgroundLayer"></LTileLayer>
            <LControl position="bottomright">
                <Legend :numberOfSteps="6" />
            </LControl>
            <LControl position="topleft">
                <ResetMapButton :selected-indicator="selectedIndicator" @reset-view="updateBounds" />
            </LControl>
        </LMap>
        <div style="visibility: hidden" class="choropleth-data-summary" v-bind="dataSummary"></div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { LatLngBounds, Layer, geoJSON, GeoJSON, polyline, Polyline, Map } from "leaflet";
import { LMap, LTileLayer, LControl } from "@vue-leaflet/vue-leaflet";
import { Feature, Geometry } from "geojson";
import { useRouter } from "vue-router";
import Color from "color";
import { useAppStore } from "../stores/appStore";
import { useColourScale } from "../composables/useColourScale";
import "leaflet/dist/leaflet.css";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";
import { APP_BASE_ROUTE } from "../router/utils";
import { debounce } from "../utils";

type FeatureProperties = { GID_0: string; GID_1: string; NAME_1: string };
type RawLeafletMap = Map | undefined;

const backgroundLayer = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
        "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ; " +
        "Boundaries: <a href='https://gadm.org' target='_blank'>GADM</a> version 4.1",
    maxZoom: 10,
    minZoom: 3
};

const map = shallowRef<typeof LMap | null>(null);
const bounds = ref<LatLngBounds | null>(null);
const geoJsonLayer = shallowRef<GeoJSON<FeatureProperties, Geometry>>(geoJSON(undefined));
const countryOutlineLayer = shallowRef<Polyline | null>(null);
const waitingForMapBounds = ref(true);
const isNewSelectedCountry = ref(false);

const router = useRouter();
const {
    selectedFeatures,
    selectedIndicators,
    selectedIndicator,
    selectedCountryId,
    appConfig,
    countryBoundingBoxes,
    admin0Geojson
} = storeToRefs(useAppStore());

useLoadingSpinner(map, waitingForMapBounds);

const { getColour } = useColourScale(selectedIndicators);

const featureProperties = appConfig.value.geoJsonFeatureProperties;

const featureInSelectedCountry = (feature: Feature, selectedCountry) =>
    feature.properties[featureProperties.country] === selectedCountry;
const getFeatureId = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value)
        ? feature.properties![featureProperties.idAdm2]
        : feature.properties![featureProperties.idAdm1];
const getFeatureName = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value)
        ? feature.properties![featureProperties.nameAdm2]
        : feature.properties![featureProperties.nameAdm1];

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
        (f) => f.properties![featureProperties.country] === selectedCountryId.value
    ).length,
    bounds:
        `S: ${bounds.value?.getSouth()} W: ${bounds.value?.getWest()} N: ${bounds.value?.getNorth()}` +
        `E: ${bounds.value?.getEast()}`
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

const layerWithOpenTooltip = ref<Layer | null>(null);

const configureGeojsonLayer = (feature: Feature, layer: Layer) => {
    layer.bindTooltip(tooltipForFeature(feature));
    layer.on({
        click: async () => {
            waitingForMapBounds.value = true;
            const country = feature.properties[featureProperties.country];
            // select feature's country, or unselect if click on it when already selected
            const countryToSelect = country === selectedCountryId.value ? "" : country;
            debounce(() => router.push(`/${APP_BASE_ROUTE}/${selectedIndicator.value}/${countryToSelect}`))();
        },
        tooltipopen: () => {
            const layerWithOpenTooltipRaw = toRaw(layerWithOpenTooltip.value);
            if (layerWithOpenTooltipRaw) layerWithOpenTooltipRaw.closeTooltip();
            layerWithOpenTooltip.value = layer;
        }
    });
};

const fadeColour = (fillColor: string, desaturate = 0.7, fade = 0.7) => {
    // for drawing borders more subtly and fading our features, desaturate
    // and fade the color returned from color scale in rgb format
    const c = Color(fillColor);
    return c.desaturate(desaturate).fade(fade).rgb();
};

const style = (f: Feature) => {
    const isFaded = selectedCountryId.value && f.properties![featureProperties.country] !== selectedCountryId.value;
    const featureColour = getColourForFeature(f, selectedIndicator.value);
    const fillColor = isFaded ? fadeColour(featureColour, 0.5, 0.6) : featureColour;
    return { className: "geojson", fillColor, color: fadeColour(fillColor) };
};

const lockBounds = async () => {
    const leafletMap = toRaw(map.value)?.leafletObject as RawLeafletMap;
    if (!leafletMap) return;

    if (isNewSelectedCountry.value && selectedCountryId.value) {
        leafletMap.setMaxBounds(leafletMap.getBounds());
        leafletMap.setMinZoom(leafletMap.getZoom());
    }

    isNewSelectedCountry.value = false;
    waitingForMapBounds.value = false;
};

const getBoundsForCountry = (countryId?: string) => {
    const [west, east, south, north] = countryBoundingBoxes.value[countryId || "GLOBAL"];
    return new LatLngBounds([south, west], [north, east]);
};

const updateBounds = async () => {
    const leafletMap = toRaw(map.value)?.leafletObject as RawLeafletMap;
    if (!leafletMap || Object.keys(countryBoundingBoxes.value).length === 0) return;

    // need to reset min zoom and max bounds so we can zoom out to world
    const globalBounds = getBoundsForCountry();
    leafletMap.setMinZoom(2.5);
    leafletMap.setMaxBounds(globalBounds);

    bounds.value = selectedCountryId.value ? getBoundsForCountry(selectedCountryId.value) : globalBounds;
    await leafletMap.fitBounds(bounds.value);
};

const updateMap = async (newFeatures: Feature[]) => {
    const leafletMap = toRaw(map.value)?.leafletObject as RawLeafletMap;
    if (!leafletMap) return;

    // remove layers from map
    geoJsonLayer.value.remove();
    countryOutlineLayer.value?.remove();

    // create new geojson and add to map
    geoJsonLayer.value = geoJSON<FeatureProperties, Geometry>(newFeatures, {
        style,
        onEachFeature: configureGeojsonLayer
    }).addTo(leafletMap);

    // adding country outline if we have a admin0geojson
    // note: the className is just for testing
    if (admin0Geojson.value) {
        const latLngs = GeoJSON.coordsToLatLngs(admin0Geojson.value.geometry.coordinates, 2);
        countryOutlineLayer.value = polyline(latLngs, {
            color: "black",
            weight: 1,
            opacity: 0.5,
            className: "country-outline"
        }).addTo(leafletMap);
    }

    await updateBounds();
};

watch([selectedFeatures, selectedIndicator], (newVal) => updateMap(newVal[0]));
watch(selectedCountryId, () => {
    isNewSelectedCountry.value = true;
});
</script>
