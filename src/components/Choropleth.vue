<template>
    <div v-if="initialising">loading..</div>
    <div v-else>
        <LMap ref="map" style="height: 100vh; width: 100%" @ready="updateBounds">
            <LTileLayer
                data-testid="tile-layer"
                :url="backgroundLayer.url"
                :attribution="backgroundLayer.attribution"
                :max-zoom="backgroundLayer.maxZoom"
                :min-zoom="backgroundLayer.minZoom"
            ></LTileLayer>
            <LGeoJson
                v-for="f in featuresWithColours"
                ref="featureRefs"
                :key="getFeatureId(f.feature)"
                :data-testid="getFeatureId(f.feature)"
                :geojson="f.feature"
                :options="createTooltips"
                :options-style="
                    () => {
                        return { ...style, fillColor: f.colour };
                    }
                "
            >
            </LGeoJson>
        </LMap>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { GeoJSON, Layer } from "leaflet";
import { LGeoJson, LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { useAppStore } from "../stores/appStore.ts";
import { useColourScale } from "../composables/useColourScale.ts";
import "leaflet/dist/leaflet.css";

interface FeatureWithColour {
    feature: Feature;
    colour: string;
}

const FEATURE_ID_PROP = "shapeID";
const FEATURE_NAME_PROP = "shapeName";
const FEATURE_COUNTRY_PROP = "shapeGroup";

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

const { selectedFeatures, selectedIndicators, loading, selectedIndicator, admin1Indicators } = storeToRefs(useAppStore());
const { selectCountry } = useAppStore();

const { colourScales, getColour } = useColourScale(selectedIndicators);

const getFeatureId = (feature: Feature) => feature.properties![FEATURE_ID_PROP];
const getFeatureName = (feature: Feature) => feature.properties![FEATURE_NAME_PROP];

const getColourForFeature = (feature, indicator) => {
    const featureIndicators = selectedIndicators.value[getFeatureId(feature)];
    return getColour(indicator, featureIndicators);
};

// TODO: This structure is an inefficient way to get reactivity working, but we can probably do better!
const featuresWithColours = computed(() => {
    if (loading.value) {
        return [];
    }
    const selectedInd = selectedIndicator.value;
    return  selectedFeatures.value.map((feature) => {
        return {
            feature,
            colour: getColourForFeature(feature, selectedInd)
        };
    });
});

const updateBounds = () => {
    if (!loading.value) {
        if (map.value?.leafletObject) {
            map.value.leafletObject.fitBounds(
                featuresWithColours.value.map((f: FeatureWithColour) => new GeoJSON(f.feature).getBounds())
            );
        }
    }
};

const initialising = computed(() => {
    return (
        loading.value &&
        !featuresWithColours.value.length &&
        !selectedIndicators.value.length &&
        !Object.keys(colourScales.value).length
    );
});

// TODO: pull out tooltips stuff into composable when fully implement
const tooltipForFeature = (feature: Feature) => {
    let indicatorValues = "";
    const fid = getFeatureId(feature);
    if (fid in selectedIndicators.value) {
        const featureValues = selectedIndicators.value[fid];
        indicatorValues = Object.keys(featureValues)
            .map((key) => {
                return `${key}: ${featureValues[key].mean} (+/- ${featureValues[key].sd})<br/>`;
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
                await selectCountry(feature.properties[FEATURE_COUNTRY_PROP]);
            }
        });
    }
};

const updateTooltips = () => {
    featuresWithColours.value.forEach((f: FeatureWithColour) => {
        const geojson = featureRefs.value.find((fr) => getFeatureId(fr.geojson) === getFeatureId(f.feature));
        if (geojson && geojson.geojson && geojson.leafletObject) {
            geojson.leafletObject.eachLayer((layer: Layer) => {
                layer.setTooltipContent(tooltipForFeature(f.feature));
            });
        }
    });
};

const updateMap = () => {
    updateTooltips();
};

watch([selectedFeatures], () => {
    updateBounds();
    updateMap();
});
</script>
