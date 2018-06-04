const D3Node = require('d3-node');
const d3 = require('d3');

module.exports = class SVGBuilder {
  constructor(totalWidth, totalHeight, margin, labelMargin, legendMargin, options) {
    this.totalWidth = totalWidth;
    this.totalHeight = totalHeight;
    this.margin = margin;
    this.labelMargin = labelMargin;
    this.legendMargin = legendMargin;
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
      .attr('x', 0 - (this.height / 2))
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
  getDragEventsGroup(dragEvents, className) {
    return this.svgWithMargin
      .selectAll(`.${className}`)
      .data(dragEvents)
      .enter().append('g')
      .attr('class', className)
      .attr('transform', d => `translate(${this.xScale(d.start)},${this.height - this.DRAG_EVENTS_HEIGHT})`);
  }
  drawDragEventsRects(dragEvents) {
    this.getDragEventsGroup(dragEvents, 'drag').append('rect')
      .attr('width', d => this.xScale(d.end) - this.xScale(d.start))
      .attr('height', () => this.DRAG_EVENTS_HEIGHT);
  }
  drawDragEventsText(dragEvents) {
    this.getDragEventsGroup(dragEvents, 'dragText').append('text')
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
  drawLegend() {
    const rectLegendWidth = 20;
    const rectLegendHeight = 15;
    const SPACING_INTER_LEGEND = 160;
    const SPACING_INTRA_LEGEND = 30;
    const LEGEND_TEXT_OFFSET = 10;
    const MARGIN_TOP_OFFSET = 10;
    const totalHeightOffset = this.height + this.labelMargin.bottom +
    this.margin.top + MARGIN_TOP_OFFSET;
    const legendItems = [
      { className: 'render', text: 'render time' },
      { className: 'drag', text: 'drag events' },
      { className: 'zoom', text: 'double click events (zoom)' },
      { className: 'bar', text: 'frames' },
    ];
    const legend = this.svg.selectAll('.legend')
      .data(legendItems)
      .enter().append('g')
      .attr('class', d => `legend ${d.className}`)
      .attr('transform', (d, i) => `translate(${this.margin.left + (i * SPACING_INTER_LEGEND)},${totalHeightOffset})`);
    legend.append('rect')
      .attr('width', rectLegendWidth)
      .attr('height', rectLegendHeight);
    legend.append('text')
      .attr('transform', `translate(${SPACING_INTRA_LEGEND},${LEGEND_TEXT_OFFSET})`)
      .text(d => d.text);
  }
  toString() {
    return this.d3n.svgString();
  }
};
