import { useExcelDownload } from "../../src/composables/useExcelDownload";
import { readFileSync } from "node:fs";
import * as path from "node:path";

//const c = useExcelDownload();

const readResource = (resourcePath: string) => {
    const baseDir = `${__dirname}/../../public/dengue/may24/resources`;
    return JSON.parse(readFileSync(path.normalize(`${baseDir}/${resourcePath}`)));
};

const countryNames = readResource("countryNames.json");

const countryIds = Object.keys(countryNames);
console.log(`Generating Excel for ${countryIds.length} countries`);

const admin1Geojson = readResource("geojson/all_adm1_0_5pc_by_iso.json");
const admin1Indicators = readResource("indicators/admin1/global_adm1.json");

const admin2Geojson = {};
const admin2Indicators = {};
countryIds.forEach((countryId) => {
    admin2Geojson[countryId] = readResource(`geojson/admin2/gadm41_${countryId}_2_2_5pc.json`);
    admin2Indicators[countryId] = readResource(`indicators/admin2/${countryId}.json`);
});
console.log("Read all indicators and geojson");

