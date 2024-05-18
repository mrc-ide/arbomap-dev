/* eslint-disable import/no-dynamic-require, global-require */

// We need country names for Excel download and Country selector, but these are not reliably present in the processed
// indicator files or simplified admin1 or admin2 geojson. They are present in the admin0 geojson, but we don't want to
// have to read in all these files in-app order to find all country names. So we generate pre-canned names from ammin0
// with this script

const path = require("path");

const baseLocation = `${__dirname}/../public/dengue/may24/resources`;
// Read country ids from config.json
const configLocation = path.normalize(`${baseLocation}/config.json`);
const { countries } = require(configLocation);
const fs = require("fs");

console.log(`Read ${countries.length} country ids`);

// Read in each country name from corresponding admin0 file
const countryNames = {};
const countryProp = "COUNTRY";
countries.forEach((countryId) => {
    const admin0Location = path.normalize(`${baseLocation}/geojson/admin0/gadm41_${countryId}_0.json`);
    try {
        const geojson = require(admin0Location);
        const name = geojson.features[0].properties[countryProp];
        console.log(`${countryId}: ${name}`);
        countryNames[countryId] = name;
    } catch (e) {
        console.log(`Unable to load data for ${countryId}: ${e}`);
    }
});

// Output country names dictionary
const output = JSON.stringify(countryNames);
const outputLocation = path.normalize(`${__dirname}/../data/processed/countryNames.json`);
fs.writeFile(outputLocation, output, (err) => {
    if (err) {
        throw err;
    }
    console.log(`Saved to ${outputLocation}`);
});
