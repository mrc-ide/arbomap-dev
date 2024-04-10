import {describe, test, expect, beforeAll} from "vitest";
import {ref} from "vue";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import {useColourScale} from "../../../src/composables/useColourScale";
import {mockPinia} from "../mocks/mockPinia";

const indicatorValues = ref({
    "123": {
        "FOI": { mean: 0.1, sd: 0.01 },
        "p9": { mean: 0.2, sd: 0.02 }
    },
    "456": {
        "FOI": { mean: 0.2, sd: 0.02 },
        "p9": { mean: 0.3, sd: 0.03 }
    },
    "789": {
        "FOI": { mean: 0.3, sd: 0.03 },
        "p9": { mean: 0.4, sd: 0.04 }
    }
});

describe("useColourScale", () => {
    beforeAll(() => {
        mockPinia();
    });

    test("returns colour scales", () => {
        const sut = useColourScale(indicatorValues);
        expect(sut.colourScales.value).toStrictEqual({
            FOI: d3ScaleChromatic.interpolateReds,
            p9: d3ScaleChromatic.interpolateBlues
        });
    });

    test("can get colour for value", () => {
        const sut = useColourScale(indicatorValues);

        // min value for FOI
        expect(sut.getColour("FOI", indicatorValues.value["123"])).toBe("rgb(255, 245, 240)");

        // max value for FOI
        expect(sut.getColour("FOI", indicatorValues.value["789"])).toBe("rgb(103, 0, 13)");

        // mid value for FOI
        expect(sut.getColour("FOI", indicatorValues.value["456"])).toBe(d3ScaleChromatic.interpolateReds(0.5));
    });
});
