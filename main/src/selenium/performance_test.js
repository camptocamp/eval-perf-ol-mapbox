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
const PATH_TO_OUTPUT_DIR = '../../out/mapbox/';

driver.get('http://localhost:8000/mapbox.html').then(main, () => console.error('error while loading the page'));

async function drag(actions, x, y, duration) {
  return actions.press()
    .move({
      duration, origin: Origin.POINTER, x, y,
    })
    .release();
}

async function initialMovement(actions) {
  return actions.move({ origin: Origin.POINTER, x: 500, y: 200 });
}

async function path5sec(driverForActions) {
  const actions = driverForActions.actions();
  const standardPause = 100;
  const standardMoveDuration = 200;
  const longerPause = 500;
  const longerMoveDuration = 500;
  return actions
    .move({ origin: Origin.POINTER, x: 600, y: 300 })
    .pause(100)
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 0,
    })
    .release()
    .pause(standardPause)
    .doubleClick()
    .pause(longerPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 0, y: -200,
    })
    .pause(standardPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 200, y: 0,
    })
    .pause(standardPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 0, y: 200,
    })
    .release()
    .pause(longerPause)
    .doubleClick()
    .pause(standardPause)
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 200,
    })
    .release()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 200, y: -200,
    })
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 200,
    })
    .release()
    .doubleClick()
    .pause(longerPause)
    .press()
    .move({
      duration: longerMoveDuration, origin: Origin.POINTER, x: 400, y: -50,
    })
    .move({
      duration: standardMoveDuration, origin: Origin.POINTer, x: 0, y: 200,
    })
    .pause(longerPause);
}

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
  driver.executeScript('window.startPerformanceRecording(document.getElementById("map"))');
  const actions = await path5sec(driver);
  await actions.perform();
  const logs = await driver.executeScript('return window.stopPerformanceRecording()');
  outputJSON(logs, 'scenario1.json');
  driver.close();
}
