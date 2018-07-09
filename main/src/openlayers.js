import { apply } from 'ol-mapbox-style';
import CanvasMap from 'ol/Map';
import { linear } from 'ol/easing';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
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
  drag(xPixels, yPixels, duration) {
    const view = this.map.getView();
    const pixelCenter = this.map.getPixelFromCoordinate(view.getCenter());
    const newCenter = [pixelCenter[0] + xPixels, pixelCenter[1] + yPixels];
    view.animate({
      center: this.map.getCoordinateFromPixel(newCenter),
      duration,
      easing: linear,
    });
  }
  zoomIn(duration) {
    const view = this.map.getView();
    view.animate({ zoom: view.getZoom() + 1, duration, easing: linear });
  }
  zoomOut(duration) {
    const view = this.map.getView();
    view.animate({ zoom: view.getZoom() - 1, duration, easing: linear });
  }
}

const map = new InstrumentedCanvasMap({
  target: 'map',
});
const olMap = new OpenLayersMap(map);
init(olMap);
