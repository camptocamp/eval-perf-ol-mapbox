const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { Origin } = require('selenium-webdriver/lib/input');

const options = new firefox.Options()
  .setPreference('reduceTimerPrecision', false);

const driver = new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(options)
  .build();

const MEASUREMENT_TIME = 500;
const PATH_TO_OUTPUT_DIR = '../../out/';

driver.get('http://localhost:8000/mapbox.html').then(main, () => console.error('error while loading the page'));

function outputList(list, filename) {
  require('fs').writeFile(
    `${PATH_TO_OUTPUT_DIR}${filename}`,
    JSON.stringify(list),
    (err) => {
      if (err) {
        console.error('Crap happens');
      }
    },
  );
}

const scriptStringified = `const callback = arguments[arguments.length - 1];\
let before, now, frameTime;\
before = performance.now();\
let renderTimeList = [];\
function loop(elapsed) {\
  if (elapsed > ${MEASUREMENT_TIME}) {\
    callback(renderTimeList);\
  }\
  now = performance.now();\
  frameTime = now - before;\
  before = now;\
  renderTimeList.push(frameTime);\
  window.requestAnimationFrame(() => loop(elapsed + frameTime));\
}\
window.requestAnimationFrame(\
  () => loop(0)\
);`;
function sum(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum;
}

function average(array) {
  return sum(array) / array.length;
}

function getInstantFPS(renderTimeList) {
  return renderTimeList.map(x => 1000 / x);
}

function callbackOfAsyncScript(renderTimeList) {
  outputList(renderTimeList, 'renderTimeList.json');
  const instantFPS = getInstantFPS(renderTimeList);
  const avgFPS = average(instantFPS);
  const totalRenderingTime = sum(renderTimeList);
  outputList(instantFPS, 'instantFPS.json');
  outputList([avgFPS, totalRenderingTime], 'miscellaneous.json');
}

async function main() {
  driver.executeAsyncScript(scriptStringified)
    .then(callbackOfAsyncScript, message => console.error(message));
  const map = await driver.findElement(By.id('map'));
  console.log(`map is: ${map}`);
  const actions = driver.actions();
  actions
    .move({ origin: Origin.POINTER, x: 500, y: 200 })
    .press()
    .move({
      duration: 200, origin: Origin.POINTER, x: -200, y: 0
    })
    .release()
    .perform();
}
