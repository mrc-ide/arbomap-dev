import { Ref, watch } from "vue";
import { Spinner, SpinnerOptions } from "spin.js";
import { LMap } from "@vue-leaflet/vue-leaflet";
import "spin.js/spin.css";

export const useLoadingSpinner = (target: Ref<typeof LMap | null>, spin: Ref<boolean>) => {
    const options: SpinnerOptions = {
        lines: 10,
        length: 54,
        width: 23,
        radius: 54,
        corners: 1,
        animation: "spinner-line-shrink",
        color: "#ffffff",
        shadow: false,
        className: "spinner"
    };

    const spinner = new Spinner(options);

    const updateSpinner = () => {
        if (spin.value && target.value) {
            spinner.spin(target.value.root);
            spinner.el.hidden = false;
        } else if (spinner.el) {
            // hide the spinner element so map can be clicked
            spinner.el.hidden = true;
            spinner.stop();
        }
    };

    watch([spin, target], updateSpinner);

    updateSpinner();

    return { spinner };
};
