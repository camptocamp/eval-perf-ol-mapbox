import { MetaPerfLogsReader } from '../filesIO/metaPerfLogsReader';
import { BoxPlot } from './BoxPlot';
import { writeSVGFileToDir } from '../filesIO/utils';

const d3 = require('d3');
const D3Node = require('d3-node');

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
  initXScale() {
    // TODO change this hardcode
    this.xScale = d3.scaleOrdinal()
      .domain([0, 1])
      .range([this.width / 4, (this.width * 3) / 4]);
  }
  initYScale() {
    this.yScale = d3.scaleLinear()
      .domain([this.getMinYValue() - 1, this.getMaxYValue() + 1])
      .range([this.height, 0]);
  }
  drawXAxis() {
    this.svgWithMargin.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));
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
  toString() {
    return this.d3n.svgString();
  }
}

function main() {
  const args = process.argv.slice(2);
  const argsV2 = args.slice(0, args.length - 1);
  const outputDir = args[args.length - 1];
  const metaPerfLogsReaders = argsV2.map(path => new MetaPerfLogsReader(path));
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
`;
  const margin = {
    top: 10, right: 30, bottom: 30, left: 30,
  };
  const svgWidth = 960;
  const svgHeight = 500;
  const options = {
    svgStyles: styles,
    d3Module: d3,
  };
  const svgGraph = new MetaPerfBoxPlot(svgWidth, svgHeight, margin, options, metaPerfLogsReaders);
  svgGraph.drawXAxis();
  svgGraph.drawYAxis();
  svgGraph.drawBoxPlots();
  writeSVGFileToDir(outputDir, 'MetaPerfTest', svgGraph.toString());
}
if (typeof require !== 'undefined' && require.main === module) {
  main();
}
