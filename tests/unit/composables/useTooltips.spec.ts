import { describe, test, expect, beforeEach } from "vitest";
import { useTooltips } from "../../../src/composables/useTooltips";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";

describe("useTooltips", () => {
    const indicatorValues = {
        value: {
            "123": {
                FOI: { mean: 0.1, sd: 0.01 },
                serop9: { mean: 0.2, sd: 0.02 },
                serop9_class: { mean: 30, sd: 1 },
                hosp_total: { mean: 0.3, sd: 0.03 }
            },
            "456": {
                FOI: { mean: 0.2, sd: 0.02 },
                serop9: { mean: 0.3, sd: 0.03 },
                serop9_class: { mean: 50, sd: 1 },
                hosp_total: { mean: 0.4, sd: 0.04 }
            },
            "789": {
                FOI: { mean: 0.3, sd: 0.03 },
                serop9: { mean: 0.4, sd: 0.04 },
                serop9_class: { mean: 70, sd: 1 },
                hosp_total: { mean: 0.5, sd: 0.05 },
                hosp_5_9: { mean: 0.7, sd: 0.07 }
            }
        }
    };

    describe("with selected indicator FOI", () => {
        beforeEach(() => {
            mockPinia({ mapSettings: mockMapSettings({ indicator: "FOI" }) });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips(indicatorValues as any);

            const tooltip = tooltipForFeature("123", "My region");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My region</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Force of infection: 0.100<br/></span>' +
                    "Seroprevalence at 9 years of age: 0.200%<br/>" +
                    "Seroprevalence classification at age 9 years: Under 40%<br/>" +
                    "Hospital admissions: 0.300<br/>" +
               "</div>"
            );
        });
    });

    describe("with selected indicator serop9", () => {
        beforeEach(() => {
            mockPinia({ mapSettings: mockMapSettings({ indicator: "serop9" }) });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips(indicatorValues as any);

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Seroprevalence at 9 years of age: 0.400%<br/></span>' +
                    "Force of infection: 0.300<br/>" +
                    "Seroprevalence classification at age 9 years: Above 60%<br/>" +
                    "Hospital admissions: 0.500<br/>" +
                    "</div>"
            );
        });
    });

    describe("with selected indicator hosp_total", () => {
        beforeEach(() => {
            mockPinia({ mapSettings: mockMapSettings({ indicator: "hosp_total" }) });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips(indicatorValues as any);

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Hospital admissions: 0.500<br/></span>' +
                    "Force of infection: 0.300<br/>" +
                    "Seroprevalence at 9 years of age: 0.400%<br/>" +
                    "Seroprevalence classification at age 9 years: Above 60%<br/>" +
                "</div>"
            );
        });
    });

    describe("with selected indicator hosp_5_9", () => {
        beforeEach(() => {
            mockPinia({ mapSettings: mockMapSettings({ indicator: "hosp_5_9" }) });
        });

        test("generates correct tooltip content", () => {
            const { tooltipForFeature } = useTooltips(indicatorValues as any);

            const tooltip = tooltipForFeature("789", "My area");

            expect(tooltip.content).toEqual(
                '<div class="text-body-1">My area</div>' +
                    '<div class="text-body-2">' +
                    '<span class="font-weight-bold">Hospital admissions in 5-9 year olds: 0.700<br/></span>' +
                    "Force of infection: 0.300<br/>" +
                    "Seroprevalence at 9 years of age: 0.400%<br/>" +
                    "Seroprevalence classification at age 9 years: Above 60%<br/>" +
                    "Hospital admissions: 0.500<br/>" +
                    "</div>"
            );
        });
    });
});
