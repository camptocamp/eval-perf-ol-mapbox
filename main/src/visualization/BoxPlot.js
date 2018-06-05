const black = 'black';
const red = 'red';
class BoxPlot {
  constructor(svgContainer, width, yScale, boxPlotLogs) {
    this.svgContainer = svgContainer;
    this.width = width;
    this.yScale = yScale;
    this.boxPlotsLogs = boxPlotLogs;
  }
  data(obj) {
    this.svgContainer.data(obj);
    return this;
  }
  enter() {
    this.svgContainer.enter();
    return this;
  }
  append(param) {
    this.svgContainer.append(param);
    return this;
  }
  attr(param1, param2) {
    this.svgContainer.attr(param1, param2);
    return this;
  }
  drawLine(x1, y1, x2, y2, className) {
    this.svgContainer
      .append('g')
      .attr('class', className)
      .append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2);
  }
  drawHorizonzalLine(height, className) {
    const x1 = -this.width / 2;
    const x2 = -x1;
    return this.drawLine(x1, height, x2, height, className);
  }
  drawMinLine() {
    const height = this.yScale(this.boxPlotsLogs.getMinimum());
    return this.drawHorizonzalLine(height, 'boxoutline', black);
  }
  drawMaxLine() {
    const height = this.yScale(this.boxPlotsLogs.getMaximum());
    return this.drawHorizonzalLine(height, 'boxoutline', black);
  }
  drawMedianLine() {
    const height = this.yScale(this.boxPlotsLogs.getMedian());
    return this.drawHorizonzalLine(height, 'median', red);
  }
  drawQuartileRect() {
    const x = -this.width / 2;
    const y = this.yScale(this.boxPlotsLogs.getThirdQuartile());
    const height = this.yScale(this.boxPlotsLogs.getFirstQuartile()) - y;
    this.svgContainer
      .append('g')
      .attr('class', 'boxoutline')
      .append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', this.width)
      .attr('height', height);
  }
  drawVerticalLine(y1, y2, x, className, color) {
    return this.drawLine(x, y1, x, y2, className, color);
  }
  drawMinFirstQuartileLine() {
    const x = 0;
    const y1 = this.yScale(this.boxPlotsLogs.getFirstQuartile());
    const y2 = this.yScale(this.boxPlotsLogs.getMinimum());
    return this.drawVerticalLine(y1, y2, x, 'boxoutline', black);
  }
  drawMaxThirdQuartileLine() {
    const x = 0;
    const y1 = this.yScale(this.boxPlotsLogs.getThirdQuartile());
    const y2 = this.yScale(this.boxPlotsLogs.getMaximum());
    return this.drawVerticalLine(y1, y2, x, 'boxoutline', black);
  }
  draw() {
    this.drawQuartileRect();
    this.drawMinLine();
    this.drawMaxLine();
    this.drawMedianLine();
    this.drawMaxThirdQuartileLine();
    this.drawMinFirstQuartileLine();
  }
}

export {
  BoxPlot
};