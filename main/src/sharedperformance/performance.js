export default class PerformanceRecording {
  constructor() {
    this.perfLogs = {};
    this.recording = false;
  }

  startPerformanceRecording() {
    this.perfLogs = {};
    this.recording = true;
    this.startFPSCount();
  }

  stopPerformanceRecording() {
    this.recording = false;
    return this.perfLogs;
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
    this.perfLogs.instantFPS.push((1000 / this.frameTime).toFixed(4));
    window.requestAnimationFrame(() => this.loop());
  }
}
