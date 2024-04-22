import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";
import notFound from "../pages/notFound.vue";
import {baseUrl, PATHOGEN} from "./utils";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: "/:pathogen?/:version?/:indicator?/:country?", component: index, props: true },
        { path: `/about`, component: about },
        { path: "/:pathMatch(.*)", component: notFound}
    ]
});

export default router;
