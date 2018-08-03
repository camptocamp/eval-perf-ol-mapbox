import { readJSONFile, expectConfigFile } from '../filesIO/utils';
import { execCommandInBash, getMajorOfVersion } from './utils';
import ConfigReader from '../filesIO/ConfigReader';


const olPackageName = 'ol';
const olMapboxStylePackageName = 'ol-mapbox-style';


function removeCarets(string) {
  return string.replace(/\^/g, '');
}

function getOlVersion(packageLockJSONContent) {
  const tempVersion = packageLockJSONContent.dependencies[olPackageName].version;
  if (tempVersion === undefined) {
    return undefined;
  }
  return removeCarets(tempVersion);
}

function getOlMapboxStyleVersion(packageLockJSONContent) {
  const tempVersion = packageLockJSONContent.dependencies[olMapboxStylePackageName].version;
  if (tempVersion === undefined) {
    return undefined;
  }
  return removeCarets(tempVersion);
}

async function npmInstall(packageName, version) {
  console.log(`installing ${packageName}@${version}`);
  execCommandInBash(`npm install ${packageName}@${version}`);
}

async function npmUninstall(packageName) {
  console.log(`uninstalling ${packageName}`);
  await execCommandInBash(`npm uninstall ${packageName}`);
}

async function compareVersion(packageName, shouldBeVersion, actualVersion) {
  if (actualVersion !== shouldBeVersion) {
    console.log(`${packageName} version installed is: ${actualVersion}
    should be: ${shouldBeVersion}`);
    await npmUninstall(packageName);
    await npmInstall(packageName, shouldBeVersion);
  } else {
    console.log(`found correct version of ${packageName}: ${actualVersion}`);
  }
}

async function checkOlVersion(pathToConfigFile) {
  console.log('checking ol version...');
  const packageLockJSONContent = readJSONFile('package-lock.json');
  const olVersionsContent = readJSONFile('ol_versions.json');
  const configReader = new ConfigReader(pathToConfigFile);
  const olTime = configReader.getOlTime();
  const olActualVersion = getOlVersion(packageLockJSONContent);
  const olMapboxStyleActualVersion = getOlMapboxStyleVersion(packageLockJSONContent);
  const olShouldBeVersion = olVersionsContent[olTime][olPackageName];
  const olMapboxStyleShouldBeVersion = olVersionsContent[olTime][olMapboxStylePackageName];
  await compareVersion(olPackageName, olShouldBeVersion, olActualVersion);
  await compareVersion(
    olMapboxStylePackageName,
    olMapboxStyleShouldBeVersion,
    olMapboxStyleActualVersion,
  );
  return getMajorOfVersion(olShouldBeVersion);
}
if (typeof require !== 'undefined' && require.main === module) {
  const configPath = expectConfigFile();
  checkOlVersion(configPath);
}
