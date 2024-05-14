import { describe, expect, test, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import { mockVuetify } from "../../mocks/mockVuetify";
import { mockPinia } from "../../mocks/mockPinia";
import router from "../../../../src/router";
import IndicatorMenu from "../../../../src/components/indicatorMenu/IndicatorMenu.vue";

const spyRouterPush = vi.spyOn(router, "push");

describe("IndicatorMenu", () => {
    let user;
    const renderComponent = async () => {
        await render(IndicatorMenu, {
            global: {
                plugins: [mockVuetify, mockPinia(), router]
            }
        });
    };

    const openMenu = async () => {
        const button = await screen.findByRole("button");
        await expect(await button.textContent).toBe("Force of infection");
        await user.click(button);
    };

    beforeEach(async () => {
        await renderComponent();
        user = userEvent.setup();
    });

    test("renders as expected initially", async () => {
        expect(await screen.findByText("Force of infection")).toBeVisible();
        expect(await screen.queryAllByText("Seroprevalence at 9 years of age").length).toBe(0);
    });

    test("opens menu when click button", async () => {
        await openMenu();
        expect(await screen.findByText("Seroprevalence at 9 years of age")).toBeVisible();
        expect(await screen.findByText("Hospital admissions")).toBeVisible();
        expect(await screen.findByText("All ages")).toBeVisible();
        expect(await screen.findByText("0-4")).toBeVisible();
        expect(await screen.findByText("5-9")).toBeVisible();
    });

    test("routes to selected indicator from indicator group menu item", async () => {
        await openMenu();
        const menuItem = await screen.findByText("Seroprevalence at 9 years of age");
        await user.click(menuItem);
        expect(spyRouterPush).toHaveBeenCalledWith("/dengue/may24/serop9/");
    });

    test("routes to selected indicator from indicator group sub-indicator slide group item", async () => {
        await openMenu();
        const sliderItem = await screen.findByText("5-9");
        await user.click(sliderItem);
        expect(spyRouterPush).toHaveBeenCalledWith("/dengue/may24/hosp_5_9/");
    });
});
