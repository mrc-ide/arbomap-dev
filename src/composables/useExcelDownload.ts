import {AppConfig, FeatureIndicators, Geojson} from "../types/resourceTypes";
import {Dict} from "../types/utilTypes";
import * as XLSX from "xlsx";
import {geoJson} from "leaflet";
import {Feature} from "geojson";
import {storeToRefs} from "pinia";
import {useAppStore} from "../stores/appStore";
import {useIndicatorColors} from "./useIndicatorColors";
import {debounce} from "../utils";
import {WorkBook} from "xlsx";

export const useExcelDownload = () => {
   //export class UseExcelDownload {
   // private readonly _fileName: string;
    //private readonly _workbook: XLSX.WorkBook;
    //private readonly _appConfig: AppConfig;
    //private readonly _countryNames: Dict<string>;

    /*constructor(fileName: string, appConfig: AppConfig, countryNames: Dict<string>) {
        this._fileName = fileName;
        this._appConfig = appConfig;
        this._countryNames = countryNames;
        this._workbook = XLSX.utils.book_new();
    }*/

    const {
        mapSettings,
        appConfig,
        admin1Indicators,
        admin2Indicators,
        admin1Geojson,
        admin2Geojson,
        countryNames
    } = storeToRefs(useAppStore());
    const {getIndicatorValueColorCategory} = useIndicatorColors(ref({})); // TODO: Maybe pull out category for value, seems daft to use indicator colors here

    const writeTab = (workbook: WorkBook, level: number, indicatorValues: Dict<FeatureIndicators>, geojson: Dict<Geojson>, country?: string) => {
        const sheetData = [];

        const { indicators, countries, geoJsonFeatureProperties } = appConfig.value;

        const countryIds = country ? [country] : countries;

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
            const countryName = countryNames.value[countryId] || "";
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

                    //country level
                    row.push(countryId, countryName);

                    //sub-country levels
                    for (let i = 1; i <= level; i++) {
                        // TODO: do something cleverer to save the level ids in an array
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
        XLSX.utils.book_append_sheet(workbook, sheet, `admin${level}`)
    }

    const buildGlobalIndicatorsWorkbook = (workbook: WorkBook) => {
        writeTab(workbook, 1, admin1Indicators.value, admin1Geojson.value);
    }

    const buildCountryIndicatorsWorkbook = (workbook: WorkBook, countryId: string, admin1Only: boolean) => {
        writeTab(workbook, 1, admin1Indicators.value, admin1Geojson.value, countryId);
        if (!admin1Only) {
            writeTab(workbook, 2, admin2Indicators.value, admin2Geojson.value, countryId);
        }
    }

    const writeFile = (fileName: string, buildWorkbook: () => WorkBook) => {
        try {
            const workbook = buildWorkbook();
            XLSX.writeFile(workbook, fileName);
        } catch (e) {
            // TODO: error handling
            console.log(e)
        }
    }


   const download = () => {
        const { country } = mapSettings.value;
        const { countriesWithoutAdmin2 } = appConfig.value;
        const admin2DataMissing = country && countriesWithoutAdmin2.includes(country);
        const fileName = `arbomap_${country || "GLOBAL"}.xlsx`;
        debounce(() => {
            writeFile(fileName, () => {
                const workbook = XLSX.utils.book_new();
                if (country) {
                    buildCountryIndicatorsWorkbook(workbook, country, admin2DataMissing);
                } else {
                    buildGlobalIndicatorsWorkbook(workbook);
                }
                return workbook;
            });
        })();
    }

    return { download };
}
