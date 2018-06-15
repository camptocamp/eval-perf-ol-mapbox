import { path5sec } from './navigationPaths';
import { outputJSON } from '../filesIO/utils';

const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

function resolveLater(resolve, reject) {
  setTimeout(() => {
    resolve(10);
  }, 300);
}

function defaultOptions() {
  return new firefox.Options()
    .setPreference('privacy.reduceTimerPrecision', false)
    .setPreference('privacy.resistFingerprinting', false);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class SeleniumNavigator {
  constructor(options) {
    this.options = {};
    if (options === undefined) {
      options = {};
    }
    this.options.browser = (options.browser === undefined) ? 'firefox' : options.browser;
    this.options.seleniumOptions =
      options.seleniumOptions === undefined ? defaultOptions() : options.seleniumOptions;
    this.init();
  }

  init() {
    this.driver = new Builder()
      .forBrowser(this.options.browser);
    if (this.options.browser = 'firefox') {
      this.driver = this.driver.setFirefoxOptions(this.options.seleniumOptions);
    }
    this.driver = this.driver.build();
  }
  async executeScenario(options) {
    if (options === undefined) {
      options = {};
    }
    if (options.rendererUsed === undefined) {
      options.rendererUsed = 'mapbox';
    }
    if (options.path === undefined) {
      options.path = path5sec;
    }
    await this.driver.get(`http://localhost:8000/${options.rendererUsed}.html`);
    await this.driver.executeScript('window.startPerformanceRecording(document.getElementById("map"))');
    await sleep(1000);
    const actionList = await options.path(this.driver);
    for (let index = 0; index < actionList.length; index += 1) {
      await actionList[index].perform();
      await sleep(300);
    }
    await sleep(1000);
    return this.driver.executeScript('return window.stopPerformanceRecording()');
  }
  close() {
    this.driver.close();
  }
}


async function defaultBehaviour() {
  const seleniumNavigator = new SeleniumNavigator();
  const logs = await seleniumNavigator.executeScenario();
  outputJSON(logs, 'scenario1.json', '../../out/mapbox/');
  seleniumNavigator.close();
}

export { defaultBehaviour, SeleniumNavigator };
