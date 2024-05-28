import {AppConfig, ColorType, FeatureIndicators, Geojson, MapFeature} from "../types/resourceTypes";
import {Dict} from "../types/utilTypes";
import * as XLSX from "xlsx";
import {geoJson} from "leaflet";
import {Feature} from "geojson";
import {storeToRefs} from "pinia";
import {useAppStore} from "../stores/appStore";
import {useIndicatorColors} from "./useIndicatorColors";
import {debounce} from "../utils";
import {WorkBook} from "xlsx";
import {ca} from "vuetify/locale";

export const useExcelDownload = () => {
    const {
        mapSettings,
        appConfig,
        admin1Indicators,
        admin2Indicators,
        admin1Geojson,
        admin2Geojson,
        countryNames
    } = storeToRefs(useAppStore());

    const { getIndicatorColorType, getIndicatorValueColorCategory } = useIndicatorColors();

    const writeTab = (workbook: WorkBook, level: number, indicatorValues: Dict<FeatureIndicators>, geojson: Dict<MapFeature[]>, country?: string) => {
        const sheetData = [];

        const { indicators, countries, geoJsonFeatureProperties } = appConfig.value;

        const countryIds = country ? [country] : countries;

        const indicatorIds = Object.keys(indicators);

        const categoryIndicators = Object.keys(indicators).filter((i) => getIndicatorColorType(i) === ColorType.Category);

        // Include IDs and names for all region levels from 0 to the requested level
        const levels = Array.from({length: level+1}, (_, v) => v);
        const [, ...subCountryLevels] = levels;

        // We use the configured feature prop names as the column headers for ID and names
        const headers = [];
        levels.forEach((level) => {
            headers.push(geoJsonFeatureProperties[`idAdm${level}`], geoJsonFeatureProperties[`nameAdm${level}`]);
        });

        indicatorIds.forEach((indicatorId) => {
            if (categoryIndicators.includes(indicatorId)) {
                // Include category only for that type of indicator
                headers.push(indicatorId);
            } else {
                headers.push(`mean_${indicatorId}`, `sd_${indicatorId}`);
            }
        });
        sheetData.push(headers);

        const levelFeatureIdProp = geoJsonFeatureProperties[`idAdm${level}`];

        countryIds.forEach((countryId) => {
            const countryName = countryNames.value[countryId] || "";
            const countryValues = indicatorValues[countryId];
            const countryGeojson = geojson[countryId];

            // Iterate features in geojson, but only emit a row if we have values in the indicators
            countryGeojson.forEach((feature) => {
                const featureId = feature.properties[levelFeatureIdProp];
                const featureValues = countryValues[featureId];
                if (featureValues) {
                    const row = [];

                    //country level
                    row.push(countryId, countryName);

                    subCountryLevels.forEach((level) => {
                        const idProp = geoJsonFeatureProperties[`idAdm${level}`];
                        const nameProp = geoJsonFeatureProperties[`nameAdm${level}`];
                        row.push(feature.properties[idProp], feature.properties[nameProp]);
                    });

                    indicatorIds.forEach((indicatorId) => {
                        const mean = featureValues[indicatorId].mean;
                        if (categoryIndicators.includes(indicatorId)) {
                            row.push(getIndicatorValueColorCategory(indicatorId, mean).name)
                        } else {
                            row.push(mean, featureValues[indicatorId].sd);
                        }
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

    const buildCountryIndicatorsWorkbook = (workbook: WorkBook, countryId: string) => {
        writeTab(workbook, 1, admin1Indicators.value, admin1Geojson.value, countryId);

        const { countriesWithoutAdmin2 } = appConfig.value;
        const admin1Only = countriesWithoutAdmin2.includes(countryId);
        if (!admin1Only) {
            writeTab(workbook, 2, admin2Indicators.value, admin2Geojson.value, countryId);
        }
    }

    const downloadFile = () => {
        try {
            const workbook = XLSX.utils.book_new();
            const { country } = mapSettings.value;
            const fileName = `arbomap_${country || "GLOBAL"}.xlsx`;
            if (country) {
                buildCountryIndicatorsWorkbook(workbook, country);
            } else {
                buildGlobalIndicatorsWorkbook(workbook);
            }

            XLSX.writeFile(workbook, fileName);
        } catch (e) {
            // TODO: error handling
            console.log(e)
        }
    }


   const download = () => {
        debounce(() => {
            downloadFile();
        })();
    }

    return { download };
}
