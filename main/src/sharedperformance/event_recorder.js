class DragEvent {
  constructor(mapDOM) {
    this.mapDOM = mapDOM;
    this.timeStampsOfMoves = [];
    this.record = () => {
      this.timeStampsOfMoves.push(performance.now().toFixed(2));
    };
  }

  start() {
    this.mapDOM.addEventListener('mousemove', this.record);
  }

  stop() {
    this.mapDOM.removeEventListener('mousemove', this.record);
  }

  toJSON() {
    return { timeStampsOfMoves: this.timeStampsOfMoves };
  }
}

class EventRecorder {
  constructor(mapDOM) {
    this.mapDOM = mapDOM;
    this.dragEvents = [];
    this.doubleClickTimes = [];
    this.init();
  }
  init() {
    this.mouseDown = () => {
      const event = new DragEvent(this.mapDOM);
      event.start();
      this.dragEvents.push(event);
    };
    this.mouseUp = () => {
      const event = this.dragEvents[this.dragEvents.length - 1];
      event.stop();
    };
    this.mapDOM.addEventListener('mousedown', this.mouseDown);
    this.mapDOM.addEventListener('mouseup', this.mouseUp);
  }
  stop() {
    this.mapDOM.removeEventListener('mousedown', this.mouseDown);
    this.mapDOM.removeEventListener('mouseup', this.mouseUp);
  }
  toJSON() {
    return {
      dragEvents: this.dragEvents.map(dragEvent => dragEvent.toJSON()),
      doubleClickTimes: this.doubleClickTimes,
    };
  }
}
let eventRecorder;
function startEventRecording(mapDOM) {
  eventRecorder = new EventRecorder(mapDOM);
}

function stopEventRecording() {
  eventRecorder.stop();
  return eventRecorder.toJSON();
}

export { startEventRecording, stopEventRecording };
