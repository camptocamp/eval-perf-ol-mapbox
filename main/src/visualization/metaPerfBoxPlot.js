import { MetaPerfLogsReader } from '../filesIO/metaPerfLogsReader';
import { BoxPlot } from './BoxPlot';
import {
  writeSVGFileToDir,
  expectConfigFile,
} from '../filesIO/utils';
import ConfigReader from '../filesIO/ConfigReader';

const d3 = require('d3');
const D3Node = require('d3-node');

const fontSize = '14px';

function sIfPlural(number) {
  if (number > 1 || number < -1) {
    return 's';
  }
  return '';
}

function colName(n) {
  const ordA = 'a'.charCodeAt(0);
  const ordZ = 'z'.charCodeAt(0);
  const len = (ordZ - ordA) + 1;

  let s = '';
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s.toUpperCase();
}


function getLegend(metaPerfLogsReader) {
  return [`${metaPerfLogsReader.getRenderer()} ${metaPerfLogsReader.getVersion()}`,
    `sample size = ${metaPerfLogsReader.getSampleSize()}`,
    `${metaPerfLogsReader.getOutliers()} outlier${sIfPlural(metaPerfLogsReader.getOutliers())} filtered out`,
  ];
}

class MetaPerfBoxPlot {
  constructor(svgWidth, svgHeight, margin, options, metaPerfLogsReaders, optionsParams) {
    this.svgWidth = svgWidth;
    this.svgHeight = svgHeight;
    this.margin = margin;
    this.options = options;
    this.metaPerfLogsReaders = metaPerfLogsReaders;
    this.minY = parseInt(optionsParams.minY, 10);
    this.maxY = parseInt(optionsParams.maxY, 10);
    this.columns = parseInt(optionsParams.columns, 10);
    if (optionsParams.yAxis === 'maxRenderTime') {
      this.boxPlotsLogs = metaPerfLogsReaders
        .map(metaPerfLogsReader => metaPerfLogsReader.getMaxRenderBoxPlotLogs());
      this.YAxisText = 'Maximum time spent rendering in a frame (in ms)';
    } else {
      this.boxPlotsLogs = metaPerfLogsReaders
        .map(metaPerfLogsReader => metaPerfLogsReader.getMeanFPSBoxPlotLogs());
      this.YAxisText = 'average FPS in an experiment';
    }
    this.init();
  }
  getMinYValue() {
    if (!Number.isNaN(this.minY)) {
      return this.minY;
    }
    let min = Infinity;
    this.boxPlotsLogs.forEach((boxPlotLogs) => {
      const value = boxPlotLogs.getMinimum();
      if (value < min) {
        min = value;
      }
    });
    return min;
  }
  getMaxYValue() {
    if (!Number.isNaN(this.maxY)) {
      return this.maxY;
    }
    let max = -Infinity;
    this.boxPlotsLogs.forEach((boxPlotLogs) => {
      const value = boxPlotLogs.getMaximum();
      if (value > max) {
        max = value;
      }
    });
    return max;
  }
  init() {
    this.d3n = new D3Node(this.options);
    this.BOX_PLOT_WIDTH = 100;
    this.width = this.svgWidth - this.margin.right - this.margin.left;
    this.height = this.svgHeight - this.margin.top - this.margin.bottom;
    this.svg = this.d3n.createSVG(this.svgWidth, this.svgHeight);
    this.svgWithMargin = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    this.initXScale();
    this.initYScale();
  }
  xDomain() {
    const domain = [];
    if (Number.isNaN(this.columns)) {
      this.metaPerfLogsReaders.forEach((element, index) => {
        domain.push(index);
      });
      this.columns = this.metaPerfLogsReaders.length;
      this.nbEmptyColumns = 0;
    } else {
      for (let index = 0; index < this.columns; index += 1) {
        domain.push(index);
      }
      this.nbEmptyColumns = this.columns - this.metaPerfLogsReaders.length;
    }
    return domain;
  }
  xRange() {
    const range = [];
    this.xDomain().forEach((element, index) => {
      range.push(this.width * ((index + 1) / (this.xDomain().length + 1)));
    });
    return range;
  }
  // gridlines in y axis function
  makeYGridlines() {
    return d3.axisLeft(this.yScale)
      .ticks(5);
  }
  initXScale() {
    this.xScale = d3.scaleOrdinal()
      .domain(this.xDomain())
      .range(this.xRange());
  }
  initYScale() {
    this.yScale = d3.scaleLinear()
      .domain([this.getMinYValue() - 1, this.getMaxYValue() + 1])
      .range([this.height, 0]);
  }
  drawYAxis() {
    this.svgWithMargin.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(this.yScale));
  }
  drawBoxPlots() {
    this.boxPlotsLogs.forEach((element, index) => {
      this.drawBoxPlot(this.xScale(this.nbEmptyColumns + index), element);
    });
  }
  drawBoxPlot(offset, boxPlotLogs) {
    const svgContainer = this.svgWithMargin.append('g')
      .attr('transform', `translate(${offset}, 0)`);
    const boxPlot = new BoxPlot(
      svgContainer, this.BOX_PLOT_WIDTH,
      this.yScale, boxPlotLogs,
    );
    return boxPlot.draw();
  }
  labelXAxis() {
    const legends = this.svg.selectAll('.legend')
      .data(this.metaPerfLogsReaders)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${this.xScale(i) + this.margin.left} ,${
        this.height + this.margin.top + 20})`);
    // Hardcoded because I can't figure how to do it properly with d3
    for (let index = 0; index < 3; index += 1) {
      legends.append('text')
        .attr('class', 'legend')
        .text(d => getLegend(d)[index])
        .attr('transform', `translate(0,${index * 18})`)
        .attr('font-size', fontSize)
        .style('text-anchor', 'middle');
    }
  }
  labelXAxisMinimized() {
    const legends = this.svg.selectAll('.legend')
      .data(this.xDomain())
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${this.xScale(i) + this.margin.left} ,${
        this.height + this.margin.top + 20})`);
    legends.append('text')
      .attr('class', 'legend')
      .text(d => colName(d))
      .attr('transform', 'translate(0, 10)')
      .attr('font-size', fontSize)
      .style('text-anchor', 'middle');
  }
  labelYAxis() {
    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(this.YAxisText);
  }
  drawYGridLines() {
    this.svgWithMargin.append('g')
      .attr('class', 'grid')
      .call(this.makeYGridlines()
        .tickSize(-this.width)
        .tickFormat(''));
  }
  toString() {
    return this.d3n.svgString();
  }
}

function main(pathToMetaPerfFiles, pathToOutDir, optionsParams) {
  console.log('drawing metaPerf ...');
  const outputDir = pathToOutDir;
  const metaPerfLogsReaders = pathToMetaPerfFiles
    .map(path => new MetaPerfLogsReader(path));
  const { mode } = optionsParams;
  const styles = `
.boxoutline line {
  stroke: #000;
}
.boxoutline rect {
  stroke: #000;
  fill: #fff;
}
.median line {
  stroke: red
}
.grid line {
  stroke: lightgrey;
  stroke-opacity: 0.7;
  shape-rendering: crispEdges;
}
`;
  const margin = {
    top: 10,
    right: 30,
    bottom: 60,
    left: 60,
  };
  if (mode === 'minimized') {
    margin.top = 23;
    margin.left = 65;
    margin.right = 0;
    margin.bottom = 20;
  }
  const svgWidth = 960;
  const svgHeight = 500;
  const options = {
    svgStyles: styles,
    d3Module: d3,
  };
  const svgGraph = new MetaPerfBoxPlot(svgWidth, svgHeight, margin, options, metaPerfLogsReaders, optionsParams);
  svgGraph.drawYAxis();
  svgGraph.drawBoxPlots();
  if (mode !== 'minimized') {
    svgGraph.labelXAxis();
    svgGraph.labelYAxis();
  } else {
    svgGraph.labelXAxisMinimized();
  }
  svgGraph.drawYGridLines();
  writeSVGFileToDir(outputDir, 'metaPerf', svgGraph.toString());
  console.log(`metaPerf drawn to ${outputDir}metaPerf.svg`);
}

function drawMetaPerfBoxPlotFromConfig(pathToConfigFile, options) {
  const configReader = new ConfigReader(pathToConfigFile);
  main(configReader.getPathsToMetaPerfFiles(), configReader.getPathForSVG(), options);
}

function twoOrMoreArguments(args) {
  return args.length > 3;
}

function processArg(args, prefix) {
  let elementFound;
  args.forEach((element, index) => {
    if (element.startsWith(prefix)) {
      elementFound = element.substring(prefix.length);
      args.splice(index, 1);
    }
  });
  return elementFound;
}

function processMinY(args) {
  return processArg(args, 'minY=');
}

function processMaxY(args) {
  return processArg(args, 'maxY=');
}

function processMode(args) {
  return processArg(args, 'mode=');
}

function processColumns(args) {
  return processArg(args, 'columns=');
}

function processYAxis(args) {
  return processArg(args, 'yAxis=');
}

if (typeof require !== 'undefined' && require.main === module) {
  const args = process.argv;
  const minY = processMinY(args);
  const maxY = processMaxY(args);
  const mode = processMode(args);
  const columns = processColumns(args);
  const yAxis = processYAxis(args);
  const options = {
    minY, maxY, mode, columns, yAxis,
  };
  if (twoOrMoreArguments(args)) {
    main(args.slice(2, args.length - 1), args[args.length - 1], options);
  } else {
    const pathToConfigFile = expectConfigFile();
    drawMetaPerfBoxPlotFromConfig(pathToConfigFile, options);
  }
}
