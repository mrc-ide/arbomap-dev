import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import Default from "@/layouts/default.vue";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockPinia } from "../mocks/mockPinia";
import { useAppStore } from "../../../src/stores/appStore";
import { mockRouter } from "../mocks/mockRouter";
import { APP_BASE_ROUTE } from "../../../src/router/utils";

const router = mockRouter();
const renderLayout = async () => {
    router.push(APP_BASE_ROUTE);
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
        expect(await screen.findByTestId("choropleth")).toBeVisible();
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
        expect(await screen.findByText("About this site")).toBeVisible();

        const accessibilityLink = await screen.findByRole("link", { name: /accessibility/i });
        await user.click(accessibilityLink);
        expect(await screen.findByText(/We are committed to making this website accessible/)).toBeVisible();

        const privacyLink = await screen.findByRole("link", { name: /privacy policy/i });
        await user.click(privacyLink);
        expect(await screen.findByText("Privacy notice for arbomap.org")).toBeVisible();

        const mapLink = await screen.findByRole("link", { name: /map/i });
        await user.click(mapLink);
        expect(await screen.findByTestId("choropleth")).toBeVisible();

        const contactLink = await screen.findByRole("link", { name: /contact/i });
        expect(contactLink.getAttribute("href")).toBe("https://imperial.eu.qualtrics.com/jfe/form/SV_1OfpYMUpy4uHlRQ");
    });
});
