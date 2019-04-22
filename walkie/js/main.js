var bfsk = require('binary-fsk');
var speaker = require('audio-speaker');

var microphone = require('mic-stream');

var opts = {
    mark: 884,
    space: 324,
    baud: 5,
    sampleRate: 8000,
    samplesPerFrame: 320
}

var encode = fsk.createEncodeStream(opts);
var decode = fsk.createDecodeStream(opts);

// pipe to your speaker
encode
    .pipe(speaker());

// receive sound from your speaker and decode it back to text to print out
microphone()
    .pipe(decode)
    .pipe(process.stdout);

// write a message!
e.end('heya!');