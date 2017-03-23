(function() {
  var prefix = "";
  if(window.location.href.split("/")[0] == "file:" ) {
    prefix = "../src/"
  }
  document.write('<script src="'+ prefix +'canvas-writer.js">\x3C/script>');
})();

