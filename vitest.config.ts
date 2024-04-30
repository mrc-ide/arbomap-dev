import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config.mts";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            environment: "jsdom",
            include: ["./tests/unit/**/*.{test,spec}.ts"],
            exclude: ["node_modules"],
            root: fileURLToPath(new URL("./", import.meta.url)),
            setupFiles: [fileURLToPath(new URL("./tests/unit/setupTests.ts", import.meta.url))],
            coverage: {
                provider: "v8",
                include: ["src/**/*"],
                exclude: ["src/types.ts", "src/main.ts", "src/plugins.ts"]
            },
            server: {
                deps: {
                    inline: ["vuetify"]
                }
            }
        }
    })
);
