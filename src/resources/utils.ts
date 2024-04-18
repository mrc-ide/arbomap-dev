import { AppConfig, Geojson, FeatureIndicators } from "../types/resourceTypes";
import { APP_BASE_URL } from "../router/utils";
import {Feature, FeatureCollection} from "geojson";

const getResource = async (path: string) => {
    const location = `${APP_BASE_URL}/resources/${path}`;
    const res = await fetch(location);
    return res.json();
};

export const getAppConfig = async () => {
    return (await getResource("config.json")) as AppConfig;
};

export const getIndicators = async (country: string, level: number) => {
    return (await getResource(`indicators/admin${level}/${country}.json`)) as FeatureIndicators;
};

export const getGeojson = async (country: string, level: number) => {
    return (await getResource(`geojson/geoBoundaries-${country}-ADM${level}_simplified.geojson`)) as Geojson;
};

export const getGlobalGeojson = async (level: number) => {
    const coll = (await getResource(`geojson/all_adm${level}_0_5pc.json`)) as FeatureCollection;
    return coll.features;
};
