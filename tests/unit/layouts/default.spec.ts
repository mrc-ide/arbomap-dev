import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import Default from "@/layouts/default.vue";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockPinia } from "../mocks/mockPinia";
import { useAppStore } from "../../../src/stores/appStore";
import { mockRouter } from "../mocks/mockRouter";

const router = mockRouter();
const renderLayout = async () => {
    router.push("/");
    await router.isReady();

    await render(Default, {
        global: {
            plugins: [mockVuetify, mockPinia(), router],
            stubs: {
                Choropleth: true
            }
        }
    });
};

describe("default layout", () => {
    test("displays app title from app config", async () => {
        await renderLayout();
        expect(await screen.findByText("MockApp")).toBeVisible();
    });

    test("renders router view component", async () => {
        // root component in mock router is index page, which shows indicator buttons
        await renderLayout();
        expect(await screen.findByText("FOI")).toBeVisible();
    });

    test("initialises data on load", async () => {
        const appStore = useAppStore();
        await renderLayout();
        expect(appStore.initialiseData).toHaveBeenCalledTimes(1);
    });

    test("Menu links navigate to correct pages", async () => {
        await renderLayout();

        const user = userEvent.setup();

        const aboutLink = await screen.findByRole("link", { name: /about/i });
        await user.click(aboutLink);
        expect(await screen.findByText(/About this site/)).toBeVisible();

        const accessibilityLink = await screen.findByRole("link", { name: /accessibility/i });
        await user.click(accessibilityLink);
        expect(await screen.findByText(/WCAG/)).toBeVisible();

        const privacyLink = await screen.findByRole("link", { name: /privacy policy/i });
        await user.click(privacyLink);
        expect(await screen.findByText(/Privacy notice for arbomap.org/)).toBeVisible();
    });
});
