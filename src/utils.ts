import { Router } from "vue-router";
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
    return Object.keys(mapSettings1).every((key: keyof MapSettings) => mapSettings1[key] === mapSettings2[key]);
};

export enum AdminLevel {
    ONE = "admin1",
    TWO = "admin2"
}

export const stringAdminLevelToNumeric = {
    [AdminLevel.ONE]: 1,
    [AdminLevel.TWO]: 2
};

export const routerDebounce = 75;

export const routerPush = (router: Router, path: string) => {
    debounce(() => router.push(path), routerDebounce)();
};
