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
  setStyle(stylePath) {
    this.map.setStyle(stylePath);
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
const mapboxMap = new MapboxMap(map);
init(mapboxMap);
