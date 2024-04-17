import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../../../src/pages/index.vue";
import about from "../../../src/pages/about.vue";

export const mockRouter = () =>
    createRouter({
        history: createWebHistory(),
        routes: [
            { path: "/", componenth: index },
            { path: "/about", component: about }
        ]
    });
