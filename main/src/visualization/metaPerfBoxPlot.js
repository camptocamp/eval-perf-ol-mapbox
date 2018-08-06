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

function getLegend(metaPerfLogsReader) {
  return [`${metaPerfLogsReader.getRenderer()} ${metaPerfLogsReader.getVersion()}`,
    `sample size = ${metaPerfLogsReader.getSampleSize()}`,
    `${metaPerfLogsReader.getOutliers()} outlier${sIfPlural(metaPerfLogsReader.getOutliers())} filtered out`,
  ];
}

class MetaPerfBoxPlot {
  constructor(svgWidth, svgHeight, margin, options, metaPerfLogsReaders, minY, maxY) {
    this.svgWidth = svgWidth;
    this.svgHeight = svgHeight;
    this.margin = margin;
    this.options = options;
    this.metaPerfLogsReaders = metaPerfLogsReaders;
    this.minY = parseInt(minY, 10);
    this.maxY = parseInt(maxY, 10);
    this.init();
  }
  getMinYValue() {
    if (!Number.isNaN(this.minY)) {
      return this.minY;
    }
    let min = Infinity;
    this.metaPerfLogsReaders.forEach((metaPerfLogsReader) => {
      const value = metaPerfLogsReader.getMeanFPSBoxPlotLogs().getMinimum();
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
    this.metaPerfLogsReaders.forEach((metaPerfLogsReader) => {
      const value = metaPerfLogsReader.getMeanFPSBoxPlotLogs().getMaximum();
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
    this.metaPerfLogsReaders.forEach((element, index) => {
      domain.push(index);
    });
    return domain;
  }
  xRange() {
    const range = [];
    this.metaPerfLogsReaders.forEach((element, index) => {
      range.push(this.width * ((index + 1) / (this.metaPerfLogsReaders.length + 1)));
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
    this.metaPerfLogsReaders.forEach((element, index) => {
      this.drawBoxPlot(this.xScale(index), element);
    });
  }
  drawBoxPlot(offset, metaPerfLogsReader) {
    const svgContainer = this.svgWithMargin.append('g')
      .attr('transform', `translate(${offset}, 0)`);
    const boxPlot = new BoxPlot(
      svgContainer, this.BOX_PLOT_WIDTH,
      this.yScale, metaPerfLogsReader.getMeanFPSBoxPlotLogs(),
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
    for (let index = 0; index < 3; index++) {
      legends.append('text')
        .attr('class', 'legend')
        .text(d => getLegend(d)[index])
        .attr('transform', `translate(0,${index * 18})`)
        .attr('font-size', fontSize)
        .style('text-anchor', 'middle');
    }
  }
  labelYAxis() {
    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('average FPS in an experiment');
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

function main(pathToMetaPerfFiles, pathToOutDir, minY, maxY, mode) {
  console.log('drawing metaPerf ...');
  const outputDir = pathToOutDir;
  const metaPerfLogsReaders = pathToMetaPerfFiles
    .map(path => new MetaPerfLogsReader(path));
  let styles = `
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
    margin.top = 20;
    margin.left = 30;
    margin.right = 0;
    margin.bottom = 0;
  }
  const svgWidth = 960;
  const svgHeight = 500;
  const options = {
    svgStyles: styles,
    d3Module: d3,
  };
  const svgGraph = new MetaPerfBoxPlot(svgWidth, svgHeight, margin, options, metaPerfLogsReaders, minY, maxY);
  svgGraph.drawYAxis();
  svgGraph.drawBoxPlots();
  if (mode !== 'minimized') {
    svgGraph.labelXAxis();
    svgGraph.labelYAxis();
  }
  svgGraph.drawYGridLines();
  writeSVGFileToDir(outputDir, 'metaPerf', svgGraph.toString());
  console.log(`metaPerf drawn to ${outputDir}metaPerf.svg`);
}

function drawMetaPerfBoxPlotFromConfig(pathToConfigFile, minY, maxY, mode) {
  const configReader = new ConfigReader(pathToConfigFile);
  main(configReader.getPathsToMetaPerfFiles(), configReader.getPathForSVG(), minY, maxY, mode);
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

if (typeof require !== 'undefined' && require.main === module) {
  const args = process.argv;
  const minY = processMinY(args);
  const maxY = processMaxY(args);
  const mode = processMode(args);
  if (twoOrMoreArguments(args)) {
    main(args.slice(2, args.length - 1), args[args.length - 1], minY, maxY, mode);
  } else {
    const pathToConfigFile = expectConfigFile();
    drawMetaPerfBoxPlotFromConfig(pathToConfigFile, minY, maxY, mode);
  }
}

