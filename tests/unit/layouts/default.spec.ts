import { describe, expect, test, mock } from "vitest";
import {createRouter, createWebHistory} from "vue-router/auto";
import {defineComponent} from "vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: defineComponent({ template: `<h1>Home</h1>` }) },
        { path: "/about", component: defineComponent({ template: `<h1>About</div>` }) },
    ]
});

describe("default layout", () => {
    test("displays app title from app config", () => {

    });
    test("initialises data on load", () => {

    });
    test("menu link navigates to About page", () => {

    });
});
