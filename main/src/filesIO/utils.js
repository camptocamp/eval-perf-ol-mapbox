const fs = require('fs');
const mkdirp = require('mkdirp');

const metaPerfLogsFileName = 'metaPerf.json';

function ensureDirectoryExistence(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  }
  mkdirp.sync(dirname);
}

function outputJSON(object, filename, path) {
  ensureDirectoryExistence(path);
  fs.writeFile(
    `${path}${filename}`,
    JSON.stringify(object),
    (err) => {
      if (err) {
        console.error(err);
      }
    },
  );
}

function getFileNamesOfLogs(pathToDir) {
  const files = fs.readdirSync(pathToDir, 'utf-8');
  const filesFiltered = files.filter(fileName => fileName !== metaPerfLogsFileName);
  return filesFiltered;
}

function writeFileToDir(path, file, data) {
  ensureDirectoryExistence(path);
  fs.writeFile(`${path}${file}`, data, 'utf-8');
}

function writeSVGFileToDir(path, file, data) {
  writeFileToDir(path, `${file}.svg`, data);
}

export { outputJSON, metaPerfLogsFileName, getFileNamesOfLogs, writeFileToDir, writeSVGFileToDir };