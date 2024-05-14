// Include git sha in command line arg
const gitSha = process.argv[2];
const path = require("path");
const fs = require("fs");
const baseLocation = `${__dirname}/../..`;
const packageVersion = require(`${baseLocation}/package.json`).version;

const output = `export const PACKAGE_VERSION="${packageVersion}";\nexport const GIT_SHA="${gitSha}";`;
const outputLocation = path.normalize(`${baseLocation}/src/version.ts`);
fs.writeFile(outputLocation, output, (err) => {
    if (err) {
        throw err;
    }
});