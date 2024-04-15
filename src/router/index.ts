/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from "vue-router/auto";
import { setupLayouts } from "virtual:generated-layouts";

const APP = "dengue";

const router = createRouter({
    history: createWebHistory(`${import.meta.env.BASE_URL}/${APP}`),
    extendRoutes: setupLayouts
});
// TODO: on browse to /${APP}, if no :indictaor, redirect to first indicator
router.addRoute({ path: `/${APP}/:indicator`, alias: `/${APP}`, props: true });

export default router;
