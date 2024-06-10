import { afterAll, beforeAll, beforeEach, describe, test, vi, expect } from "vitest";
import { mockDownloadFile } from "../mocks/mockUtils";
import { mockWriteFile } from "../mocks/mockXlsx";
import { mockMapSettings, mockPinia } from "../mocks/mockPinia";
import { MOCK_ADMIN2_GEOJSON, MOCK_ADMIN2_INDICATORS, MOCK_APP_CONFIG } from "../mocks/mockObjects";
import { useExcelDownload } from "../../../src/composables/useExcelDownload";

describe("useExcelDownload", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeAll(() => {
        vi.useFakeTimers();
    });

    describe("when no country is selected", () => {
        beforeAll(() => {
            mockPinia();
        });

        const expectCanDownloadGlobal = (includeAdmin2: boolean) => {
            const sut = useExcelDownload();
            sut.downloadGlobal(includeAdmin2);
            vi.runAllTimers();
            const level = includeAdmin2 ? 2 : 1;
            const filename = `arbomap_dengue_may24_GLOBAL_admin${level}.xlsx`;
            expect(mockDownloadFile).toHaveBeenCalledWith(`/dengue/may24/resources/excel/${filename}`, filename);
        };

        test("can download global indicators file without indicators 2 values", () => {
            expectCanDownloadGlobal(false);
        });

        test("can download global indicators file with indicators 2 values", () => {
            expectCanDownloadGlobal(true);
        });
    });

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

    describe("when a country is selected", () => {
        beforeAll(() => {
            mockPinia({
                mapSettings: mockMapSettings({ country: "TZA" }),
                admin2Geojson: {
                    TZA: MOCK_ADMIN2_GEOJSON.TZA.features
                },
                admin2Indicators: MOCK_ADMIN2_INDICATORS
            });
        });

        test("can write country indicators Excel file", () => {
            const sut = useExcelDownload();
            sut.downloadSelectedCountry();
            vi.runAllTimers();
            expect(mockWriteFile).toHaveBeenCalledTimes(1);
            expect(mockWriteFile.mock.calls[0][0]).toStrictEqual({
                sheets: [expectedAdmin1Sheet, expectedAdmin2Sheet]
            });
            expect(mockWriteFile.mock.calls[0][1]).toBe("arbomap_dengue_may24_TZA.xlsx");
        });
    });

    describe("when a country with no admin2 regions is selected", () => {
        beforeAll(() => {
            mockPinia({
                appConfig: { ...MOCK_APP_CONFIG, countriesWithoutAdmin2: ["TZA"] },
                mapSettings: mockMapSettings({ country: "TZA" }),
                admin2Geojson: MOCK_ADMIN2_GEOJSON,
                admin2Indicators: MOCK_ADMIN2_INDICATORS
            });
        });

        test("can write country indicators Excel file", () => {
            const sut = useExcelDownload();
            sut.downloadSelectedCountry();
            vi.runAllTimers();
            expect(mockWriteFile).toHaveBeenCalledTimes(1);
            expect(mockWriteFile.mock.calls[0][0]).toStrictEqual({
                sheets: [expectedAdmin1Sheet] // admin1 sheet only
            });
            expect(mockWriteFile.mock.calls[0][1]).toBe("arbomap_dengue_may24_TZA.xlsx");
        });
    });

    describe("when there is an error while writing the file", () => {
        beforeAll(() => {
            mockPinia({
                mapSettings: mockMapSettings({ country: "TZA" }),
                admin2Geojson: { duff: "data" }
            });
        });

        test("sets downloadError", () => {
            const sut = useExcelDownload();
            sut.downloadSelectedCountry();
            vi.runAllTimers();
            expect(mockWriteFile).toHaveBeenCalledTimes(0);
            expect(sut.downloadError.value.name).toBe("TypeError");
        });
    });
});
