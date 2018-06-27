/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
/* eslint-disable no-await-in-loop */

const standardPause = 100;
const standardMoveDuration = 200;
const mediumPause = 300;
const longerPause = 500;
const longerMoveDuration = 500;
const safetyPause = 500;
const standardZoomDuration = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
class RendererZoomIn {
  constructor(duration) {
    this.duration = duration;
  }
  async perform(driverForActions) {
    driverForActions.executeScript(`window.zoomIn(${this.duration})`);
  }
}
class RendererZoomOut {
  constructor(duration) {
    this.duration = duration;
  }
  async perform(driverForActions) {
    driverForActions.executeScript(`window.zoomOut(${this.duration})`);
  }
}
class RendererDrag {
  constructor(xPixels, yPixels, duration) {
    this.xPixels = xPixels;
    this.yPixels = yPixels;
    this.duration = duration;
  }
  async perform(driverForActions) {
    driverForActions.executeScript(`window.drag(${-this.xPixels},${-this.yPixels},${this.duration})`);
  }
}

class Pause {
  constructor(duration) {
    this.duration = duration;
  }
  async perform() {
    await sleep(this.duration);
  }
}

class RendererActionWrapper {
  constructor(driverForActions) {
    this.driverForActions = driverForActions;
    this.actions = [];
  }
  drag(duration, xPixels, yPixels) {
    this.actions.push(new RendererDrag(xPixels, yPixels, duration));
    return this.pause(duration + safetyPause);
  }
  pause(duration) {
    this.actions.push(new Pause(duration));
    return this;
  }
  zoomIn(zoomDuration) {
    this.actions.push(new RendererZoomIn(zoomDuration));
    return this.pause(zoomDuration + safetyPause);
  }
  zoomOut(zoomDuration) {
    this.actions.push(new RendererZoomOut(zoomDuration));
    return this.pause(zoomDuration + safetyPause);
  }
  async perform() {
    for (let index = 0; index < this.actions.length; index += 1) {
      await this.actions[index].perform(this.driverForActions);
    }
  }
}

function getActionWrapper(driverForActions) {
  return new RendererActionWrapper(driverForActions);
}

export {
  getActionWrapper,
  standardPause,
  standardMoveDuration,
  longerMoveDuration,
  longerPause,
  mediumPause,
  standardZoomDuration,
};
