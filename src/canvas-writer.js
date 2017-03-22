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
    observe(input.element, "mousedown", penDown);
    observe(input.element, "mouseup",   penUp  );
    observe(input.element, "mousemove", penMove);
    return this;
  }

  function observe(element, eventName, handler) {
    if( element.addEventListener ) {
      element.addEventListener(eventName, handler, false);
    } else {
      element.attachEvent("on" + eventName, handler);
    }
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

  var scaleFactor = 1;

  function clear(item) {
    item.canvas.clearRect(0, 0, item.element.width / scaleFactor,
                                item.element.height / scaleFactor);
  }

  function startRecording() {
    clear(input);
    recorded  = [];
    recording = true;
    penDown   = false;
  }

  var afterDrawing = null;

  function stopRecording() {
    recording = false;
    console.log(recorded);
  }

  function setSpeed(newSpeed) {
    speed = newSpeed;
    return this;
  }
  
  function getRecorded() {
    return recorded;
  }

  var writeData, writeText;
  var drawChar, drawPixel;
  var offset;

  var afterWrite;

  var spaceWidth  = 25;
  var lineWidth   = 1;

  function write(data, text, whenDone) {
    clear(output);

    writeData  = data;
    writeText  = text;
    afterWrite = whenDone;
    drawChar   = 0;
    drawPixel  = 0;
    offset     = 0;

    drawNextChar();
  }

  var width = 0;

  function drawNextChar() {
    if(drawChar < writeText.length) { // characters left to draw ?
      c = writeText[drawChar];
      if( c == " " ) {
        offset += spaceWidth;
        drawChar++;
        c = writeText[drawChar];
      }
      if( ! writeData[c] ) {
        console.log("unknown char " + c);
        return;
      }
      console.log("writing char " + c + " at offset " + offset);
      setTimeout(drawNextPixel, 0);
    } else {
      // we're done
      if(afterWrite) { afterWrite(); }
    }
  }

  var selection = 0;

  function drawNextPixel() {
    c = writeText[drawChar];
    pixels = writeData[c];

    if( Object.prototype.toString.call( pixels[0] ) === '[object Array]' ) {
      if(drawPixel == 0) {
        // we have multiple character descriptors, choose one randomly
        selection = Math.floor(Math.random() * pixels.length);
        console.log("selecting randomly", selection, "from", pixels.length);
      }
      pixels = pixels[selection];
    }

    if(drawPixel < pixels.length) { // pixels left to draw ?
      if(drawPixel == 0) {
        // move to start
        p = pixels[drawPixel];
        output.canvas.beginPath();
        output.canvas.moveTo(offset + p.x, p.y);
        if(width < p.x) { width = p.x; }
      } else if(pixels[drawPixel] == "U") {
        // move to next
        drawPixel++;
        if(drawPixel < pixels.length) {
          p = pixels[drawPixel];
          output.canvas.beginPath();
          output.canvas.moveTo(offset + p.x, p.y);
          if(width < p.x) { width = p.x; }
        }          
      } else {
        // stroke to next
        p = pixels[drawPixel];
        output.canvas.lineTo(offset + p.x, p.y);
        output.canvas.lineWidth = lineWidth;
        output.canvas.stroke();          
        if(width < p.x) { width = p.x; }
      }
      drawPixel++;
      setTimeout(drawNextPixel, speed);
      return;
    }
    // prepare for next character
    offset += width + 10;
    width = 0;
    drawChar++;
    drawPixel = 0;
    setTimeout(drawNextChar, 0);
  }

  function withSpace(width) {
    spaceWidth = width;
    return this;
  }

  function withLine(width) {
    lineWidth = width;
    return this;
  }
  
  function withScale(scale) {
    output.canvas.setTransform(1, 0, 0, 1, 0, 0);
    output.canvas.scale(scale, scale);
    scaleFactor = scale;
    return this;
  }

  globals.CanvasWriter = {
    "useInput"    : useInput,
    "useOutput"   : useOutput,
    "setSpeed"    : setSpeed,
    "record"      : startRecording,
    "stop"        : stopRecording,
    "getRecorded" : getRecorded,
    "write"       : write,
    "withSpace"   : withSpace,
    "withLine"    : withLine,
    "withScale"   : withScale
  }
})(window);
