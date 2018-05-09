import View from 'ol/view';
import proj from 'ol/proj';
import { apply } from 'ol-mapbox-style';
import { startPerformanceRecording, stopPerformanceRecording, stopPRAfterATime } from './sharedperformance/performance';


const map = apply('map', './styles/mapbox-roads-basic.json');
map.setView(new View({
  center: proj.fromLonLat([6, 46]),
  zoom: 8,
}));

window.startPerformanceRecording = startPerformanceRecording;
window.stopPerformanceRecording = stopPerformanceRecording;