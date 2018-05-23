import mapboxgl from 'mapbox-gl';
import init from './shared-init';

class InstrumentedMap extends mapboxgl.Map {
  _render() {
    this.beforeRender = performance.now();
    super._render();
    this.afterRender = performance.now();
    this.hasChanged = true;
  }
}

const map = new InstrumentedMap({
  container: 'map',
  style: 'styles/mapbox-roads-basic.json',
  center: [6, 46],
  zoom: 8,
});
map.showTileBoundaries = true;

init(map);
