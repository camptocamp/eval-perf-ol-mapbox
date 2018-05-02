const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { Origin } = require('selenium-webdriver/lib/input');

const options = new firefox.Options()
  .setPreference('privacy.reduceTimerPrecision', false).setPreference('privacy.resistFingerprinting', false);

const driver = new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(options)
  .build();

const MEASUREMENT_TIME = 500;
const PATH_TO_OUTPUT_DIR = '../../out/';

driver.get('http://localhost:8000/mapbox.html').then(main, () => console.error('error while loading the page'));

function outputJSON(object, filename) {
  require('fs').writeFile(
    `${PATH_TO_OUTPUT_DIR}${filename}`,
    JSON.stringify(object),
    (err) => {
      if (err) {
        console.error(err);
      }
    },
  );
}

async function main() {
  driver.executeScript('window.startPerformanceRecording()');
  const actions = driver.actions();
  await actions
    .move({ origin: Origin.POINTER, x: 500, y: 200 })
    .press()
    .move({
      duration: 200, origin: Origin.POINTER, x: -200, y: 0
    })
    .release()
    .perform();
  const logs = await driver.executeScript('return window.stopPerformanceRecording()');
  outputJSON(logs, 'perfLogs.json');
  //driver.close()
}
