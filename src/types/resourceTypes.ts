import { Feature, MultiPolygon, Polygon } from "geojson";
import { Dict } from "./utilTypes";

export enum ColorType {
    Scale = "scale",
    Category = "category"
}

export interface IndicatorColorScale {
    type: ColorType.Scale;
    colorScale: {
        name: string;
        reverse: boolean | undefined;
    };
}

export interface IndicatorColorCategories {
    type: ColorType.Category;
    categories: {
        name: string,
        upperLimit: number | null,
        color: string
    }[]
}

export type IndicatorColors = IndicatorColorScale | IndicatorColorCategories;

export interface IndicatorConfig {
    colors: IndicatorColors,
    unit: string;
    humanReadableName: string;
    description: string;
}

// Used for display in the indicator selection menu -
// top level main indicator with optional (stratified)
// sub-indicators
export interface IndicatorGroup {
    mainIndicator: string;
    subIndicators?: string[];
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
    indicatorGroups: IndicatorGroup[];
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
