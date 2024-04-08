import { describe, expect, test, vi } from "vitest";
import {createRouter, createWebHistory} from "vue-router/auto";
import {defineComponent} from "vue";
import { render, screen, within } from "@testing-library/vue";
import Default from "@/layouts/default.vue";
import {mockVuetify} from "../mocks/mockVuetify";
import {mockPinia} from "../mocks/mockPinia";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: defineComponent({ template: `<h1>Home</h1>` }) },
        { path: "/about", component: defineComponent({ template: `<h1>About</div>` }) },
    ]
});

global.ResizeObserver = require('resize-observer-polyfill')

const renderLayout = async() => {
    router.push("/");
    await router.isReady();

    return render(Default, {
       global: {
           router,
           plugins: [mockVuetify, mockPinia()]
       }
    });
};

describe("default layout", () => {
    test("displays app title from app config", async () => {
        await renderLayout();
        expect(await screen.findByText("MockApp")).toBeVisible();
    });
    /*test("initialises data on load", () => {

    });
    test("menu link navigates to About page", () => {

    });*/
});
