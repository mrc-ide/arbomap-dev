import {describe, it, expect} from "vitest"
import { render, screen } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import {mockDownload, mockDownloadError} from "../mocks/composables/mockUseExcelDownload";
import ExcelDownloadButton from "../../../src/components/ExcelDownloadButton.vue";
import {render} from "@testing-library/vue";
import {mockVuetify} from "../mocks/mockVuetify";

const renderComponent = () => {
    return render(ExcelDownloadButton, {
        global: { plugins: [mockVuetify] }
    });
};

describe("ExcelDownloadButton", () => {
    it("renders as expected", async () => {
        renderComponent();
        const button = await screen.findByRole("button") as HTMLElement;
        expect(button.getAttribute("aria-label")).toBe("Download Excel");
        expect(button.getElementsByTagName("i").item(0).className).toContain("mdi-download");
        expect(mockDownloadError.value).toBe(null);
    });

    it("clicking button calls download", async () => {
        renderComponent();
        const user = userEvent.setup();
        const button = await screen.findByRole("button");
        await user.click(button);
        expect(mockDownload).toHaveBeenCalledTimes(1);
    });

    it("shows snackbar on error, and hides on close", async () => {
        renderComponent();
        mockDownloadError.value = new Error("oops");
        expect(await screen.findByText(/Error downloading Excel file: oops/)).toBeVisible();

        const buttons = await screen.findAllByRole("button");
        expect(buttons.length).toBe(2);
        const closeButton = buttons[0] as HTMLElement;
        expect(closeButton.getElementsByTagName("i").item(0).className).toContain("mdi-close");
        const user = userEvent.setup();
        await user.click(closeButton);
        expect(await screen.findByText(/Error downloading Excel file: oops/)).not.toBeVisible();
    });
});

