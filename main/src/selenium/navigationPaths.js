const { LegacyActionSequence } = require('selenium-webdriver/lib/actions');
const { Origin } = require('selenium-webdriver/lib/input');
const { By } = require('selenium-webdriver/lib/by');

const standardPause = 100;
const standardMoveDuration = 200;
const mediumPause = 300;
const longerPause = 500;
const longerMoveDuration = 500;


/**
 * This class is an abstraction of the moves performed by selenium,
 * As there may be an issue with the W3C actions implemented by selenium,
 * there is an option to go into legacyMode
 * In legacyMode openlayers and mapbox seem to behave differently, so there will be the need to specify
 * the renderer
 */
class ActionWrapper {
  constructor(driverForActions, legacyMode, renderer) {
    this.driverForActions = driverForActions;
    this.legacyMode = legacyMode;
    this.renderer = renderer;
    if (legacyMode) {
      this.actionsLegayList = [];
    } else {
      this.actions = driverForActions.actions({ bridge: true });
    }
    this.x = 0;
    this.y = 0;
  }
  async moveToStartPoint() {
    const map = await this.driverForActions.findElement(By.id('map'));
    this.actions.move({
      x: 0, y: 0, duration: 0, origin: map,
    });
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
  let actions = new ActionWrapper(driverForActions);
  actions = await actions.moveToStartPoint();
  return actions
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

async function legacySimpleScenario(driverForActions) {
  const actionsList = [];
  const actions1 = new LegacyActionSequence(driverForActions);
  const map = await driverForActions.findElement(By.id('map'));
  actions1.mouseMove(map).mouseDown();
  const actions2 = new LegacyActionSequence(driverForActions);
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: -20, y: 0 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });
  actions2.mouseMove({ x: 0, y: 10 });

  const actions3 = new LegacyActionSequence(driverForActions).mouseUp();
  const actions4 = new LegacyActionSequence(driverForActions).doubleClick();
  const actions5 = new LegacyActionSequence(driverForActions).click().click();
  actionsList.push(actions1);
  actionsList.push(actions2);
  actionsList.push(actions3);
  actionsList.push(actions4);
  actionsList.push(actions5);
  return actionsList;
}

export { path5sec, littleDrag, slowerScenario, legacySimpleScenario };
