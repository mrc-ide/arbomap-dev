import { mockBookAppendSheet } from "../mocks/mockXlsx";
import {BuildExcel} from "../../../src/excel/buildExcel";
import {
    MOCK_ADMIN1_GEOJSON,
    MOCK_ADMIN1_INDICATORS, MOCK_ADMIN2_GEOJSON,
    MOCK_ADMIN2_INDICATORS,
    MOCK_APP_CONFIG,
    MOCK_COUNTRY_NAMES
} from "../mocks/mockObjects";
import {beforeEach, vi} from "vitest";

describe("buildExcel", () => {
    // NB buildCountryIndicatorsWorkbook is tested via useExcelDownload tests

    const sut = new BuildExcel(
        MOCK_APP_CONFIG,
        MOCK_COUNTRY_NAMES,
        MOCK_ADMIN1_INDICATORS,
        MOCK_ADMIN2_INDICATORS,
        MOCK_ADMIN1_GEOJSON,
        {
            MWI: MOCK_ADMIN2_GEOJSON.MWI.features,
            TZA: MOCK_ADMIN2_GEOJSON.TZA.features
        }
    );

    const expectedAdmin1Sheet = {
        name: "admin1",
        data: [
            [
                "shapeGroup",
                "countryName",
                "shapeID_1",
                "shapeName_1",
                "mean_FOI",
                "sd_FOI",
                "mean_serop9",
                "sd_serop9",
                "serop9_class",
                "mean_hosp_total",
                "sd_hosp_total",
                "mean_hosp_0_4",
                "sd_hosp_0_4",
                "mean_hosp_5_9",
                "sd_hosp_5_9"
            ],
            ["MWI", "Malawi", "123", "Test123", 0.1, 0.01, 0.2, 0.02, "Under 40%", 0.3, 0.03, 0.4, 0.04, 0.5, 0.05],
            ["TZA", "Tanzania", "789", "Test789", 0.3, 0.03, 0.4, 0.04, "40-60%", 0.5, 0.05, 0.6, 0.06, 0.7, 0.07]
        ]
    };

    const expectedAdmin2Sheet = {
        name: "admin2",
        data: [
            [
                "shapeGroup",
                "countryName",
                "shapeID_1",
                "shapeName_1",
                "shapeID_2",
                "shapeName_2",
                "mean_FOI",
                "sd_FOI",
                "mean_serop9",
                "sd_serop9",
                "serop9_class",
                "mean_hosp_total",
                "sd_hosp_total",
                "mean_hosp_0_4",
                "sd_hosp_0_4",
                "mean_hosp_5_9",
                "sd_hosp_5_9"
            ],
            [
                "MWI",
                "Malawi",
                "123",
                "Test123",
                "123-a",
                "Test123-a",
                0.1,
                0.01,
                0.2,
                0.02,
                "Under 40%",
                0.53,
                0.053,
                0.63,
                0.063,
                0.73,
                0.073
            ],
            [
                "TZA",
                "Tanzania",
                "789",
                "Test789",
                "789-a",
                "Test789-a",
                0.31,
                0.031,
                0.41,
                0.041,
                "40-60%",
                0.31,
                0.031,
                0.41,
                0.041,
                0.51,
                0.051
            ],
            [
                "TZA",
                "Tanzania",
                "789",
                "Test789",
                "789-b",
                "Test789-b",
                0.32,
                0.032,
                0.62,
                0.062,
                "Above 60%",
                0.51,
                0.051,
                0.61,
                0.061,
                0.71,
                0.071
            ]
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("can build global indicators workbook without admin 2", () => {
        const mockWorkbook = { sheets: [] };
        sut.buildGlobalIndicatorsWorkbook(mockWorkbook, false);
        expect(mockBookAppendSheet).toHaveBeenCalledTimes(1);
        expect(mockWorkbook.sheets).toStrictEqual([expectedAdmin1Sheet]);
    });

    test("can build global indicators workbook with admin 2", () => {
        const mockWorkbook = { sheets: [] };
        sut.buildGlobalIndicatorsWorkbook(mockWorkbook, true);
        expect(mockBookAppendSheet).toHaveBeenCalledTimes(2);
        expect(mockWorkbook.sheets).toStrictEqual([expectedAdmin1Sheet, expectedAdmin2Sheet]);
    });
});
