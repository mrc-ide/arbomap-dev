const path = require("path");
const fs = require("fs");

const location = path.normalize(`${__dirname}/../data/raw/all_adm1_0_5pc.json`);
console.log(`Transforming geojson at ${location}`);
const rawGeojson = require(location);
const allGeojsonArr = rawGeojson.features;
console.log(`found ${allGeojsonArr.length} features`);

const allGeojson = {};
allGeojsonArr.forEach((feature) => {
    const country = feature.properties["GID_0"];
    if (!Object.keys(allGeojson).includes(country)) {
        allGeojson[country] = [];
    }
    allGeojson[country].push(feature);
});

const output = JSON.stringify(allGeojson);
const outputLocation = path.normalize(`${__dirname}/../data/processed/all_adm1_0_5pc_by_iso.json`);
fs.writeFile(outputLocation, output, err => {
    if (err) {
        throw err
    }
    console.log(`Saved to ${outputLocation}`)
})

