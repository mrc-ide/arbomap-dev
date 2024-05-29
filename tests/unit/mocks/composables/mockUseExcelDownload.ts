import { vi } from "vitest";
import { ref, Ref } from "vue";

export const mockDownload = vi.fn();
export const mockDownloadError: Ref<Error | null> = ref(null);

const mockUseExcelDownload = () => ({
    download: mockDownload,
    downloadError: mockDownloadError
});

vi.mock("../../../../src/composables/useExcelDownload.js", () => ({
    useExcelDownload: mockUseExcelDownload
}));
