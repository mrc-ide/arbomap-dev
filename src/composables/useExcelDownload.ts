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
import {BuildExcel} from "../excel/buildExcel";

export const useExcelDownload = () => {
    const { mapSettings, appConfig, admin1Indicators, admin2Indicators, admin1Geojson, admin2Geojson, countryNames } =
        storeToRefs(useAppStore());

    //const { getIndicatorColorType, getIndicatorValueColorCategory } = useIndicatorColors(appConfig);

    const downloadError: Ref<Error | null> = ref(null);

    const downloadFile = (includeAdmin2ForGlobal) => {
        const workbook = XLSX.utils.book_new();
        const { country } = mapSettings.value;
        const fileName = `arbomap_${PATHOGEN}_${VERSION}_${country || "GLOBAL"}.xlsx`;
        const builder = new BuildExcel(appConfig.value, countryNames.value, admin1Indicators.value, admin2Indicators.value,
            admin1Geojson.value, admin2Geojson.value);
        if (country) {
            builder.buildCountryIndicatorsWorkbook(workbook, country);
        } else {
            builder.buildGlobalIndicatorsWorkbook(workbook, includeAdmin2ForGlobal);
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
