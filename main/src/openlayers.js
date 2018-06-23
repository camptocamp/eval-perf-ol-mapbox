import { apply  } from 'ol-mapbox-style';
import CanvasMap from 'ol/Map';
import View from 'ol/View';
import { fromLonLat  } from 'ol/proj';
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
  getUnderlyingMap() {
    return this.map;
  }
  setCenter(center) {
    const zoom = this.map.getView().getZoom();
    this.map.setView(new View({
      center: fromLonLat(center),
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
map.on('pointermove', (e) => {
  document.getElementById('features').innerHTML = JSON.stringify(e.pixel);
});
const olMap = new OpenLayersMap(map);
map.on('pointerdown', (e) => {
  console.log(`pointer down !`);
});
map.on('pointerup', (e) => {
  console.log(`pointer up!`);
});
init(olMap);
