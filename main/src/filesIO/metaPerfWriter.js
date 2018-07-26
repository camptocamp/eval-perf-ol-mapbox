import { metaperf } from '../sharedperformance/metaPerf';
import { metaPerfLogsFileName, outputJSON, expectConfigFile } from './utils';
import ConfigReader from './ConfigReader';

const fs = require('fs');

function writeMetaPerf(dirName) {
  if (!fs.existsSync(dirName)) {
    throw new Error(`no such dir : ${dirName}`);
  } else {
    const perfs = metaperf(dirName);
    outputJSON(perfs, metaPerfLogsFileName, dirName);
  }
}

function main(pathToConfig) {
  console.log('writing metaPerformance ...');
  const configReader = new ConfigReader(pathToConfig);
  configReader.getPathsToRenderersDir().forEach((dirName) => {
    writeMetaPerf(dirName);
  });
  console.log('metaPerformance written');
}

if (typeof require !== 'undefined' && require.main === module) {
  const pathToConfig = expectConfigFile();
  main(pathToConfig);
}

