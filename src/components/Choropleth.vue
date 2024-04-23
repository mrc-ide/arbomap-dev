<template>
    <div>
        <LMap ref="map" style="height: 100vh; width: 100%" @update:bounds="boundsUpdated">
            <LTileLayer data-testid="tile-layer" v-bind="backgroundLayer"></LTileLayer>
            <LGeoJson
                v-for="f in featuresWithColoursArr"
                ref="featureRefs"
                :key="getFeatureId(f.feature)"
                :data-testid="getFeatureId(f.feature)"
                :geojson="f.feature"
                :options="createTooltips"
                :options-style="
                    () => {
                        return { ...style, fillColor: f.colour, color: borderColor(f.colour) };
                    }
                "
            >
            </LGeoJson>
        </LMap>
        <div style="visibility: hidden" class="choropleth-data-summary" v-bind="dataSummary"></div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import {GeoJSON, LatLngBounds, Layer} from "leaflet";
import { LGeoJson, LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore.ts";
import { useColourScale } from "../composables/useColourScale.ts";
import "leaflet/dist/leaflet.css";
import { useLoadingSpinner } from "../composables/useLoadingSpinner";
import Color from "color";
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

// The last thing the map does when features are updated is redraw its bounds - we want to show the spinner while waiting
// for this, so set this to true when features first update, and false on update bounds event from map


const router = useRouter();
const { selectedFeatures, selectedIndicators, loading, selectedIndicator, selectedCountryId, appConfig, countryBoundingBoxes, waitingForMapBounds } =
    storeToRefs(useAppStore());

const showSpinner = computed(() => waitingForMapBounds.value || loading.value);
useLoadingSpinner(map, showSpinner);

const { getColour } = useColourScale(selectedIndicators);
const featureInSelectedCountry = (feature: Feature, selectedCountry) => feature.properties[featureProps.value.country] === selectedCountry;
const getFeatureId = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value) ? feature.properties![featureProps.value.idAdm2] : feature.properties![featureProps.value.idAdm1];
const getFeatureName = (feature: Feature) =>
    featureInSelectedCountry(feature, selectedCountryId.value) ? feature.properties![featureProps.value.nameAdm2] : feature.properties![featureProps.value.nameAdm1];

const getColourForFeature = (feature, indicator, selectedCountry) => {
    const featureId = getFeatureId(feature);
    const featureIndicators = selectedIndicators.value[featureId];
    return getColour(indicator, featureIndicators);
};

const featuresWithColours = computed(() => {
    const selectedInd = selectedIndicator.value;
    if (!selectedInd) return {};
    const selectedCountry = selectedCountryId.value;
    return Object.fromEntries(selectedFeatures.value.map((feature) => {
        return [
            getFeatureId(feature),
            {
                feature,
                colour: getColourForFeature(feature, selectedInd, selectedCountry)
            }
        ];
    }));
});

const featuresWithColoursArr = computed(() => Object.values(featuresWithColours.value));

const featureProps = computed(() => appConfig.value?.geoJsonFeatureProperties);

// Useful for the e2e tests
const dataSummary = computed(() => ({
    "selected-indicator": selectedIndicator.value,
    "selected-country-id": selectedCountryId.value,
    "colour-scale": appConfig.value?.indicators[selectedIndicator.value]?.colourScale.name,
    "feature-count": featuresWithColoursArr.value.length,
    "selected-country-feature-count": featuresWithColoursArr.value.filter(
        (f) => f.feature.properties![featureProps.value.country] === selectedCountryId.value
    ).length
}));

const updateBounds = () => {
    console.log(`Updating bounds ${new Date().toLocaleString()}`)
    if (!loading.value) {
        if (map.value?.leafletObject) {
            const country = selectedCountryId.value || "GLOBAL";
            const [west, east, south, north] = countryBoundingBoxes.value[country];
            console.log(`W: ${west} E: ${east} S: ${south} N: ${north}`)
            const bounds = new LatLngBounds([south, west], [north, east]);
            map.value.leafletObject.fitBounds(bounds);
        }
    }
    console.log(`Finished Updating bounds ${new Date().toLocaleString()}`)
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
                const country = feature.properties[featureProps.value.country];
                // select feature's country, or unselect if click on it when already selected
                let countryToSelect: string;
                if (country === selectedCountryId.value) {
                    countryToSelect = "";
                } else {
                    countryToSelect = country;
                }
                router.push(`/${APP_BASE_ROUTE}/${selectedIndicator.value}/${countryToSelect}`);
            },
            add: async () => {
                console.log("layer added")
            },
            remove: async () => {
                console.log("layer removed")
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
    console.log(`Updating tooltips ${new Date().toLocaleString()}`)
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
    console.log(`Finished updating tooltips ${new Date().toLocaleString()}`)
};

const updateMap = () => {
    updateTooltips();
};

const boundsUpdated = () => {
    console.log("Map bounds updated!")
    waitingForMapBounds.value = false;
};

watch([selectedFeatures], () => {
    console.log("setting wating to true")
    waitingForMapBounds.value = true;

    updateBounds();
    updateMap();
});
</script>
