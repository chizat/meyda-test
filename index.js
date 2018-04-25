var play = require('./meyda-extractor.js');

function data(d)
{
    console.log(d);
}

function cb()
{
    console.log("Done")
}

play("./hp-sample.wav", "rms", data, cb );