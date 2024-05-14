import { Feature, MultiPolygon, Polygon } from "geojson";
import { Dict } from "./utilTypes";

export interface IndicatorConfig {
    colourScale: {
        name: string;
        reverse: boolean | undefined;
    };
    unit: string;
    humanReadableName: string;
}

export interface AppConfig {
    title: string;
    countries: string[];
    countriesWithoutAdmin2: string[];
    geoJsonFeatureProperties: {
        idAdm1: string;
        idAdm2: string;
        nameAdm1: string;
        nameAdm2: string;
        country: string;
    };
    indicators: Dict<IndicatorConfig>;
}

export interface IndicatorValue {
    mean: number;
    sd: number;
}

// Indicator values for a singe feature area - a dictionary of indicator ids to  values
export type FeatureIndicatorValues = Dict<IndicatorValue>;

export type MapFeature = Feature<Polygon | MultiPolygon>;

export interface Geojson {
    features: MapFeature[];
}

// Dictionary of feature ids to indicator values
export type FeatureIndicators = Dict<FeatureIndicatorValues>;

// Country bounding boxes are numeric arrays with order West, East, North, South
export type BoundingBox = [number, number, number, number];

export type MapSettings = {
    pathogen: string;
    version: string;
    indicator: string;
    country: string;
    adminLevel: number;
};
