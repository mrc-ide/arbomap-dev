import { AppConfig, BoundingBox, FeatureIndicators, MapFeature, MapSettings } from "./resourceTypes";
import { Dict } from "./utilTypes";
import { GeoJsonProperties } from "geojson";

export interface AppState {
    // these state variables only get updated once on initialisation, we keep all data in
    // dictionaries with country ids as keys, mirroring the resources on disk
    appConfig: AppConfig;
    countryNames: Dict<string>;
    countryBoundingBoxes: Dict<BoundingBox>;
    admin1Indicators: Dict<FeatureIndicators>;
    initialisationComplete: boolean;

    // these are initialised as empty objects and extended every time the user selects a
    // country
    admin2Indicators: Dict<FeatureIndicators>;

    // these variables change every time there is an update to the map
    mapSettings: MapSettings;

    mapLoading: boolean;

    countryProperties: GeoJsonProperties | null;
}
