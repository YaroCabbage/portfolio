'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
/*!
This code is © Copyright Stephen C. Phillips, 2018.
Email: steve@scphillips.com
*/

/*
Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at: https://joinup.ec.europa.eu/community/eupl/
Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and limitations under the Licence.
*/


var _morseProWpm = require('./morse-pro-wpm');

var WPM = _interopRequireWildcard(_morseProWpm);

var _morseProDecoder = require('./morse-pro-decoder');

var _morseProDecoder2 = _interopRequireDefault(_morseProDecoder);

var _morseProPlayerWaa = require('./morse-pro-player-waa');

var _morseProPlayerWaa2 = _interopRequireDefault(_morseProPlayerWaa);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj.default = obj;
    return newObj;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
/**
 * The Morse keyer tests for input on a timer, plays the appropriate tone and passes the data to a decoder.
 *
 * @example
 * var ditKey = 90;  // Z
 * var dahKey = 88;  // X
 * window.onkeyup = function(e) {
 *     if (e.keyCode === ditKey) { dit = false; }
 *     if (e.keyCode === dahKey) { dah = false; }
 * };
 * window.onkeydown = function(e) {
 *     var wasMiddle = !dit & !dah;
 *     if (e.keyCode === ditKey) { dit = true; }
 *     if (e.keyCode === dahKey) { dah = true; }
 *     if (wasMiddle & (dit | dah)) { keyer.start(); }
 * };
 * var keyCallback = function() {
 *     return ((dit === true) * 1) + ((dah === true) * 2);
 * };
 * var messageCallback = function(d) {
 *     console.log(d.message);
 * };
 * keyer = new MorseKeyer(keyCallback, 20, 20, 550, messageCallback);
 */


var MorseKeyer = function () {
  /**
   * @param {function(): number} keyCallback - A function which should return 0, 1, 2, or 3 from the vitual "paddle" depending if nothing, a dit, a dah or both is detected. This implementation will play dits if both keys are detected.
   * @param {number} [wpm=20] - Speed of the keyer.
   * @param {number} [fwpm=wpm] - Farnsworth speed of the keyer.
   * @param {number} [frequency=550] - The frequency in Hz for the sidetone.
   * @param {function()} messageCallback - A function called with {message: string, timings: number[], morse: string} for each decoded part (see MorseDecoder). Its use here will result in a single character being returned each time.
   */
  function MorseKeyer(keyCallback) {
    var wpm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
    var fwpm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : wpm;
    var frequency = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 550;
    var messageCallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;

    _classCallCheck(this, MorseKeyer);

    this.keyCallback = keyCallback;
    this.wpm = wpm;
    this.fwpm = fwpm;
    this.player = new _morseProPlayerWaa2.default();
    this.player.frequency = frequency;
    this.decoder = new _morseProDecoder2.default(this.wpm, this.fwpm, messageCallback);
    this.decoder.noiseThreshold = 0;
    this.ditLen = WPM.ditLength(wpm); // duration of dit in ms

    this.fditLen = WPM.fditLength(wpm, fwpm); // TODO: finish fwpm bit

    this._state = {
      playing: false
    };
  }
  /**
   * @access: private
   */


  _createClass(MorseKeyer, [{
    key: '_check',
    value: function _check() {
      var key = this.keyCallback();

      var ditOrDah = this._ditOrDah(key);

      var beepLen; // length of beep

      var silenceLen; // length of silence

      var now = new Date().getTime();

      if (this._state.lastTime !== undefined) {
        this.decoder.addTiming(this._state.lastTime - now); // add how long since we've last been here as silence
      }

      if (ditOrDah === undefined) {
        // If no keypress is detected then continue pushing chunks of silence to the decoder to complete the character and add a space
        beepLen = 0;
        this._state.playing = false; // make it interupterable: means that a new char can start whenever

        switch (this._state.spaceCounter) {
          case 0:
            // we've already waited 1 ditLen, need to make it 1 fditLen plus 2 more
            silenceLen = this.fditLen - this.ditLen + 2 * this.fditLen;
            break;

          case 1:
            silenceLen = 4 * this.fditLen;
            break;

          case 2:
            silenceLen = 0;
            this.stop();
            break;
        }

        this._state.spaceCounter++;
      } else {
        this._state.spaceCounter = 0;
        beepLen = (ditOrDah ? 1 : 3) * this.ditLen;

        this._playTone(beepLen);

        this.decoder.addTiming(beepLen);
        silenceLen = this.ditLen; // while playing, assume we are inside a char and so wait 1 ditLen
      }

      this._state.lastTime = now + beepLen;
      if (beepLen + silenceLen) this.timer = setTimeout(this._check.bind(this), beepLen + silenceLen); // check key state again after the dit or dah and after a dit-space
    }
    /**
     * Translate key input into whether to play nothing, dit, or dah
     * @returns undefined, true or false for nothing, dit or dah
     * @access: private
     */

  }, {
    key: '_ditOrDah',
    value: function _ditOrDah(input) {
      if (input & 1) {
        return true;
      } else if (input === 2) {
        return false;
      } else {
        return undefined;
      }
    }
    /**
     * Call this method when an initial key-press (or equivalent) is detected.
     */

  }, {
    key: 'start',
    value: function start() {
      if (this._state.playing) {
        // If the keyer is already playing then ignore a new start.
        return;
      } else {
        this._state.playing = true;
        this._state.spaceCounter = 0;
        this._state.lastTime = undefined; // removes extended pauses

        clearTimeout(this.timer);

        this._check();
      }
    }
    /**
     * This method can be called externally to stop the keyer but is also used internally when no key-press is detected.
     */

  }, {
    key: 'stop',
    value: function stop() {
      this._state.playing = false;
      clearTimeout(this.timer);
    }
    /**
     * Play a dit or dah sidetone.
     * @param {number} duration - number of milliseconds to play
     * @access: private
     */

  }, {
    key: '_playTone',
    value: function _playTone(duration) {
      this.player.load([duration]);
      this.player.playFromStart();
    }
  }]);

  return MorseKeyer;
}();

exports.default = MorseKeyer;