import { startEventRecording, stopEventRecording } from './event_recorder';

export default class PerformanceRecording {
  constructor() {
    this.perfLogs = {};
    this.recording = false;
  }

<<<<<<< HEAD
  startPerformanceRecording(mapDOM) {
    if (!this.recording) {
      this.perfLogs = {};
      this.recording = true;
      this.startFPSCount();
      startEventRecording(mapDOM);
    } else {
      console.error('console already launched');
    }
=======
function startFPSCount(perfLogsObject) {
  let before;
  let now;
  let timeBetweenFrame;
  before = performance.now();
  perfLogsObject.timeBetweenFrames = [];
  perfLogsObject.frameTimes = [];
  perfLogsObject.instantFPS = [];
  function loop() {
    if (!recording) {
      return;
    }
    now = performance.now();
    timeBetweenFrame = now - before;
    before = now;
    // performance.now() has 20 microseconds precision
    perfLogsObject.timeBetweenFrames.push(timeBetweenFrame.toFixed(2));
    perfLogsObject.frameTimes.push(now.toFixed(2));
    perfLogsObject.instantFPS.push((1000 / timeBetweenFrame).toFixed(4));
    window.requestAnimationFrame(() => loop());
>>>>>>> 5809a6c... adding timestamps of frames in perfLogs to synchronize with eventRecorder
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
    this.perfLogs.frameTimes.push(now.toFixed(2));
    this.perfLogs.instantFPS.push((1000 / this.frameTime).toFixed(4));
    window.requestAnimationFrame(() => this.loop());
  }
}
