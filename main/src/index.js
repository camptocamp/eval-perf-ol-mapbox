import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'styles/mapbox-roads-basic.json',
  center: [6, 46],
  zoom: 8,
});
map.showTileBoundaries = true;

window.mapBounds = map.getBounds();
