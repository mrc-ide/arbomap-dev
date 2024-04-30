import { describe, expect, test, beforeAll, afterAll, vi } from "vitest";
import { debounce } from "../../src/utils";

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
