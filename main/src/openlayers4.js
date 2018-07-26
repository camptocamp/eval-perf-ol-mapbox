import { apply } from 'ol-mapbox-style';
import CanvasMap from 'ol/map';
import easing from 'ol/easing';
import index from 'ol/index';
import View from 'ol/view';
import proj from 'ol/proj';
import init from './shared-init';
import AbstractMap from './AbstractMap';

const { linear } = easing;
const { fromLonLat } = proj;
const { VERSION } = index;

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
    this.version = VERSION;
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
  async setStyle(stylePath) {
    const style = await fetch(stylePath);
    const styleObject = await style.json();
    const styleObjectWithFakeCenterAndZoom =
      Object.assign(styleObject, { center: [0, 0], zoom: 3 });
    apply(this.map, styleObjectWithFakeCenterAndZoom);
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
  getVersion() {
    return this.version;
  }
}

const map = new InstrumentedCanvasMap({
  target: 'map',
});
const olMap = new OpenLayersMap(map);
init(olMap);
