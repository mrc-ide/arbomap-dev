// Plugins
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Fonts from "unplugin-fonts/vite";
import Layouts from "vite-plugin-vue-layouts";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
    base: `${process.env.BASE_URL || ""}/`,
    plugins: [
        Layouts(),
        AutoImport({
            imports: [
                "vue",
                {
                    "vue-router/auto": ["useRoute", "useRouter"]
                }
            ],
            dts: "src/auto-imports.d.ts",
            eslintrc: {
                enabled: true
            },
            vueTemplate: true
        }),
        Components({
            dts: "src/components.d.ts"
        }),
        Vue({
            template: { transformAssetUrls }
        }),
        // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
        Vuetify({
            autoImport: true,
            styles: {
                configFile: "src/styles/settings.scss"
            }
        }),
        Fonts({
            google: {
                families: [
                    {
                        name: "Roboto",
                        styles: "wght@100;300;400;500;700;900"
                    }
                ]
            }
        })
    ],
    define: { "process.env": {} },
    resolve: {
        alias: {
            "leaflet-geojson-vt": path.resolve(__dirname, 'node_modules', "leaflet-geojson-vt", "src", "leaflet-geojson-vt.js"),
            "@": fileURLToPath(new URL("./src", import.meta.url))
        },
        extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"]
    },
    server: {
        port: 3000
    },
    test: {
        globals: true,
        environment: "jsdom",
        server: {
            deps: {
                inline: ["vuetify"]
            }
        }
    }
});
