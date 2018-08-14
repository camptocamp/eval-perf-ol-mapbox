/* eslint-disable */
/*
 * Here to abstract the difference between openlayers and mapbox maps
 */
export default class AbstractMap {
  constructor(){
  }
  async applyStyle() {
  }
  addRecorder(performanceRecorder) {
    this.performanceRecorder = performanceRecorder;
  }
  setZoom() {
  }
  setCenter() {
  }
  getUnderlyingMap() {
  }
  drag(){
  }
  zoomIn(){
  }
  zoomOut(){
  }
  getVersion(){
  }
}
