import BrowserMob from 'browsermob-proxy-client';
import selProxy from 'selenium-webdriver/proxy';
import { path5sec } from './navigationPaths';
import promiseTimeOut from './promiseTimeOut';
import ProxyHelper from '../network/ProxyHelper';
import { writeFileToDir } from '../filesIO/utils';

const { Builder } = require('selenium-webdriver');
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

  async init() {
    this.defaultProxy = BrowserMob.createClient();
    await this.defaultProxy.start();
    await this.defaultProxy.createHar();
    this.driver = new Builder()
      .withCapabilities(ProxyHelper.getCapabilities(this.options.browser))
      .setProxy(selProxy.manual(ProxyHelper.getManualProxy(this.defaultProxy.proxy.port)));

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
    const actions = await options.path(this.driver);
    try {
      await promiseTimeOut(30000, actions.perform());
    } catch (error) {
      console.log(error.message);
      await this.driver.get(`http://localhost:8000/${options.rendererUsed}.html`);
      this.close();
    }
    const har = await this.defaultProxy.getHar();
    writeFileToDir('./', 'testHars', JSON.stringify(har));
    const logs = await this.driver.executeScript('return window.stopPerformanceRecording()');
    const version = await this.driver.executeScript('return window.getVersion()');
    return Object.assign(logs, { version });
  }
  close() {
    this.driver.close();
  }
}

export { SeleniumNavigator };
