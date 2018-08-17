import { readJSONFile } from './utils';

function createDragEventObject(start, end) {
  return { start, end };
}

function convertObjectWithStringToObjectWithFloat(object) {
  const newObj = {};
  Object.keys(object).forEach((key) => {
    newObj[key] = parseFloat(object[key]);
  });
  return newObj;
}

function convertStringArrayToFloatList(strArray) {
  return strArray.map(string => parseFloat(string));
}

function arrayMax(arr) {
  return arr.reduce((p, v) => (p > v ? p : v));
}

class LogsReader {
  constructor(path) {
    this.logsObject = readJSONFile(path);
  }
  getVersion() {
    return this.logsObject.version;
  }
  checkIfUndefined() {
    if (this.logsObject === undefined) {
      console.error('could not read logs properly');
    }
  }

  getFrameTimes() {
    this.checkIfUndefined();
    return convertStringArrayToFloatList(this.logsObject.frameTimes);
  }

  getInstantFPS() {
    this.checkIfUndefined();
    return convertStringArrayToFloatList(this.logsObject.instantFPS);
  }

  getDragEvents() {
    this.checkIfUndefined();
    return this.logsObject.dragEvents
      .map(object => convertObjectWithStringToObjectWithFloat(object));
  }

  getZoomEvents() {
    this.checkIfUndefined();
    return this.logsObject.zoomEvents
      .map(object => convertObjectWithStringToObjectWithFloat(object));
  }

  getRenderTimes() {
    this.checkIfUndefined();
    if (this.logsObject.renderTimes === undefined) {
      return [];
    }
    return this.logsObject.renderTimes
      .map(object => convertObjectWithStringToObjectWithFloat(object));
  }

  getTimeBetweenFrames() {
    this.checkIfUndefined();
    return convertStringArrayToFloatList(this.logsObject.timeBetweenFrames);
  }

  getMaxRenderTime() {
    const renderTimes = this.getRenderTimes();
    const renderDuration = renderTimes.map(renderTime => renderTime.afterRender - renderTime.beforeRender);
    return arrayMax(renderDuration);
  }
}

export { LogsReader, convertObjectWithStringToObjectWithFloat };
