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
    this.zoomPauseDuration = 500;
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
    return this;
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
      duration,
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
    this.actionList.push(new LegacyActionExtended(
      typePause,
      this.zoomPauseDuration,
    ));
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
  pause(duration) {
    this.actions = this.actions.pause(duration);
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
    this.moveToStartPoint();
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

export {
  getActionWrapper,
  standardPause, standardMoveDuration, longerMoveDuration, longerPause, mediumPause,
};
