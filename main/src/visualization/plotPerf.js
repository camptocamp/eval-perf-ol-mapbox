import { LogsReader } from '../filesIO/logsReader';

const d3 = require('d3');
const SVGBuilder = require('./svgBuilder');

const styles = `
.bar rect {
  fill: steelblue;
}
.bar text {
  fill: #fff;
  font: 10px sans-serif;
}
.drag rect {
  fill: orange
}
.drag text {
  fill: #000;
  font: 10px sans-serif;
}
.zoom circle {
  fill: red
}
.zoom text {
  fill: #000;
  font: 8px sans-serif;
}
.render rect {
  fill: violet
}`;

const options = {
  svgStyles: styles,
  d3Module: d3,
};

function SVGFromLogs(path) {
  const reader = new LogsReader(path);
  const frameTimes = reader.getFrameTimes();
  const instantFPS = reader.getInstantFPS();
  const timeBetweenFrames = reader.getTimeBetweenFrames();
  const dragEvents = reader.getStartAndEndOfDragEvents();
  const doubleClickTimes = reader.getDoubleClickTimes();
  const renderTimes = reader.getRenderTimes();

  const margin = {
    top: 10, right: 30, bottom: 30, left: 30,
  };
  const labelMargin = {
    left: 30, bottom: 30,
  };
  const svgWidth = 960;
  const svgHeight = 500;

  const svgBuilderObj = new SVGBuilder(svgWidth, svgHeight, margin, labelMargin, options);
  svgBuilderObj.initXScale(frameTimes[0] - timeBetweenFrames[0], frameTimes[frameTimes.length - 1]);
  // TODO change this when first frame bug is fixed
  svgBuilderObj.initYScale(0, 150);
  svgBuilderObj.initSVG();
  svgBuilderObj.initSVGWithMargin();
  svgBuilderObj.drawXAxis();
  svgBuilderObj.drawYAxis();
  svgBuilderObj.drawFPS(frameTimes, timeBetweenFrames, instantFPS);
  svgBuilderObj.initdragEventsGroup(dragEvents);
  svgBuilderObj.drawDragEventsRects();
  svgBuilderObj.drawDragEventsText();
  svgBuilderObj.drawDblClicks(doubleClickTimes);
  svgBuilderObj.drawRenderRects(renderTimes);

  return svgBuilderObj.toString();
}
module.exports.SVGFromLogs = SVGFromLogs;
