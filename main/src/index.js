import mapboxgl from 'mapbox-gl';
import PerformanceRecording from './sharedperformance/performance';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'styles/mapbox-roads-basic.json',
  center: [6, 46],
  zoom: 8,
});
map.showTileBoundaries = true;

const performanceRecording = new PerformanceRecording();
window.startPerformanceRecording = () => performanceRecording.startPerformanceRecording();
window.stopPerformanceRecording = () => performanceRecording.stopPerformanceRecording();
window.startPerformanceRecording();

