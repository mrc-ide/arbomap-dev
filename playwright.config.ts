import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000
    },
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: 0,//process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: undefined,//process.env.CI ? 1 : undefined,
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

        headless: true
    },

    /* Configure projects for major browsers */
    projects: /*process.env.CI
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
              },
              {
                  name: "webkit",
                  use: {
                      ...devices["Desktop Safari"]
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
        command: "vite dev",//process.env.CI ? "vite preview --port 3000" : "vite dev",
        port: 3000,
        reuseExistingServer: true,
        stdout: "pipe"
    }
});
