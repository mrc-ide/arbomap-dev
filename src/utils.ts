import { MapSettings } from "./types/resourceTypes";

export function debounce(fn, wait = 0) {
    let timer;
    return (...args) => {
        if (timer) {
            clearTimeout(timer); // clear any pre-existing timer
        }
        timer = setTimeout(() => {
            fn(...args);
        }, wait);
    };
}

export const mapSettingsAreEqual = (mapSettings1: MapSettings, mapSettings2: MapSettings) => {
    if (mapSettings1 === null && !!mapSettings2) return false;
    if (mapSettings2 === null && !!mapSettings1) return false;
    return (
        mapSettings1.pathogen === mapSettings2.pathogen &&
        mapSettings1.version === mapSettings2.version &&
        mapSettings1.indicator === mapSettings2.indicator &&
        mapSettings1.country === mapSettings2.country &&
        mapSettings1.adminLevel === mapSettings2.adminLevel
    );
};
