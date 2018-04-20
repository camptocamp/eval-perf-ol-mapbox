const {Builder} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const {Origin} = require('selenium-webdriver/lib/input');
let options = new firefox.Options()
.setPreference('reduceTimerPrecision', false);

let driver = new Builder()
.forBrowser('firefox')
.setFirefoxOptions(options)
.build();

driver.get('http://localhost:8000/mapbox.html');
const actions = driver.actions();
actions
.move({origin: Origin.POINTER, x : 500, y : 200})
.press()
.move({duration: 200, origin: Origin.POINTER, x : -200, y : 0})
.release()
.perform();
