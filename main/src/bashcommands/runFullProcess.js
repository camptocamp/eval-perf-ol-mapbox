import {
  expectConfigFile,
  readJSONFile,
} from '../filesIO/utils';
import {
  execCommandInBash,
  getMajorOfVersion,
} from './utils';
import ConfigReader from '../filesIO/ConfigReader';
import { sleep } from '../selenium/actionWrapper';

async function runFullProcess(configPath) {
  await execCommandInBash(`npm run checkOlVersion ${configPath}`);
  const configReader = new ConfigReader(configPath);
  const olVersionsContent = readJSONFile('ol_versions.json');
  const majorVersionOfOl = getMajorOfVersion(olVersionsContent[configReader.getOlTime()].ol);
  if (majorVersionOfOl === '5') {
    console.log('starting server...');
    execCommandInBash('npm start');
  } else if (majorVersionOfOl === '4') {
    console.log('starting server...');
    execCommandInBash('npm run startOl4');
  } else {
    throw new Error(`major version of ol: ${majorVersionOfOl} not supported`);
  }
  console.log('waiting 10 server for the server to start...');
  await sleep(10000);
  await execCommandInBash(`npm run launchExperiment ${configPath}`);
  await execCommandInBash(`npm run writeMetaPerf ${configPath}`);
  await execCommandInBash(`npm run drawPerfPlots ${configPath}`);
  await execCommandInBash(`npm run drawMetaPerf ${configPath}`);
  console.log('done');
}

if (typeof require !== 'undefined' && require.main === module) {
  const configPath = expectConfigFile();
  runFullProcess(configPath);
}
