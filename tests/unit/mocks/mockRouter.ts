import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../../../src/pages/index.vue";
import about from "../../../src/pages/about.vue";
import accessibility from "../../../src/pages/accessibility.vue";
import privacy from "../../../src/pages/privacy.vue";

export const mockRouter = () =>
    createRouter({
        history: createWebHistory(),
        routes: [
            { path: "/", component: index },
            { path: "/about", component: about },
            { path: "/accessibility", component: accessibility },
            { path: "/privacy", component: privacy }
        ]
    });
