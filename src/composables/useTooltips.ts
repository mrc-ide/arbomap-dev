import { Layer } from "leaflet";
import { LGeoJson } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { storeToRefs } from "pinia";
import { FeatureWithColour } from "../types/resourceTypes";
import { APP_BASE_ROUTE } from "../router/utils";
import { useAppStore } from "../stores/appStore";

export const useTooltips = (featureRefs: Ref<(typeof LGeoJson)[]>) => {
    const { appConfig, selectedIndicator, selectedIndicators, selectedCountryId } = storeToRefs(useAppStore());
    const router = useRouter();
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
    const sortedIndicators = computed(() => {
        if (!appConfig.value) return [];

        const sortedKeys = Object.keys(appConfig.value.indicators).sort((indicatorName) =>
            indicatorName.toLowerCase() === selectedIndicator.value.toLowerCase() ? -1 : 1
        );

        const sortedMap = new Map();

        sortedKeys.forEach((key) => {
            sortedMap.set(key, appConfig.value.indicators[key]);
        });

        return sortedMap;
    });

    const tooltipForFeature = (feature: Feature) => {
        let indicatorValues = "";
        const featureId = getFeatureId(feature);
        if (featureId in selectedIndicators.value) {
            const featureValues = selectedIndicators.value[featureId];
            indicatorValues = "";
            sortedIndicators.value.forEach((metadata, indicatorKey) => {
                const { mean } = featureValues[indicatorKey];
                const headlineNumber = mean.toPrecision(3);
                const line = `${metadata.humanReadableName}: ${headlineNumber}${metadata.unit}<br/>`;
                indicatorValues +=
                    indicatorKey.toLowerCase() === selectedIndicator.value.toLowerCase()
                        ? `<span class="font-weight-bold">${line}</span>`
                        : line;
            });
        }
        const name = getFeatureName(feature) || featureId;
        return `<div class="text-body-1">${name}</div>` + `<div class="text-body-2">${indicatorValues}</div>`;
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
                    console.log("layer added");
                },
                remove: async () => {
                    console.log("layer removed");
                }
            });
        }
    };

    const updateTooltips = (featuresWithColours: FeatureWithColour[]) => {
        featureRefs.value.forEach((geojson) => {
            if (geojson.geojson && geojson.leafletObject) {
                const f: FeatureWithColour = featuresWithColours[getFeatureId(geojson.geojson)];
                if (f && f.feature) {
                    geojson.leafletObject.eachLayer((layer: Layer) => {
                        layer.setTooltipContent(tooltipForFeature(f.feature));
                    });
                }
            }
        });
    };

    return {
        createTooltips,
        updateTooltips
    };
};
