/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
/* eslint-disable no-await-in-loop */
const { LegacyActionSequence } = require('selenium-webdriver/lib/actions');
const { Origin } = require('selenium-webdriver/lib/input');
const { By } = require('selenium-webdriver/lib/by');

const standardPause = 100;
const standardMoveDuration = 200;
const mediumPause = 300;
const longerPause = 500;
const longerMoveDuration = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * This class is an abstraction of the moves performed by selenium,
 * As there may be an issue with the W3C actions implemented by selenium,
 * there is an option to go into legacyMode
 * In legacyMode openlayers and mapbox seem to behave differently, so there will be the need to specify
 * the renderer
 */
class ActionWrapper {
  constructor(driverForActions) {
    this.driverForActions = driverForActions;
  }
  async initMap() {
    this.map = await this.driverForActions.findElement(By.id('map'));
  }
  move() {
  }
  drag() {
  }
  doubleClick() {
  }
  async perform() {
  }
}

const typeActionLegacySequence = 'actionLegacy';
const typePause = 'pause';
class LegacyActionExtended {
  constructor(type, action) {
    if (type !== typeActionLegacySequence && type !== typePause) {
      throw new Error('wrong type for LegacyActionExtended');
    }
    this.type = type;
    this.action = action;
  }
  getPauseDuration() {
    if (this.type !== typePause) {
      throw new Error(`type must be: ${typePause} but is: ${this.type}`);
    }
    return this.action;
  }
  getActionLegacySequence() {
    if (this.type !== typeActionLegacySequence) {
      throw new Error(`type must be: ${typeActionLegacySequence} but is: ${this.type}`);
    }
    return this.action;
  }
  getType() {
    return this.type;
  }
}

class LegacyActionWrapper extends ActionWrapper {
  constructor(driverForActions, renderer) {
    super(driverForActions);
    this.renderer = renderer;
    this.actionList = [];
    this.BREAK_MOVE_LENGTH = 10;
    this.pressPauseDuration = 20;
  }
  async perform() {
    for (let index = 0; index < this.actionList.length; index += 1) {
      const action = this.actionList[index];
      if (action.getType() === typePause) {
        await sleep(action.getPauseDuration());
      } else if (action.getType() === typeActionLegacySequence) {
        await action.getActionLegacySequence().perform();
      }
    }
  }
  moveToStartPoint() {
    this.actionList.push(new LegacyActionExtended(
      typeActionLegacySequence,
      new LegacyActionSequence(this.driverForActions).mouseMove(this.map),
    ));
  }
  pause(duration) {
    this.actionList.push(new LegacyActionExtended(
      typePause,
      duration,
    ));
    return this;
  }
  drag(duration, x, y) {
    this._press();
    const action = new LegacyActionSequence(this.driverForActions);
    for (let index = 0; index < this.BREAK_MOVE_LENGTH; index += 1) {
      action.mouseMove({
        x: Math.floor(x / this.BREAK_MOVE_LENGTH),
        y: Math.floor(y / this.BREAK_MOVE_LENGTH),
      });
    }
    action.mouseMove({ x: x % this.BREAK_MOVE_LENGTH, y: y % this.BREAK_MOVE_LENGTH });
    this.actionList.push(new LegacyActionExtended(
      typeActionLegacySequence,
      action,
    ));
    this.actionList.push(new LegacyActionExtended(
      typePause,
      this.pressPauseDuration,
    ));
    this._release();
    this.actionList.push(new LegacyActionExtended(
      typeActionLegacySequence,
      new LegacyActionSequence(this.driverForActions).mouseMove({ x: -x, y: -y }),
    ));
    this.actionList.push(new LegacyActionExtended(
      typePause,
      this.pressPauseDuration,
    ));
    return this;
  }
  _press() {
    this.actionList.push(new LegacyActionExtended(
      typeActionLegacySequence,
      new LegacyActionSequence(this.driverForActions).mouseDown(),
    ));
    this.actionList.push(new LegacyActionExtended(
      typePause,
      this.pressPauseDuration,
    ));
  }
  _release() {
    this.actionList.push(new LegacyActionExtended(
      typeActionLegacySequence,
      new LegacyActionSequence(this.driverForActions).mouseUp(),
    ));
    this.actionList.push(new LegacyActionExtended(
      typePause,
      this.pressPauseDuration,
    ));
  }
  doubleClick() {
    this.moveToStartPoint();
    if (this.renderer === 'openlayers') {
      this.actionList.push(new LegacyActionExtended(
        typeActionLegacySequence,
        new LegacyActionSequence(this.driverForActions).click().click(),
      ));
    } else if (this.renderer === 'mapbox') {
      this.actionList.push(new LegacyActionExtended(
        typeActionLegacySequence,
        new LegacyActionSequence(this.driverForActions).doubleClick(),
      ));
    }
    return this;
  }
}

class W3CActionWrapper extends ActionWrapper {
  constructor(driverForActions) {
    super(driverForActions);
    this.actions = driverForActions.actions({ bridge: true });
    this.x = 0;
    this.y = 0;
  }

  moveToStartPoint() {
    if (this.map === undefined) {
      throw new Error('map has not been initialized');
    }
    this.actions.move({
      x: 0, y: 0, duration: 0, origin: this.map,
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

function getActionWrapper(driverForActions, legacyMode, renderer) {
  if (legacyMode) {
    return new LegacyActionWrapper(driverForActions, renderer);
  }
  return new W3CActionWrapper(driverForActions);
}

async function slowerScenario(driverForActions, legacyMode, renderer) {
  const actions = getActionWrapper(driverForActions, legacyMode, renderer);
  await actions.initMap();
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
  const actions = getActionWrapper(driverForActions, legacyMode, renderer);
  await actions.initMap();
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
    .drag(standardMoveDuration, -200, 200)
    .doubleClick()
    .pause(longerPause)
    .drag(longerMoveDuration, 400, -50)
    .drag(standardMoveDuration, 0, 200)
    .pause(standardPause);
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
