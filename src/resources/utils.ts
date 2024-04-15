import { AppConfig, Geojson, FeatureIndicators } from "../types/resourceTypes";

const getResource = async (path: string) => {
    console.log(`loading from ${path}`)
    const res = await fetch(`resources/${path}`);
    return res.json();
};

export const getAppConfig = async () => {
    return (await getResource("config.json")) as AppConfig;
};

export const getIndicators = async (country: string, level: number) => {
    return (await getResource(`indicators/indicators-${country}-ADM${level}.json`)) as FeatureIndicators;
};

export const getGeojson = async (country: string, level: number) => {
    return (await getResource(`geojson/geoBoundaries-${country}-ADM${level}_simplified.geojson`)) as Geojson;
};
