import { SeleniumNavigator } from '../selenium/performance_test';
import { outputJSON } from '../filesIO/utils';
import ConfigReader from '../filesIO/ConfigReader';

const fs = require('fs');

const moment = require('moment');

const PATH_TO_CONFIG_FILE = './config.json';

class BenchTest {
  constructor(pathToConfigFile) {
    this.configReader = new ConfigReader(pathToConfigFile);
    this.pathToOutDir = this.configReader.getPathToOutDir();
    this.renderers = this.configReader.getRenderers();
    this.nbTrials = this.configReader.getNumberOfTrials();
    this.testName = this.configReader.getTestName();
    this.paths = this.configReader.getNavigationPaths();
    this.date = moment().format();
    this.overwritePreviousTests = this.configReader.getOverwritePreviousTests();
  }
  endOfChain(indexOfRenderer, indexOfPath) {
    return (this.paths.length === indexOfPath + 1) && (this.renderers.length === indexOfRenderer + 1);
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
      browser: this.configReader.getBrowser(),
      seleniumOptions: this.seleniumOptions,
    });
    // transform asynchronous code into synchronous code
    let chain = Promise.resolve();
    this.renderers.forEach((renderer, indexOfRenderer) => {
      chain = chain.then(() => {
        this.createDirForRenderer(renderer);
        this.paths.forEach((path, indexOfPath) => {
          chain = chain.then(() => {
            for (let trialNumber = 1; trialNumber <= this.nbTrials; trialNumber += 1) {
              chain = this.executeAndPrintScenario(chain, renderer, path, seleniumNavigator, trialNumber);
              chain = chain.then(() => console.log('run done'));
            }
            if (this.endOfChain(indexOfRenderer, indexOfPath)) {
              chain
                .then(() => seleniumNavigator.close());
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
    outputJSON(
      Object.assign({ date: this.date }, this.configReader.toJSON()),
      'config.json',
      this.getRootPath(),
    );
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

console.log('starting an experiment');
const test = new BenchTest(PATH_TO_CONFIG_FILE);
test.launch();
