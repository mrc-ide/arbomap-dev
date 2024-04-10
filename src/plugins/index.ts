/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import type { App } from "vue";
import vuetify from "./vuetify";
import pinia from "../stores";
import router from "../router";

// Types

export function registerPlugins(app: App) {
    app.use(vuetify).use(router).use(pinia);
}
