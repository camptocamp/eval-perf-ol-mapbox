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
  constructor() {
    super();
    this.map = new InstrumentedCanvasMap({
      target: 'map',
    });
    apply(this.map, './styles/mapbox-roads-basic.json');
    this.map.setView(new View({
      center: proj.fromLonLat([6, 46]),
      zoom: 9,
    }));
    init(this.map);
  }
  setCenter(center) {
    this.map.getView().setCenter(proj.fromLonLat(center));
  }
  setZoom(zoom) {
    this.map.getView().setZoom(zoom);
  }
  setStyle(stylePath) {
    apply(this.map, stylePath);
  }
}
