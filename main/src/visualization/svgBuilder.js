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
    this.DRAG_EVENTS_HEIGHT = 30;
    this.DOUBLE_CLICKS_HEIGHT = 5;
    this.RENDER_RECT_HEIGHT = 20;
    this.d3n = new D3Node(options);
    this.width = this.totalWidth - this.labelMargin.left - this.margin.left - this.margin.right;
    this.height = this.totalHeight - this.labelMargin.bottom - this.margin.top - this.margin.bottom;
  }
  initXScale(domainBegin, domainEnd) {
    this.xScale = d3.scaleLinear()
      .domain([domainBegin, domainEnd])
      .range([0, this.width]);
    this.xOtherScale = d3.scaleLinear()
      .domain([0, domainEnd - domainBegin])
      .range([0, this.width]);
  }
  initYScale(domainBegin, domainEnd) {
    this.yScale = d3.scaleLinear()
      .domain([domainBegin, domainEnd])
      .range([this.height, 0]);
  }
  initSVG() {
    this.svg = this.d3n.createSVG(this.totalWidth, this.totalHeight);
  }
  initSVGWithMargin() {
    this.svgWithMargin = this.svg
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
      .attr('this.xScale', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('FPS');
  }
  getXOffset(data, index, timeBetweenFrames) {
    return this.xScale(data - timeBetweenFrames[index]);
  }
  getYOffset(index, instantFPS) {
    return this.yScale(instantFPS[index]);
  }

  drawFPS(frameTimes, timeBetweenFrames, instantFPS) {
    const bar = this.svgWithMargin.selectAll('.bar')
      .data(frameTimes)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', (d, i) =>
        `translate(${this.getXOffset(d, i, timeBetweenFrames)},${this.getYOffset(i, instantFPS)})`);

    bar.append('rect')
      .attr('width', (d, i) => this.xOtherScale(timeBetweenFrames[i]))
      .attr('height', (d, i) => this.height - this.getYOffset(i, instantFPS));
  }
  initdragEventsGroup(dragEvents) {
    this.dragEventsSVG = this.svgWithMargin
      .selectAll('.drag')
      .data(dragEvents)
      .enter().append('g')
      .attr('class', 'drag')
      .attr('transform', d => `translate(${this.xScale(d.start)},${this.height - this.DRAG_EVENTS_HEIGHT})`);
  }
  drawDragEventsRects() {
    this.dragEventsSVG.append('rect')
      .attr('width', d => this.xScale(d.end) - this.xScale(d.start))
      .attr('height', () => this.DRAG_EVENTS_HEIGHT);
  }
  drawDragEventsText() {
    this.dragEventsSVG.append('text')
      .attr('dy', '.75em')
      .attr('y', (this.DRAG_EVENTS_HEIGHT / 2) - 5)
      .attr('x', d => this.xOtherScale((d.end - d.start) / 2))
      .attr('text-anchor', 'middle')
      .text((d, i) => `DragEvent${i}`);
  }
  drawDblClicks(doubleClickTimes) {
    this.dblClickEventsSVG = this.svgWithMargin.selectAll('.zoom')
      .data(doubleClickTimes)
      .enter().append('g')
      .attr('class', 'zoom')
      .attr('transform', d => `translate(${this.xScale(d)},${this.height - this.DOUBLE_CLICKS_HEIGHT})`);

    this.dblClickEventsSVG.append('circle')
      .attr('r', this.DOUBLE_CLICKS_HEIGHT);
  }
  drawRenderRects(renderTimes) {
    this.renderSVG = this.svgWithMargin.selectAll('.render')
      .data(renderTimes)
      .enter().append('g')
      .attr('class', 'render')
      .attr('transform', data => `translate(${this.xScale(data.beforeRender)},${this.height - this.RENDER_RECT_HEIGHT})`);

    this.renderSVG.append('rect')
      .attr('width', d => this.xScale(d.afterRender) - this.xScale(d.beforeRender))
      .attr('height', this.RENDER_RECT_HEIGHT);
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
  toString() {
    return this.d3n.svgString();
  }
};
