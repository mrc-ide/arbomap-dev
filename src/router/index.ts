import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";

const APP = "dengue";
export const APP_BASE_URL = `${import.meta.env.BASE_URL}${APP}`;

const router = createRouter({
    history: createWebHistory(APP_BASE_URL),
    routes: [
        { path: "/", component: index },
        { path: "/about", component: about },
        { path: "/:indicator", component: index, props: true },
        { path: "/:indicator/:country", component: index, props: true }
    ]
});
// TODO: what should we do if indicator or country is not found? - redirect to 404 - can we route that in advance?
// - should get same 404 page for any unknown route

export default router;
