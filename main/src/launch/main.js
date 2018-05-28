import { SeleniumNavigator } from '../selenium/performance_test';
import { outputJSON } from '../filesIO/utils';
import { path5sec, littleDrag } from '../selenium/navigationPaths';

const fs = require('fs');

const moment = require('moment');

class BenchTest {
  constructor(options) {
    if (options.pathToOutDir === undefined) {
      this.pathToOutDir = '../../out/';
    } else {
      this.pathToOutDir = options.pathToOutDir;
    }
    this.renderers = options.renderers;
    this.nbTrials = options.nbTrials;
    this.testName = options.testName;
    this.seleniumOptions = options.seleniumOptions;
    this.paths = options.paths;
    this.date = moment().format();
    this.overwritePreviousTests = options.overwritePreviousTests;
  }
  launch() {
    try {
      fs.mkdirSync(this.getRootPath());
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    } 
    this.outputConfigFile();
    const seleniumNavigator = new SeleniumNavigator({
      navigator: 'firefox',
      seleniumOptions: this.seleniumOptions,
    });
    //transform asynchronous code into synchronous code
    let chain = Promise.resolve();
    this.renderers.forEach((renderer) => {
      chain = chain.then(() => {
        this.createDirForRenderer(renderer);
        this.paths.forEach((path) => {
          chain = chain.then(() => {
            for (let trialNumber = 1; trialNumber <= this.nbTrials; trialNumber++) {
              chain = this.executeAndPrintScenario(chain, renderer, path, seleniumNavigator, trialNumber);
            }
          });
        });
      });
    });
  }
  executeAndPrintScenario(chainPromise, renderer, path, seleniumNavigator, trialNumber) {
    return chainPromise.then(() => {
      const options = {
        rendererUsed: renderer,
        path,
      };
      return seleniumNavigator.executeScenario(options);
    })
      .then((logs) => {
        outputJSON(logs, this.getFileName(trialNumber, path), this.getPathOfRendererDir(renderer));
      });
  }
  outputConfigFile() {
    outputJSON(this.configToJSON, 'config.json', this.getRootPath());
  }
  configToJSON() {
    return {
      renderers: this.renderers,
      nbTrials: this.nbTrials,
      testName: this.testName,
      date: this.date,
      seleniumOptions: this.seleniumOptions,
      paths: this.paths,
    };
  }
  getFileName(trialNumber, path) {
    return `${path.name}_${trialNumber}`;
  }
  getPathOfRendererDir(renderer) {
    return `${this.getRootPath()}${renderer}/`;
  }
  getRootPath() {
    return `${this.pathToOutDir}${this.testName}/`;
  }
  createDirForRenderer(renderer) {
    try {
      fs.mkdirSync(this.getPathOfRendererDir(renderer));
    } catch (error) {
      if (error.code !== 'EEXIST' || !this.overwritePreviousTests) {
        throw error;
      }
    }
  }
}

const renderers = ['mapbox', 'openlayers'];
const nbTrials = 3;
const testName = 'demo28may';
const paths = [path5sec];
const test = new BenchTest({
  renderers, nbTrials, testName, paths, overwritePreviousTests: true,
});
test.launch();
