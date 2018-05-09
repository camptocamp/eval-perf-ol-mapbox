import CanvasMap from 'ol/canvasmap';
import View from 'ol/view';
import proj from 'ol/proj';
import { apply } from 'ol-mapbox-style';
import init from './shared-init';

class InstrumentedCanvasMap extends CanvasMap {
  renderFrame_(time) {
    this.beforeRender = performance.now();
    super.renderFrame_(time);
    this.afterRender = performance.now();
    this.hasChanged = true;
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

init(map);
