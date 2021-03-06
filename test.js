var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');

var file = fs.createReadStream('steps-mono-16b-44khz.wav');
var reader = new wav.Reader();

// the "format" event gets emitted at the end of the WAVE header
reader.on('format', function (format) {

  // the WAVE header is stripped from the output of the reader
  reader.pipe(new Speaker(format));
});

reader.on('data', function (d){
    console.log("data")
});

// pipe the WAVE file to the Reader instance
file.pipe(reader);