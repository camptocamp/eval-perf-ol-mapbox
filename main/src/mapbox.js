import mapboxgl from 'mapbox-gl';
import init from './shared-init';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'styles/mapbox-roads-basic.json',
  center: [6, 46],
  zoom: 8,
});
map.showTileBoundaries = true;

init();
