import { getFileNamesOfLogs, writeSVGFileToDir } from './utils';

const plotPerf = require('../visualization/plotPerf');

const LIBRARIES = ['openlayers', 'mapbox'];

function filenameWithoutExtension(filename) {
  return filename.split('.')[0];
}

function exportSVGFromDirToDir(inputDir, outputDir) {
  const files = getFileNamesOfLogs(inputDir);
  files.forEach((filename) => {
    const svg = plotPerf.SVGFromLogs(`${inputDir}${filename}`);
    writeSVGFileToDir(outputDir, filenameWithoutExtension(filename), svg);
  });
}

function exportLogs(inputDir, outputDir, lib) {
  exportSVGFromDirToDir(`${inputDir}${lib}/`, `${outputDir}${lib}/`);
}

function exportAllSVGFromDirToDir(inputDir, outputDir) {
  LIBRARIES.forEach(lib => exportLogs(inputDir, outputDir, lib));
}

function main() {
  const args = process.argv;
  if (args.length !== 4) {
    throw new Error(`wrong number of argument, expected 2 arguments, got: ${args.length - 2}`);
  }
  exportAllSVGFromDirToDir(args[2], args[3]);
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}
