import { vi } from "vitest";
import { ref, Ref } from "vue";

export const mockDownloadGlobal = vi.fn();
export const mockDownloadSelectedCountry = vi.fn();
export const mockDownloadError: Ref<Error | null> = ref(null);

const mockUseExcelDownload = () => ({
    downloadGlobal: mockDownloadGlobal,
    downloadSelectedCountry: mockDownloadSelectedCountry,
    downloadError: mockDownloadError
});

vi.mock("../../../../src/composables/useExcelDownload.js", () => ({
    useExcelDownload: mockUseExcelDownload
}));
