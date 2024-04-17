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

    test("initialises data on load", async () => {
        const appStore = useAppStore();
        await renderLayout();
        expect(appStore.initialiseData).toHaveBeenCalledTimes(1);
    });

    test("menu link navigates to About page", async () => {
        await renderLayout();
        const link = await screen.findByRole("button", { name: /About/i });
        const user = userEvent.setup();
        await user.click(link);
        expect(await screen.findByText(/MockApp is in development/)).toBeVisible();
    });
});
