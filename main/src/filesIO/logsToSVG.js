import { getFileNamesOfLogs, writeSVGFileToDir } from './utils';
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

function main() {
  console.log('exporting svg of experiment');
  const args = process.argv;
  if (args.length !== 3) {
    throw new Error(`wrong number of argument, expected 1 arguments, got: ${args.length - 2}`);
  }
  const configReader = new ConfigReader(args[2]);
  exportAllSVGFromDirToDir(
    configReader.getPathToOutDir(),
    configReader.getPathToOutSVGDir(),
    configReader.getRenderers(),
  );
  console.log('exporting done');
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}
