import {
  getActionWrapper,
  standardMoveDuration, standardPause,
  longerMoveDuration, longerPause,
  mediumPause,
} from './actionWrapper';

async function beginScenario(driverForActions, legacyMode, renderer) {
  const actions = getActionWrapper(driverForActions, legacyMode, renderer);
  await actions.initMap();
  return actions;
}

async function slowerScenario(driverForActions, legacyMode, renderer) {
  const actions = await beginScenario(driverForActions, legacyMode, renderer);
  return actions
    .pause(1000)
    .moveToStartPoint()
    .drag(longerMoveDuration, -300, 40)
    .pause(mediumPause)
    .drag(longerMoveDuration, 30, 300)
    .doubleClick()
    .doubleClick()
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .doubleClick()
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .doubleClick()
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .doubleClick()
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause)
    .drag(longerMoveDuration, 300, 150)
    .pause(mediumPause)
    .doubleClick()
    .drag(longerMoveDuration, -300, 150)
    .pause(mediumPause);
}

async function path5sec(driverForActions, legacyMode, renderer) {
  const actions = await beginScenario(driverForActions, legacyMode, renderer);
  return actions
    .pause(100)
    .moveToStartPoint()
    .drag(standardMoveDuration, -200, 0)
    .pause(standardPause)
    .doubleClick()
    .pause(longerPause)
    .drag(standardMoveDuration, 0, -200)
    .pause(standardPause)
    .drag(standardMoveDuration, 200, 0)
    .pause(standardPause)
    .drag(standardMoveDuration, 0, 200)
    .pause(longerPause)
    .doubleClick()
    .pause(standardPause)
    .drag(standardMoveDuration, -200, 200)
    .drag(standardMoveDuration, -200, 200)
    .doubleClick()
    .pause(longerPause)
    .drag(longerMoveDuration, 400, -50)
    .drag(standardMoveDuration, 0, 200)
    .pause(standardPause);
}

async function littleDrag(driverForActions, legacyMode, renderer) {
  const actions = await beginScenario(driverForActions, legacyMode, renderer);
  return actions
    .moveToStartPoint()
    .pause(100)
    .drag({
      duration: standardMoveDuration, x: -200, y: 0,
    })
    .pause(standardPause);
}

export { path5sec, littleDrag, slowerScenario };
