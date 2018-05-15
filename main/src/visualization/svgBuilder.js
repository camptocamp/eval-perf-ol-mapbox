const D3Node = require('d3-node');
const d3 = require('d3');

module.exports.SVGBuilder = class SVGBuilder {
  constructor(totalWidth, totalHeight, margin, labelMargin, options) {
    this.totalWidth = totalWidth;
    this.totalHeight = totalHeight;
    this.margin = margin;
    this.labelMargin = labelMargin;
    this.init(options);
  }

  init(options) {
    this.d3n = new D3Node(options);
    this.width = 960 - this.labelMargin.left - this.margin.left - this.margin.right;
    this.height = 500 - this.labelMargin.bottom - this.margin.top - this.margin.bottom;
    // TODO fix bug when first frame is really too fast
  }
  setTopLimit(topLimit) {
    this.topLimit = topLimit;
  }
  initXScale(domainBegin, domainEnd) {
    this.xScale = d3.scaleLinear()
      .domain(domainBegin, domainEnd)
      .range([0, this.width]);
  }
  initYScale(domainBegin, domainEnd) {
    this.yScale = d3.scaleLinear()
      .domain(domainBegin, domainEnd)
      .range([this.height, 0]);
  }
  initSVG() {
    this.svg = this.d3n.createSVG(this.totalWidth, this.totalHeight);
  }
  appendMarginTranslation() {
    return this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }
  labelXAxis() {
    this.svg.append('text')
      .attr(
        'transform',
        `translate(${this.width / 2} ,${
          this.height + this.margin.top + 30})`,
      )
      .style('text-anchor', 'middle')
      .text('time since Origin in ms');
  }
  labelYAxis() {
    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('FPS');
  }
};
