import { describe, expect, test, beforeAll, afterAll, vi } from "vitest";
import { debounce, downloadFile } from "../../src/utils";

describe("debounce util", () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    test("executes function after delay", () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 5);
        debounced("hello", 1);
        expect(mockFn).not.toHaveBeenCalled();
        vi.runAllTimers();
        expect(mockFn).toHaveBeenCalledWith("hello", 1);
    });
});

describe("downloadFile", () => {
    const setMockFetch = (mockResponse) => {
        const mockFetch = vi.fn(async () => mockResponse);
        global.fetch = mockFetch;
    };

    it("downloads on successful response", async () => {
        const mockFileBlob = new Blob(["test contents"]);
        const mockResponse = {
            ok: true,
            blob: async () => mockFileBlob
        };
        setMockFetch(mockResponse);

        const fakeObjectUrl = "fakeObjectUrl";
        const mockCreateObjectUrl = vi.fn(() => fakeObjectUrl);
        const mockRevokeObjectUrl = vi.fn();

        URL.createObjectURL = mockCreateObjectUrl;
        URL.revokeObjectURL = mockRevokeObjectUrl;

        const mockFileLink = {
            href: "",
            setAttribute: vi.fn(),
            click: vi.fn()
        } as any;

        const mockAppendChild = vi.fn();
        const mockRemoveChild = vi.fn();

        document.createElement = () => mockFileLink;
        document.body.appendChild = mockAppendChild;
        document.body.removeChild = mockRemoveChild;

        await downloadFile("/testUrl", "testFile.xlsx");

        expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
        expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "testFile.xlsx");
        expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
        expect(mockFileLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
        expect(mockRevokeObjectUrl).toHaveBeenCalledWith(fakeObjectUrl);
    });

    test("throws error on unsuccessful response", async () => {
        const mockResponse = {
            ok: false
        };
        setMockFetch(mockResponse);

        await expect(downloadFile("/testUrl", "testFile.xlsx")).rejects.toEqual(new Error("Error fetching file"));
    });

    test("throw error when get blob from response fails", async () => {
        const mockResponse = {
            ok: true,
            blob: async () => {
                throw Error("failed");
            }
        };
        setMockFetch(mockResponse);

        await expect(downloadFile("/testUrl", "testFile.xlsx")).rejects.toEqual(
            new Error("Error retrieving data from response")
        );
    });
});
