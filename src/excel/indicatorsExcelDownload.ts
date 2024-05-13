import {AppConfig, FeatureIndicators, Geojson} from "../types/resourceTypes";
import {Dict} from "../types/utilTypes";
import * as XLSX from "xlsx";

export class IndicatorsExcelDownload {
    private readonly _fileName: string;
    private readonly _workbook: XLSX.WorkBook;
    private readonly _appConfig: AppConfig;

    constructor(fileName: string, appConfig) {
        this._fileName = fileName;
        this._appConfig = appConfig;
        this._workbook = XLSX.utils.book_new();
    }

    private _writeTab(level: number, indicatorValues: Dict<FeatureIndicators>, country?: string) {
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

        countryIds.forEach((countryId) => {
            const countryValues = indicatorValues[countryId];
           // const countryGeojson = geojson[countryId];
            Object.values(countryValues).forEach((featureValues) => {
                const row = [];
                indicatorIds.forEach((indicatorId) => {
                    row.push(featureValues[indicatorId].mean, featureValues[indicatorId].sd)
                });
                sheetData.push(row);
            });
        });


        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(this._workbook, sheet, `admin${level}`)
    }

    private _buildGlobalIndicatorsWorkbook(admin1Indicators: Dict<FeatureIndicators>): void {
        this._writeTab(1, admin1Indicators);
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

    downloadGlobalIndicators = (admin1Indicators: Dict<FeatureIndicators>) => {
        this._writeFile(() => { this._buildGlobalIndicatorsWorkbook(admin1Indicators); });
    }
}
