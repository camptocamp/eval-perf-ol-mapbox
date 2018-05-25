import { path5sec } from './navigationPaths';
import { outputJSON } from '../filesIO/utils';

const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

function defaultOptions() {
  return new firefox.Options()
    .setPreference('privacy.reduceTimerPrecision', false)
    .setPreference('privacy.resistFingerprinting', false);
}

class SeleniumNavigator {
  constructor(options) {
    this.options = {};
    if (options === undefined) {
      options = {};
    }
    this.options.navigator = options.navigator === undefined ? 'firefox' : options.navigator;
    this.options.seleniumOptions =
      options.seleniumOptions === undefined ? defaultOptions() : options.seleniumOptions;
    this.init();
  }

  init() {
    this.driver = new Builder()
      .forBrowser(this.options.navigator)
      .setFirefoxOptions(this.options.seleniumOptions)
      .build();
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
    this.driver.executeScript('window.startPerformanceRecording(document.getElementById("map"))');
    const actions = await options.path(this.driver);
    await actions.perform();
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
