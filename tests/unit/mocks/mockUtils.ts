import { vi } from "vitest";

export const mockDownloadFile = vi.fn();

vi.mock("../../../src/utils.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        downloadFile: mockDownloadFile
    };
});
