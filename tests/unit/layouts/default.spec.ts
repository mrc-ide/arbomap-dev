import { describe, expect, test, vi } from "vitest";
import {createRouter, createWebHistory} from "vue-router/auto";
import { createTestingPinia } from "@pinia/testing";
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {defineComponent} from "vue";
import { render, screen, within } from "@testing-library/vue";
import mockAppStore from "../mocks/mockAppStore";
import Default from "@/layouts/default.vue";
import {MOCK_APP_CONFIG} from "../mocks/mockObjects";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: defineComponent({ template: `<h1>Home</h1>` }) },
        { path: "/about", component: defineComponent({ template: `<h1>About</div>` }) },
    ]
});

// TODO: pull this out into a mock util
const vuetify = createVuetify({
    components,
    directives,
})

// TODO: can we avoid this by using test pinia?
//mockAppStore();
vi.stubGlobal('ResizeObserver', vi.fn());
vi.stubGlobal("observer.observe", vi.fn());  // this is a vuetify issue

const initialState = {
    app: {
        loading: false,
        selectedIndicator: "",
        appConfig: MOCK_APP_CONFIG,
        admin1Indicators: {},
        admin1Geojson: {},
        admin2Indicators: {},
        admin2Geojson: {}
    }
};

const renderLayout = async() => {
    router.push("/");
    await router.isReady();

    return render(Default, {
       global: {
           router,
           plugins: [vuetify, createTestingPinia()]
       }
    });
};

describe("default layout", () => {
    test("displays app title from app config", async () => {
        await renderLayout();
    });
    /*test("initialises data on load", () => {

    });
    test("menu link navigates to About page", () => {

    });*/
});
