import { getFileNamesOfLogs, writeSVGFileToDir, expectConfigFile } from './utils';
import ConfigReader from './ConfigReader';

const plotPerf = require('../visualization/plotPerf');

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

function exportAllSVGFromDirToDir(inputDir, outputDir, renderers) {
  renderers.forEach(lib => exportLogs(inputDir, outputDir, lib));
}

function main(pathToConfigFile) {
  console.log('exporting svg of experiment');
  const configReader = new ConfigReader(pathToConfigFile);
  exportAllSVGFromDirToDir(
    configReader.getPathToTestNameDir(),
    configReader.getPathForSVG(),
    configReader.getRenderers(),
  );
  console.log('exporting done');
}

if (typeof require !== 'undefined' && require.main === module) {
  const pathToConfigFile = expectConfigFile();
  main(pathToConfigFile);
}
