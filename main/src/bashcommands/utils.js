const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function execCommandInBash(command) {
  const {
    stdout,
    stderr,
  } = await exec(command);
  console.log(stdout);
  console.error(stderr);
}

function getMajorOfVersion(version) {
  return version.substring(0, 1);
}

export { execCommandInBash, getMajorOfVersion };
