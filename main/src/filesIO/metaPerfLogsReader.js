import { readJSONFile } from './utils';

class BoxPlotLogs {
  constructor(object) {
    this.min = object.min;
    this.firstQuartile = object.firstQuartile;
    this.median = object.median;
    this.thirdQuartile = object.thirdQuartile;
    this.max = object.max;
  }
  getMinimum() {
    return this.min;
  }
  getFirstQuartile() {
    return this.firstQuartile;
  }
  getMedian() {
    return this.median;
  }
  getThirdQuartile() {
    return this.thirdQuartile;
  }
  getMaximum() {
    return this.max;
  }
}

class MetaPerfLogsReader {
  constructor(path) {
    this.path = path;
    this.metaPerfObject = readJSONFile(path);
    this.checkIfUndefined();
    this.varianceFPSBoxPlot = new BoxPlotLogs(this.metaPerfObject.varianceFPSBoxPlot);
    this.meanFPSBoxPlot = new BoxPlotLogs(this.metaPerfObject.meanFPSBoxPlot);
  }
  checkIfUndefined() {
    if (this.metaPerfObject === undefined) {
      console.error(`MetaPerfLogsReader at path: ${this.path} did not initialize correctly`);
    } else if (this.metaPerfObject.varianceFPSBoxPlot === undefined) {
      console.error(`wrong format for MetaPerfLogs at path: ${this.path}, expected a varianceFPSBoxPlot field`);
    } else if (this.metaPerfObject.meanFPSBoxPlot === undefined) {
      console.error(`wrong format for MetaPerfLogs at path: ${this.path}, expected a meanFPSBoxPlot field`);
    }
  }
  getMeanFPSBoxPlotLogs() {
    return this.meanFPSBoxPlot;
  }
  getVarianceFPSBoxPlotLogs() {
    return this.varianceFPSBoxPlot;
  }
}

export { MetaPerfLogsReader, BoxPlotLogs };
