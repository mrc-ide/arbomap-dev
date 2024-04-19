import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";
import notFound from "../pages/notFound.vue";
import {baseUrl, PATHOGEN} from "./utils";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        //{ path: "/", component: index, props: true },
        //{ path: "/:pathogen", component: index, props: true },
        //{ path: "/:pathogen/:version", component: index, props: true },
        //{ path: "/:pathogen/:version/:indicator", component: index, props: true },
        { path: "/:pathogen?/:version?/:indicator?/:country?", component: index, props: true },
        { path: `/about`, component: about },
        //{ path: "/:indicator", component: index, props: true },
        //{ path: "/:indicator/:country", component: index, props: true },
        { path: "/:pathMatch(.*)", component: notFound}
    ]
});

// This route is required for non-root base urls where (I think) vite defaults to serving the base url, which
// can clash with the configuration in vue router
//if (baseUrl !== "/") {
//    router.addRoute({ path: baseUrl, redirect: "/"  });
//}

export default router;
