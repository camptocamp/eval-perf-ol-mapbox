import PerformanceRecording from './sharedperformance/performance';
import ConfigReader from './filesIO/ConfigReader';
import config from '../config.json';

const PATH_TO_CONFIG_FILE = './config.json';

async function init(abstractMapImplementation) {
  window.drag = (xPixels, yPixels, duration) =>
    abstractMapImplementation.drag(xPixels, yPixels, duration);
  window.zoomIn = duration => abstractMapImplementation.zoomIn(duration);
  window.zoomOut = duration => abstractMapImplementation.zoomOut(duration);
  window.getVersion = () => abstractMapImplementation.getVersion();
  const configReader = new ConfigReader(PATH_TO_CONFIG_FILE, config);

  abstractMapImplementation.setZoom(configReader.getZoom());
  abstractMapImplementation.setCenter(configReader.getCenter());
  await abstractMapImplementation.setStyle(configReader.getStyle(), configReader.getOlTime());
  abstractMapImplementation.setZoom(configReader.getZoom());
  abstractMapImplementation.setCenter(configReader.getCenter());
  window.map = abstractMapImplementation;
}
function addPerformanceRecorderToMap(abstractMapImplementation) {
  const mapDOM = document.getElementById('map');
  const performanceRecording = new PerformanceRecording(
    abstractMapImplementation.getUnderlyingMap(),
    mapDOM,
  );
  window.startPerformanceRecording = () => performanceRecording.startPerformanceRecording();
  window.stopPerformanceRecording = () => performanceRecording.stopPerformanceRecording();
  abstractMapImplementation.addRecorder(performanceRecording);
}

export { init, addPerformanceRecorderToMap };

