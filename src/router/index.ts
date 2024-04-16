import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";
import notFound from "../pages/notFound.vue";

const APP = "dengue";
const VERSION = "may24";
// In future iterations we will support non-default pathogens and data versions, but for now we hardcode these
export const APP_BASE_URL = `${import.meta.env.BASE_URL}${APP}/${VERSION}`;

console.log(`App base url is ${APP_BASE_URL}`)

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

//TODO: remove this
router.beforeEach((to, from) => {
    console.log(`routing from ${JSON.stringify(from)} to ${JSON.stringify(to)}`)
    if (to.fullPath === "/arbomap/") {
        throw Error("unexpected route")
    }
});

export default router;
