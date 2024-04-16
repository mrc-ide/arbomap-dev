import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";
import notFound from "../pages/notFound.vue";

const baseUrl = import.meta.env.BASE_URL;
const APP = "dengue";
const VERSION = "may24";
// In future iterations we will support non-default pathogens and data versions, but for now we hardcode these
export const APP_BASE_URL = `${baseUrl}${APP}/${VERSION}`;

const router = createRouter({
    history: createWebHistory(APP_BASE_URL),
    routes: [
        { path: "/", component: index },
        { path: "/about", component: about },
        { path: "/:indicator", component: index, props: true },
        { path: "/:indicator/:country", component: index, props: true },
        { path: "/:pathMatch(.*)", component: notFound}
    ]
});

// This route is required for non-root base urls where (I think) vite defaults to serving the base url, which
// can clash with the configuration in vue router
if (baseUrl !== "/") {
    router.addRoute({ path: baseUrl, redirect: "/"  });
}

export default router;
