const { Origin } = require('selenium-webdriver/lib/input');

const standardPause = 100;
const standardMoveDuration = 200;
const mediumPause = 300;
const longerPause = 500;
const longerMoveDuration = 500;

class ActionWrapper {
  constructor(driverForActions) {
    this.actions = driverForActions.actions({ bridge: true });
    this.x = 0;
    this.y = 0;
  }
  moveToStartPoint() {
    this.move(600, 300);
    return this;
  }
  comeBackToOrigin() {
    this.move(-this.x, -this.y);
    return this;
  }
  pause(duration) {
    this.actions = this.actions.pause(duration);
    return this;
  }
  move(x, y) {
    this.x += x;
    this.y += y;
    this.actions = this.actions.move({ origin: Origin.POINTER, x, y });
    return this;
  }
  drag(duration, x, y) {
    this.actions = this.actions.press()
      .move({
        duration, origin: Origin.POINTER, x, y,
      })
      .release()
      .move({ origin: Origin.POINTER, x: -x, y: -y });
    return this;
  }
  doubleClick() {
    this.actions = this.actions
      .pause(longerPause)
      .doubleClick()
      .pause(standardPause);
    return this;
  }
  async perform() {
    return this.actions.perform();
  }
}

async function slowerScenario(driverForActions) {
  const actions = new ActionWrapper(driverForActions);
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

async function path5sec(driverForActions) {
  const actions = new ActionWrapper(driverForActions);
  return actions
    .moveToStartPoint()
    .pause(100)
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
    .move(standardMoveDuration, 200, -200)
    .drag(standardMoveDuration, -200, 200)
    .doubleClick()
    .pause(longerPause)
    .drag(longerMoveDuration, 400, -50)
    .drag(standardMoveDuration, 0, 200)
    .pause(standardPause)
    .comeBackToOrigin();
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

export { path5sec, littleDrag, slowerScenario };
