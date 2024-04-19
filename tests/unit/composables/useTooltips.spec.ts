import { describe, test, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { Layer } from "leaflet";
import { LGeoJson } from "@vue-leaflet/vue-leaflet";
import { useTooltips } from "../../../src/composables/useTooltips";
import { MOCK_APP_CONFIG, MOCK_ADMIN1_INDICATORS, MOCK_FEATURE } from "../mocks/mockObjects";
import { AppConfig, FeatureIndicatorValues, FeatureWithColour } from "../../../src/types/resourceTypes";
import { Dict } from "../../../src/types/utilTypes";

describe("useTooltips", () => {
    let appConfig: Ref<AppConfig>;
    let featureRefs: Ref<(typeof LGeoJson)[]>;
    let selectedIndicator: Ref<string>;
    let selectedIndicators: Ref<Dict<FeatureIndicatorValues>>;
    let selectedCountryId: Ref<string>;
    let layer: Layer;
    let sut;

    beforeEach(() => {
        appConfig = ref(MOCK_APP_CONFIG);
        featureRefs = ref([]);
        selectedIndicator = ref("FOI");
        selectedIndicators = ref(MOCK_ADMIN1_INDICATORS.MWI);
        selectedCountryId = ref("");
        sut = useTooltips(appConfig, featureRefs, selectedIndicator, selectedIndicators, selectedCountryId);
    });

    test("createTooltips generates correct tooltip content and binds it to the layer", () => {
        const { createTooltips } = sut;

        layer = new Layer();
        vi.spyOn(layer, "bindTooltip");

        selectedIndicator.value = "FOI";

        const expectedTooltipContent =
            '<div class="text-body-1">Test123</div>' +
            '<div class="text-body-2"><span class="font-weight-bold">' +
            "Force of infection: 0.100 <br/></span>" +
            "Seroprevalence at 9 years of age: 0.200 %<br/></div>";

        createTooltips.onEachFeature(MOCK_FEATURE, layer);

        expect(layer.bindTooltip).toHaveBeenCalledWith(expectedTooltipContent);
    });

    test("updateTooltips generates correct tooltip content and binds it to the layer", () => {
        const { updateTooltips } = sut;

        const mockLGeoJson = {
            leafletObject: {
                eachLayer: vi.fn((callback) => {
                    callback(layer);
                })
            },
            geojson: MOCK_FEATURE
        } as unknown as typeof LGeoJson;
        featureRefs.value.push(mockLGeoJson);

        layer = new Layer();
        vi.spyOn(layer, "setTooltipContent");

        selectedIndicator.value = "p9";

        const expectedTooltipContent =
            '<div class="text-body-1">Test123</div>' +
            '<div class="text-body-2"><span class="font-weight-bold">' +
            "Seroprevalence at 9 years of age: 0.200 %<br/></span>" +
            "Force of infection: 0.100 <br/></div>";

        const featureWithColour = {
            feature: MOCK_FEATURE,
            colour: "red",
            id: Object.keys(MOCK_ADMIN1_INDICATORS.MWI)[0]
        } as FeatureWithColour;

        updateTooltips([featureWithColour]);

        expect(layer.setTooltipContent).toHaveBeenCalledWith(expectedTooltipContent);
    });
});
