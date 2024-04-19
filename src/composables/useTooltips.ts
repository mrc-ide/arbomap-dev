import { Layer } from "leaflet";
import { LGeoJson } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import { Dict } from "../types/utilTypes";
import { FeatureIndicatorValues, AppConfig, FeatureWithColour } from "../types/resourceTypes";
import { APP_BASE_ROUTE } from "../router/utils";

const router = useRouter();

export const useTooltips = (
    appConfig: Ref<AppConfig>,
    featureRefs: Ref<(typeof LGeoJson)[]>,
    selectedIndicator: Ref<string>,
    selectedIndicators: Ref<Dict<FeatureIndicatorValues>>,
    selectedCountryId: Ref<string>
) => {
    const featureProps = computed(() => appConfig.value?.geoJsonFeatureProperties);
    const featureInSelectedCountry = (feature: Feature, selectedCountry) =>
        feature.properties[featureProps.value.country] === selectedCountry;
    const getFeatureId = (feature: Feature) =>
        featureInSelectedCountry(feature, selectedCountryId.value)
            ? feature.properties![featureProps.value.idAdm2]
            : feature.properties![featureProps.value.idAdm1];

    const tooltipForFeature = (feature: Feature) => {
        let indicatorValues = "";
        const featureId = getFeatureId(feature);
        if (featureId in selectedIndicators.value) {
            const featureValues = selectedIndicators.value[featureId];
            indicatorValues = Object.keys(featureValues)
                .sort((key) => (key === selectedIndicator.value ? -1 : 1))
                .map((key) => {
                    const { humanReadableName, unit } = appConfig.value.indicators[key];
                    const { mean } = featureValues[key];
                    const headlineNumber = mean.toPrecision(3);
                    const line = `${humanReadableName}: ${headlineNumber} ${unit}<br/>`;
                    return key === selectedIndicator.value ? `<span class="font-weight-bold">${line}</span>` : line;
                })
                .join("");
        }
        const name = feature.properties![appConfig.value?.featureNameProp] || featureId;
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
