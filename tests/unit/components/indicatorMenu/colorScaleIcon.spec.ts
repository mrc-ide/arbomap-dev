import { describe, expect, test } from "vitest";
import { interpolatePurples } from "d3-scale-chromatic";
import { render, screen } from "@testing-library/vue";
import { mockPinia } from "../../mocks/mockPinia";
import ColorScaleIcon from "../../../../src/components/indicatorMenu/ColorScaleIcon.vue";

describe("ColorScaleIcon", () => {
    test("renders as expected", async () => {
        await render(ColorScaleIcon, {
            props: {
                size: 24,
                indicator: "hosp_total"
            },
            global: {
                plugins: [mockPinia()]
            }
        });

        const svg = (await screen.findByRole("presentation")) as HTMLElement;
        expect(svg.getAttribute("height")).toBe("24");
        expect(svg.getAttribute("width")).toBe("24");
        const colorBlocks = svg.children;
        expect(colorBlocks.length).toBe(4);
        expect(colorBlocks[0].getAttribute("fill")).toBe(interpolatePurples(0.7));
        expect(colorBlocks[1].getAttribute("fill")).toBe(interpolatePurples(0.9));
        expect(colorBlocks[2].getAttribute("fill")).toBe(interpolatePurples(0.4));
        expect(colorBlocks[3].getAttribute("fill")).toBe(interpolatePurples(0.1));
    });
});
