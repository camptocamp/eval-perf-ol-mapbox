import { metaperf } from '../sharedperformance/metaPerf';
import { metaPerfLogsFileName, outputJSON } from './utils';
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

function main() {
  console.log('writing metaPerformance ...');
  const pathToConfig = process.argv[2];
  const configReader = new ConfigReader(pathToConfig);
  configReader.getPathsToRenderersDir().forEach((dirName) => {
    writeMetaPerf(dirName);
  });
  console.log('metaPerformance written');
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}

