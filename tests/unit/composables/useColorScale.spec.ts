import { describe, test, expect, beforeAll } from "vitest";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import { useIndicatorColors } from "../../../src/composables/useIndicatorColors";
import { mockPinia } from "../mocks/mockPinia";
import { useAppStore } from "../../../src/stores/appStore";

const indicatorValues = {
    value: {
        "123": {
            FOI: { mean: 0.1, sd: 0.01 },
            serop9: { mean: 0.2, sd: 0.02 }
        },
        "456": {
            FOI: { mean: 0.2, sd: 0.02 },
            serop9: { mean: 0.3, sd: 0.03 }
        },
        "789": {
            FOI: { mean: 0.3, sd: 0.03 },
            serop9: { mean: 0.4, sd: 0.04 }
        }
    }
};

describe("useColorScale", () => {
    beforeAll(() => {
        mockPinia();
    });

    test("returns colour scales", () => {
        const sut = useIndicatorColors(indicatorValues as any);
        expect(sut.colorScales.value).toStrictEqual({
            FOI: d3ScaleChromatic.interpolateReds,
            serop9: d3ScaleChromatic.interpolateBlues,
            hosp_total: d3ScaleChromatic.interpolatePurples,
            hosp_0_4: d3ScaleChromatic.interpolatePurples,
            hosp_5_9: d3ScaleChromatic.interpolatePurples
        });
    });

    test("can get colour for value", () => {
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
        appConfig.indicators.FOI.colorScale.reverse = true;

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
});
