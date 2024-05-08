import {describe, expect, test, beforeEach, vi} from "vitest";
import {interpolatePurples} from "d3-scale-chromatic";
import { render, screen } from "@testing-library/vue";
import {render} from "@testing-library/vue";
import {mockPinia} from "../../mocks/mockPinia";
import ColourScaleIcon from "../../../../src/components/indicatorMenu/ColourScaleIcon.vue";

describe("ColourScaleIcon", () => {
    test("renders as expected", async () => {
        await render(ColourScaleIcon, {
            props: {
                size: 24,
                indicator: "hosp_total"
            },
            global: {
                plugins: [mockPinia()],
            }
        });

        const svg = (await screen.findByRole("presentation")) as HTMLElement;
        expect(svg.getAttribute("height")).toBe("24");
        expect(svg.getAttribute("width")).toBe("24");
        const colourBlocks = svg.children;
        expect(colourBlocks.length).toBe(4);
        expect(colourBlocks[0].getAttribute("fill")).toBe(interpolatePurples(0.7));
        expect(colourBlocks[1].getAttribute("fill")).toBe(interpolatePurples(0.9));
        expect(colourBlocks[2].getAttribute("fill")).toBe(interpolatePurples(0.4));
        expect(colourBlocks[3].getAttribute("fill")).toBe(interpolatePurples(0.1));
    });
});
