let recording = false;

function startPerformanceRecording() {
  window.perfLogs = {};
  recording = true;
  startFPSCount(perfLogs);
}

function stopPerformanceRecording() {
  recording = false;
  return window.perfLogs;
}

async function stopPRAfterATime(time) {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, time);
  });
  promise.then(() => console.log(stopPerformanceRecording()));
}

function startFPSCount(perfLogsObject) {
  let before, now, frameTime;
  before = performance.now();
  perfLogsObject.timeBetweenFrames = [];
  perfLogsObject.instantFPS = [];
  function loop() {
    if (!recording ) {
      return;
    }
    now = performance.now();
    frameTime = now - before;
    before = now;
    //performance.now() has 20 microseconds precision
    perfLogsObject.timeBetweenFrames.push(frameTime.toFixed(2));
    perfLogsObject.instantFPS.push((1000/frameTime).toFixed(4));
    window.requestAnimationFrame(() => loop());
  }
  window.requestAnimationFrame(loop);
}

export {startPerformanceRecording, stopPerformanceRecording, stopPRAfterATime};