import CanvasMap from 'ol/canvasmap';
import View from 'ol/view';
import proj from 'ol/proj';
import { apply } from 'ol-mapbox-style';
import { startPerformanceRecording, stopPerformanceRecording, stopPRAfterATime } from './sharedperformance/performance';


class InstrumentedCanvasMap extends CanvasMap {
  renderFrame_(time) {
    const beforeRender = performance.now();
    super.renderFrame_(time);
    const afterRender = performance.now();
    const renderTime = afterRender - beforeRender;
    console.log('rendered in', renderTime);
  }
}

const map = new InstrumentedCanvasMap({
  target: 'map',
});

apply(map, './styles/mapbox-roads-basic.json');

map.setView(new View({
  center: proj.fromLonLat([6, 46]),
  zoom: 8,
}));

window.startPerformanceRecording = startPerformanceRecording;
window.stopPerformanceRecording = stopPerformanceRecording;