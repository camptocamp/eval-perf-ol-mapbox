import { path5sec } from './navigationPaths';
import promiseTimeOut from './promiseTimeOut';

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
    this.options.browser = (options.browser === undefined) ? 'firefox' : options.browser;
    this.options.seleniumOptions =
      options.seleniumOptions === undefined ? defaultOptions() : options.seleniumOptions;
    this.init();
  }

  init() {
    this.driver = new Builder()
      .forBrowser(this.options.browser);
    if (this.options.browser === 'firefox') {
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
    const actions = await options.path(this.driver, options.mode, options.rendererUsed);
    try {
      await promiseTimeOut(30000, actions.perform());
    } catch (error) {
      console.log(error.message);
      await this.driver.get(`http://localhost:8000/${options.rendererUsed}.html`);
      this.close();
    }
    console.log('hey');
    return this.driver.executeScript('return window.stopPerformanceRecording()');
  }
  close() {
    this.driver.close();
  }
}

export { SeleniumNavigator };
