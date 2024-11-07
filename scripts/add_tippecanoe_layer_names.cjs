// For the tiling proof of concept:
// We want each feature in our geojson to become a layer in the mbtiles database, and for this we need to
// inject the tippecanoe.layer property so that tippecanoe generates these layers. We'll set the value
// of this prop to the feature id
// Currently doing proof of concept for Brazil level 2 only!
// In future we will probably include this processing in our tile server repo

/* eslint-disable import/no-dynamic-require */
const path = require("path");
const fs = require("fs");

const dir = `${__dirname}/../public/dengue/may24/resources/geojson/admin2/`;
const inputFile = path.normalize(`${dir}gadm41_BRA_2_100pc.json`);
const outputFile = path.normalize(`${dir}gadm41_BRA_2_100pc_for_tippecanoe.json`);
console.log(`Transforming geojson at ${inputFile}`);

const input = require(inputFile);
const features = input.features;
console.log(`found ${features.length} features`);
features.forEach((feature) => {
    const id = feature.properties.GID_2;
    feature.tippecanoe = {
        layer: id
    };
});

const output = JSON.stringify(input);
fs.writeFile(outputFile, output, (err) => {
    if (err) {
        throw err;
    }
    console.log(`Saved to ${outputFile}`);
});