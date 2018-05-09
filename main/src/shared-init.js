import PerformanceRecording from './sharedperformance/performance';

function init() {
  const mapDOM = document.getElementById('map');
  const performanceRecording = new PerformanceRecording();
  window.startPerformanceRecording = () => performanceRecording.startPerformanceRecording(mapDOM);
  window.stopPerformanceRecording = () => performanceRecording.stopPerformanceRecording()
}

export default { init };
