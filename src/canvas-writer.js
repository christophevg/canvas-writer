// canvas-writer is a small library around the HTML5 Canvas element to record
// and playback hand-written text.
// author: Christophe VG <contact@christophe.vg>

(function(globals) {
  
  var input = {}, output = {};
  var speed = 100;

  function useInput(source) {
    input.element = document.getElementById(source);
    input.canvas  = input.element.getContext("2d");
    // setup event handlers
    document.onmousedown = startRecording;
    document.onmouseup   = stopRecording;
    document.onmousemove = record;
    return this;
  }

  var recorded = [];
  var recording = false;

  function startRecording(event) {
    recorded = [];
    recording = true;
    clear(input);
    input.canvas.beginPath();
  }

  function record(event) {
    if(! recording ) { return; }
    var point = getXY(event);
    recorded.push(point);
    // draw for feedback
    if(recorded.length == 1) {
      input.canvas.moveTo(point.x, point.y);
    } else {
      input.canvas.lineTo(point.x, point.y);
      input.canvas.stroke();
    }
  }
  
  function stopRecording(event) {
    recording = false;
    // clear output
    clear(output);
    // draw recorded on output
    draw();
  }

  function getXY(e) {
    var x,y;
    // IE?
    if( !!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1) ) {
      x = event.clientX + document.body.scrollLeft;
      y = event.clientY + document.body.scrollTop;
    } else {
      x = e.pageX;
      y = e.pageY;
    }
    return { x: x - getLeft(), y: y - getTop() };
  }

  function getLeft() {
    var elem = input.element;
    var left = 0;
    while( elem != null ) {
      left += elem.offsetLeft;
      elem = elem.offsetParent;
    }
    return left;
  }

  function getTop() {
    var elem = input.element;
    var top = 0;
    while( elem != null ) {
      top += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return top;
  }

  function useOutput(target) {
    output.element = document.getElementById(target);
    output.canvas  = output.element.getContext("2d");
    return this;
  }

  function clear(item) {
    item.canvas.clearRect(0, 0, item.element.width, item.element.height);
  }

  function setSpeed(newSpeed) {
    speed = newSpeed;
  }

  var pixel = 0;

  function draw() {
    output.canvas.beginPath();
    output.canvas.moveTo(recorded[0].x, recorded[0].y);
    pixel = 0;
    drawNext();
  }
  
  function drawNext() {
    if(pixel < recorded.length) {
      output.canvas.lineTo(recorded[pixel].x, recorded[pixel].y);
      output.canvas.stroke();
      // schedule next
      pixel++;
      setTimeout(drawNext, speed);
    }
  }

  globals.CanvasWriter = {
    "useInput"  : useInput,
    "useOutput" : useOutput,
    "setSpeed"  : setSpeed
  }
})(window);
