const D3Node = require('d3-node');
const fs = require('fs');

const d3 = require('d3');

const styles = `
.bar rect {
  fill: steelblue;
}
.bar text {
  fill: #fff;
  font: 10px sans-serif;
}`;

const options = {
  svgStyles: styles,
  d3Module: d3,
};

const d3n = new D3Node(options);

// from https://bl.ocks.org/mbostock/3048450
const data = d3.range(1000).map(d3.randomBates(10));

const formatCount = d3.format(',.0f');

let margin = {
    top: 10, right: 30, bottom: 30, left: 30,
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const x = d3.scaleLinear()
  .rangeRound([0, width]);

const bins = d3.histogram()
  .domain(x.domain())
  .thresholds(x.ticks(20))(data);

const y = d3.scaleLinear()
  .domain([0, d3.max(bins, d => d.length)])
  .range([height, 0]);

const svgWidth = width + margin.left + margin.right;
const svgHeight = height + margin.top + margin.bottom;

const svg = d3n.createSVG(svgWidth, svgHeight)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const bar = svg.selectAll('.bar')
  .data(bins)
  .enter().append('g')
  .attr('class', 'bar')
  .attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`);

bar.append('rect')
  .attr('x', 1)
  .attr('width', x(bins[0].x1) - x(bins[0].x0) - 1)
  .attr('height', d => height - y(d.length));

bar.append('text')
  .attr('dy', '.75em')
  .attr('y', 6)
  .attr('x', (x(bins[0].x1) - x(bins[0].x0)) / 2)
  .attr('text-anchor', 'middle')
  .text(d => formatCount(d.length));

svg.append('g')
  .attr('class', 'axis axis--x')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(x));

fs.writeFile('../../out/test2.svg', d3n.svgString());
