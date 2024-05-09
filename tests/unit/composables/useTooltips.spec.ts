import { describe, test, expect, beforeEach } from "vitest";
import { useTooltips } from "../../../src/composables/useTooltips";
import { mockPinia } from "../mocks/mockPinia";

describe("useTooltips", () => {
    describe("with selected indicator FOI", () => {
        beforeEach(() => {
            mockPinia({ selectedIndicator: "FOI" });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips();

            const tooltip = tooltipForFeature("123", "My region");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My region</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Force of infection: 0.100<br/></span>' +
                    "Seroprevalence at 9 years of age: 0.200%<br/>" +
                    "Hospital admissions: 0.300<br/>" +
                    "</div>"
            );
        });
    });

    describe("with selected indicator serop9", () => {
        beforeEach(() => {
            mockPinia({ selectedIndicator: "serop9" });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips();

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Seroprevalence at 9 years of age: 0.400%<br/></span>' +
                    "Force of infection: 0.300<br/>" +
                    "Hospital admissions: 0.500<br/>" +
                    "</div>"
            );
        });
    });

    describe("with selected indicator hosp_total", () => {
        beforeEach(() => {
            mockPinia({ selectedIndicator: "hosp_total" });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips();

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Hospital admissions: 0.500<br/></span>' +
                    "Force of infection: 0.300<br/>" +
                    "Seroprevalence at 9 years of age: 0.400%<br/>" +
                    "</div>"
            );
        });
    });

    describe("with selected indicator hosp_5_9", () => {
        beforeEach(() => {
            mockPinia({ selectedIndicator: "hosp_5_9" });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips();

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Hospital admissions in 5-9 year olds: 0.700<br/></span>' +
                    "Force of infection: 0.300<br/>" +
                    "Seroprevalence at 9 years of age: 0.400%<br/>" +
                    "Hospital admissions: 0.500<br/>" +
                    "</div>"
            );
        });
    });
});
