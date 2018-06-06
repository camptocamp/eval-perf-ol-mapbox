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
  constructor() {
    super();
    this.map = new InstrumentedMap({
      container: 'map',
      style: 'styles/mapbox-roads-basic.json',
      center: [6, 46],
      zoom: 8,
    });
    this.showTileBoundaries = true;
    init(this.map);
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
