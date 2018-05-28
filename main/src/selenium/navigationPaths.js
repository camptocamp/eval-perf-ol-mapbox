const { Origin } = require('selenium-webdriver/lib/input');

const standardPause = 100;
const standardMoveDuration = 200;
const longerPause = 500;
const longerMoveDuration = 500;

async function path5sec(driverForActions) {
  const actions = driverForActions.actions();
  return actions
    .move({ origin: Origin.POINTER, x: 600, y: 300 })
    .pause(100)
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 0,
    })
    .release()
    .pause(standardPause)
    .doubleClick()
    .pause(longerPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 0, y: -200,
    })
    .pause(standardPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 200, y: 0,
    })
    .pause(standardPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 0, y: 200,
    })
    .release()
    .pause(longerPause)
    .doubleClick()
    .pause(standardPause)
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 200,
    })
    .release()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 200, y: -200,
    })
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 200,
    })
    .release()
    .doubleClick()
    .pause(longerPause)
    .press()
    .move({
      duration: longerMoveDuration, origin: Origin.POINTER, x: 400, y: -50,
    })
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: 0, y: 200,
    })
    .release()
    .pause(standardPause)
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -800, y: -650,
    });
}

async function littleDrag(driverForActions) {
  const actions = driverForActions.actions();
  return actions
    .move({ origin: Origin.VIEWPORT, x: 600, y: 300 })
    .pause(100)
    .press()
    .move({
      duration: standardMoveDuration, origin: Origin.POINTER, x: -200, y: 0,
    })
    .release()
    .pause(standardPause);
}

export { path5sec, littleDrag };
