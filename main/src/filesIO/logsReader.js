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
    return this.logsObject.eventLogs.dragEvents;
  }

  getDoubleClickTimes() {
    this.checkIfUndefined();
    return convertStringArrayToFloatList(this.logsObject.eventLogs.doubleClickTimes);
  }

  getRenderTimes() {
    this.checkIfUndefined();
    if (this.logsObject.renderTimes === undefined) {
      return [];
    }
    return this.logsObject.renderTimes.map(object => convertObjectWithStringToObjectWithFloat(object));
  }

  getStartAndEndOfDragEvents() {
    const dragEvents = this.getDragEvents();
    const filteredDragEvents = dragEvents.filter(dragEvent => (dragEvent.timeStampsOfMoves.length >= 2));
    const finalArray = filteredDragEvents.map((dragEvent) => {
      const object = createDragEventObject(
        parseFloat(dragEvent.timeStampsOfMoves[0]),
        parseFloat(dragEvent.timeStampsOfMoves[dragEvent.timeStampsOfMoves.length - 1]),
      );
      return object;
    });
    return finalArray;
  }

  getTimeBetweenFrames() {
    this.checkIfUndefined();
    return convertStringArrayToFloatList(this.logsObject.timeBetweenFrames);
  }
}

export { LogsReader, convertObjectWithStringToObjectWithFloat };
