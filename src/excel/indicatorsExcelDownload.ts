import {AppConfig, FeatureIndicators, Geojson} from "../types/resourceTypes";
import {Dict} from "../types/utilTypes";
import * as XLSX from "xlsx";
import {geoJson} from "leaflet";
import {Feature} from "geojson";

export class IndicatorsExcelDownload {
    private readonly _fileName: string;
    private readonly _workbook: XLSX.WorkBook;
    private readonly _appConfig: AppConfig;

    constructor(fileName: string, appConfig) {
        this._fileName = fileName;
        this._appConfig = appConfig;
        this._workbook = XLSX.utils.book_new();
    }

    private _writeTab(level: number, indicatorValues: Dict<FeatureIndicators>, geojson: Dict<Geojson>, country?: string) {
        const sheetData = [];

        const { indicators, countries, geoJsonFeatureProperties } = this._appConfig;

        const countryIds = country ? [country] : countries;
        // TODO: cope with countriesWithoutAdmin2

        const indicatorIds = Object.keys(indicators);

        // We use the configured feature prop names as the column headers for ID and names
        const headers = [];
        for (let i = 0; i <= level; i++) {
            headers.push(geoJsonFeatureProperties[`idAdm${i}`], geoJsonFeatureProperties[`nameAdm${i}`]);
        }
        indicatorIds.forEach((i) => headers.push(`mean_${i}`, `sd_${i}`));
        sheetData.push(headers);

        const levelFeatureIdProp = geoJsonFeatureProperties[`idAdm${level}`];

        countryIds.forEach((countryId) => {
            const countryValues = indicatorValues[countryId];
            const countryGeojson = geojson[countryId];

            // Iterate features in geojson, but only emit a row if we have values in the indicators
            // Deal with inconsistency in admin1 vs admin2 geojson format
            // TODO: fix this properly in types
            const features = (countryGeojson.features || countryGeojson) as Feature[];
            features.forEach((feature) => {
                const featureId = feature.properties[levelFeatureIdProp];
                const featureValues = countryValues[featureId];
                if (featureValues) {
                    const row = [];

                    for (let i = 0; i <= level; i++) {
                        // TODO: do something cleverer to save the level ids in an array
                        // TODO: there's a problem with country not being available in admin1 features.. but we probably
                        // don't need to look up country name from every feature anyway...?
                        const idProp = geoJsonFeatureProperties[`idAdm${i}`];
                        const nameProp = geoJsonFeatureProperties[`nameAdm${i}`];
                        row.push(feature.properties[idProp], feature.properties[nameProp]);
                    }

                    indicatorIds.forEach((indicatorId) => {
                        row.push(featureValues[indicatorId].mean, featureValues[indicatorId].sd)
                    });
                    sheetData.push(row);
                }
            });
        });


        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(this._workbook, sheet, `admin${level}`)
    }

    private _buildGlobalIndicatorsWorkbook(admin1Indicators: Dict<FeatureIndicators>, admin1Geojson: Dict<Geojson>): void {
        this._writeTab(1, admin1Indicators, admin1Geojson);
    }

    private _writeFile(buildWorkbook: () => void): void {
        try {
            buildWorkbook();
            XLSX.writeFile(this._workbook, this._fileName);
        } catch (e) {
            // TODO: error handling
            console.log(e)
        }
    }

    downloadGlobalIndicators = (admin1Indicators: Dict<FeatureIndicators>, admin1Geojson: Dict<Geojson>) => {
        this._writeFile(() => { this._buildGlobalIndicatorsWorkbook(admin1Indicators, admin1Geojson); });
    }
}
