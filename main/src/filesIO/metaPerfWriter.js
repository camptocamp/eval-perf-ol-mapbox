import { metaperf } from '../sharedperformance/metaPerf';
import { metaPerfLogsFileName } from './utils';
import { outputJSON } from './utils';

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
  const args = process.argv.splice(2);
  args.forEach((dirName) => {
    writeMetaPerf(dirName);
  });
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}

