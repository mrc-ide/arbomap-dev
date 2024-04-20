import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockPinia } from "../mocks/mockPinia";
import NotFound from "../../../src/pages/notFound.vue";
import { mockRouter } from "../mocks/mockRouter";

describe("NotFound page", () => {
    test("renders as expected", async () => {
        await render(NotFound, {
            props: { detail: "test detail" },
            global: {
                plugins: [mockVuetify, mockPinia(), mockRouter()]
            }
        });

        expect(await screen.findByText("Sorry, this page does not exist!")).toBeVisible();
        expect(await screen.findByText("test detail")).toBeVisible();
        const link = await screen.findByText("MockApp home page");
        expect((link as HTMLElement).getAttribute("href")).toBe("/dengue/may24");
    });
});
