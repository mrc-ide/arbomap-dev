import { Layer } from "leaflet";
import { LGeoJson } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { storeToRefs } from "pinia";
import { FeatureWithColour } from "../types/resourceTypes";
import { getFeatureId } from "../resources/utils";
import { APP_BASE_ROUTE } from "../router/utils";
import { useAppStore } from "../stores/appStore";

export const useTooltips = (featureRefs: Ref<(typeof LGeoJson)[]>) => {
    const { appConfig, selectedIndicator, selectedIndicators, selectedCountryId } = storeToRefs(useAppStore());
    const router = useRouter();

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
        const featureId = getFeatureId(feature, appConfig.value);
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
        const name = feature.properties![appConfig.value?.featureNameProp] || featureId;
        return `<div class="text-body-1">${name}</div>` + `<div class="text-body-2">${indicatorValues}</div>`;
    };

    const createTooltips = {
        onEachFeature: (feature: Feature, layer: Layer) => {
            layer.bindTooltip(tooltipForFeature(feature)).openTooltip();
            layer.on({
                click: async () => {
                    const country = feature.properties[appConfig.value?.featureCountryProp];
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

    const updateTooltips = (featuresWithColours: FeatureWithColour[]) => {
        featuresWithColours.forEach((f: FeatureWithColour) => {
            const geojson = featureRefs.value.find((fr) => {
                const frId = getFeatureId(fr.geojson, appConfig.value);
                return frId === f.id;
            });
            if (geojson && geojson.geojson && geojson.leafletObject) {
                geojson.leafletObject.eachLayer((layer: Layer) => {
                    layer.setTooltipContent(tooltipForFeature(f.feature));
                });
            }
        });
    };

    return {
        createTooltips,
        updateTooltips
    };
};
