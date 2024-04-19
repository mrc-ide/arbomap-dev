import { Feature } from "geojson";
import { AppConfig, Geojson, FeatureIndicators } from "../types/resourceTypes";
import { APP_BASE_URL } from "../router/utils";

const getResource = async (path: string) => {
    const location = `${APP_BASE_URL}/resources/${path}`;
    const res = await fetch(location);
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

// Pass in appConfig to save having to re-read the config file
export const getFeatureId = (feature: Feature, appConfig: AppConfig) => {
    return feature.properties![appConfig.featureIdProp];
};
