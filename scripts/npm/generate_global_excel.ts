import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { BuildExcel } from "../../src/excel/buildExcel";
import {excelFilename} from "../../src/composables/useExcelDownload";
import {AdminLevel} from "../../src/utils";

XLSX.set_fs(fs);

const baseDir = `${__dirname}/../../public/dengue/may24/resources`;

const readResource = (resourcePath: string) => {
    return JSON.parse(fs.readFileSync(path.normalize(`${baseDir}/${resourcePath}`)));
};

const appConfig = readResource("config.json");
const countryNames = readResource("countryNames.json");

const countryIds = appConfig.countries;
console.log(`Generating Excel for ${countryIds.length} countries`);

const admin1Geojson = readResource("geojson/all_adm1_0_5pc_by_iso.json");
const admin1Indicators = readResource("indicators/admin1/global_adm1.json");

const admin2Geojson = {};
const admin2Indicators = {};
countryIds.forEach((countryId) => {
    admin2Geojson[countryId] = readResource(`geojson/admin2/gadm41_${countryId}_2_2_5pc.json`).features;
    admin2Indicators[countryId] = readResource(`indicators/admin2/${countryId}.json`);
});
console.log("Read all indicators and geojson");

const builder = new BuildExcel(appConfig, countryNames, admin1Indicators, admin2Indicators,
    admin1Geojson, admin2Geojson);

const writeGlobalWorkbook = (filename: string, includeAdmin2: boolean) => {
    const workbook = XLSX.utils.book_new();
    builder.buildGlobalIndicatorsWorkbook(workbook, includeAdmin2);
    const fullFilename = path.normalize(`${baseDir}/excel/${filename}`);
    XLSX.writeFile(workbook, fullFilename, { compression: true });
    console.log(`Wrote ${fullFilename}`);
};

writeGlobalWorkbook(excelFilename(null, AdminLevel.ONE), false);
writeGlobalWorkbook(excelFilename(null, AdminLevel.TWO), true);

