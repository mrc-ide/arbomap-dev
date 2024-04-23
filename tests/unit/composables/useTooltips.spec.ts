import { describe, test, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { Layer } from "leaflet";
import { LGeoJson } from "@vue-leaflet/vue-leaflet";
import { useTooltips } from "../../../src/composables/useTooltips";
import { MOCK_ADMIN1_INDICATORS, MOCK_FEATURE } from "../mocks/mockObjects";
import { mockPinia } from "../mocks/mockPinia";
import { FeatureWithColour } from "../../../src/types/resourceTypes";

describe("useTooltips", () => {
    const featureRefs = ref([]);
    let layer: Layer;

    describe("with selected indicator FOI", () => {
        beforeEach(() => {
            mockPinia({ selectedIndicator: "FOI" });
        });

        test("createTooltips generates correct tooltip content and binds it to the layer", () => {
            const { createTooltips } = useTooltips(featureRefs);

            layer = new Layer();
            vi.spyOn(layer, "bindTooltip");

            const expectedTooltipContent =
                '<div class="text-body-1">Test123</div>' +
                '<div class="text-body-2"><span class="font-weight-bold">' +
                "Force of infection: 0.100<br/></span>" +
                "Seroprevalence at 9 years of age: 0.200%<br/></div>";

            createTooltips.onEachFeature(MOCK_FEATURE, layer);

            expect(layer.bindTooltip).toHaveBeenCalledWith(expectedTooltipContent);
        });
    });

    describe("with selected indicator P9", () => {
        beforeEach(() => {
            mockPinia({ selectedIndicator: "P9" });
        });

        test("updateTooltips generates correct tooltip content and binds it to the layer", () => {
            const { updateTooltips } = useTooltips(featureRefs);

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

            const expectedTooltipContent =
                '<div class="text-body-1">Test123</div>' +
                '<div class="text-body-2"><span class="font-weight-bold">' +
                "Seroprevalence at 9 years of age: 0.200%<br/></span>" +
                "Force of infection: 0.100<br/></div>";

            const featureWithColour = {
                feature: MOCK_FEATURE,
                colour: "red",
                id: Object.keys(MOCK_ADMIN1_INDICATORS.MWI)[0]
            } as FeatureWithColour;

            updateTooltips([featureWithColour]);

            expect(layer.setTooltipContent).toHaveBeenCalledWith(expectedTooltipContent);
        });
    });
});
