import mapboxgl from 'mapbox-gl';
import init from './shared-init';
import AbstractMap from './AbstractMap';

class InstrumentedMap extends mapboxgl.Map {
  _render() {
    this.beforeRender = performance.now();
    super._render();
    this.afterRender = performance.now();
    this.hasChanged = true;
  }
}

class MapboxMap extends AbstractMap {
  constructor(map) {
    super();
    this.version = mapboxgl.version;
    this.map = map;
    this.showTileBoundaries = true;
  }
  getUnderlyingMap() {
    return this.map;
  }
  setCenter(center) {
    this.map.setCenter(center);
  }
  setZoom(zoom) {
    this.map.setZoom(zoom - 1);
  }
  async setStyle(stylePath) {
    this.map.setStyle(stylePath);
  }
  drag(xPixels, yPixels, duration) {
    if (duration === undefined) {
      duration = 1000;
    }
    this.map.panBy([xPixels, yPixels], { duration, easing: x => x });
  }
  zoomIn(duration) {
    this.map.zoomIn({ duration, easing: x => x });
  }
  zoomOut(duration) {
    this.map.zoomOut({ duration, easing: x => x });
  }
  getVersion() {
    return this.version;
  }
}

// the parameters will be overwritten by the config.json file
// but they need to be here for mapbox to function properly
const map = new InstrumentedMap({
  container: 'map',
  style: 'styles/osm-liberty-custom.json',
  center: [0, 0],
  zoom: 0,
});
map.showTileBoundaries = true;
map.on('mousemove', (e) => {
  document.getElementById('features').innerHTML = JSON.stringify(e.point);
});
const mapboxMap = new MapboxMap(map);
init(mapboxMap);
