/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from "vue-router/auto";
import { setupLayouts } from "virtual:generated-layouts";

console.log(`base url is ${import.meta.env.BASE_URL}`);
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    extendRoutes: setupLayouts
});

export default router;
