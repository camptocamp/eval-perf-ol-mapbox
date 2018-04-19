import Map from 'ol/map';
import View from 'ol/view';
import MVT from 'ol/format/mvt';
import VectorTileLayer from 'ol/layer/vectortile';
import VectorTileSource from 'ol/source/vectortile';
import proj from 'ol/proj';
import { apply } from 'ol-mapbox-style';

const map = apply('map', './styles/mapbox-roads-basic.json')
map.setView(new View({
  center: proj.fromLonLat([6, 46]),
  zoom: 8
}))