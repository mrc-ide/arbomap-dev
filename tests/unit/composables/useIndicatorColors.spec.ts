import { describe, test, expect, beforeAll } from "vitest";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import { useIndicatorColors } from "../../../src/composables/useIndicatorColors";
import { mockPinia } from "../mocks/mockPinia";
import { useAppStore } from "../../../src/stores/appStore";
import { ColorType } from "../../../src/types/resourceTypes";
import { MOCK_APP_CONFIG } from "../mocks/mockObjects";

const indicatorValues = {
    value: {
        "123": {
            FOI: { mean: 0.1, sd: 0.01 },
            serop9: { mean: 0.2, sd: 0.02 },
            serop9_class: { mean: 30, sd: 1 }
        },
        "456": {
            FOI: { mean: 0.2, sd: 0.02 },
            serop9: { mean: 0.3, sd: 0.03 },
            serop9_class: { mean: 50, sd: 1 }
        },
        "789": {
            FOI: { mean: 0.3, sd: 0.03 },
            serop9: { mean: 0.4, sd: 0.04 },
            serop9_class: { mean: 70, sd: 1 }
        }
    }
};

describe("useIndicatorColors", () => {
    beforeAll(() => {
        mockPinia();
    });

    test("can get indicator value colour", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        // scale indicator
        expect(sut.getIndicatorValueColor("FOI", 0.2)).toBe(d3ScaleChromatic.interpolateReds(0.5));

        // categories indicator
        expect(sut.getIndicatorValueColor("serop9_class", 50)).toBe("#ff5800");
    });

    test("can get scale value colour, not scaled to extremes", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(sut.getIndicatorValueColor("FOI", 0.5, false)).toBe(d3ScaleChromatic.interpolateReds(0.5));
    });

    test("can get fill and outline colours for scale value", () => {
        const sut = useIndicatorColors(indicatorValues as any);

        // min value for FOI
        expect(sut.getFillAndOutlineColor("FOI", "123", false)).toStrictEqual({
            fillColor: "rgb(255, 245, 240)",
            outlineColor: "rgba(251, 246, 244, 0.4)"
        });

        // max value for FOI
        expect(sut.getFillAndOutlineColor("FOI", "789", false)).toStrictEqual({
            fillColor: "rgb(103, 0, 13)",
            outlineColor: "rgba(77, 26, 32, 0.4)"
        });

        // mid value for FOI
        expect(sut.getFillAndOutlineColor("FOI", "456", false)).toStrictEqual({
            fillColor: d3ScaleChromatic.interpolateReds(0.5),
            outlineColor: "rgba(206, 134, 119, 0.4)"
        });
    });

    test("can get fill and outline colours for categories value", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(sut.getFillAndOutlineColor("serop9_class", "123", false)).toStrictEqual({
            fillColor: "#dc143c",
            outlineColor: "rgba(170, 70, 90, 0.4)"
        });

        expect(sut.getFillAndOutlineColor("serop9_class", "456", false)).toStrictEqual({
            fillColor: "#ff5800",
            outlineColor: "rgba(191, 108, 64, 0.4)"
        });

        expect(sut.getFillAndOutlineColor("serop9_class", "789", false)).toStrictEqual({
            fillColor: "#fcf75e",
            outlineColor: "rgba(213, 210, 134, 0.4)"
        });
    });

    test("can get faded colour for value", () => {
        const sut = useIndicatorColors(indicatorValues as any);

        // min value for FOI
        expect(sut.getFillAndOutlineColor("FOI", "123", true)).toStrictEqual({
            fillColor: "rgba(251, 246, 244, 0.4)",
            outlineColor: "rgba(249, 247, 246, 0.16000000000000003)"
        });
    });

    test("can get colour for value when scale is reversed", () => {
        const { appConfig } = useAppStore();
        appConfig.indicators.FOI.colors.colorScale.reverse = true;

        const sut = useIndicatorColors(indicatorValues as any);
        // min value for FOI, should return max value for colour scale
        expect(sut.getFillAndOutlineColor("FOI", "123")).toStrictEqual({
            fillColor: "rgb(103, 0, 13)",
            outlineColor: "rgba(77, 26, 32, 0.4)"
        });

        // max value for FOI, should return min value for colour scale
        expect(sut.getFillAndOutlineColor("FOI", "789")).toStrictEqual({
            fillColor: "rgb(255, 245, 240)",
            outlineColor: "rgba(251, 246, 244, 0.4)"
        });
    });

    test("can get indicator color type", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(sut.getIndicatorColorType("FOI")).toBe(ColorType.Scale);
        expect(sut.getIndicatorColorType("serop9_class")).toBe(ColorType.Category);
    });

    test("can get indicator color categories", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(sut.getIndicatorColorCategories("serop9_class")).toStrictEqual(
            MOCK_APP_CONFIG.indicators.serop9_class.colors.categories
        );
    });

    test("can get indicator value colour category", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(sut.getIndicatorValueColorCategory("serop9_class", 50)).toStrictEqual({
            name: "40-60%",
            upperLimit: 60,
            color: "#ff5800"
        });
    });

    test("throws error if request colour categories for colour scale indicator", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(() => sut.getIndicatorColorCategories("FOI")).toThrow("Indicator colors are not category type");
    });

    test("throws error if request indicator value colour category for colour scale indicator", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(() => sut.getIndicatorValueColorCategory("FOI", 0.2)).toThrow("Indicator colors are not category type");
    });
});
