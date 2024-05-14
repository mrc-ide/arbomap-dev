import { describe, test, expect, beforeEach } from "vitest";
import { useTooltips } from "../../../src/composables/useTooltips";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";

describe("useTooltips", () => {
    describe("with selected indicator FOI", () => {
        beforeEach(() => {
            mockPinia({ mapSettings: mockMapSettings({ indicator: "FOI" }) });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips();

            const tooltip = tooltipForFeature("123", "My region");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My region</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Force of infection: 0.100<br/></span>' +
                    "Seroprevalence at 9 years of age: 0.200%<br/></div>"
            );
        });
    });

    describe("with selected indicator serop9", () => {
        beforeEach(() => {
            mockPinia({ mapSettings: mockMapSettings({ indicator: "serop9" }) });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips();

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Seroprevalence at 9 years of age: 0.400%<br/></span>' +
                    "Force of infection: 0.300<br/></div>"
            );
        });
    });
});
