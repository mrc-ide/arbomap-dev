import { Feature } from "geojson";
import { Dict } from "./utilTypes";

export interface IndicatorConfig {
    humanReadableName: string;
    colourScale: {
        name: string;
    };
    unit: string;
}

export interface AppConfig {
    title: string;
    countries: string[];
    indicators: Dict<IndicatorConfig>;
    featureIdProp: string;
    featureNameProp: string;
    featureCountryProp: string;
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

export interface FeatureWithColour {
    feature: Feature;
    colour: string;
    id: string;
}
