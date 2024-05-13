import {FeatureIndicators, Geojson} from "../types/resourceTypes";
import {Dict} from "../types/utilTypes";
import * as XLSX from "xlsx";
import {AppState} from "../types/storeTypes";
import {useAppStore} from "../stores/appStore";

export class IndicatorsExcelDownload {
    private readonly _fileName: string;
    private readonly _workbook: XLSX.WorkBook;
    private readonly _appState: AppState;

    constructor(fileName: string) {
        this._fileName = fileName;
        this._workbook = XLSX.utils.book_new();
        this._appState = useAppStore();
    }

    private _writeTab(level: number, indicators: Dict<FeatureIndicators>, geojson: Dict<Geojson>, countryId?: string) {
        const sheetData = [];

        const countries = countryId ? [countryId] : this._appState.appConfig.countries;
        // TODO: cope with countriesWithoutAdmin2

        const headers = [];
        for (let i = 0; i <= level; i++) {
            headers.push(`GID_${i}`, `NAME_${i}`);
        }
        Object.keys(this._appState.appConfig.indicators).forEach((i) => headers.push(`mean_${i}`, `sd_${i}`));

        sheetData.push(headers);
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(this._workbook, sheet, `admin${level}`)
    }

    private _buildGlobalIndicatorsWorkbook(): void {
        this._writeTab(1, this._appState.admin1Indicators, this._appState.admin1Geojson);
    }

    private _writeFile(buildWorkbook: () => void): void {
        try {
            buildWorkbook();
            XLSX.writeFile(this._workbook, this._fileName);
        } catch (e) {
            // TODO: error handling
        }
    }

    downloadGlobalIndicators = () => {
        this._writeFile(this._buildGlobalIndicatorsWorkbook);
    }
}
