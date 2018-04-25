  
var Meyda = require('meyda');
var WavLoader = require('./wav-loader.js');
var fs = require('fs');

const play = require('audio-play');

var FRAME_SIZE = 512;
Meyda.bufferSize = FRAME_SIZE;
Meyda.windowingFunction = 'hanning';

function output(file, features, dataCallback, finishedCallback)
{
    var featuresToExtract = features;

    for (var i = 0; i < featuresToExtract.length; i++) {
        features[featuresToExtract[i]] = [];
    }

    // utility to convert typed arrays to normal arrays
    function typedToArray(t) {
        return Array.prototype.slice.call(t);
    }

    // utility to convert arrays to typed F32 arrays
    function arrayToTyped(t) {
        return Float32Array.from(t);
    }

    //helper method to extract features for this chunk
    function extractFeatures(chunk) {
        //make it a F32A for efficiency
        var frame = arrayToTyped(chunk);
        //run the extraction of selected features
        var fset = Meyda.extract(featuresToExtract, frame);
        //here is where the feature is available
        dataCallback(fset);
    }

    //this is a buffer
    var buffer = [];

    var wl = new WavLoader(
        function(chunk, d){
            
            //convert to normal array so we can concatenate
            var _chunk = typedToArray(chunk);
            //check if chunk is bigger than frame
            if (_chunk.length > FRAME_SIZE) {
                // if so, we'll extract stuff from it frame by frame, until we're left with something that's short enough to buffer
                while(_chunk.length > FRAME_SIZE) {
                    var frame = _chunk.splice(0, FRAME_SIZE);
                    extractFeatures(frame);
                }
            }

            buffer = buffer.concat(_chunk);
            
            //if we're long enough, splice the frame, and extract features on it
            if (buffer.length >= FRAME_SIZE) {
                extractFeatures(buffer.splice(0, FRAME_SIZE));
            }
        },
        function(data) {
        //check if there's still something left in our buffer
        if (buffer.length) {
            //zero pad the buffer at the end so we get a full frame (needed for successful spectral analysis)
            for (let i = buffer.length; i < FRAME_SIZE; i++) {
                buffer.push(0);
            }
            //extract features for zero-padded frame
            extractFeatures(buffer);
            finishedCallback();
        }
    }
    );
    
    wl.open(file);
}

module.exports = output;
