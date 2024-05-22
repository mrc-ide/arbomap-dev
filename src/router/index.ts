import { createRouter, createWebHistory } from "vue-router/auto";
import index from "../pages/index.vue";
import about from "../pages/about.vue";
import accessibility from "../pages/accessibility.vue";
import privacy from "../pages/privacy.vue";
import notFound from "../pages/notFound.vue";
import { PATHOGEN } from "./utils";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: "/:pathogen?/:version?/:indicator?/:country?/:adminLevel?", component: index, props: true },
        { path: `/${PATHOGEN}/about`, component: about },
        { path: `/${PATHOGEN}/accessibility`, component: accessibility },
        { path: `/${PATHOGEN}/privacy`, component: privacy },
        { path: "/:pathMatch(.*)", component: notFound}
    ]
});

export default router;
