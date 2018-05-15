const fs = require('fs');

let logsObject;

function initLogs(path) {
  logsObject = JSON.parse(fs.readFileSync(path, 'utf8'));
}
function checkIfUndefined() {
  if (logsObject === undefined) {
    console.error('Logs Object was not properly initialized, call initLogs before attempting to call any other function from this module');
  }
}

function convertStringArrayToFloatList(strArray) {
  return strArray.map(string => parseFloat(string));
}

function getFrameTimes() {
  checkIfUndefined();
  return convertStringArrayToFloatList(logsObject.frameTimes);
}

function getInstantFPS() {
  checkIfUndefined();
  return convertStringArrayToFloatList(logsObject.instantFPS);
}

function getDragEvents() {
  checkIfUndefined();
  return logsObject.eventLogs.dragEvents;
}

function getDoubleClickTimes() {
  checkIfUndefined();
  return convertStringArrayToFloatList(logsObject.eventLogs.doubleClickTimes);
}

function createDragEventObject(start, end) {
  return { start, end };
}

function getStartAndEndOfDragEvents() {
  const dragEvents = getDragEvents();
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

function getTimeBetweenFrames() {
  checkIfUndefined();
  return convertStringArrayToFloatList(logsObject.timeBetweenFrames);
}

module.exports.initLogs = initLogs;
module.exports.getFrameTimes = getFrameTimes;
module.exports.getInstantFPS = getInstantFPS;
module.exports.getTimeBetweenFrames = getTimeBetweenFrames;
module.exports.getStartAndEndOfDragEvents = getStartAndEndOfDragEvents;
module.exports.getDoubleClickTimes = getDoubleClickTimes;
