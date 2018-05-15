const D3Node = require('d3-node');
const fs = require('fs');
const d3 = require('d3');
const logsReader = require('../filesIO/logsReader');
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
  fill: #fff;
  font: 10px sans-serif;
}
.zoom rect {
  fill: red
}
.zoom text {
  fill: #fff;
  font: 10px sans-serif;
}`;

const options = {
  svgStyles: styles,
  d3Module: d3,
};

function SVGFromLogs(path) {

  const d3n = new D3Node(options);

  logsReader.initLogs(path);
  const frameTimes = logsReader.getFrameTimes();
  const instantFPS = logsReader.getInstantFPS();
  const timeBetweenFrames = logsReader.getTimeBetweenFrames();
  const dragEvents = logsReader.getStartAndEndOfDragEvents();
  const DRAG_EVENTS_HEIGHT = 30;

  const margin = {
    top: 10, right: 30, bottom: 30, left: 30,
  };
  const labelMargin = {
    left: 30, bottom: 30,
  };
  const width = 960 - labelMargin.left - margin.left - margin.right;
  const height = 500 - labelMargin.bottom - margin.top - margin.bottom;

  const maxFps = d3.max(instantFPS);
  const xOtherScale = d3.scaleLinear()
    .domain([0, frameTimes[frameTimes.length - 1] - frameTimes[0]])
    .range([0, width]);

  const x = d3.scaleLinear()
    .domain([frameTimes[0] - timeBetweenFrames[0], frameTimes[frameTimes.length - 1]])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(instantFPS)])
    .range([height, 0]);


  const svgWidth = width + labelMargin.left + margin.left + margin.right;
  const svgHeight = height + labelMargin.bottom + margin.top + margin.bottom;

  function getXOffset(data, index) {
    return x(data - timeBetweenFrames[index]);
  }

  function getYOffset(index) {
    return y(instantFPS[index]);
  }

  const svg = d3n.createSVG(svgWidth, svgHeight)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Label Names
  // text label for the x axis
  svg.append('text')
    .attr(
      'transform',
      `translate(${width / 2} ,${
      height + margin.top + 30})`,
  )
    .style('text-anchor', 'middle')
    .text('time since Origin in ms');

  // text label for the y axis
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('FPS');


  // With label Margins
  const graph = svg
    .append('g')
    .attr('transform', `translate(${labelMargin.left}, 0)`);
  const bar = graph.selectAll('.bar')
    .data(frameTimes)
    .enter().append('g')
    .attr('class', 'bar')
    .attr('transform', (d, i) => `translate(${getXOffset(d, i)},${getYOffset(i)})`);

  bar.append('rect')
    .attr('width', (d, i) => xOtherScale(timeBetweenFrames[i]))
    .attr('height', (d, i) => height - getYOffset(i));

  const dragEventsSVG = graph.selectAll('.drag')
    .data(dragEvents)
    .enter().append('g')
    .attr('class', 'drag')
    .attr('transform', d => `translate(${x(d.start)},${height - DRAG_EVENTS_HEIGHT})`);

  dragEventsSVG.append('rect')
    .attr('width', d => x(d.end) - x(d.start))
    .attr('height', () => DRAG_EVENTS_HEIGHT);
  dragEventsSVG.append('text')
    .attr('dy', '.75em')
    .attr('y', (DRAG_EVENTS_HEIGHT / 2) - 5)
    .attr('x', d => xOtherScale((d.end - d.start) / 2))
    .attr('text-anchor', 'middle')
    .text((d, i) => `DragEvent${i}`);

  graph.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  graph.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y));
  return d3n.svgString();
}

module.exports.SVGFromLogs = SVGFromLogs;
