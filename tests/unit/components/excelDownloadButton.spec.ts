import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/vue";
import { userEvent } from "@testing-library/user-event";
import {
    mockDownloadGlobal,
    mockDownloadSelectedCountry,
    mockDownloadError
} from "../mocks/composables/mockUseExcelDownload";
import ExcelDownloadButton from "../../../src/components/ExcelDownloadButton.vue";
import { mockVuetify } from "../mocks/mockVuetify";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";

const defaultStore = mockPinia();
const selectedCountryStore = mockPinia({
    mapSettings: mockMapSettings({ country: "MWI" })
});

let user;

beforeEach(() => {
    user = userEvent.setup();
});

const renderComponent = (store = defaultStore) => {
    return render(ExcelDownloadButton, {
        global: { plugins: [mockVuetify, store] }
    });
};

const clickButton = async () => {
    const button = await screen.findByRole("button");
    await user.click(button);
};

const expectDialogToBeHidden = async () => {
    await waitFor(() => expect(screen.queryByText("Excel Download")).not.toBeVisible());
};

describe("ExcelDownloadButton", () => {
    it("renders as expected", async () => {
        renderComponent();
        const button = (await screen.findByRole("button")) as HTMLElement;
        expect(button.getAttribute("aria-label")).toBe("Download Excel");
        expect(button.getElementsByTagName("i").item(0).className).toContain("mdi-download");
        expect(mockDownloadError.value).toBe(null);
    });

    it("clicking button calls download when a country is selected", async () => {
        renderComponent(selectedCountryStore);
        await clickButton();
        expect(mockDownloadSelectedCountry).toHaveBeenCalledTimes(1);
    });

    it("clicking button shows dialog when no country is selected", async () => {
        renderComponent();
        await clickButton();
        expect(await screen.findByText("Excel Download")).toBeVisible();
    });

    it("clicking Yes downloads with level 2 values", async () => {
        renderComponent();
        await clickButton();
        const yesButton = await screen.findByText("Yes");
        await user.click(yesButton);
        expect(mockDownloadGlobal).toHaveBeenCalledWith(true);
        await expectDialogToBeHidden();
    });

    it("clicking No downloads without level 2 values", async () => {
        renderComponent();
        await clickButton();
        const noButton = await screen.findByText("No");
        await user.click(noButton);
        expect(mockDownloadGlobal).toHaveBeenCalledWith(false);
        await expectDialogToBeHidden();
    });

    it("clicking Cancel hides dialog without download", async () => {
        renderComponent();
        await clickButton();
        const cancelButton = await screen.findByText("Cancel");
        await user.click(cancelButton);
        await expectDialogToBeHidden();
    });

    it("shows snackbar on error, and hides on close", async () => {
        renderComponent(selectedCountryStore);
        mockDownloadError.value = new Error("oops");
        expect(await screen.findByText(/Error downloading Excel file: oops/)).toBeVisible();

        const buttons = await screen.findAllByRole("button");
        expect(buttons.length).toBe(2);
        const closeButton = buttons[0] as HTMLElement;
        expect(closeButton.getElementsByTagName("i").item(0).className).toContain("mdi-close");
        await user.click(closeButton);
        expect(await screen.findByText(/Error downloading Excel file: oops/)).not.toBeVisible();
    });
});
