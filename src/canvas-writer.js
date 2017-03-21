// canvas-writer is a small library around the HTML5 Canvas element to record
// and playback hand-written text.
// author: Christophe VG <contact@christophe.vg>

// The drawing format consists of pairs of coordinates to move to. Coordinate
// "U" means pen up, resulting in a move to the next coordinate where the
// pen is put down again.


(function(globals) {
  
  var input = {}, output = {};
  var speed = 100;

  function useInput(source) {
    input.element = document.getElementById(source);
    input.canvas  = input.element.getContext("2d");
    // setup event handlers
    document.onmousedown = penDown;
    document.onmouseup   = penUp;
    document.onmousemove = penMove;
    return this;
  }

  var recorded = [];
  var recording = false;

  var writing = false;

  function penDown(event) {
    writing = true;
    if(recording) {
      var point = getXY(event);
      recorded.push(point);
      input.canvas.beginPath();
      input.canvas.moveTo(point.x, point.y);
    }
  }
  
  function penUp(event) {
    writing = false;
    if(recording) {
      recorded.push("U");
    }
  }

  function penMove(event) {
    if(! recording ) { return; }
    // draw for feedback
    if(writing) {
      var point = getXY(event);
      recorded.push(point);
      input.canvas.lineTo(point.x, point.y);
      input.canvas.stroke();
    }
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

  function startRecording() {
    clear(input);
    recorded  = [];
    recording = true;
    penDown   = false;
  }

  var afterDrawing = null;

  function stopRecording(whenDone) {
    recording = false;
    clear(output);
    afterDrawing = whenDone;
    draw();
    console.log(recorded);
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
      if(recorded[pixel] == "U") {
        pixel++;
        if(pixel < recorded.length) {
          output.canvas.beginPath();
          output.canvas.moveTo(recorded[pixel].x, recorded[pixel].y);
        }
      } else {
        output.canvas.lineTo(recorded[pixel].x, recorded[pixel].y);
        output.canvas.stroke();
      }
      // schedule next
      pixel++;
      setTimeout(drawNext, speed);
    } else {
      if(afterDrawing) {
        afterDrawing();
        afterDrawing = null;
      }
    }
  }

  function setSpeed(newSpeed) {
    speed = newSpeed;
    return this;
  }

  globals.CanvasWriter = {
    "useInput"  : useInput,
    "useOutput" : useOutput,
    "setSpeed"  : setSpeed,
    "record"    : startRecording,
    "stop"      : stopRecording
  }
})(window);
