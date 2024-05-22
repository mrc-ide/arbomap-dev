import { render, screen } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import About from "../../../src/pages/about.vue";
import { mockPinia } from "../mocks/mockPinia";
import { mockVuetify } from "../mocks/mockVuetify";
import { GIT_BRANCH, GIT_COMMIT, PACKAGE_VERSION } from "../../../src/version";

const renderPage = async () => {
    await render(About, {
        global: {
            plugins: [mockVuetify, mockPinia()]
        }
    });
};

describe("About page", () => {
    test("displays package version", async () => {
        await renderPage();
        const versionPara = await screen.findByText(`You are viewing MockApp version ${PACKAGE_VERSION}`, {
            exact: false
        });
        expect(versionPara).toBeVisible();
        expect(await screen.queryByText(/Git branch/)).toBe(null);
    });

    test("displays and hides version details when button clicked", async () => {
        await renderPage();
        const detailsButton = await screen.findByText("Show details");
        const user = userEvent.setup();

        await user.click(detailsButton);
        const detailsText = `Git branch: ${GIT_BRANCH} | Git commit: ${GIT_COMMIT}`;
        expect(await screen.findByText("Hide details")).toBeVisible();
        expect(await screen.queryByText("Show details")).toBe(null);

        await user.click(detailsButton);
        expect(await screen.queryByText(detailsText)).toBe(null);
        expect(await screen.findByText("Show details")).toBeVisible();
        expect(await screen.queryByText("Hide details")).toBe(null);
    });
});
