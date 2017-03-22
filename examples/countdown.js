var writer;
var lastUpdate;

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
    
    var update = ("000"+days).slice(-3) + " " +
                 ("00"+hours).slice(-2) + " " +
                 ("00"+minutes).slice(-2) + " " +
                 ("00"+seconds).slice(-2);

    writer.write(font, update.split(""), function() {
      setTimeout(updateClock, 10000);          
    });
  }
}

window.addEventListener("load", function() {
  console.log("countdown starting...");
  writer = CanvasWriter.useOutput("countdown")
                       .withLine(5)
                       .withScale(0.5)
                       .withSpace(30)
                       .setSpeed(15);
 updateClock();
}, false);
