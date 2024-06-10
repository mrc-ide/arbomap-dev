import * as XLSX from "xlsx";
import { storeToRefs } from "pinia";
import { Ref, ref } from "vue";
import { useAppStore } from "../stores/appStore";
import { AdminLevel, debounce, downloadFile } from "../utils";
import { APP_BASE_URL, PATHOGEN, VERSION } from "../router/utils";
import { BuildExcel } from "../excel/buildExcel";

export const excelFilename = (country?: string, level?: AdminLevel) => {
    const levelPart = level ? `_${level}` : "";
    return `arbomap_${PATHOGEN}_${VERSION}_${country || "GLOBAL"}${levelPart}.xlsx`;
};

export const useExcelDownload = () => {
    const { mapSettings, appConfig, admin1Indicators, admin2Indicators, admin1Geojson, admin2Geojson, countryNames } =
        storeToRefs(useAppStore());

    const downloadError: Ref<Error | null> = ref(null);

    const doDownloadSelectedCountry = () => {
        const workbook = XLSX.utils.book_new();
        const { country } = mapSettings.value;
        if (!country) {
            throw Error("No selected country");
        }
        const fileName = excelFilename(country);
        const builder = new BuildExcel(
            appConfig.value,
            countryNames.value,
            admin1Indicators.value,
            admin2Indicators.value,
            admin1Geojson.value,
            admin2Geojson.value
        );

        builder.buildCountryIndicatorsWorkbook(workbook, country);
        XLSX.writeFile(workbook, fileName);
    };

    const doDownloadGlobal = async (includeAdmin2: boolean) => {
        const filename = excelFilename(null, includeAdmin2 ? AdminLevel.TWO : AdminLevel.ONE);
        const url = `${APP_BASE_URL}/resources/excel/${filename}`;
        await downloadFile(url, filename);
    };

    const download = (doDownload: () => void | Promise<void>) => {
        downloadError.value = null;
        debounce(async () => {
            try {
                await doDownload();
            } catch (e) {
                console.log(`Error downloading Excel file: ${e}`);
                downloadError.value = e;
            }
        })();
    };

    const downloadSelectedCountry = () => {
        download(doDownloadSelectedCountry);
    };

    const downloadGlobal = (includeAdmin2: bool) => {
        download(async () => {
            await doDownloadGlobal(includeAdmin2);
        });
    };

    return { downloadSelectedCountry, downloadGlobal, downloadError };
};
