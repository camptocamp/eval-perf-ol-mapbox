import { path5sec, slowerScenario, noZoom } from '../selenium/navigationPaths';
import { readJSONFile, metaPerfLogsFileName } from './utils';

const pathUtils = require('path');

function pathStringToFunction(navigationPath) {
  switch (navigationPath) {
    case 'path5sec':
      return path5sec;
    case 'slowerScenario':
      return slowerScenario;
    case 'noZoom':
      return noZoom;
    default:
      throw new Error(`${navigationPath} is not a valid function name for a navigation path`);
  }
}

export default class ConfigReader {
  constructor(path, config) {
    this.path = path;
    if (config === undefined) {
      this.config = readJSONFile(path);
    } else {
      this.config = config;
    }
  }
  getBrowser() {
    return this.config.browser;
  }

  getPathForSVG() {
    return `${this.getPathToOutSVGDir()}${this.getTestName()}/`;
  }

  getPathsToMetaPerfFiles() {
    return this.getPathsToRenderersDir().map(path => `${path}${metaPerfLogsFileName}`);
  }

  // prepend path to config file, because the pathToOutDir is relative
  // to the directory in which is the config file
  getPathToTestNameDir() {
    return `${this.getPathToOutDir()}${this.getTestName()}/`;
  }

  getPathsToRenderersDir() {
    return this.getRenderers().map(renderer => `${this.getPathToOutDir()}${this.getTestName()}/${renderer}/`);
  }
  getPathToOutSVGDir() {
    return this.config.pathToOutDirSVG;
  }
  getPathToOutDir() {
    return `${pathUtils.dirname(this.path)}/${this.config.pathToOutDir}`;
  }
  getRenderers() {
    return this.config.renderers;
  }
  getTestName() {
    return this.config.testName;
  }
  getNumberOfTrials() {
    return this.config.nbTrials;
  }
  getStyle() {
    return this.config.style;
  }
  getCenter() {
    return this.config.initialCenter;
  }
  getZoom() {
    return this.config.initialZoom;
  }
  getNavigationPaths() {
    return this.config.paths.map(path => pathStringToFunction(path));
  }
  getOverwritePreviousTests() {
    return this.config.overwritePreviousTests;
  }
  toJSON() {
    return Object.assign({}, this.config);
  }
  getOlTime() {
    return this.config.olTime;
  }
}
