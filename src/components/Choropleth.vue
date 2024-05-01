<template>
    <div>
        <LMap ref="map" style="height: 100vh; width: 100%" @update:bounds="boundsUpdated">
            <LTileLayer v-bind="backgroundLayer"></LTileLayer>
            <LGeoJson
                v-for="f in featuresWithColoursArr"
                ref="featureRefs"
                :key="getFeatureId(f.feature)"
                :geojson="f.feature"
                :options="createTooltips"
                :options-style="
                    () => {
                        return { ...style, fillColor: f.colour, color: borderColor(f.colour) };
                    }
                "
            ></LGeoJson>
            <LControl position="bottomright">
                <Legend :numberOfSteps="6" />
            </LControl>
        </LMap>
        <div style="visibility: hidden" class="choropleth-data-summary" v-bind="dataSummary"></div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, Ref } from "vue";
import { storeToRefs } from "pinia";
import { LatLngBounds, Layer } from "leaflet";
import { LControl, LGeoJson, LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { useRouter } from "vue-router";
import Color from "color";
import { useAppStore } from "../stores/appStore.ts";
import { useColourScale } from "../composables/useColourScale.ts";
import "leaflet/dist/leaflet.css";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";
import { APP_BASE_ROUTE } from "../router/utils";

interface FeatureWithColour {
    feature: Feature;
    colour: string;
}

const style = {
    className: "geojson"
};

const backgroundLayer = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 10,
    minZoom: 3
};

const map = ref<typeof LMap | null>(null);
const featureRefs = ref<(typeof LGeoJson)[]>([]);
const bounds: Ref<LatLngBounds | null> = ref(null);

const router = useRouter();
const {
    selectedFeatures,
    selectedIndicators,
    loading,
    selectedIndicator,
    selectedCountryId,
    appConfig,
    countryBoundingBoxes,
    waitingForMapBounds
} = storeToRefs(useAppStore());

const showSpinner = computed(() => waitingForMapBounds.value || loading.value);
useLoadingSpinner(map, showSpinner);

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

const featuresWithColours = computed(() => {
    const selectedInd = selectedIndicator.value;
    if (!selectedInd) return {};
    const selectedCountry = selectedCountryId.value;
    return Object.fromEntries(
        selectedFeatures.value.map((feature) => {
            return [
                getFeatureId(feature),
                {
                    feature,
                    colour: getColourForFeature(feature, selectedInd)
                }
            ];
        })
    );
});

const featuresWithColoursArr = computed(() => Object.values(featuresWithColours.value));

// Useful for the e2e tests
const dataSummary = computed(() => ({
    "selected-indicator": selectedIndicator.value,
    "selected-country-id": selectedCountryId.value,
    "colour-scale": appConfig.value?.indicators[selectedIndicator.value]?.colourScale.name,
    "feature-count": featuresWithColoursArr.value.length,
    "selected-country-feature-count": featuresWithColoursArr.value.filter(
        (f) => f.feature.properties![featureProperties.country] === selectedCountryId.value
    ).length,
    bounds:
        `S: ${bounds.value?.getSouth()} W: ${bounds.value?.getWest()} N: ${bounds.value?.getNorth()}` +
        `E: ${bounds.value?.getEast()}`
}));

const updateBounds = () => {
    if (!loading.value) {
        if (map.value?.leafletObject) {
            const country = selectedCountryId.value || "GLOBAL";
            const [west, east, south, north] = countryBoundingBoxes.value[country];
            const countryBounds = new LatLngBounds([south, west], [north, east]);
            map.value.leafletObject.fitBounds(countryBounds);
        }
    }
};

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

const createTooltips = {
    onEachFeature: (feature: Feature, layer: Layer) => {
        layer.bindTooltip(tooltipForFeature(feature)).openTooltip();
        layer.on({
            click: async () => {
                const country = feature.properties[featureProperties.country];
                // select feature's country, or unselect if click on it when already selected
                let countryToSelect: string;
                if (country === selectedCountryId.value) {
                    countryToSelect = "";
                } else {
                    countryToSelect = country;
                }
                router.push(`/${APP_BASE_ROUTE}/${selectedIndicator.value}/${countryToSelect}`);
            }
        });
    }
};

const borderColor = (fillColor: string) => {
    // for drawing borders more subtly, desaturate and fade the
    // color returned from color scale in rgb format
    const c = Color(fillColor);
    return c.desaturate(0.7).fade(0.7).rgb();
};

const updateTooltips = () => {
    featureRefs.value.forEach((geojson) => {
        if (geojson.geojson && geojson.leafletObject) {
            const f: FeatureWithColour = featuresWithColours.value[getFeatureId(geojson.geojson)];
            if (f && f.feature) {
                geojson.leafletObject.eachLayer((layer: Layer) => {
                    layer.setTooltipContent(tooltipForFeature(f.feature));
                });
            }
        }
    });
};

const updateMap = () => {
    updateTooltips();
};

const boundsUpdated = (b) => {
    // The last thing the map does when features are updated is redraw its bounds - we want to show the spinner while
    // waiting for this, so we set this flag to true when features first update on select country (in index page) and
    // false here
    bounds.value = b;
    waitingForMapBounds.value = false;
};

watch([selectedFeatures], () => {
    updateBounds();
    updateMap();
});
</script>
