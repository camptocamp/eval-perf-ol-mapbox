import { MetaPerfLogsReader } from '../filesIO/metaPerfLogsReader';
import { BoxPlot } from './BoxPlot';
import { writeSVGFileToDir } from '../filesIO/utils';
import ConfigReader from '../filesIO/ConfigReader';

const d3 = require('d3');
const D3Node = require('d3-node');

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
  constructor(svgWidth, svgHeight, margin, options, metaPerfLogsReaders) {
    this.svgWidth = svgWidth;
    this.svgHeight = svgHeight;
    this.margin = margin;
    this.options = options;
    this.metaPerfLogsReaders = metaPerfLogsReaders;
    this.init();
  }
  getMinYValue() {
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
    // TODO change this hardcode
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

function main() {
  console.log('drawing metaPerf ...');
  const configFile = process.argv[2];
  const configReader = new ConfigReader(configFile);
  const outputDir = configReader.getPathForSVG();
  const metaPerfLogsReaders = configReader.getPathsToMetaPerfFiles()
    .map(path => new MetaPerfLogsReader(path));
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
  const svgWidth = 960;
  const svgHeight = 500;
  const options = {
    svgStyles: styles,
    d3Module: d3,
  };
  const svgGraph = new MetaPerfBoxPlot(svgWidth, svgHeight, margin, options, metaPerfLogsReaders);
  svgGraph.drawYAxis();
  svgGraph.drawBoxPlots();
  svgGraph.labelXAxis();
  svgGraph.labelYAxis();
  svgGraph.drawYGridLines();
  writeSVGFileToDir(outputDir, 'metaPerf', svgGraph.toString());
  console.log(`metaPerf drawn to ${configReader.getPathForSVG()}metaPerf.svg`);
}
if (typeof require !== 'undefined' && require.main === module) {
  main();
}
