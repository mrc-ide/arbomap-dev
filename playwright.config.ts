import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    /* Maximum time one test can run for. */
    timeout: process.env.CI ? 60 * 1000 : 30 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 10000
    },
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Allow parallel tests */
    workers: undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: "http://localhost:3000",

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",

        headless: true,
        screenshot: "only-on-failure"
    },

    /* Configure projects for major browsers */
    projects: process.env.CI
        ? [
              {
                  name: "chromium",
                  use: {
                      ...devices["Desktop Chrome"]
                  }
              },
              {
                  name: "firefox",
                  use: {
                      ...devices["Desktop Firefox"]
                  }
              }
          ]
        : /* Just test on Chrome when running on local dev */
          [
              {
                  name: "chromium",
                  use: {
                      ...devices["Desktop Chrome"]
                  }
              }
          ],

    /* Run your local dev server before starting the tests */
    webServer: {
        /**
         * Use the dev server by default for faster feedback loop.
         * Use the preview server on CI for more realistic testing.
         * Playwright will re-use the local server if there is already a dev-server running.
         */
        command: "npm run dev",
        port: 3000,
        reuseExistingServer: true,
        stdout: "pipe"
    }
});
