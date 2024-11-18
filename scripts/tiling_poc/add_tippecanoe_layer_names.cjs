// For the tiling proof of concept:
// We want each feature in our geojson to become a layer in the mbtiles database, and for this we need to
// inject the tippecanoe.layer property so that tippecanoe generates these layers. We'll set the value
// of this prop to the feature id

// To run this script, provide the following parameters in this order:
// 1. Input folder - the script will process all files discovered in this folder
// 2. Output folder - the script will overwrite existing files with same name - it prepends "tippecanoe_" to each input
// file name
// 3. layerId property - the geojson property which should be considered the layer id

// e.g. node add_tippecanoe_layer_names.cjs ~/gadm41/admin2 ~/gadm41_processed/admin2 GID_2


/* eslint-disable import/no-dynamic-require */
const path = require("path");
const fs = require("fs");

const transformFile = (inputFile, outputFile, layerIdProp) => {
    console.log(`Transforming geojson at ${inputFile}`);

    const input = require(inputFile);
    const features = input.features;
    console.log(`found ${features.length} features`);
    features.forEach((feature) => {
        const id = feature.properties[layerIdProp];
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
}
//transformFile("/../public/dengue/may24/resources/geojson/admin2/", "gadm41_BRA_2_100pc.json", "GID_2");
//transformFile("/../public/dengue/may24/resources/geojson/admin1/", "all_adm1_100pc.json", "GID_1");

const errorOut = (msg) => {
    console.error(msg);
    process.exit(1);
};

const args = process.argv.slice(2);
if (args.length !== 3) {
   errorOut("Expected 3 args");
}
const [inputDir, outputDir, layerIdProp] = args;


// 1. check input dir exists
if (!fs.existsSync(inputDir)) {
    errorOut(`Input folder ${inputDir} does not exist`)
}

// 2. create output dir if needed
if (!fs.existsSync(outputDir)) {
    console.log(`creating ${outputDir}`)
    fs.mkdirSync(outputDir, { recursive: true });
}

// 3 Discover files in input dir (expect valid geojson files only) and transform each
fs.readdirSync(inputDir).map(fileName => {
    const inputFile =  path.join(inputDir, fileName);
    const outputFile = path.join(outputDir, `tippecanoe_${fileName}`);
    transformFile(inputFile, outputFile, layerIdProp);
});
