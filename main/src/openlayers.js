import CanvasMap from 'ol/canvasmap';
import View from 'ol/view';
import proj from 'ol/proj';
import { apply } from 'ol-mapbox-style';
import init from './shared-init';
import AbstractMap from './AbstractMap';

class InstrumentedCanvasMap extends CanvasMap {
  renderFrame_(time) {
    this.beforeRender = performance.now();
    super.renderFrame_(time);
    this.afterRender = performance.now();
    this.hasChanged = true;
  }
}

class OpenLayersMap extends AbstractMap {
  constructor(map) {
    super();
    this.map = map;
  }
  setCenter(center) {
    const zoom = this.map.getView().getZoom();
    this.map.setView(new View({
      center: proj.fromLonLat(center),
      zoom,
    }));
  }
  setZoom(zoom) {
    const center = this.map.getView().getCenter();
    this.map.setView(new View({
      center,
      zoom,
    }));
  }
  setStyle(stylePath) {
    apply(this.map, stylePath);
  }
}

const map = new InstrumentedCanvasMap({
  target: 'map',
});
const olMap = new OpenLayersMap(map);
init(olMap);
