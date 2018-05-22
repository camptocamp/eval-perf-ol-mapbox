import { startEventRecording, stopEventRecording } from './event_recorder';

export default class PerformanceRecording {
  constructor(map, mapDOM) {
    this.map = map;
    this.mapDOM = mapDOM;
    this.perfLogs = {};
    this.recording = false;
  }

  startPerformanceRecording() {
    if (!this.recording) {
      this.perfLogs = {};
      this.recording = true;
      this.startFPSCount();
      startEventRecording(this.mapDOM);
    } else {
      console.error('console already launched');
    }
  }

  stopPerformanceRecording() {
    if (this.recording) {
      this.recording = false;
      this.perfLogs.eventLogs = stopEventRecording();
      return this.perfLogs;
    }
    console.error('no recording launched');
    return null;
  }

  async stopPRAfterATime(time) {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('resolved');
      }, time);
    });
    promise.then(() => console.log(this.stopPerformanceRecording()));
  }

  startFPSCount() {
    this.before = performance.now();
    this.perfLogs.timeBetweenFrames = [];
    this.perfLogs.instantFPS = [];
    this.perfLogs.frameTimes = [];
    this.perfLogs.renderTimes = [];
    window.requestAnimationFrame(() => this.loop());
  }
  loop() {
    if (!this.recording) {
      return;
    }
    this.now = performance.now();
    this.frameTime = this.now - this.before;
    this.before = this.now;
    // performance.now() has 20 microseconds precision
    this.perfLogs.timeBetweenFrames.push(this.frameTime.toFixed(2));
    this.perfLogs.frameTimes.push(this.now.toFixed(2));
    this.perfLogs.instantFPS.push((1000 / this.frameTime).toFixed(4));
    if (this.map.hasChanged) {
      this.perfLogs.renderTimes.push({
        beforeRender: this.map.beforeRender.toFixed(2),
        afterRender: this.map.afterRender.toFixed(2),
      });
      this.map.hasChanged = false;
    }
    window.requestAnimationFrame(() => this.loop());
  }
}
