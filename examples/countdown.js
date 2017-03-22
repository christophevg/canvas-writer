var writer;

var lastUpdate = { "days" : "", "hours" : "", "minutes" : "", "seconds" : "" };

var updates = [];

function updateClock() {
  var then = new Date(document.getElementById("countdown").dataset.totime);
  var thenEpoch = then.getTime();
  var now = new Date();
  var nowEpoch = now.getTime();
  var timediff = then - now;
  if ( timediff > 0 ) {
    var days    = Math.floor( timediff/86400000 );
    var hours   = Math.floor( (timediff - 86400000*days)/3600000);
    var minutes = Math.floor( (timediff-86400000*days-3600000*hours)/60000 );
    var seconds = Math.floor( (timediff-86400000*days-3600000*hours-60000*minutes)/1000 );
    
    updates = [];
    
    var daysUpdate = ("000"+days).slice(-3);
    if(lastUpdate["days"] != daysUpdate) {
      updates.push(function() {
        writer.useOutput("countdown-days").write(font, daysUpdate, processUpdates);
        lastUpdate["days"] = daysUpdate;
      })
    }

    var hoursUpdate = ("00"+hours).slice(-2);
    if(lastUpdate["hours"] != hoursUpdate) {
      updates.push(function() {
        writer.useOutput("countdown-hours").write(font, hoursUpdate, processUpdates);
        lastUpdate["hours"] = hoursUpdate;
      })
    }

    var minutesUpdate = ("00"+minutes).slice(-2);
    if(lastUpdate["minutes"] != minutesUpdate) {
      updates.push(function() {
        writer.useOutput("countdown-minutes").write(font, minutesUpdate, processUpdates);
        lastUpdate["minutes"] = minutesUpdate;
      })
    }

    var secondsUpdate = ("00"+seconds).slice(-2);
    if(lastUpdate["seconds"] != secondsUpdate) {
      updates.push(function() {
        writer.useOutput("countdown-seconds").write(font, secondsUpdate, processUpdates);
        lastUpdate["seconds"] = secondsUpdate;
      })
    }
    
    processUpdates();
  }
}

function processUpdates() {
  if(updates.length > 0) {
    updates.shift()();
  } else {
    setTimeout(updateClock, 1000);
  }
}

window.addEventListener("load", function() {
  writer = CanvasWriter.withLine(5)
                       .withScale(0.5)
                       .withSpace(30)
                       .setSpeed(10);
 updateClock();
}, false);
