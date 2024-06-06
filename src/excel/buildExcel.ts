import {Dict} from "../types/utilTypes";
import {ColorType, FeatureIndicators, MapFeature} from "../types/resourceTypes";
import {WorkBook} from "xlsx";
import * as XLSX from "xlsx";
import {useIndicatorColors} from "../composables/useIndicatorColors";

export class BuildExcel {

    private readonly _appConfig: AppConfig;
    private readonly _countryNames: Dict<string>;
    private readonly _admin1Indicators: Dict<FeatureIndicators>;
    private readonly _admin2Indicators: Dict<FeatureIndicators>;
    private readonly _admin1Geojson: Dict<MapFeature[]>;
    private readonly _admin2Geojson: Dict<MapFeature[]>;
    private readonly _indicatorColors: any;

    constructor(
        appConfig: AppConfig,
        countryNames: Dict<string>,
        admin1Indicators: Dict<FeatureIndicators>,
        admin2Indicators: Dict<FeatureIndicators>,
        admin1Geojson: Dict<MapFeature[]>,
        admin2Geojson: Dict<MapFeature[]>
    ) {
        this._appConfig = appConfig;
        this._countryNames = countryNames;
        this._admin1Indicators = admin1Indicators;
        this._admin2Indicators = admin2Indicators;
        this._admin1Geojson = admin1Geojson;
        this._admin2Geojson = admin2Geojson;
        this._indicatorColors = useIndicatorColors(ref(appConfig));
    }

    private _writeTab(
        workbook: WorkBook,
        level: number,
        indicatorValues: Dict<FeatureIndicators>,
        geojson: Dict<MapFeature[]>,
        country?: string[]
    ) {
        const sheetData = [];

        const { indicators, countries, geoJsonFeatureProperties } = this._appConfig;

        const { getIndicatorColorType, getIndicatorValueColorCategory } = this._indicatorColors;

        const countryIds = country ? [country] : countries;

        const indicatorIds = Object.keys(indicators);

        const categoryIndicators = Object.keys(indicators).filter(
            (i) => getIndicatorColorType(i) === ColorType.Category
        );

        // Include IDs and names for all region levels from 0 to the requested level
        const levels = Array.from({ length: level + 1 }, (_, v) => v);
        const [, ...subCountryLevels] = levels;

        // We use the configured feature prop names as the column headers for ID and names
        const headers = [];
        levels.forEach((lvl) => {
            headers.push(geoJsonFeatureProperties[`idAdm${lvl}`], geoJsonFeatureProperties[`nameAdm${lvl}`]);
        });

        indicatorIds.forEach((indicatorId) => {
            if (categoryIndicators.includes(indicatorId)) {
                // Include category only for category indicators
                headers.push(indicatorId);
            } else {
                headers.push(`mean_${indicatorId}`, `sd_${indicatorId}`);
            }
        });
        sheetData.push(headers);

        const levelFeatureIdProp = geoJsonFeatureProperties[`idAdm${level}`];

        countryIds.forEach((countryId) => {
            const countryName = this._countryNames[countryId] || "";
            const countryValues = indicatorValues[countryId];
            const countryGeojson = geojson[countryId];

            // Iterate features in geojson, but only emit a row if we have values in the indicators
            countryGeojson.forEach((feature) => {
                const featureId = feature.properties[levelFeatureIdProp];
                const featureValues = countryValues[featureId];
                if (featureValues) {
                    const row = [];

                    // country level
                    row.push(countryId, countryName);

                    subCountryLevels.forEach((lvl) => {
                        const idProp = geoJsonFeatureProperties[`idAdm${lvl}`];
                        const nameProp = geoJsonFeatureProperties[`nameAdm${lvl}`];
                        row.push(feature.properties[idProp], feature.properties[nameProp]);
                    });

                    indicatorIds.forEach((indicatorId) => {
                        const { mean } = featureValues[indicatorId];
                        if (categoryIndicators.includes(indicatorId)) {
                            row.push(getIndicatorValueColorCategory(indicatorId, mean).name);
                        } else {
                            row.push(mean, featureValues[indicatorId].sd);
                        }
                    });
                    sheetData.push(row);
                }
            });
        });

        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, `admin${level}`);
    };

    public buildGlobalIndicatorsWorkbook (workbook: WorkBook, includeAdmin2: boolean)  {
        this._writeTab(workbook, 1, this._admin1Indicators, this._admin1Geojson);
        if (includeAdmin2) {
            this._writeTab(workbook, 2, this._admin2Indicators, this._admin2Geojson);
        }
    };

    public buildCountryIndicatorsWorkbook = (workbook: WorkBook, countryId: string) => {
        this._writeTab(workbook, 1, this._admin1Indicators, this._admin1Geojson, countryId);

        const { countriesWithoutAdmin2 } = this._appConfig;
        const admin1Only = countriesWithoutAdmin2.includes(countryId);
        if (!admin1Only) {
            this._writeTab(workbook, 2, this._admin2Indicators, this._admin2Geojson, countryId);
        }
    };
}
