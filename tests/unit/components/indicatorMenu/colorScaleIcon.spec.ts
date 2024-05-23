import { describe, expect, test } from "vitest";
import { interpolatePurples } from "d3-scale-chromatic";
import { render, screen } from "@testing-library/vue";
import { mockPinia } from "../../mocks/mockPinia";
import ColorScaleIcon from "../../../../src/components/indicatorMenu/ColorScaleIcon.vue";
import { MOCK_APP_CONFIG } from "../../mocks/mockObjects";

describe("ColorScaleIcon", () => {
    test("renders as expected for color scale", async () => {
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

    test("renders as expected for color categories", async () => {
        await render(ColorScaleIcon, {
            props: {
                size: 24,
                indicator: "serop9_class"
            },
            global: {
                plugins: [mockPinia()]
            }
        });

        const svg = (await screen.findByRole("presentation")) as HTMLElement;
        const colorBlocks = svg.children;
        expect(colorBlocks.length).toBe(4);
        expect(colorBlocks[0].getAttribute("fill")).toBe("#dc143c");
        expect(colorBlocks[1].getAttribute("fill")).toBe("#ff5800");
        expect(colorBlocks[2].getAttribute("fill")).toBe("#fcf75e");
        expect(colorBlocks[3].getAttribute("fill")).toBe("#dc143c");
    });

    test("throws error when render with invalid config (color categories with length 0)", async () => {
        const pinia = mockPinia({
            appConfig: {
                ...MOCK_APP_CONFIG,
                indicators: {
                    serop9_class: {
                        colors: {
                            type: "category",
                            categories: []
                        },
                        humanReadableName: "Seroprevalence classification at age 9 years",
                        description: "",
                        unit: ""
                    }
                }
            }
        });
        await expect(async () => {
            await render(ColorScaleIcon, {
                props: {
                    size: 24,
                    indicator: "serop9_class"
                },
                global: {
                    plugins: [pinia]
                }
            });
        }).rejects.toThrowError("Empty color categories config for serop9_class");
    });
});
