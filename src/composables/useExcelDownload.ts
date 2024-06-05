import * as XLSX from "xlsx";
import { storeToRefs } from "pinia";
import { WorkBook } from "xlsx";
import { Ref, ref } from "vue";
import { ColorType, FeatureIndicators, MapFeature } from "../types/resourceTypes";
import { Dict } from "../types/utilTypes";
import { useAppStore } from "../stores/appStore";
import { useIndicatorColors } from "./useIndicatorColors";
import { debounce } from "../utils";
import {PATHOGEN, VERSION} from "../router/utils";

export const useExcelDownload = () => {
    const { mapSettings, appConfig, admin1Indicators, admin2Indicators, admin1Geojson, admin2Geojson, countryNames } =
        storeToRefs(useAppStore());

    const { getIndicatorColorType, getIndicatorValueColorCategory } = useIndicatorColors();

    const downloadError: Ref<Error | null> = ref(null);

    const writeTab = (
        workbook: WorkBook,
        level: number,
        indicatorValues: Dict<FeatureIndicators>,
        geojson: Dict<MapFeature[]>,
        country?: string
    ) => {
        const sheetData = [];

        const { indicators, countries, geoJsonFeatureProperties } = appConfig.value;

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
            const countryName = countryNames.value[countryId] || "";
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

    const buildGlobalIndicatorsWorkbook = (workbook: WorkBook, includeAdmin2: boolean) => {
        writeTab(workbook, 1, admin1Indicators.value, admin1Geojson.value);
        if (includeAdmin2) {
            console.log("should include admin2")
        }
    };

    const buildCountryIndicatorsWorkbook = (workbook: WorkBook, countryId: string) => {
        writeTab(workbook, 1, admin1Indicators.value, admin1Geojson.value, countryId);

        const { countriesWithoutAdmin2 } = appConfig.value;
        const admin1Only = countriesWithoutAdmin2.includes(countryId);
        if (!admin1Only) {
            writeTab(workbook, 2, admin2Indicators.value, admin2Geojson.value, countryId);
        }
    };

    const downloadFile = (includeAdmin2ForGlobal) => {
        const workbook = XLSX.utils.book_new();
        const { country } = mapSettings.value;
        const fileName = `arbomap_${PATHOGEN}_${VERSION}_${country || "GLOBAL"}.xlsx`;
        if (country) {
            buildCountryIndicatorsWorkbook(workbook, country);
        } else {
            buildGlobalIndicatorsWorkbook(workbook, includeAdmin2ForGlobal);
        }

        XLSX.writeFile(workbook, fileName);
    };

    const download = (includeAdmin2ForGlobal = false) => {
        downloadError.value = null;
        debounce(() => {
            try {
                downloadFile(includeAdmin2ForGlobal);
            } catch (e) {
                console.log(`Error downloading Excel file: ${e}`);
                downloadError.value = e;
            }
        })();
    };

    return { download, downloadError };
};
