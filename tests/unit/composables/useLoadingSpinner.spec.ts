import { describe, test, expect, beforeAll, beforeEach, vi } from "vitest";
import {Spinner} from "spin.js";
import {useLoadingSpinner} from "../../../src/composables/useLoadingSpinner";
import {Ref, ref, nextTick} from "vue";
import { LMap } from "@vue-leaflet/vue-leaflet";

describe("useLoadingSpinner", () => {
    let target: Ref<typeof LMap | null>;
    let spin: Ref<boolean>;
    let spinner: Spinner | null = null;
    let spinSpy;
    let stopSpy;

    const root = {
        insertBefore: vi.fn()
    } as HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks;
        target = ref(null);
        spin = ref(false);
        spinner = useLoadingSpinner(target, spin).spinner;
        spinSpy = vi.spyOn(spinner, "spin");
        stopSpy = vi.spyOn(spinner, "stop");
    });

   test("does not spin when only target element or spin flag are set", async () => {
        target.value = {
            root
        } as any;
        await nextTick();
        expect(spinSpy).not.toHaveBeenCalled();
        expect(stopSpy).not.toHaveBeenCalled();

        target.value = null;
        spin.value = true;
        await nextTick();
        expect(spinSpy).not.toHaveBeenCalled();
        expect(stopSpy).not.toHaveBeenCalled();
    });

    test("spins when target element and spin flag are both set", async () => {
        spin.value = true;
        target.value = {
            root
        } as any;
        await nextTick();
        const el = spinner.el;

        expect(spinSpy).toHaveBeenCalledWith(root);
        // should also show element
        expect(el.hidden).toBe(false);
    });


    test("stops spin and hides element when spin flag is unset", async () => {
        target.value = {
            root
        } as any;
        spin.value = true;
        await nextTick();
        const el = spinner.el;

        spin.value = false;
        await nextTick();
        expect(stopSpy).toHaveBeenCalled();
        // should also hide element
        expect(el.hidden).toBe(true);
    });
});
