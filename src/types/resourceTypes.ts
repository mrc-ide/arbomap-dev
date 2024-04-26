import { Feature } from "geojson";
import { Dict } from "./utilTypes";

export interface IndicatorConfig {
    colourScale: {
        name: string;
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

export interface Geojson {
    features: Feature[];
}

// Dictionary of feature ids to indicator values
export type FeatureIndicators = Dict<FeatureIndicatorValues>;

// Country bounding boxes are numeric arrays with order West, East, North, South
export type BoundingBox = [number, number, number, number];
