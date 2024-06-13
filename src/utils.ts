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

const getFileObjectUrl = async (url: string) => {
    const res = await fetch(url, {
        method: "GET"
    });

    if (!res.ok) {
        throw new Error("Error fetching file");
    }

    const blob = await res.blob().catch(() => {
        throw new Error("Error retrieving data from response");
    });
    return URL.createObjectURL(blob);
};

export const downloadFile = async (url: string, filename: string) => {
    const fileUrl = await getFileObjectUrl(url);
    const fileLink = document.createElement("a");
    fileLink.href = fileUrl;
    fileLink.setAttribute("download", filename);
    document.body.appendChild(fileLink);
    fileLink.click();
    document.body.removeChild(fileLink);
    window.URL.revokeObjectURL(fileUrl);
};
