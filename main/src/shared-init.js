import PerformanceRecording from './sharedperformance/performance';

export default function init(map) {
  const mapDOM = document.getElementById('map');
  const performanceRecording = new PerformanceRecording(map, mapDOM);
  window.startPerformanceRecording = () => performanceRecording.startPerformanceRecording();
  window.stopPerformanceRecording = () => performanceRecording.stopPerformanceRecording();
}

