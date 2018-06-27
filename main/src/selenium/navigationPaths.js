import {
  getActionWrapper,
  standardMoveDuration, standardPause,
  longerMoveDuration, longerPause,
  mediumPause, standardZoomDuration,
} from './actionWrapper';

async function slowerScenario(driverForActions) {
  const actions = getActionWrapper(driverForActions);
  return actions
    .pause(1000)
    .drag(longerMoveDuration, -300, 40)
    .pause(mediumPause)
    .drag(longerMoveDuration, 30, 300)
    .zoomIn(standardZoomDuration)
    .zoomIn(standardZoomDuration)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .zoomIn(standardZoomDuration)
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .zoomIn(standardZoomDuration)
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .zoomIn(standardZoomDuration)
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .zoomIn(standardZoomDuration)
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause);
}

async function path5sec(driverForActions) {
  const actions = getActionWrapper(driverForActions);
  return actions
    .pause(100)
    .drag(standardMoveDuration, -200, 0)
    .pause(standardPause)
    .zoomIn(standardZoomDuration)
    .pause(longerPause)
    .drag(standardMoveDuration, 0, -200)
    .pause(standardPause)
    .drag(standardMoveDuration, 200, 0)
    .pause(standardPause)
    .drag(standardMoveDuration, 0, 200)
    .pause(longerPause)
    .zoomIn(standardZoomDuration)
    .pause(standardPause)
    .drag(standardMoveDuration, -200, 200)
    .drag(standardMoveDuration, -200, 200)
    .zoomIn(standardZoomDuration)
    .pause(longerPause)
    .drag(longerMoveDuration, 400, -50)
    .drag(standardMoveDuration, 0, 200)
    .pause(standardPause);
}

export { path5sec, slowerScenario };
