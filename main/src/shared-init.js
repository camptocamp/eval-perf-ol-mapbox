import PerformanceRecording from './sharedperformance/performance';
import ConfigReader from './filesIO/ConfigReader';
import config from '../config.json';

const PATH_TO_CONFIG_FILE = './config.json';

export default function init(abstractMapImplementation) {
  const mapDOM = document.getElementById('map');
  const performanceRecording = new PerformanceRecording(
    abstractMapImplementation.getUnderlyingMap(),
    mapDOM,
  );
  window.startPerformanceRecording = () => performanceRecording.startPerformanceRecording();
  window.stopPerformanceRecording = () => performanceRecording.stopPerformanceRecording();
  window.drag = (xPixels, yPixels, duration) =>
    abstractMapImplementation.drag(xPixels, yPixels, duration);
  window.zoomIn = duration => abstractMapImplementation.zoomIn(duration);
  window.zoomOut = duration => abstractMapImplementation.zoomOut(duration);
  const configReader = new ConfigReader(PATH_TO_CONFIG_FILE, config);
  abstractMapImplementation.setStyle(configReader.getStyle());
  abstractMapImplementation.setZoom(configReader.getZoom());
  abstractMapImplementation.setCenter(configReader.getCenter());
}

