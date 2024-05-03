import { AppConfig, BoundingBox, FeatureIndicators, Geojson } from "./resourceTypes";
import { Dict } from "./utilTypes";

export interface AppState {
    selectedIndicator: string;

    // When a country is selected (when value is non-empty), we display admin2 data for it.
    selectedCountryId: string;

    appConfig: AppConfig | null;

    countryBoundingBoxes: Dict<BoundingBox>;

    // We keep all data in dictionaries with country ids as keys, mirroring the resources on disk
    admin1Indicators: Dict<FeatureIndicators>;
    admin1Geojson: Dict<Geojson>;
    admin2Indicators: Dict<FeatureIndicators>;
    admin2Geojson: Dict<Geojson>;
}
