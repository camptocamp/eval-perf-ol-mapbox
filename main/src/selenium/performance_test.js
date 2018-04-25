const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { Origin } = require('selenium-webdriver/lib/input');
let options = new firefox.Options()
  .setPreference('reduceTimerPrecision', false);

let driver = new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(options)
  .build();

const totalLengthDuration = 500;
driver.get('http://localhost:8000/mapbox.html').then(main, () => console.error('error while loading the page'));

function outputList(list) {
  require('fs').writeFile(
    './my.json',
    JSON.stringify(list),
    function (err) {
      if (err) {
        console.error('Crap happens');
      }
    }
  );
}

const scriptStringified = 'const callback = arguments[arguments.length - 1];\
let before, old_before, now, fps;\
before = Date.now();\
fps = 0;\
let fps_list = [];\
function loop(elapsed) {\
  if (elapsed > 500) {\
    callback(fps_list);\
    return;\
  }\
  now = Date.now();\
  fps = Math.round(1000 / (now - before));\
  old_before = before;\
  before = now;\
  fps_list.push(fps);\
  window.requestAnimationFrame(() => loop(elapsed + now - old_before));\
}\
window.requestAnimationFrame(\
  () => loop(501)\
);'

function main() {
  driver.executeAsyncScript('const callback = arguments[arguments.length - 1];\
  let before, old_before, now, fps;\
  before = Date.now();\
  fps = 0;\
  let fps_list = [];\
  function loop(elapsed) {\
    if (elapsed > 500) {\
      callback(fps_list);\
    }\
    now = Date.now();\
    fps = Math.round(1000 / (now - before));\
    old_before = before;\
    before = now;\
    fps_list.push(fps);\
    window.requestAnimationFrame(() => loop(elapsed + now - old_before));\
  }\
  window.requestAnimationFrame(\
    () => loop(0)\
  );').then(result => {
    outputList(result);
    driver.close()
  }, (message) => console.error(message))
  const actions = driver.actions();
  actions
    .move({ origin: Origin.POINTER, x: 500, y: 200 })
    .press()
    .move({ duration: 200, origin: Origin.POINTER, x: -200, y: 0 })
    .release()
    .perform();
}