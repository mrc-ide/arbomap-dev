import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";

const APP = "dengue";

const router = createRouter({
    history: createWebHistory(`${import.meta.env.BASE_URL}${APP}`),
    routes: [
        { path: "/", component: index },
        { path: "/about", component: about }
    ]
});
// TODO: on browse to /${APP}, if no :indicator, redirect to first indicator
// TODO: what should we do if indicator is not found? - redirect to 404 - can we route that in advance?
//router.addRoute({ path: `/:indicator`, alias: `/`, props: true });

export default router;
