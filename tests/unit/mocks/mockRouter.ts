import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../../../src/pages/index.vue";
import about from "../../../src/pages/about.vue";
import accessibility from "../../../src/pages/accessibility.vue";
import privacy from "../../../src/pages/privacy.vue";

export const mockRouter = () =>
    createRouter({
        history: createWebHistory(),
        routes: [
            { path: "/:pathogen?/:version?/:indicator?/:country?/:adminLevel?", component: index, props: true },
            { path: "/:pathogen?/about", component: about },
            { path: "/:pathogen?/accessibility", component: accessibility },
            { path: "/:pathogen?/privacy", component: privacy }
        ]
    });
