(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    "use strict";

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

    var _morseProCw = require("./morse-pro-cw");

    var _morseProCw2 = _interopRequireDefault(_morseProCw);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
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

    /**
     * Class to create sine-wave samples of standard CW Morse.
     *
     * @example
     * import MorseCWWave from 'morse-pro-cw-wave';
     * var morseCWWave = new MorseCWWave();
     * morseCWWave.translate("abc");
     * var sample = morseCWWave.getSample();
     */


    var MorseCWWave = function (_MorseCW) {
      _inherits(MorseCWWave, _MorseCW);
      /**
       * @param {number} [frequency=550] - frequency of wave in Hz
       * @param {number} [sampleRate=8000] - sample rate for the waveform in Hz
       */


      function MorseCWWave(useProsigns, wpm, fwpm) {
        var frequency = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 550;
        var sampleRate = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 8000;

        _classCallCheck(this, MorseCWWave);
        /** @type {number} */


        var _this = _possibleConstructorReturn(this, (MorseCWWave.__proto__ || Object.getPrototypeOf(MorseCWWave)).call(this, useProsigns, wpm, fwpm));

        _this.frequency = frequency; // frequency of wave in Hz

        /** @type {number} */

        _this.sampleRate = sampleRate; // sample rate for the waveform in Hz

        return _this;
      }
      /**
       * Get a sample waveform, not using Web Audio API (synchronous).
       * @param {number} [endPadding=0] - how much silence in ms to add to the end of the waveform.
       * @return {number[]} an array of floats in range [-1, 1] representing the wave-form.
       */


      _createClass(MorseCWWave, [{
        key: "getSample",
        value: function getSample() {
          var endPadding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          return MorseCWWave.getSampleGeneral(this.getTimings(), this.frequency, this.sampleRate, endPadding);
        }
        /**
         * Get a sample waveform, not using Web Audio API (synchronous).
         * @param {number[]} timings - millisecond timings, +ve numbers representing sound, -ve for no sound (+ve/-ve can be in any order)
         * @param {number} frequency - frequency of sound in Hz.
         * @param {number} sampleRate - sample rate in Hz.
         * @param {number} [endPadding=0] - how much silence in ms to add to the end of the waveform.
         * @return {number[]} an array of floats in range [-1, 1] representing the wave-form.
         */

      }, {
        key: "getWAASample",

        /**
         * Get a sample waveform using Web Audio API (asynchronous).
         * @param {number} [endPadding=0] - how much silence in ms to add to the end of the waveform.
         * @return {Promise(number[])} a Promise resolving to an array of floats in range [-1, 1] representing the wave-form.
         */
        value: function getWAASample() {
          var endPadding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0; // add minimum of 5ms silence to the end to ensure the filtered signal can finish cleanly

          endPadding = Math.max(5, endPadding);
          var timings = this.getTimings();
          timings.push(-endPadding);
          var offlineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;

          if (offlineAudioContextClass === undefined) {
            throw new Error("No OfflineAudioContext class defined");
          } // buffer length is the Morse duration + 5ms to let the lowpass filter end cleanly


          var offlineCtx = new offlineAudioContextClass(1, this.sampleRate * (this.getDuration() + endPadding) / 1000, this.sampleRate);
          var gainNode = offlineCtx.createGain(); // empirically, the lowpass filter outputs waveform of magnitude 1.23, so need to scale it down to avoid clipping

          gainNode.gain.setValueAtTime(0.813, 0);
          var lowPassNode = offlineCtx.createBiquadFilter();
          lowPassNode.type = "lowpass";
          lowPassNode.frequency.setValueAtTime(this.frequency * 1.1, 0); // TODO: remove this magic number and make the filter configurable?

          gainNode.connect(lowPassNode);
          lowPassNode.connect(offlineCtx.destination);
          var t = 0;
          var oscillator;
          var duration;

          for (var i = 0; i < timings.length; i++) {
            duration = Math.abs(timings[i]) / 1000;

            if (timings[i] > 0) {
              // -ve timings are silence
              oscillator = offlineCtx.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(this.frequency, t);
              oscillator.start(t);
              oscillator.stop(t + duration);
              oscillator.connect(gainNode);
            }

            t += duration;
          }

          return offlineCtx.startRendering().then(function (renderedBuffer) {
            return renderedBuffer.getChannelData(0);
          });
        }
      }], [{
        key: "getSampleGeneral",
        value: function getSampleGeneral(timings, frequency, sampleRate) {
          var endPadding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
          var sample = [];

          if (timings.length === 0) {
            return [];
          } // add minimum of 5ms silence to the end to ensure the filtered signal can finish cleanly


          timings.push(-Math.max(5, endPadding));
          /*
          Compute lowpass biquad filter coefficients using method from Chromium
      */
          // set lowpass frequency cutoff to 1.5 x wave frequency

          var lowpassFreq = frequency * 1.5 / sampleRate;
          var q = Math.SQRT1_2;
          var sin = Math.sin(2 * Math.PI * lowpassFreq);
          var cos = Math.cos(2 * Math.PI * lowpassFreq);
          var alpha = sin / (2 * Math.pow(10, q / 20));
          var a0 = 1 + alpha;
          var b0 = (1 - cos) * 0.5 / a0;
          var b1 = (1 - cos) / a0;
          var b2 = (1 - cos) * 0.5 / a0;
          var a1 = -2 * cos / a0;
          var a2 = (1 - alpha) / a0;
          /*
          Compute filtered signal
      */

          var step = Math.PI * 2 * frequency / sampleRate;
          var on = timings[0] > 0 ? 1 : 0;
          var x0,
              x1 = 0,
              x2 = 0;
          var y0,
              y1 = 0,
              y2 = 0;
          var gain = 0.813; // empirically, the lowpass filter outputs waveform of magnitude 1.23, so need to scale it down to avoid clipping

          for (var t = 0; t < timings.length; t += 1) {
            var duration = sampleRate * Math.abs(timings[t]) / 1000;

            for (var i = 0; i < duration; i += 1) {
              x0 = on * Math.sin(i * step); // the input signal

              y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
              sample.push(y0 * gain);
              x2 = x1;
              x1 = x0;
              y2 = y1;
              y1 = y0;
            }

            on = 1 - on;
          }

          return sample;
        }
      }]);

      return MorseCWWave;
    }(_morseProCw2.default);

    exports.default = MorseCWWave;
  },{"./morse-pro-cw":2}],2:[function(require,module,exports){
    'use strict';

    require("core-js/modules/es6.regexp.replace");

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

    var _morseProWpm = require('./morse-pro-wpm');

    var WPM = _interopRequireWildcard(_morseProWpm);

    var _morseProMessage = require('./morse-pro-message');

    var _morseProMessage2 = _interopRequireDefault(_morseProMessage);

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

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
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

    /**
     * Class to create the on/off timings needed by e.g. sound generators. Timings are in milliseconds; "off" timings are negative.
     *
     * @example
     * import MorseCW from 'morse-pro-cw';
     * var morseCW = new MorseCW();
     * morseCW.translate("abc");
     * var timings = morseCW.getTimings();
     */


    var MorseCW = function (_MorseMessage) {
      _inherits(MorseCW, _MorseMessage);
      /**
       * @param {boolean} [prosigns=true] - whether or not to include prosigns in the translations
       * @param {number} [wpm=20] - the speed in words per minute using PARIS as the standard word
       * @param {number} [fwpm=wpm] - the Farnsworth speed in words per minute (defaults to wpm)
       */


      function MorseCW() {
        var useProsigns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var wpm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
        var fwpm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : wpm;

        _classCallCheck(this, MorseCW);
        /** @type {number} */


        var _this = _possibleConstructorReturn(this, (MorseCW.__proto__ || Object.getPrototypeOf(MorseCW)).call(this, useProsigns));

        _this.wpm = wpm;
        /** @type {number} */

        _this.fwpm = fwpm;
        return _this;
      }
      /**
       * Set the WPM speed. Ensures that Farnsworth WPM is no faster than WPM.
       * @type {number} */


      _createClass(MorseCW, [{
        key: 'getTimings',

        /**
         * Return an array of millisecond timings.
         * With the Farnsworth method, the morse characters are played at one
         * speed and the spaces between characters at a slower speed.
         * @return {number[]}
         */
        value: function getTimings() {
          return MorseCW.getTimingsGeneral(WPM.ditLength(this._wpm), WPM.dahLength(this._wpm), WPM.ditSpace(this._wpm), WPM.charSpace(this._wpm, this._fwpm), WPM.wordSpace(this._wpm, this._fwpm), this.morse);
        }
        /**
         * Return an array of millisecond timings.
         * Each sound and space has a duration. The durations of the spaces are distinguished by being negative.
         * @param {number} dit - the length of a dit in milliseconds
         * @param {number} dah - the length of a dah in milliseconds (normally 3 * dit)
         * @param {number} ditSpace - the length of an intra-character space in milliseconds (1 * dit)
         * @param {number} charSpace - the length of an inter-character space in milliseconds (normally 3 * dit)
         * @param {number} wordSpace - the length of an inter-word space in milliseconds (normally 7 * dit)
         * @param {string} morse - the (canonical) morse code string (matching [.-/ ]*)
         * @return {number[]}
         */

      }, {
        key: 'getDuration',

        /**
         * Get the total duration of the message in ms
         8 @return {number}
         */
        value: function getDuration() {
          var times = this.getTimings();
          var t = 0;

          for (var i = 0; i < times.length; i++) {
            t += Math.abs(times[i]);
          }

          return t;
        }
      }, {
        key: 'wpm',
        set: function set(wpm) {
          this._wpm = wpm;

          if (wpm < this._fwpm) {
            this._fwpm = wpm;
          }
        }
        /** @type {number} */
        ,
        get: function get() {
          return this._wpm;
        }
        /**
         * Set the Farnsworth WPM speed. Ensures that WPM is no slower than Farnsworth WPM.
         *  @type {number} */

      }, {
        key: 'fwpm',
        set: function set(fwpm) {
          this._fwpm = fwpm;

          if (fwpm > this._wpm) {
            this._wpm = fwpm;
          }
        }
        /** @type {number} */
        ,
        get: function get() {
          return this._fwpm;
        }
        /**
         * Get the length of the space between words in ms.
         * @type {number} */

      }, {
        key: 'wordSpace',
        get: function get() {
          return WPM.wordSpace(this._wpm, this._fwpm);
        }
      }], [{
        key: 'getTimingsGeneral',
        value: function getTimingsGeneral(dit, dah, ditSpace, charSpace, wordSpace, morse) {
          //console.log("Morse: " + morse);
          morse = morse.replace(/ \/ /g, '/'); // this means that a space is only used for inter-character

          morse = morse.replace(/([\.\-])(?=[\.\-])/g, "$1+"); // put a + in between all dits and dahs

          var times = [];

          for (var i = 0; i < morse.length; i++) {
            switch (morse[i]) {
              case '.':
                times.push(dit);
                break;

              case '-':
                times.push(dah);
                break;

              case '+':
                times.push(-ditSpace);
                break;

              case " ":
                times.push(-charSpace);
                break;

              case "/":
                times.push(-wordSpace);
                break;
            }
          } //console.log("Timings: " + times);


          return times;
        }
      }]);

      return MorseCW;
    }(_morseProMessage2.default);

    exports.default = MorseCW;
  },{"./morse-pro-message":7,"./morse-pro-wpm":9,"core-js/modules/es6.regexp.replace":48}],3:[function(require,module,exports){
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

    var _get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var _morseProWpm = require('./morse-pro-wpm');

    var WPM = _interopRequireWildcard(_morseProWpm);

    var _morseProDecoder = require('./morse-pro-decoder');

    var _morseProDecoder2 = _interopRequireDefault(_morseProDecoder);

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

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
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

    /**
     * Class to convert from timings to Morse code. Adapts to changing speed.
     *
     * @example
     * var messageCallback = function(data) {
     *     console.log(data);
     * };
     * var speedCallback = function(s) {
     *     console.log('Speed is now: ' + s.wpm + ' WPM');
     * };
     * var decoder = new MorseAdaptiveDecoder(10);
     * decoder.messageCallback = messageCallback;
     * decoder.speedCallback = speedCallback;
     * var t;
     * while (decoder_is_operating) {
     *     // get some timing "t" from a sensor, make it +ve for noise and -ve for silence
     *     decoder.addTiming(t);
     * }
     * decoder.flush();  // make sure all the data is pushed through the decoder
     */


    var MorseAdaptiveDecoder = function (_MorseDecoder) {
      _inherits(MorseAdaptiveDecoder, _MorseDecoder);
      /**
       * @param {number} [bufferSize=30] - Size of the buffer to average over
       */


      function MorseAdaptiveDecoder(wpm, fwpm) {
        var bufferSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
        var messageCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
        var speedCallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;

        _classCallCheck(this, MorseAdaptiveDecoder);

        var _this = _possibleConstructorReturn(this, (MorseAdaptiveDecoder.__proto__ || Object.getPrototypeOf(MorseAdaptiveDecoder)).call(this, wpm, fwpm, messageCallback, speedCallback));

        _this.bufferSize = bufferSize;
        _this.ditLengths = [];
        _this.fditLengths = [];
        _this.lockSpeed = false;
        return _this;
      }
      /**
       * @override
       * @access private
       */


      _createClass(MorseAdaptiveDecoder, [{
        key: 'addDecode',
        value: function addDecode(duration, character) {
          _get(MorseAdaptiveDecoder.prototype.__proto__ || Object.getPrototypeOf(MorseAdaptiveDecoder.prototype), 'addDecode', this).call(this, duration, character); // adapt!


          var dit;
          var fdit;

          switch (character) {
            case '.':
              dit = duration;
              break;

            case '-':
              dit = duration / 3;
              break;

            case '':
              dit = duration;
              break;

            case ' ':
              fdit = duration / 3;
              break;
              // enable this if the decoder can be made to ignore extra long pauses
              // case '/':
              //     fdit = duration / 7;
              //     break;
          }

          this.ditLengths.push(dit);
          this.fditLengths.push(fdit);
          this.ditLengths = this.ditLengths.slice(-this.bufferSize);
          this.fditLengths = this.fditLengths.slice(-this.bufferSize);

          if (this.lockSpeed) {
            return;
          }

          var sum = 0;
          var denom = 0;
          var fSum = 0;
          var fDenom = 0;
          var weight;

          for (var i = 0; i < this.bufferSize; i++) {
            // weight = Math.exp(-this.bufferSize + 1 + i);  // exponential weighting
            weight = i + 1; // linear weighting
            // weight = 1;  // constant weighting

            if (this.ditLengths[i] !== undefined) {
              sum += this.ditLengths[i] * weight;
              denom += weight;
            }

            if (this.fditLengths[i] !== undefined) {
              fSum += this.fditLengths[i] * weight;
              fDenom += weight;
            }
          }

          if (fDenom) {
            this.fditLen = fSum / fDenom;
          }

          if (denom) {
            this.ditLen = sum / denom;
          }

          this.speedCallback({
            wpm: this.wpm,
            fwpm: this.fwpm
          });
        }
      }]);

      return MorseAdaptiveDecoder;
    }(_morseProDecoder2.default);

    exports.default = MorseAdaptiveDecoder;
  },{"./morse-pro-decoder":4,"./morse-pro-wpm":9}],4:[function(require,module,exports){
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
    /*
This code is © Copyright Stephen C. Phillips, 2018.
Email: steve@scphillips.com

Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at: https://joinup.ec.europa.eu/community/eupl/
Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and limitations under the Licence.
*/


    var _morsePro = require('./morse-pro');

    var Morse = _interopRequireWildcard(_morsePro);

    var _morseProWpm = require('./morse-pro-wpm');

    var WPM = _interopRequireWildcard(_morseProWpm);

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
     * Class to convert from timings to Morse code.
     *
     * @example
     * // The messageCallback is called when a character or more is decoded
     * // It receives a dictionary of the timings, morse, and the message
     * var messageCallback = function(data) {
     *     console.log("Decoded: {\n  timings: " + data.timings + "\n  morse: " + data.morse + "\n  message: " + data.message + "\n}");
     * }
     * var decoder = new MorseDecoder(10);
     * decoder.messageCallback = messageCallback;
     * var t;
     * while (decoder_is_operating) {
     *     // get some timing "t" from a sensor, make it +ve for noise and -ve for silence
     *     decoder.addTiming(t);
     * }
     * decoder.flush();  // make sure all the data is pushed through the decoder
     */


    var MorseDecoder = function () {
      /**
       * @param {number} [wpm=20] - The speed of the Morse in words per minute.
       * @param {number} [fwpm=wpm] - The Farnsworth speed of the Morse in words per minute.
       * @param {function()} messageCallback - Callback executed with {message: string, timings: number[], morse: string} when decoder buffer is flushed (every character).
       * @param {function()} speedCallback - Callback executed with {wpm: number, fwpm: number} if the wpm or fwpm speed changes. The speed in this class doesn't change by itself, but e.g. the fwpm can change if wpm is changed. Returned dictionary has keys 'fwpm' and 'wpm'.
       */
      function MorseDecoder() {
        var wpm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;
        var fwpm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : wpm;
        var messageCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
        var speedCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

        _classCallCheck(this, MorseDecoder);

        this._wpm = undefined;
        this._fwpm = undefined; // farnsworth speed

        this._ditLen = undefined;
        this._fditLen = undefined;
        this.defaults = {
          wpm: 20,
          fwpm: 20
        };
        this.wpm = wpm;
        this.fwpm = fwpm;
        if (messageCallback !== undefined) this.messageCallback = messageCallback;
        if (speedCallback !== undefined) this.speedCallback = speedCallback; // function receives dictionary with wpm and fwpm set when the speed changes

        this.timings = []; // all the ms timings received, all +ve

        this.characters = []; // all the decoded characters ('.', '-', etc)

        this.unusedTimes = [];
        this.noiseThreshold = 1; // a duration <= noiseThreshold is assumed to be an error

        this.morse = ""; // string of morse

        this.message = ""; // string of decoded message
      }
      /**
       * @access private
       */


      _createClass(MorseDecoder, [{
        key: 'updateThresholds',
        value: function updateThresholds() {
          this._ditDahThreshold = (1 * this._ditLen + 3 * this._ditLen) / 2;
          this._dahSpaceThreshold = (3 * this._fditLen + 7 * this._fditLen) / 2;
        }
        /**
         * Should be set to the WPM speed of the input sound.
         * The input data is validated and this.defaults.wpm will be used if there is an error in input.
         * The private _fwpm, _ditLen and _fditLen variables are also updated and the speedCallback is executed.
         * @param {number} wpm - Speed in words per minute.
         */

      }, {
        key: 'addTiming',

        /**
         * Add a timing in ms to the list of recorded timings.
         * The duration should be positive for a dit or dah and negative for a space.
         * If the duration is <= noiseThreshold it is assumed to be noise and is added to the previous duration.
         * If a duration is the same sign as the previous one then they are combined.
         * @param {number} duration - millisecond duration to add, positive for a dit or dah, negative for a space
         */
        value: function addTiming(duration) {
          // console.log("Received: " + duration);
          if (duration === 0) {
            return;
          }

          if (this.unusedTimes.length > 0) {
            var last = this.unusedTimes[this.unusedTimes.length - 1];

            if (duration * last > 0) {
              // if the sign of the duration is the same as the previous one then add it on
              this.unusedTimes.pop();
              duration = last + duration;
            } else if (Math.abs(duration) <= this.noiseThreshold) {
              // if the duration is very short, assume it is a mistake and add it to the previous one
              this.unusedTimes.pop();
              duration = last - duration; // take care of the sign change
            }
          }

          this.unusedTimes.push(duration); // If we have just received a character space or longer then flush the timings

          if (-duration >= this._ditDahThreshold) {
            // TODO: if fwpm != wpm then the ditDahThreshold only applies to sound, not spaces so this is slightly wrong (need another threshold)
            this.flush();
          }
        }
        /**
         * Process the buffer of unused timings, converting them into Morse and converting the generated Morse into a message.
         * Should be called only when a character space has been reached (or the message is at an end).
         * Will call the messageCallback with the latest timings, morse (dots and dashes) and message.
         */

      }, {
        key: 'flush',
        value: function flush() {
          // Then we've reached the end of a character or word or a flush has been forced
          // If the last character decoded was a space then just ignore additional quiet
          if (this.message[this.message.length - 1] === ' ') {
            if (this.unusedTimes[0] < 0) {
              this.unusedTimes.shift();
            }
          } // Make sure there is (still) something to decode


          if (this.unusedTimes.length === 0) {
            return;
          } // If last element is quiet but it is not enough for a space character then pop it off and replace afterwards


          var last = this.unusedTimes[this.unusedTimes.length - 1];

          if (last < 0 && -last < this._dahSpaceThreshold) {
            this.unusedTimes.pop();
          }

          var u = this.unusedTimes;
          var m = this.timings2morse(this.unusedTimes);
          var t = Morse.morse2text(m).message; // will be '#' if there's an error

          this.morse += m;
          this.message += t;

          if (last < 0) {
            this.unusedTimes = [last]; // put the space back on the end in case there is more quiet to come
          } else {
            this.unusedTimes = [];
          }

          this.messageCallback({
            timings: u,
            morse: m,
            message: t
          });
        }
        /**
         * Convert from millisecond timings to dots and dashes.
         * @param {number[]} times - array of millisecond timings, +ve numbers representing a signal, -ve representing a space.
         * @return {string} - the dots and dashes as a string.
         * @access private
         */

      }, {
        key: 'timings2morse',
        value: function timings2morse(times) {
          var ditdah = "";
          var c;
          var d;

          for (var i = 0; i < times.length; i++) {
            d = times[i];

            if (d > 0) {
              if (d < this._ditDahThreshold) {
                c = ".";
              } else {
                c = "-";
              }
            } else {
              d = -d;

              if (d < this._ditDahThreshold) {
                c = "";
              } else if (d < this._dahSpaceThreshold) {
                c = " ";
              } else {
                c = "/";
              }
            }

            this.addDecode(d, c);
            ditdah = ditdah + c;
          }

          return ditdah;
        }
        /**
         * Store the timing and the corresponding decoded character element.
         * @param {number} duration - the millisecond duration (always +ve).
         * @param {string} character - the corresponding character element [.-/ ].
         * @access private
         */

      }, {
        key: 'addDecode',
        value: function addDecode(duration, character) {
          this.timings.push(duration);
          this.characters.push(character);
        }
        /**
         * @access private
         */

      }, {
        key: 'getTimings',
        value: function getTimings(character) {
          var ret = [];

          for (var i = 0; i < this.timings.length; i++) {
            if (this.characters[i] === character) {
              ret.push(this.timings[i]);
            }
          }

          return ret;
        }
        /**
         * Get the millisecond timings of all durations determined to be dits
         * @return {number[]}
         */

      }, {
        key: 'messageCallback',
        value: function messageCallback(jsonData) {}
      }, {
        key: 'speedCallback',
        value: function speedCallback(jsonData) {}
      }, {
        key: 'wpm',
        set: function set(wpm) {
          if (isNaN(wpm)) wpm = this.defaults.wpm;
          wpm = Math.max(wpm, 1);
          this._wpm = wpm;

          if (this._fwpm === undefined || this._fwpm > wpm) {
            this._fwpm = this._wpm;
          }

          this._ditLen = WPM.ditLength(this._wpm);
          this._fditLen = WPM.fditLength(this._wpm, this._fwpm);
          this.updateThresholds();
          this.speedCallback({
            wpm: this.wpm,
            fwpm: this.fwpm
          });
        },
        get: function get() {
          return this._wpm;
        }
        /**
         * Should be set to the Farnsworth WPM speed of the input sound.
         * The input data is validated and this.defaults.fwpm will be used if there is an error in input.
         * The private _wpm, _ditLen and _fditLen variables are also updated and the speedCallback is executed.
         * @param {number} fwpm - Speed in words per minute.
         */

      }, {
        key: 'fwpm',
        set: function set(fwpm) {
          if (isNaN(fwpm)) fwpm = this.defaults.fwpm;
          fwpm = Math.max(fwpm, 1);
          this._fwpm = fwpm;

          if (this._wpm === undefined || this._wpm < fwpm) {
            this.wpm = fwpm;
          }

          this._ditLen = WPM.ditLength(this._wpm);
          this._fditLen = WPM.fditLength(this._wpm, this._fwpm);
          this.updateThresholds();
          this.speedCallback({
            wpm: this.wpm,
            fwpm: this.fwpm
          });
        },
        get: function get() {
          return this._fwpm;
        }
        /**
         * Set the length of a dit the decoder will look for.
         * The private _wpm, _fwpm, and _fditLen variables are also updated.
         * @param {number} dit - Length of a dit in ms.
         */

      }, {
        key: 'ditLen',
        set: function set(dit) {
          this._ditLen = dit;

          if (this._fditLen === undefined || this._fditLen < this._ditLen) {
            this._fditLen = this._ditLen;
          }

          this._wpm = WPM.wpm(this._ditLen);
          this._fwpm = WPM.fwpm(this._wpm, this._fditLen / this._ditLen);
          this.updateThresholds();
        },
        get: function get() {
          return this._ditLen;
        }
        /**
         * Set the length of a Farnsworth dit the decoder will look for.
         * The private _wpm, _fwpm, and _ditLen variables are also updated.
         * @param {number} dit - Length of a Farnsworth dit in ms.
         */

      }, {
        key: 'fditLen',
        set: function set(fdit) {
          this._fditLen = fdit;

          if (this._ditLen === undefined || this._ditLen > this._fditLen) {
            this._ditLen = this._fditLen;
          }

          this._wpm = WPM.wpm(this._ditLen);
          this._fwpm = WPM.fwpm(this._wpm, this._fditLen / this._ditLen);
          this.updateThresholds();
        },
        get: function get() {
          return this._fditLen;
        }
      }, {
        key: 'dits',
        get: function get() {
          return this.getTimings('.');
        }
        /**
         * Get the millisecond timings of all durations determined to be dahs
         * @return {number[]}
         */

      }, {
        key: 'dahs',
        get: function get() {
          return this.getTimings('-');
        }
        /**
         * Get the millisecond timings of all durations determined to be dit-spaces
         * @return {number[]}
         */

      }, {
        key: 'ditSpaces',
        get: function get() {
          return this.getTimings('');
        }
        /**
         * Get the millisecond timings of all durations determined to be dah-spaces
         * @return {number[]}
         */

      }, {
        key: 'dahSpaces',
        get: function get() {
          return this.getTimings(' ');
        }
        /**
         * Get the millisecond timings of all durations determined to be spaces
         * @return {number[]}
         */

      }, {
        key: 'spaces',
        get: function get() {
          return this.getTimings('/');
        }
      }]);

      return MorseDecoder;
    }();

    exports.default = MorseDecoder;
  },{"./morse-pro":10,"./morse-pro-wpm":9}],5:[function(require,module,exports){
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

    var _get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var _morseProListener = require('./morse-pro-listener');

    var _morseProListener2 = _interopRequireDefault(_morseProListener);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
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

    /**
     * Extension of the MorseListener class which automatically adapts to the dominant frequency.
     */


    var MorseAdaptiveListener = function (_MorseListener) {
      _inherits(MorseAdaptiveListener, _MorseListener);
      /**
       * Parameters are all the same as the MorseListener class with the addition of the bufferDuration.
       * @param {number} [bufferDuration=500] - How long in ms to look back to find the frequency with the maximum volume.
       */


      function MorseAdaptiveListener(fftSize, volumeMin, volumeMax, frequencyMin, frequencyMax, volumeThreshold, decoder) {
        var bufferDuration = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 500;
        var spectrogramCallback = arguments[8];
        var frequencyFilterCallback = arguments[9];
        var volumeFilterCallback = arguments[10];
        var volumeThresholdCallback = arguments[11];
        var micSuccessCallback = arguments[12];
        var micErrorCallback = arguments[13];
        var fileLoadCallback = arguments[14];
        var fileErrorCallback = arguments[15];
        var EOFCallback = arguments[16];

        _classCallCheck(this, MorseAdaptiveListener);

        var _this = _possibleConstructorReturn(this, (MorseAdaptiveListener.__proto__ || Object.getPrototypeOf(MorseAdaptiveListener)).call(this, fftSize, volumeMin, volumeMax, frequencyMin, frequencyMax, volumeThreshold, decoder, spectrogramCallback, frequencyFilterCallback, volumeFilterCallback, volumeThresholdCallback, micSuccessCallback, micErrorCallback, fileLoadCallback, fileErrorCallback, EOFCallback));

        _this.bufferSize = Math.floor(bufferDuration / _this.timeStep);
        _this.bufferIndex = 0;
        _this.buffer = [];

        for (var i = 0; i < _this.bufferSize; i++) {
          _this.buffer[i] = new Uint8Array(_this.freqBins);
        }

        _this.averageVolume = new Uint32Array(_this.freqBins);
        _this.lockFrequency = false;
        return _this;
      }
      /**
       * @access: private
       */


      _createClass(MorseAdaptiveListener, [{
        key: 'processSound',
        value: function processSound() {
          _get(MorseAdaptiveListener.prototype.__proto__ || Object.getPrototypeOf(MorseAdaptiveListener.prototype), 'processSound', this).call(this);

          var sum = this.frequencyData.reduce(function (a, b) {
            return a + b;
          });
          sum -= this.frequencyData[0]; // remove DC component

          if (sum) {
            var max = 0;
            var maxIndex = 0; // loop over all frequencies, ignoring DC

            for (var i = 1; i < this.freqBins; i++) {
              this.averageVolume[i] = this.averageVolume[i] + this.frequencyData[i] - this.buffer[this.bufferIndex][i];
              this.buffer[this.bufferIndex][i] = this.frequencyData[i];

              if (this.averageVolume[i] > max) {
                maxIndex = i;
                max = this.averageVolume[i];
              }
            }

            this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;

            if (!this.lockFrequency) {
              this.frequencyFilter = maxIndex * this.freqStep;
            }
          }
        }
      }]);

      return MorseAdaptiveListener;
    }(_morseProListener2.default);

    exports.default = MorseAdaptiveListener;
  },{"./morse-pro-listener":6}],6:[function(require,module,exports){
    "use strict";

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

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
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

    /**
     * A class to 'listen' for Morse code from the microphone or an audio file, filter the sound and pass timings to a decoder to convert to text.
     */


    var MorseListener = function () {
      /**
       * @param {number} fftSize - Size of the discrete Fourier transform to use. Must be a power of 2 >= 256 (defaults to 256). A smaller fftSize gives better time resolution but worse frequency resolution.
       * @param {number} [volumeFilterMin=-60] - Sound less than this volume (in dB) is ignored.
       * @param {number} [volumeFilterMax=-30] - Sound greater than this volume (in dB) is ignored.
       * @param {number} [frequencyFilterMin=550] - Sound less than this frequency (in Hz) is ignored.
       * @param {number} [frequencyFilterMax=550] - Sound greater than this frequency (in Hz) is ignored.
       * @param {number} [volumeThreshold=220] - If the volume is greater than this then the signal is taken as "on" (part of a dit or dah) (range 0-255).
       * @param {Object} decoder - An instance of a configured decoder class.
       * @param {function()} spectrogramCallback - Called every time fftSize samples are read.
       Called with a dictionary parameter:
       {
              frequencyData: output of the DFT (the real values including DC component)
              frequencyStep: frequency resolution in Hz
              timeStep: time resolution in Hz
              filterBinLow: index of the lowest frequency bin being analysed
              filterBinHigh: index of the highest frequency bin being analysed
              filterRegionVolume: volume in the analysed region
              isOn: whether the analysis detected a signal or not
          }
       * @param {function()} frequencyFilterCallback - Called when the frequency filter parameters change.
       Called with a dictionary parameter:
       {
              min: lowest frequency in Hz
              max: highest frequency in Hz
          }
       The frequencies may well be different to that which is set as they are quantised.
       * @param {function()} volumeFilterCallback - Called when the volume filter parameters change.
       Called with a dictionary parameter:
       {
              min: low volume (in dB)
              max: high volume (in dB)
          }
       If the set volumes are not numeric or out of range then the callback will return in range numbers.
       * @param {function()} volumeThresholdCallback - Called with a single number as the argument when the volume filter threshold changes.
       * @param {function()} micSuccessCallback - Called when the microphone has successfully been connected.
       * @param {function()} micErrorCallback - Called with the error as the argument if there is an error connecting to the microphone.
       * @param {function()} fileLoadCallback - Called with the AudioBuffer object as the argument when a file has successfully been loaded (and decoded).
       * @param {function()} fileErrorCallback - Called with the error as the argument if there is an error in decoding a file.
       * @param {function()} EOFCallback - Called when the playback of a file ends.
       */
      function MorseListener(fftSize, volumeFilterMin, volumeFilterMax, frequencyFilterMin, frequencyFilterMax, volumeThreshold, decoder, spectrogramCallback, frequencyFilterCallback, volumeFilterCallback, volumeThresholdCallback, micSuccessCallback, micErrorCallback, fileLoadCallback, fileErrorCallback, EOFCallback) {
        _classCallCheck(this, MorseListener); // audio input and output


        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        this.audioContext = new window.AudioContext() || new window.webkitAudioContext();
        if (spectrogramCallback !== undefined) this.spectrogramCallback = spectrogramCallback;
        if (frequencyFilterCallback !== undefined) this.frequencyFilterCallback = frequencyFilterCallback;
        if (volumeFilterCallback !== undefined) this.volumeFilterCallback = volumeFilterCallback;
        if (volumeThresholdCallback !== undefined) this.volumeThresholdCallback = volumeThresholdCallback;
        if (micSuccessCallback !== undefined) this.micSuccessCallback = micSuccessCallback;
        if (micErrorCallback !== undefined) this.micErrorCallback = micErrorCallback;
        if (fileLoadCallback !== undefined) this.fileLoadCallback = fileLoadCallback;
        if (fileErrorCallback !== undefined) this.fileErrorCallback = fileErrorCallback;
        if (EOFCallback !== undefined) this.EOFCallback = EOFCallback;
        this.fftSize = fftSize; // basic parameters from the sample rate

        this.sampleRate = this.audioContext.sampleRate; // in Hz, 48000 on Chrome

        this.maxFreq = this.sampleRate / 2; // in Hz; Nyquist theorem

        this.freqBins = this.fftSize / 2;
        this.timeStep = 1000 / (this.sampleRate / this.fftSize); // in ms

        this.freqStep = this.maxFreq / this.freqBins;
        this.initialiseAudioNodes();
        this.defaults = {
          fftSize: 256,
          volumeFilterMin: -60,
          volumeFilterMax: -30,
          frequencyFilterMin: 550,
          frequencyFilterMax: 550,
          volumeThreshold: 200
        };
        this.volumeFilterMin = volumeFilterMin; // in dB

        this.volumeFilterMax = volumeFilterMax;
        this.frequencyFilterMin = frequencyFilterMin; // in Hz

        this.frequencyFilterMax = frequencyFilterMax;
        this.volumeThreshold = volumeThreshold; // in range [0-255]

        this.decoder = decoder;
        this.notStarted = true;
        this.flushTime = 500; // how long to wait before pushing data to the decoder if e.g. you have a very long pause

        this.input = undefined; // current state: undefined, "mic", "file"
      }
      /**
       * Set the minimum threshold on the volume filter. i.e. the minimum volume considered to be a signal.
       * Input validation is done to set a sensible default on non-numeric input and clamp the maximum to be zero.
       * The volumFilterMax property is also set by this to be no less than the minimum.
       * Calls the volumeFilterCallback with the new min and max.
       * @param {number} v - the minimum volume in dB (-ve).
       */


      _createClass(MorseListener, [{
        key: "initialiseAudioNodes",

        /**
         * @access: private
         */
        value: function initialiseAudioNodes() {
          // set up a javascript node (BUFFER_SIZE, NUM_INPUTS, NUM_OUTPUTS)
          this.jsNode = this.audioContext.createScriptProcessor(this.fftSize, 1, 1); // buffer size can be 256, 512, 1024, 2048, 4096, 8192 or 16384
          // set the event handler for when the buffer is full

          this.jsNode.onaudioprocess = this.processSound.bind(this); // set up an analyserNode

          this.analyserNode = this.audioContext.createAnalyser();
          this.analyserNode.smoothingTimeConstant = 0; // no mixing with the previous frame

          this.analyserNode.fftSize = this.fftSize; // can be 32 to 2048 in webkit

          this.frequencyData = new Uint8Array(this.freqBins); // create an arrray of the right size for the frequency data
        }
        /**
         * Start the decoder listening to the microphone.
         * Calls micSuccessCallback or micErrorCallback on success or error.
         */

      }, {
        key: "startListening",
        value: function startListening() {
          this.stop(); // TODO: replace this with navigator.mediaDevices.getUserMedia() instead and shim for legacy browsers (https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

          navigator.getUserMedia({
            audio: true,
            video: false
          }, function (stream) {
            // create an audio node from the stream
            this.sourceNode = this.audioContext.createMediaStreamSource(stream);
            this.input = "mic"; // connect nodes but don't connect mic to audio output to avoid feedback

            this.sourceNode.connect(this.analyserNode);
            this.jsNode.connect(this.audioContext.destination);
            this.micSuccessCallback();
          }.bind(this), function (error) {
            this.input = undefined;
            this.micErrorCallback(error);
          }.bind(this));
        }
        /**
         * Load audio data from an ArrayBuffer. Use a FileReader to load from a file.
         * Calls fileLoadCallback or fileErrorCallback on success or error.
         * @param {ArrayBuffer} arrayBuffer
         */

      }, {
        key: "loadArrayBuffer",
        value: function loadArrayBuffer(arrayBuffer) {
          // by separating loading (decoding) and playing, the playing can be done multiple times
          this.audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
            this.fileAudioBuffer = audioBuffer;
            this.fileLoadCallback(audioBuffer);
          }.bind(this), function (error) {
            this.fileAudioBuffer = undefined;
            this.fileErrorCallback(error);
          }.bind(this));
        }
        /**
         * Play a loaded audio file (through speakers) and decode it.
         * Calls EOFCallback when buffer ends.
         */

      }, {
        key: "playArrayBuffer",
        value: function playArrayBuffer() {
          this.stop(); // make BufferSource node

          this.sourceNode = this.audioContext.createBufferSource();
          this.sourceNode.buffer = this.fileAudioBuffer;

          this.sourceNode.onended = function () {
            this.stop();
            this.EOFCallback();
          }.bind(this); // connect nodes


          this.jsNode.connect(this.audioContext.destination);
          this.sourceNode.connect(this.analyserNode);
          this.sourceNode.connect(this.audioContext.destination);
          this.input = "file"; // play

          this.sourceNode.start();
        }
        /**
         * Stop listening.
         */

      }, {
        key: "stop",
        value: function stop() {
          if (this.input === undefined) {
            return;
          }

          if (this.input === "file") {
            this.sourceNode.stop();
            this.sourceNode.disconnect(this.audioContext.destination);
          }

          this.sourceNode.disconnect(this.analyserNode);
          this.jsNode.disconnect(this.audioContext.destination);
          this.flush();
          this.decoder.flush();
          this.input = undefined;
        }
        /**
         * This ScriptProcessorNode is called when it is full, we then actually look at the data in the analyserNode node to measure the volume in the frequency band of interest. We don't actually use the input or output of the ScriptProcesorNode.
         * @access: private
         */

      }, {
        key: "processSound",
        value: function processSound() {
          // get the data from the analyserNode node and put into frequencyData
          this.analyserNode.getByteFrequencyData(this.frequencyData); // find the average volume in the filter region

          var filterRegionVolume = 0;

          for (var i = this._filterBinLow; i <= this._filterBinHigh; i++) {
            filterRegionVolume += this.frequencyData[i];
          }

          filterRegionVolume /= 1.0 * (this._filterBinHigh - this._filterBinLow + 1); // record the data

          var isOn = filterRegionVolume >= this._volumeThreshold;
          this.recordOnOrOff(isOn);
          this.spectrogramCallback({
            frequencyData: this.frequencyData,
            frequencyStep: this.freqStep,
            timeStep: this.timeStep,
            filterBinLow: this._filterBinLow,
            filterBinHigh: this._filterBinHigh,
            filterRegionVolume: filterRegionVolume,
            isOn: isOn
          });
        }
        /**
         * Called each tick with whether the sound is judged to be on or off. If a change from on to off or off to on is detected then the number of ticks of the segment is passed to the decoder.
         * @access: private
         */

      }, {
        key: "recordOnOrOff",
        value: function recordOnOrOff(soundIsOn) {
          if (this.notStarted) {
            if (!soundIsOn) {
              // wait until we hear something
              return;
            } else {
              this.notStarted = false;
              this.lastSoundWasOn = true;
              this.ticks = 0;
            }
          }

          if (this.lastSoundWasOn === soundIsOn) {
            // accumulating an on or an off
            this.ticks++;

            if (this.ticks * this.timeStep > this.flushTime) {
              // then it's e.g. a very long pause, so flush it through to decoder and keep counting
              this.flush(soundIsOn);
              this.ticks = 0;
            }
          } else {
            // we've just changed from on to off or vice versa
            this.flush(!soundIsOn); // flush the previous segment

            this.lastSoundWasOn = soundIsOn;
            this.ticks = 1; // at this moment we just saw the first tick of the new segment
          }
        }
        /**
         * Flush the current ticks to the decoder. Parameter is whether the ticks represent sound (on) or not.
         */

      }, {
        key: "flush",
        value: function flush() {
          var on = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.lastSoundWasOn;
          this.decoder.addTiming((on ? 1 : -1) * this.ticks * this.timeStep);
        } // empty callbacks to avoid errors

      }, {
        key: "spectrogramCallback",
        value: function spectrogramCallback(jsonData) {}
      }, {
        key: "frequencyFilterCallback",
        value: function frequencyFilterCallback(jsonData) {}
      }, {
        key: "volumeFilterCallback",
        value: function volumeFilterCallback(jsonData) {}
      }, {
        key: "volumeThresholdCallback",
        value: function volumeThresholdCallback(volume) {}
      }, {
        key: "micSuccessCallback",
        value: function micSuccessCallback() {}
      }, {
        key: "micErrorCallback",
        value: function micErrorCallback(error) {}
      }, {
        key: "fileLoadCallback",
        value: function fileLoadCallback(audioBuffer) {}
      }, {
        key: "fileErrorCallback",
        value: function fileErrorCallback(error) {}
      }, {
        key: "EOFCallback",
        value: function EOFCallback() {}
      }, {
        key: "volumeFilterMin",
        set: function set(v) {
          if (isNaN(v)) v = this.defaults.volumeFilterMin; // v is in dB and therefore -ve

          v = Math.min(0, v);
          this.analyserNode.minDecibels = v;
          this.analyserNode.maxDecibels = Math.max(this.analyserNode.maxDecibels, v);
          this.volumeFilterCallback({
            min: this.analyserNode.minDecibels,
            max: this.analyserNode.maxDecibels
          });
        },
        get: function get() {
          return this.analyserNode.minDecibels;
        }
        /**
         * Set the maximum threshold on the volume filter. i.e. the maximum volume considered to be a signal.
         * Input validation is done to set a sensible default on non-numeric input and clamp the maximum to be zero.
         * The volumFilterMin property is also set by this to be no more than the maximum.
         * Calls the volumeFilterCallback with the new min and max.
         * @param {number} v - the maximum volume in dB (-ve).
         */

      }, {
        key: "volumeFilterMax",
        set: function set(v) {
          if (isNaN(v)) v = this.defaults.volumeFilterMax; // v is in dB and therefore -ve

          v = Math.min(0, v);
          this.analyserNode.maxDecibels = v;
          this.analyserNode.minDecibels = Math.min(this.analyserNode.minDecibels, v);
          this.volumeFilterCallback({
            min: this.analyserNode.minDecibels,
            max: this.analyserNode.maxDecibels
          });
        },
        get: function get() {
          return this.analyserNode.maxDecibels;
        }
        /**
         * Set the minimum threshold on the frequency filter. i.e. the minimum frequency to be considered.
         * Input validation is done to set a sensible default on non-numeric input and the value is clamped to be between zero and the current maximum frequency.
         * The actual minimum will be the minimum frequency of the frequency bin the chosen frequency lies in.
         * Calls the frequencyFilterCallback with the new min and max.
         * @param {number} v - the minimum frequency in Hz.
         */

      }, {
        key: "frequencyFilterMin",
        set: function set(f) {
          if (isNaN(f)) f = this.defaults.frequencyFilterMin;
          f = Math.min(Math.max(f, 0), this.maxFreq);
          this._filterBinLow = Math.min(Math.max(Math.round(f / this.freqStep), 1), this.freqBins); // at least 1 to avoid DC component

          this._filterBinHigh = Math.max(this._filterBinLow, this._filterBinHigh); // high must be at least low

          this.frequencyFilterCallback({
            min: this.frequencyFilterMin,
            max: this.frequencyFilterMax
          });
        },
        get: function get() {
          return Math.max(this._filterBinLow * this.freqStep, 0);
        }
        /**
         * Set the maximum threshold on the frequency filter. i.e. the maximum frequency to be considered.
         * Input validation is done to set a sensible default on non-numeric input and the value is clamped to be between zero and the current maximum frequency.
         * The actual minimum will be the maximum frequency of the frequency bin the chosen frequency lies in.
         * Calls the frequencyFilterCallback with the new min and max.
         * @param {number} v - the maximum frequency in Hz.
         */

      }, {
        key: "frequencyFilterMax",
        set: function set(f) {
          if (isNaN(f)) f = this.defaults.frequencyFilterMin;
          f = Math.min(Math.max(f, 0), this.maxFreq);
          this._filterBinHigh = Math.min(Math.max(Math.round(f / this.freqStep), 1), this.freqBins); // at least 1 to avoid DC component

          this._filterBinLow = Math.min(this._filterBinHigh, this._filterBinLow); // low must be at most high

          this.frequencyFilterCallback({
            min: this.frequencyFilterMin,
            max: this.frequencyFilterMax
          });
        },
        get: function get() {
          return Math.min(this._filterBinHigh * this.freqStep, this.maxFreq);
        }
        /**
         * Set the minimum and maximum frequency filter values to be closely surrounding a specific frequency.
         * @param {number} f - the frequency to target.
         */

      }, {
        key: "frequencyFilter",
        set: function set(f) {
          this.frequencyFilterMin = f;
          this.frequencyFilterMax = f;
        }
        /**
         * Set the threshold used to determine if an anlaysed region has sufficient sound to be "on".
         * Input validation is done to set a sensible default on non-numeric input and the value is clamped to be between zero and 255.
         * @param {number} v - threshold volume [0, 255]
         */

      }, {
        key: "volumeThreshold",
        set: function set(v) {
          if (isNaN(v)) v = this.defaults.volumeThreshold;
          this._volumeThreshold = Math.min(Math.max(Math.round(v), 0), 255);
          this.volumeThresholdCallback(this._volumeThreshold);
        },
        get: function get() {
          return this._volumeThreshold;
        }
      }]);

      return MorseListener;
    }();

    exports.default = MorseListener;
  },{}],7:[function(require,module,exports){
    "use strict";

    require("core-js/modules/es6.regexp.replace");

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


    var _morsePro = require("./morse-pro");

    var Morse = _interopRequireWildcard(_morsePro);

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
     * Class for conveniently translating to and from Morse code.
     * Deals with error handling.
     * Works out if the input is Morse code or not.
     *
     * @example
     * import MorseMessage from 'morse-pro-message';
     * var morseMessage = new MorseMessage();
     * var input;
     * var output;
     * try {
     *     output = morseMessage.translate("abc");
     * catch (ex) {
     *     // input will have errors surrounded by paired '#' signs
     *     // output will be best attempt at translation, with untranslatables replaced with '#'
     *     morseMessage.clearError();  // remove all the '#'
     * }
     * if (morseMessage.inputWasMorse) {
     *     // do something
     * }
     */


    var MorseMessage = function () {
      /**
       * @param {boolean} [prosigns=true] - whether or not to include prosigns in the translations
       */
      function MorseMessage() {
        var useProsigns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        _classCallCheck(this, MorseMessage);

        this.useProsigns = useProsigns;
        this.input = "";
        this.output = "";
        this.morse = "";
        this.message = "";
        this.inputWasMorse = undefined;
        this.hasError = undefined;
      }
      /**
       * @param {string} input - alphanumeric text or morse code to translate
       * @param {boolean} isMorse - whether the input is Morse code or not (if not set then the looksLikeMorse method will be used)
       */


      _createClass(MorseMessage, [{
        key: "translate",
        value: function translate(input, isMorse) {
          var translation;

          if (typeof isMorse === "undefined") {
            // make a guess: could be wrong if someone wants to translate "." into Morse for instance
            isMorse = Morse.looksLikeMorse(input);
          }

          if (isMorse) {
            this.inputWasMorse = true;
            translation = Morse.morse2text(input, this.useProsigns);
          } else {
            this.inputWasMorse = false;
            translation = Morse.text2morse(input, this.useProsigns);
          }

          this.morse = translation.morse;
          this.message = translation.message;

          if (this.inputWasMorse) {
            this.input = this.morse;
            this.output = this.message;
          } else {
            this.input = this.message;
            this.output = this.morse;
          }

          this.hasError = translation.hasError;

          if (this.hasError) {
            throw new Error("Error in input");
          }

          return this.output;
        }
        /**
         * Clear all the errors from the morse and message. Useful if you want to play the sound even though it didn't translate.
         */

      }, {
        key: "clearError",
        value: function clearError() {
          if (this.inputWasMorse) {
            this.morse = this.morse.replace(/#/g, ""); // leave in the bad Morse
          } else {
            this.message = this.message.replace(/#[^#]*?#/g, "");
            this.morse = this.morse.replace(/#/g, "");
          }

          this.hasError = false;
        }
      }]);

      return MorseMessage;
    }();

    exports.default = MorseMessage;
  },{"./morse-pro":10,"core-js/modules/es6.regexp.replace":48}],8:[function(require,module,exports){
    "use strict";

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

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
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

    /**
     * Web browser sound player using Web Audio API.
     *
     * @example
     * import MorseCWWave from 'morse-pro-cw-wave';
     * import MorsePlayerWAA from 'morse-pro-player-waa';
     * var morseCWWave = new MorseCWWave();
     * morseCWWave.translate("abc");
     * var morsePlayerWAA = new MorsePlayerWAA();
     * morsePlayerWAA.loadCWWave(morseCWWave);
     * morsePlayerWAA.playFromStart();
     */


    var MorsePlayerWAA = function () {
      /**
       * @param {function()} sequenceStartCallback - function to call each time the sequence starts.
       * @param {function()} sequenceEndingCallback - function to call when the sequence is nearing the end.
       * @param {function()} soundStoppedCallback - function to call when the sequence stops.
       */
      function MorsePlayerWAA(sequenceStartCallback, sequenceEndingCallback, soundStoppedCallback) {
        _classCallCheck(this, MorsePlayerWAA);

        if (sequenceStartCallback !== undefined) this.sequenceStartCallback = sequenceStartCallback;
        if (sequenceEndingCallback !== undefined) this.sequenceEndingCallback = sequenceEndingCallback;
        if (soundStoppedCallback !== undefined) this.soundStoppedCallback = soundStoppedCallback;
        this._noAudio = false;
        console.log("Trying Web Audio API (Oscillators)");
        this.audioContextClass = window.AudioContext || window.webkitAudioContext;

        if (this.audioContextClass === undefined) {
          this._noAudio = true;
          throw new Error("No AudioContext class defined");
        }

        this.loop = false;
        this.frequency = undefined;
        this.startPadding = 0; // number of ms to wait before playing first note of initial sequence

        this.endPadding = 0; // number of ms to wait at the end of a sequence before playing the next one (or looping)

        this._cTimings = [];
        this._isPlaying = false;
        this._isPaused = false;
        this._volume = 1;
        this._lookAheadTime = 0.1; // seconds

        this._timerInterval = 0.05; // seconds

        this._timer = undefined;
        this._stopTimer = undefined;
        this._notPlayedANote = true;
      }
      /**
       * Set up the audio graph
       * @access: private
       */


      _createClass(MorsePlayerWAA, [{
        key: "_initialiseAudioNodes",
        value: function _initialiseAudioNodes() {
          this.audioContext = new this.audioContextClass();
          this.splitterNode = this.audioContext.createGain(); // this node is here to attach other nodes to in subclass

          this.lowPassNode = this.audioContext.createBiquadFilter();
          this.lowPassNode.type = "lowpass"; // TODO: remove this magic number and make the filter configurable?

          this.lowPassNode.frequency.setValueAtTime(this.frequency * 1.1, this.audioContext.currentTime);
          this.gainNode = this.audioContext.createGain(); // this node is actually used for volume

          this.volume = this._volume;
          this.splitterNode.connect(this.lowPassNode);
          this.lowPassNode.connect(this.gainNode);
          this.gainNode.connect(this.audioContext.destination);
          this._notPlayedANote = true;
        }
        /**
         * Set the volume for the player
         * @param {number} v - the volume, clamped to [0,1]
         */

      }, {
        key: "loadCWWave",

        /**
         * Convenience method to help playing directly from a MorseCWWave instance. Uses the CWWave timings and frequency.
         * @param {Object} cwWave - a MorseCWWave instance
         */
        value: function loadCWWave(cwWave) {
          this.load(cwWave.getTimings());
          this.frequency = cwWave.frequency;
        }
        /**
         * Load timing sequence, replacing any existing sequence.
         * If endPadding is non-zero then an appropriate pause is added to the end.
         * @param {number[]} timings - list of millisecond timings; +ve numbers are beeps, -ve numbers are silence
         */

      }, {
        key: "load",
        value: function load(timings) {
          // TODO: undefined behaviour if this is called in the middle of a sequence
          // console.log('Timings: ' + timings);

          /*
          The ith element of the sequence starts at _cTimings[i] and ends at _cTimings[i+1] (in fractional seconds)
          It is a note (i.e. not silence) if isNote[i] === True
      */
          if (this.endPadding > 0) {
            timings.push(-this.endPadding);
          }

          this._cTimings = [0];
          this.isNote = [];

          for (var i = 0; i < timings.length; i++) {
            this._cTimings[i + 1] = this._cTimings[i] + Math.abs(timings[i]) / 1000; // AudioContext runs in seconds not ms

            this.isNote[i] = timings[i] > 0;
          }

          this.sequenceLength = this.isNote.length;
        }
        /**
         * Convenience method to help playing directly from a MorseCWWave instance. Uses the CWWave timings.
         * @param {Object} cwWave - a MorseCWWave instance
         */

      }, {
        key: "loadNextCWWave",
        value: function loadNextCWWave(cwWave) {
          this.loadNext(cwWave.getTimings());
        }
        /**
         * Load timing sequence which will be played when the current sequence is completed (only one sequence is queued).
         * @param {number[]} timings - list of millisecond timings; +ve numbers are beeps, -ve numbers are silence
         */

      }, {
        key: "loadNext",
        value: function loadNext(timings) {
          this.upNext = timings;
        }
        /**
         * Plays the loaded timing sequence from the start, regardless of whether playback is ongoing or paused.
         */

      }, {
        key: "playFromStart",
        value: function playFromStart() {
          // TODO: why do we have this method at all? Better just to have play() and if user needs playFromStart, just call stop() first?
          if (this._noAudio || this._cTimings.length === 0) {
            return;
          }

          this.stop();

          this._initialiseAudioNodes();

          this._nextNote = 0;
          this._isPlaying = true;
          this._isPaused = true; // pretend we were paused so that play() "resumes" playback

          this.play();
        }
        /**
         * Starts or resumes playback of the loaded timing sequence.
         */

      }, {
        key: "play",
        value: function play() {
          if (!this._isPlaying) {
            // if we're not actually playing then play from start
            this.playFromStart();
          } // otherwise we are resuming playback after a pause


          if (!this._isPaused) {
            // if we're not actually paused then do nothing
            return;
          } // otherwise we really are resuming playback (or pretending we are, and actually playing from start...)


          clearInterval(this._stopTimer); // if we were going to send a soundStoppedCallback then don't

          clearInterval(this._startTimer); // ditto

          clearInterval(this._timer);
          this._isPaused = false; // basically set the time base to now but
          //    - to work after a pause: subtract the start time of the next note so that it will play immediately
          //    - to avoid clipping the very first note: add on startPadding if notPlayedANote

          this._tZero = this.audioContext.currentTime - this._cTimings[this._nextNote] + (this._notPlayedANote ? this.startPadding / 1000 : 0); // schedule the first note ASAP (directly) and then if there is more to schedule, set up an interval timer

          if (this._scheduleNotes()) {
            this._timer = setInterval(function () {
              this._scheduleNotes();
            }.bind(this), 1000 * this._timerInterval); // regularly check to see if there are more notes to schedule
          }
        }
        /**
         * Pause playback (resume with play())
         */

      }, {
        key: "pause",
        value: function pause() {
          if (!this._isPlaying) {
            // if we're not actually playing then ignore this
            return;
          }

          this._isPaused = true;
          clearInterval(this._timer); // ensure that the next note that is scheduled is a beep, not a pause (to help sync with vibration patterns)

          if (!this.isNote[this._nextNote]) {
            this._nextNote++; // if we'e got to the end of the sequence, then loop or load next sequence as appropriate

            if (this._nextNote === this.sequenceLength) {
              if (this.loop || this.upNext !== undefined) {
                this._nextNote = 0;

                if (this.upNext !== undefined) {
                  this.load(this.upNext);
                  this.upNext = undefined;
                }
              }
            }
          }
        }
        /**
         * Stop playback (calling play() afterwards will start from the beginning)
         */

      }, {
        key: "stop",
        value: function stop() {
          if (this._isPlaying) {
            this._isPlaying = false;
            this._isPaused = false;
            clearInterval(this._timer);
            clearInterval(this._stopTimer);
            clearInterval(this._startTimer);
            this.audioContext.close();
            this.soundStoppedCallback();
          }
        }
        /**
         * Schedule notes that start before now + lookAheadTime.
         * @return {boolean} true if there is more to schedule, false if sequence is complete
         * @access: private
         */

      }, {
        key: "_scheduleNotes",
        value: function _scheduleNotes() {
          // console.log('Scheduling:');
          var oscillator, start, end;
          var now = this.audioContext.currentTime;

          while (this._nextNote < this.sequenceLength && this._cTimings[this._nextNote] < now - this._tZero + this._lookAheadTime) {
            this._notPlayedANote = false; // console.log('T: ' + Math.round(1000 * now)/1000 + ' (+' + Math.round(1000 * (now - this._tZero))/1000 + ')');
            // console.log(this._nextNote + ': ' +
            //     (this.isNote[this._nextNote] ? 'Note  ' : 'Pause ') +
            //     Math.round(1000 * this._cTimings[this._nextNote])/1000 + ' - ' +
            //     Math.round(1000 * this._cTimings[this._nextNote + 1])/1000 + ' (' +
            //     Math.round(1000 * (this._cTimings[this._nextNote + 1] - this._cTimings[this._nextNote]))/1000 + ')');

            if (this._nextNote === 0 && !this.sequenceStartCallbackFired) {
              // when scheduling the first note, schedule a callback as well
              this._startTimer = setTimeout(function () {
                this.sequenceStartCallback();
              }.bind(this), 1000 * (this._tZero + this._cTimings[this._nextNote] - now));
              this.sequenceStartCallbackFired = true;
            }

            if (this.isNote[this._nextNote]) {
              start = this._tZero + this._cTimings[this._nextNote];
              end = this._tZero + this._cTimings[this._nextNote + 1];
              this._soundEndTime = end; // we need to store this for the stop() callback

              oscillator = this.audioContext.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(this.frequency, start);
              oscillator.start(start);
              oscillator.stop(this._soundEndTime);
              oscillator.connect(this.splitterNode);
            }

            this._nextNote++;

            if (this._nextNote === this.sequenceLength) {
              if (this.loop || this.upNext !== undefined) {
                // increment time base to be the absolute end time of the final element in the sequence
                this._tZero += this._cTimings[this._nextNote];
                this._nextNote = 0;

                if (this.upNext !== undefined) {
                  this.load(this.upNext);
                  this.upNext = undefined;
                }
              }
            }
          }

          if (this._nextNote === this.sequenceLength) {
            // then all notes have been scheduled and we are not looping
            clearInterval(this._timer); // schedule stop() for after when the scheduled sequence ends
            // adding on 3 * lookAheadTime for safety but shouldn't be needed

            this._stopTimer = setTimeout(function () {
              this.stop();
            }.bind(this), 1000 * (this._soundEndTime - now + 3 * this._lookAheadTime));
            return false; // indicate that sequence is complete
          } else if (now - this._tZero + this._timerInterval + this._lookAheadTime > this._cTimings[this.sequenceLength - 1] && this.sequenceStartCallbackFired) {
            // then we are going to schedule the last note in the sequence next time
            this.sequenceEndingCallback();
            this.sequenceStartCallbackFired = false;
          }

          return true; // indicate there are more notes to schedule
        }
        /**
         * @returns {boolean} whether there was an error in initialisation
         */

      }, {
        key: "hasError",
        value: function hasError() {
          return this._noAudio;
        }
        /**
         * @returns {boolean} whether a sequence is being played or not (still true even when paused); becomes false when stop is used
         */

      }, {
        key: "sequenceStartCallback",
        // empty callbacks in case user does not define any
        value: function sequenceStartCallback() {}
      }, {
        key: "sequenceEndingCallback",
        value: function sequenceEndingCallback() {}
      }, {
        key: "soundStoppedCallback",
        value: function soundStoppedCallback() {}
      }, {
        key: "volume",
        set: function set(v) {
          this._volume = Math.min(Math.max(v, 0), 1);

          try {
            // multiply by 0.813 to reduce gain added by lowpass filter and avoid clipping
            this.gainNode.gain.setValueAtTime(0.813 * this._volume, this.audioContext.currentTime);
          } catch (ex) {// getting here means _initialiseAudioNodes() has not yet been called: that's okay
          }
        }
        /**
         * @returns {number} the current volume [0,1]
         */
        ,
        get: function get() {
          return this._volume;
        }
      }, {
        key: "isPlaying",
        get: function get() {
          return this._isPlaying;
        }
        /**
         * @returns {boolean} whether the playback is paused or not
         */

      }, {
        key: "isPaused",
        get: function get() {
          return this._isPaused;
        }
        /**
         * Return the index of the next note in the sequence to be scheduled.
         * Useful if the sequence has been paused.
         * @returns {number} note index
         */

      }, {
        key: "nextNote",
        get: function get() {
          return this._nextNote;
        }
        /**
         * @returns {number} representing this audio player type: 4
         */

      }, {
        key: "audioType",
        get: function get() {
          return 4; // 4: Web Audio API using oscillators
          // 3: Audio element using media stream worker (using PCM audio data)
          // 2: Flash (using PCM audio data)
          // 1: Web Audio API with webkit and native support (using PCM audio data)
          // 0: Audio element using Mozilla Audio Data API (https://wiki.mozilla.org/Audio_Data_API) (using PCM audio data)
          // -1: no audio support
        }
      }]);

      return MorsePlayerWAA;
    }();

    exports.default = MorsePlayerWAA;
  },{}],9:[function(require,module,exports){
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ditLength = ditLength;
    exports.dahLength = dahLength;
    exports.ditSpace = ditSpace;
    exports.charSpace = charSpace;
    exports.wordSpace = wordSpace;
    exports.wpm = wpm;
    exports.fditLength = fditLength;
    exports.ratio = ratio;
    exports.fwpm = fwpm;
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

    /**
     * Useful constants and functions for computing the speed of Morse code.
     */

    var DITS_PER_WORD = 50;
    /** dits in "PARIS " */

    var SPACES_IN_PARIS = 19;
    /** 5x 3-dit inter-character spaces + 1x 7-dit space */

    var MS_IN_MINUTE = 60000;
    /** number of milliseconds in 1 minute */

    /** Get the dit length in ms
     * @param {number} wpm - speed in words per minute
     * @return {integer}
     */

    function ditLength(wpm) {
      return Math.round(_ditLength(wpm));
    }

    function _ditLength(wpm) {
      return MS_IN_MINUTE / DITS_PER_WORD / wpm;
    }
    /**
     * Get the dah length in ms
     * @param {number} wpm - speed in words per minute
     * @return {integer}
     */


    function dahLength(wpm) {
      return Math.round(3 * _ditLength(wpm));
    }
    /**
     * Get the dit space in ms
     * @param {number} wpm - speed in words per minute
     * @return {integer}
     */


    function ditSpace(wpm) {
      return ditLength(wpm);
    }
    /**
     * Get the character-space in ms
     * @param {number} wpm - speed in words per minute
     * @param {number} [fwpm = wpm] - Farnsworth speed in words per minute
     * @return {integer}
     */


    function charSpace(wpm) {
      var fwpm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : wpm;
      return Math.round(3 * _fditLength(wpm, fwpm));
    }
    /**
     * Get the word-space in ms
     * @param {number} wpm - speed in words per minute
     * @param {number} [fwpm = wpm] - Farnsworth speed in words per minute
     * @return {integer}
     */


    function wordSpace(wpm) {
      var fwpm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : wpm;
      return Math.round(7 * _fditLength(wpm, fwpm));
    }
    /**
     * Get the WPM for a given dit length in ms
     * @return {number}
     */


    function wpm(ditLen) {
      return MS_IN_MINUTE / DITS_PER_WORD / ditLen;
    }
    /**
     * Get the Farnsworth dit length in ms for a given WPM and Farnsworth WPM. Note, actual dit-spaces should not be slowed down
     * @return {integer}
     */


    function fditLength(wpm, fwpm) {
      return Math.round(_fditLength(wpm, fwpm));
    }

    function _fditLength(wpm, fwpm) {
      return _ditLength(wpm) * ratio(wpm, fwpm);
    }
    /**
     * Get the dit length ratio for a given WPM and Farnsworth WPM
     * @param {number} wpm - speed in words per minute
     * @param {number} fwpm - Farnsworth speed in words per minute
     * @return {number}
     */


    function ratio(wpm, fwpm) {
      // "PARIS " is 31 units for the characters and 19 units for the inter-character spaces and inter-word space
      // One unit takes 1 * 60 / (50 * wpm)
      // The 31 units should take 31 * 60 / (50 * wpm) seconds at wpm
      // "PARIS " should take 50 * 60 / (50 * fwpm) to transmit at fwpm, or 60 / fwpm  seconds at fwpm
      // Keeping the time for the characters constant,
      // The spaces need to take: (60 / fwpm) - [31 * 60 / (50 * wpm)] seconds in total
      // The spaces are 4 inter-character spaces of 3 units and 1 inter-word space of 7 units. Their ratio must be maintained.
      // A space unit is: [(60 / fwpm) - [31 * 60 / (50 * wpm)]] / 19 seconds
      // Comparing that to 60 / (50 * wpm) gives a ratio of (50.wpm - 31.fwpm) / 19.fwpm
      return (DITS_PER_WORD * wpm - (DITS_PER_WORD - SPACES_IN_PARIS) * fwpm) / (SPACES_IN_PARIS * fwpm);
    }
    /** Get the Farnsworth WPM for a given WPM and ratio */


    function fwpm(wpm, r) {
      return DITS_PER_WORD * wpm / (SPACES_IN_PARIS * r + (DITS_PER_WORD - SPACES_IN_PARIS));
    }
  },{}],10:[function(require,module,exports){
    'use strict';

    require("core-js/modules/es6.regexp.split");

    require("core-js/modules/es6.regexp.match");

    require("core-js/modules/es6.regexp.replace");

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.text2morse = text2morse;
    exports.text2ditdah = text2ditdah;
    exports.morse2text = morse2text;
    exports.looksLikeMorse = looksLikeMorse;
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

    /**
     * Basic methods to translate Morse code.
     */

    if (typeof String.prototype.trim === "undefined") {
      String.prototype.trim = function () {
        return String(this).replace(/^\s+|\s+$/g, '');
      };
    }

    var text2morseH = {
      'A': ".-",
      'B': "-...",
      'C': "-.-.",
      'D': "-..",
      'E': ".",
      'F': "..-.",
      'G': "--.",
      'H': "....",
      'I': "..",
      'J': ".---",
      'K': "-.-",
      'L': ".-..",
      'M': "--",
      'N': "-.",
      'O': "---",
      'P': ".--.",
      'Q': "--.-",
      'R': ".-.",
      'S': "...",
      'T': "-",
      'U': "..-",
      'V': "...-",
      'W': ".--",
      'X': "-..-",
      'Y': "-.--",
      'Z': "--..",
      '1': ".----",
      '2': "..---",
      '3': "...--",
      '4': "....-",
      '5': ".....",
      '6': "-....",
      '7': "--...",
      '8': "---..",
      '9': "----.",
      '0': "-----",
      '.': ".-.-.-",
      ',': "--..--",
      ':': "---...",
      '?': "..--..",
      '\'': ".----.",
      '-': "-....-",
      '/': "-..-.",
      '(': "-.--.",
      ')': "-.--.-",
      '"': ".-..-.",
      '@': ".--.-.",
      '=': "-...-",
      '&': ".-...",
      '+': ".-.-.",
      '!': "-.-.--",
      ' ': "/" //Not morse but helps translation

    };
    var morse2textH = {};
    var prosign2morseH = {
      '<AA>': '.-.-',
      '<AR>': '.-.-.',
      '<AS>': '.-...',
      '<BK>': '-...-.-',
      '<BT>': '-...-',
      // also <TV>
      '<CL>': '-.-..-..',
      '<CT>': '-.-.-',
      '<DO>': '-..---',
      '<KN>': '-.--.',
      '<SK>': '...-.-',
      // also <VA>
      '<VA>': '...-.-',
      '<SN>': '...-.',
      // also <VE>
      '<VE>': '...-.',
      '<SOS>': '...---...'
    };
    var morsepro2textH = {};
    var text2morseproH = {};

    for (var text in text2morseH) {
      text2morseproH[text] = text2morseH[text];
      morse2textH[text2morseH[text]] = text;
      morsepro2textH[text2morseH[text]] = text;
    }

    for (var sign in prosign2morseH) {
      text2morseproH[sign] = prosign2morseH[sign];
      morsepro2textH[prosign2morseH[sign]] = sign;
    }

    var tidyText = function tidyText(text) {
      text = text.toUpperCase();
      text = text.trim();
      text = text.replace(/\s+/g, ' ');
      return text;
    };
    /**
     * Translate text to morse in '..- .. / --' form.
     * If something in the text is untranslatable then it is surrounded by hash-signs ('#') and a hash is placed in the morse.
     * @param {string} text - alphanumeric message
     * @param {boolean} useProsigns - true if prosigns are to be used (default is true)
     * @return {{message: string, morse: string, hasError: boolean}}
     */


    function text2morse(text) {
      var useProsigns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      text = tidyText(text);
      var ret = {
        morse: "",
        message: "",
        hasError: false
      };

      if (text === "") {
        return ret;
      }

      var tokens = [];
      var prosign;
      var token_length;

      while (text.length > 0) {
        token_length = 1;

        if (useProsigns) {
          prosign = text.match(/^<...?>/); // array of matches

          if (prosign) {
            token_length = prosign[0].length;
          }
        }

        tokens.push(text.slice(0, token_length));
        text = text.slice(token_length, text.length);
      }

      var dict;

      if (useProsigns) {
        dict = text2morseproH;
      } else {
        dict = text2morseH;
      }

      var i, c, t;

      for (i = 0; i < tokens.length; i++) {
        t = tokens[i];
        c = dict[t];

        if (c === undefined) {
          ret.message += "#" + t + "#";
          ret.morse += "# ";
          ret.hasError = true;
        } else {
          ret.message += t;
          ret.morse += c + " ";
        }
      }

      ret.morse = ret.morse.slice(0, ret.morse.length - 1);
      return ret;
    }
    /**
     * Translate text to morse in 'Di-di-dah dah' form.
     * @param {string} text - alphanumeric message
     * @param {boolean} useProsigns - true if prosigns are to be used (default is true)
     * @return {string}
     */


    function text2ditdah(text, useProsigns) {
      // TODO: deal with errors in the translation
      var ditdah = text2morse(text, useProsigns).morse + ' '; // get the dots and dashes

      ditdah = ditdah.replace(/\./g, 'di~').replace(/\-/g, 'dah~'); // do the basic job

      ditdah = ditdah.replace(/~/g, '-'); // replace placeholder with dash

      ditdah = ditdah.replace(/\- /g, ' '); // remove trailing dashes

      ditdah = ditdah.replace(/di /g, 'dit '); // use 'dit' at end of letter

      ditdah = ditdah.replace(/ \/ /g, ', '); // do punctuation

      ditdah = ditdah.replace(/^d/, 'D'); // do capitalisation

      ditdah = ditdah.replace(/ $/, ''); // remove the space we added

      ditdah = ditdah.replace(/([th])$/, '$1.'); // add full-stop if there is anything there

      return ditdah;
    }
    /**
     * Canonicalise morse text.
     * Canonical form matches [.-/ ]*, has single spaces between characters, has words separated by ' / ', and has no spaces at the start or end.
     * A single '/' may be returned by this function.
     * @param {string} morse - Morse code matching [.-_/| ]*
     * @return {string} Morse code in canonical form matching [.-/ ]*
     */


    var tidyMorse = function tidyMorse(morse) {
      morse = morse.replace(/\|/g, "/"); // unify the word separator

      morse = morse.replace(/\//g, " / "); // make sure word separators are spaced out

      morse = morse.replace(/\s+/g, " "); // squash multiple spaces into single spaces

      morse = morse.replace(/(\/ )+\//g, "/"); // squash multiple word separators

      morse = morse.replace(/_/g, "-"); // unify the dash character

      morse = morse.replace(/^\s+/, ""); // remove initial whitespace

      morse = morse.replace(/\s+$/, ""); // remove trailing whitespace

      return morse;
    };
    /**
     * Translate morse to text. Canonicalise the morse first.
     * If something in the morse is untranslatable then it is surrounded by hash-signs ('#') and a hash is placed in the text.
     * @param {string} morse - morse message using [.-_/| ] characters
     * @param {boolean} useProsigns - true if prosigns are to be used (default is true)
     * @return {{message: string, morse: string, hasError: boolean}}
     */


    function morse2text(morse) {
      var useProsigns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      morse = tidyMorse(morse);
      var ret = {
        morse: "",
        message: "",
        hasError: false
      };

      if (morse === "") {
        return ret;
      }

      var tokens = morse.split(" ");
      var dict;

      if (useProsigns) {
        dict = morsepro2textH;
      } else {
        dict = morse2textH;
      }

      var c, t;

      for (var i = 0; i < tokens.length; i++) {
        t = tokens[i];
        c = dict[t];

        if (c === undefined) {
          ret.morse += "#" + t + "# ";
          ret.message += "#";
          ret.hasError = true;
        } else {
          ret.morse += t + " ";
          ret.message += c;
        }
      }

      ret.morse = ret.morse.slice(0, ret.morse.length - 1);
      return ret;
    }
    /**
     * Determine whether a string is most likely morse code.
     * @param {string} input - the text
     * @return {boolean} - true if the string only has Morse characters in after executing tidyMorse
     */


    function looksLikeMorse(input) {
      input = tidyMorse(input);
      return input.match(/^[/.-][ /.-]*$/) !== null;
    }
  },{"core-js/modules/es6.regexp.match":47,"core-js/modules/es6.regexp.replace":48,"core-js/modules/es6.regexp.split":49}],11:[function(require,module,exports){
    module.exports = function (it) {
      if (typeof it != 'function') throw TypeError(it + ' is not a function!');
      return it;
    };

  },{}],12:[function(require,module,exports){
    'use strict';
    var at = require('./_string-at')(true);

    // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
    module.exports = function (S, index, unicode) {
      return index + (unicode ? at(S, index).length : 1);
    };

  },{"./_string-at":39}],13:[function(require,module,exports){
    var isObject = require('./_is-object');
    module.exports = function (it) {
      if (!isObject(it)) throw TypeError(it + ' is not an object!');
      return it;
    };

  },{"./_is-object":29}],14:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
    var cof = require('./_cof');
    var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
    var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
    var tryGet = function (it, key) {
      try {
        return it[key];
      } catch (e) { /* empty */ }
    };

    module.exports = function (it) {
      var O, T, B;
      return it === undefined ? 'Undefined' : it === null ? 'Null'
          // @@toStringTag case
          : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
              // builtinTag case
              : ARG ? cof(O)
                  // ES3 arguments fallback
                  : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
    };

  },{"./_cof":15,"./_wks":45}],15:[function(require,module,exports){
    var toString = {}.toString;

    module.exports = function (it) {
      return toString.call(it).slice(8, -1);
    };

  },{}],16:[function(require,module,exports){
    var core = module.exports = { version: '2.6.1' };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

  },{}],17:[function(require,module,exports){
// optional / simple context binding
    var aFunction = require('./_a-function');
    module.exports = function (fn, that, length) {
      aFunction(fn);
      if (that === undefined) return fn;
      switch (length) {
        case 1: return function (a) {
          return fn.call(that, a);
        };
        case 2: return function (a, b) {
          return fn.call(that, a, b);
        };
        case 3: return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
      }
      return function (/* ...args */) {
        return fn.apply(that, arguments);
      };
    };

  },{"./_a-function":11}],18:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
    module.exports = function (it) {
      if (it == undefined) throw TypeError("Can't call method on  " + it);
      return it;
    };

  },{}],19:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
    module.exports = !require('./_fails')(function () {
      return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
    });

  },{"./_fails":22}],20:[function(require,module,exports){
    var isObject = require('./_is-object');
    var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
    var is = isObject(document) && isObject(document.createElement);
    module.exports = function (it) {
      return is ? document.createElement(it) : {};
    };

  },{"./_global":25,"./_is-object":29}],21:[function(require,module,exports){
    var global = require('./_global');
    var core = require('./_core');
    var hide = require('./_hide');
    var redefine = require('./_redefine');
    var ctx = require('./_ctx');
    var PROTOTYPE = 'prototype';

    var $export = function (type, name, source) {
      var IS_FORCED = type & $export.F;
      var IS_GLOBAL = type & $export.G;
      var IS_STATIC = type & $export.S;
      var IS_PROTO = type & $export.P;
      var IS_BIND = type & $export.B;
      var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
      var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
      var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
      var key, own, out, exp;
      if (IS_GLOBAL) source = name;
      for (key in source) {
        // contains in native
        own = !IS_FORCED && target && target[key] !== undefined;
        // export native or passed
        out = (own ? target : source)[key];
        // bind timers to global for call from export context
        exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
        // extend global
        if (target) redefine(target, key, out, type & $export.U);
        // export
        if (exports[key] != out) hide(exports, key, exp);
        if (IS_PROTO && expProto[key] != out) expProto[key] = out;
      }
    };
    global.core = core;
// type bitmap
    $export.F = 1;   // forced
    $export.G = 2;   // global
    $export.S = 4;   // static
    $export.P = 8;   // proto
    $export.B = 16;  // bind
    $export.W = 32;  // wrap
    $export.U = 64;  // safe
    $export.R = 128; // real proto method for `library`
    module.exports = $export;

  },{"./_core":16,"./_ctx":17,"./_global":25,"./_hide":27,"./_redefine":34}],22:[function(require,module,exports){
    module.exports = function (exec) {
      try {
        return !!exec();
      } catch (e) {
        return true;
      }
    };

  },{}],23:[function(require,module,exports){
    'use strict';
    require('./es6.regexp.exec');
    var redefine = require('./_redefine');
    var hide = require('./_hide');
    var fails = require('./_fails');
    var defined = require('./_defined');
    var wks = require('./_wks');
    var regexpExec = require('./_regexp-exec');

    var SPECIES = wks('species');

    var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
      // #replace needs built-in support for named groups.
      // #match works fine because it just return the exec results, even if it has
      // a "grops" property.
      var re = /./;
      re.exec = function () {
        var result = [];
        result.groups = { a: '7' };
        return result;
      };
      return ''.replace(re, '$<a>') !== '7';
    });

    var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
      // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
      var re = /(?:)/;
      var originalExec = re.exec;
      re.exec = function () { return originalExec.apply(this, arguments); };
      var result = 'ab'.split(re);
      return result.length === 2 && result[0] === 'a' && result[1] === 'b';
    })();

    module.exports = function (KEY, length, exec) {
      var SYMBOL = wks(KEY);

      var DELEGATES_TO_SYMBOL = !fails(function () {
        // String methods call symbol-named RegEp methods
        var O = {};
        O[SYMBOL] = function () { return 7; };
        return ''[KEY](O) != 7;
      });

      var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
        // Symbol-named RegExp methods call .exec
        var execCalled = false;
        var re = /a/;
        re.exec = function () { execCalled = true; return null; };
        if (KEY === 'split') {
          // RegExp[@@split] doesn't call the regex's exec method, but first creates
          // a new one. We need to return the patched regex when creating the new one.
          re.constructor = {};
          re.constructor[SPECIES] = function () { return re; };
        }
        re[SYMBOL]('');
        return !execCalled;
      }) : undefined;

      if (
          !DELEGATES_TO_SYMBOL ||
          !DELEGATES_TO_EXEC ||
          (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
          (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
      ) {
        var nativeRegExpMethod = /./[SYMBOL];
        var fns = exec(
            defined,
            SYMBOL,
            ''[KEY],
            function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
              if (regexp.exec === regexpExec) {
                if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
                  // The native String method already delegates to @@method (this
                  // polyfilled function), leasing to infinite recursion.
                  // We avoid it by directly calling the native @@method method.
                  return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
                }
                return { done: true, value: nativeMethod.call(str, regexp, arg2) };
              }
              return { done: false };
            }
        );
        var strfn = fns[0];
        var rxfn = fns[1];

        redefine(String.prototype, KEY, strfn);
        hide(RegExp.prototype, SYMBOL, length == 2
            // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
            // 21.2.5.11 RegExp.prototype[@@split](string, limit)
            ? function (string, arg) { return rxfn.call(string, this, arg); }
            // 21.2.5.6 RegExp.prototype[@@match](string)
            // 21.2.5.9 RegExp.prototype[@@search](string)
            : function (string) { return rxfn.call(string, this); }
        );
      }
    };

  },{"./_defined":18,"./_fails":22,"./_hide":27,"./_redefine":34,"./_regexp-exec":36,"./_wks":45,"./es6.regexp.exec":46}],24:[function(require,module,exports){
    'use strict';
// 21.2.5.3 get RegExp.prototype.flags
    var anObject = require('./_an-object');
    module.exports = function () {
      var that = anObject(this);
      var result = '';
      if (that.global) result += 'g';
      if (that.ignoreCase) result += 'i';
      if (that.multiline) result += 'm';
      if (that.unicode) result += 'u';
      if (that.sticky) result += 'y';
      return result;
    };

  },{"./_an-object":13}],25:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math
        ? window : typeof self != 'undefined' && self.Math == Math ? self
            // eslint-disable-next-line no-new-func
            : Function('return this')();
    if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

  },{}],26:[function(require,module,exports){
    var hasOwnProperty = {}.hasOwnProperty;
    module.exports = function (it, key) {
      return hasOwnProperty.call(it, key);
    };

  },{}],27:[function(require,module,exports){
    var dP = require('./_object-dp');
    var createDesc = require('./_property-desc');
    module.exports = require('./_descriptors') ? function (object, key, value) {
      return dP.f(object, key, createDesc(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };

  },{"./_descriptors":19,"./_object-dp":32,"./_property-desc":33}],28:[function(require,module,exports){
    module.exports = !require('./_descriptors') && !require('./_fails')(function () {
      return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
    });

  },{"./_descriptors":19,"./_dom-create":20,"./_fails":22}],29:[function(require,module,exports){
    module.exports = function (it) {
      return typeof it === 'object' ? it !== null : typeof it === 'function';
    };

  },{}],30:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
    var isObject = require('./_is-object');
    var cof = require('./_cof');
    var MATCH = require('./_wks')('match');
    module.exports = function (it) {
      var isRegExp;
      return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
    };

  },{"./_cof":15,"./_is-object":29,"./_wks":45}],31:[function(require,module,exports){
    module.exports = false;

  },{}],32:[function(require,module,exports){
    var anObject = require('./_an-object');
    var IE8_DOM_DEFINE = require('./_ie8-dom-define');
    var toPrimitive = require('./_to-primitive');
    var dP = Object.defineProperty;

    exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPrimitive(P, true);
      anObject(Attributes);
      if (IE8_DOM_DEFINE) try {
        return dP(O, P, Attributes);
      } catch (e) { /* empty */ }
      if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
      if ('value' in Attributes) O[P] = Attributes.value;
      return O;
    };

  },{"./_an-object":13,"./_descriptors":19,"./_ie8-dom-define":28,"./_to-primitive":43}],33:[function(require,module,exports){
    module.exports = function (bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };

  },{}],34:[function(require,module,exports){
    var global = require('./_global');
    var hide = require('./_hide');
    var has = require('./_has');
    var SRC = require('./_uid')('src');
    var TO_STRING = 'toString';
    var $toString = Function[TO_STRING];
    var TPL = ('' + $toString).split(TO_STRING);

    require('./_core').inspectSource = function (it) {
      return $toString.call(it);
    };

    (module.exports = function (O, key, val, safe) {
      var isFunction = typeof val == 'function';
      if (isFunction) has(val, 'name') || hide(val, 'name', key);
      if (O[key] === val) return;
      if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
      if (O === global) {
        O[key] = val;
      } else if (!safe) {
        delete O[key];
        hide(O, key, val);
      } else if (O[key]) {
        O[key] = val;
      } else {
        hide(O, key, val);
      }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, TO_STRING, function toString() {
      return typeof this == 'function' && this[SRC] || $toString.call(this);
    });

  },{"./_core":16,"./_global":25,"./_has":26,"./_hide":27,"./_uid":44}],35:[function(require,module,exports){
    'use strict';

    var classof = require('./_classof');
    var builtinExec = RegExp.prototype.exec;

    // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
    module.exports = function (R, S) {
      var exec = R.exec;
      if (typeof exec === 'function') {
        var result = exec.call(R, S);
        if (typeof result !== 'object') {
          throw new TypeError('RegExp exec method returned something other than an Object or null');
        }
        return result;
      }
      if (classof(R) !== 'RegExp') {
        throw new TypeError('RegExp#exec called on incompatible receiver');
      }
      return builtinExec.call(R, S);
    };

  },{"./_classof":14}],36:[function(require,module,exports){
    'use strict';

    var regexpFlags = require('./_flags');

    var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
    var nativeReplace = String.prototype.replace;

    var patchedExec = nativeExec;

    var LAST_INDEX = 'lastIndex';

    var UPDATES_LAST_INDEX_WRONG = (function () {
      var re1 = /a/,
          re2 = /b*/g;
      nativeExec.call(re1, 'a');
      nativeExec.call(re2, 'a');
      return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
    })();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
    var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

    var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

    if (PATCH) {
      patchedExec = function exec(str) {
        var re = this;
        var lastIndex, reCopy, match, i;

        if (NPCG_INCLUDED) {
          reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
        }
        if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

        match = nativeExec.call(re, str);

        if (UPDATES_LAST_INDEX_WRONG && match) {
          re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
        }
        if (NPCG_INCLUDED && match && match.length > 1) {
          // Fix browsers whose `exec` methods don't consistently return `undefined`
          // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
          // eslint-disable-next-line no-loop-func
          nativeReplace.call(match[0], reCopy, function () {
            for (i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undefined) match[i] = undefined;
            }
          });
        }

        return match;
      };
    }

    module.exports = patchedExec;

  },{"./_flags":24}],37:[function(require,module,exports){
    var core = require('./_core');
    var global = require('./_global');
    var SHARED = '__core-js_shared__';
    var store = global[SHARED] || (global[SHARED] = {});

    (module.exports = function (key, value) {
      return store[key] || (store[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: core.version,
      mode: require('./_library') ? 'pure' : 'global',
      copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
    });

  },{"./_core":16,"./_global":25,"./_library":31}],38:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
    var anObject = require('./_an-object');
    var aFunction = require('./_a-function');
    var SPECIES = require('./_wks')('species');
    module.exports = function (O, D) {
      var C = anObject(O).constructor;
      var S;
      return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
    };

  },{"./_a-function":11,"./_an-object":13,"./_wks":45}],39:[function(require,module,exports){
    var toInteger = require('./_to-integer');
    var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
    module.exports = function (TO_STRING) {
      return function (that, pos) {
        var s = String(defined(that));
        var i = toInteger(pos);
        var l = s.length;
        var a, b;
        if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
        a = s.charCodeAt(i);
        return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
            ? TO_STRING ? s.charAt(i) : a
            : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
      };
    };

  },{"./_defined":18,"./_to-integer":40}],40:[function(require,module,exports){
// 7.1.4 ToInteger
    var ceil = Math.ceil;
    var floor = Math.floor;
    module.exports = function (it) {
      return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
    };

  },{}],41:[function(require,module,exports){
// 7.1.15 ToLength
    var toInteger = require('./_to-integer');
    var min = Math.min;
    module.exports = function (it) {
      return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
    };

  },{"./_to-integer":40}],42:[function(require,module,exports){
// 7.1.13 ToObject(argument)
    var defined = require('./_defined');
    module.exports = function (it) {
      return Object(defined(it));
    };

  },{"./_defined":18}],43:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
    var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
    module.exports = function (it, S) {
      if (!isObject(it)) return it;
      var fn, val;
      if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
      if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
      if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
      throw TypeError("Can't convert object to primitive value");
    };

  },{"./_is-object":29}],44:[function(require,module,exports){
    var id = 0;
    var px = Math.random();
    module.exports = function (key) {
      return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
    };

  },{}],45:[function(require,module,exports){
    var store = require('./_shared')('wks');
    var uid = require('./_uid');
    var Symbol = require('./_global').Symbol;
    var USE_SYMBOL = typeof Symbol == 'function';

    var $exports = module.exports = function (name) {
      return store[name] || (store[name] =
          USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
    };

    $exports.store = store;

  },{"./_global":25,"./_shared":37,"./_uid":44}],46:[function(require,module,exports){
    'use strict';
    var regexpExec = require('./_regexp-exec');
    require('./_export')({
      target: 'RegExp',
      proto: true,
      forced: regexpExec !== /./.exec
    }, {
      exec: regexpExec
    });

  },{"./_export":21,"./_regexp-exec":36}],47:[function(require,module,exports){
    'use strict';

    var anObject = require('./_an-object');
    var toLength = require('./_to-length');
    var advanceStringIndex = require('./_advance-string-index');
    var regExpExec = require('./_regexp-exec-abstract');

// @@match logic
    require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match, maybeCallNative) {
      return [
        // `String.prototype.match` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.match
        function match(regexp) {
          var O = defined(this);
          var fn = regexp == undefined ? undefined : regexp[MATCH];
          return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
        },
        // `RegExp.prototype[@@match]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
        function (regexp) {
          var res = maybeCallNative($match, regexp, this);
          if (res.done) return res.value;
          var rx = anObject(regexp);
          var S = String(this);
          if (!rx.global) return regExpExec(rx, S);
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
          var A = [];
          var n = 0;
          var result;
          while ((result = regExpExec(rx, S)) !== null) {
            var matchStr = String(result[0]);
            A[n] = matchStr;
            if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
            n++;
          }
          return n === 0 ? null : A;
        }
      ];
    });

  },{"./_advance-string-index":12,"./_an-object":13,"./_fix-re-wks":23,"./_regexp-exec-abstract":35,"./_to-length":41}],48:[function(require,module,exports){
    'use strict';

    var anObject = require('./_an-object');
    var toObject = require('./_to-object');
    var toLength = require('./_to-length');
    var toInteger = require('./_to-integer');
    var advanceStringIndex = require('./_advance-string-index');
    var regExpExec = require('./_regexp-exec-abstract');
    var max = Math.max;
    var min = Math.min;
    var floor = Math.floor;
    var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
    var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

    var maybeToString = function (it) {
      return it === undefined ? it : String(it);
    };

// @@replace logic
    require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
      return [
        // `String.prototype.replace` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.replace
        function replace(searchValue, replaceValue) {
          var O = defined(this);
          var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
          return fn !== undefined
              ? fn.call(searchValue, O, replaceValue)
              : $replace.call(String(O), searchValue, replaceValue);
        },
        // `RegExp.prototype[@@replace]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
        function (regexp, replaceValue) {
          var res = maybeCallNative($replace, regexp, this, replaceValue);
          if (res.done) return res.value;

          var rx = anObject(regexp);
          var S = String(this);
          var functionalReplace = typeof replaceValue === 'function';
          if (!functionalReplace) replaceValue = String(replaceValue);
          var global = rx.global;
          if (global) {
            var fullUnicode = rx.unicode;
            rx.lastIndex = 0;
          }
          var results = [];
          while (true) {
            var result = regExpExec(rx, S);
            if (result === null) break;
            results.push(result);
            if (!global) break;
            var matchStr = String(result[0]);
            if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
          }
          var accumulatedResult = '';
          var nextSourcePosition = 0;
          for (var i = 0; i < results.length; i++) {
            result = results[i];
            var matched = String(result[0]);
            var position = max(min(toInteger(result.index), S.length), 0);
            var captures = [];
            // NOTE: This is equivalent to
            //   captures = result.slice(1).map(maybeToString)
            // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
            // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
            // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
            for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
            var namedCaptures = result.groups;
            if (functionalReplace) {
              var replacerArgs = [matched].concat(captures, position, S);
              if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
              var replacement = String(replaceValue.apply(undefined, replacerArgs));
            } else {
              replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
            }
            if (position >= nextSourcePosition) {
              accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
              nextSourcePosition = position + matched.length;
            }
          }
          return accumulatedResult + S.slice(nextSourcePosition);
        }
      ];

      // https://tc39.github.io/ecma262/#sec-getsubstitution
      function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
        var tailPos = position + matched.length;
        var m = captures.length;
        var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
        if (namedCaptures !== undefined) {
          namedCaptures = toObject(namedCaptures);
          symbols = SUBSTITUTION_SYMBOLS;
        }
        return $replace.call(replacement, symbols, function (match, ch) {
          var capture;
          switch (ch.charAt(0)) {
            case '$': return '$';
            case '&': return matched;
            case '`': return str.slice(0, position);
            case "'": return str.slice(tailPos);
            case '<':
              capture = namedCaptures[ch.slice(1, -1)];
              break;
            default: // \d\d?
              var n = +ch;
              if (n === 0) return ch;
              if (n > m) {
                var f = floor(n / 10);
                if (f === 0) return ch;
                if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
                return ch;
              }
              capture = captures[n - 1];
          }
          return capture === undefined ? '' : capture;
        });
      }
    });

  },{"./_advance-string-index":12,"./_an-object":13,"./_fix-re-wks":23,"./_regexp-exec-abstract":35,"./_to-integer":40,"./_to-length":41,"./_to-object":42}],49:[function(require,module,exports){
    'use strict';

    var isRegExp = require('./_is-regexp');
    var anObject = require('./_an-object');
    var speciesConstructor = require('./_species-constructor');
    var advanceStringIndex = require('./_advance-string-index');
    var toLength = require('./_to-length');
    var callRegExpExec = require('./_regexp-exec-abstract');
    var regexpExec = require('./_regexp-exec');
    var $min = Math.min;
    var $push = [].push;
    var $SPLIT = 'split';
    var LENGTH = 'length';
    var LAST_INDEX = 'lastIndex';

// eslint-disable-next-line no-empty
    var SUPPORTS_Y = !!(function () { try { return new RegExp('x', 'y'); } catch (e) {} })();

// @@split logic
    require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
      var internalSplit;
      if (
          'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
          'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
          'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
          '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
          '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
          ''[$SPLIT](/.?/)[LENGTH]
      ) {
        // based on es5-shim implementation, need to rework it
        internalSplit = function (separator, limit) {
          var string = String(this);
          if (separator === undefined && limit === 0) return [];
          // If `separator` is not a regex, use native split
          if (!isRegExp(separator)) return $split.call(string, separator, limit);
          var output = [];
          var flags = (separator.ignoreCase ? 'i' : '') +
              (separator.multiline ? 'm' : '') +
              (separator.unicode ? 'u' : '') +
              (separator.sticky ? 'y' : '');
          var lastLastIndex = 0;
          var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
          // Make `global` and avoid `lastIndex` issues by working with a copy
          var separatorCopy = new RegExp(separator.source, flags + 'g');
          var match, lastIndex, lastLength;
          while (match = regexpExec.call(separatorCopy, string)) {
            lastIndex = separatorCopy[LAST_INDEX];
            if (lastIndex > lastLastIndex) {
              output.push(string.slice(lastLastIndex, match.index));
              if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
              lastLength = match[0][LENGTH];
              lastLastIndex = lastIndex;
              if (output[LENGTH] >= splitLimit) break;
            }
            if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
          }
          if (lastLastIndex === string[LENGTH]) {
            if (lastLength || !separatorCopy.test('')) output.push('');
          } else output.push(string.slice(lastLastIndex));
          return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
        };
        // Chakra, V8
      } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
        internalSplit = function (separator, limit) {
          return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
        };
      } else {
        internalSplit = $split;
      }

      return [
        // `String.prototype.split` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.split
        function split(separator, limit) {
          var O = defined(this);
          var splitter = separator == undefined ? undefined : separator[SPLIT];
          return splitter !== undefined
              ? splitter.call(separator, O, limit)
              : internalSplit.call(String(O), separator, limit);
        },
        // `RegExp.prototype[@@split]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
        //
        // NOTE: This cannot be properly polyfilled in engines that don't support
        // the 'y' flag.
        function (regexp, limit) {
          var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
          if (res.done) return res.value;

          var rx = anObject(regexp);
          var S = String(this);
          var C = speciesConstructor(rx, RegExp);

          var unicodeMatching = rx.unicode;
          var flags = (rx.ignoreCase ? 'i' : '') +
              (rx.multiline ? 'm' : '') +
              (rx.unicode ? 'u' : '') +
              (SUPPORTS_Y ? 'y' : 'g');

          // ^(? + rx + ) is needed, in combination with some S slicing, to
          // simulate the 'y' flag.
          var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
          var lim = limit === undefined ? 0xffffffff : limit >>> 0;
          if (lim === 0) return [];
          if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
          var p = 0;
          var q = 0;
          var A = [];
          while (q < S.length) {
            splitter.lastIndex = SUPPORTS_Y ? q : 0;
            var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
            var e;
            if (
                z === null ||
                (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
            ) {
              q = advanceStringIndex(S, q, unicodeMatching);
            } else {
              A.push(S.slice(p, q));
              if (A.length === lim) return A;
              for (var i = 1; i <= z.length - 1; i++) {
                A.push(z[i]);
                if (A.length === lim) return A;
              }
              q = p = e;
            }
          }
          A.push(S.slice(p));
          return A;
        }
      ];
    });

  },{"./_advance-string-index":12,"./_an-object":13,"./_fix-re-wks":23,"./_is-regexp":30,"./_regexp-exec":36,"./_regexp-exec-abstract":35,"./_species-constructor":38,"./_to-length":41}],50:[function(require,module,exports){
    window.MorseCWWave =require( './morse-pro-cw-wave').default;
    window.MorsePlayerWAA = require( './morse-pro-player-waa').default;
    window.MorseListener = require ('./morse-pro-listener').default;
    window.MorseAdaptiveListener = require ('./morse-pro-listener-adaptive').default;
    window.MorseAdaptiveDecoder = require ('./morse-pro-decoder-adaptive').default;
    window.MorseDecoder = require('./morse-pro-decoder').default;

    window.MorseCW = require('./morse-pro-cw').default;
  },{"./morse-pro-cw":2,"./morse-pro-cw-wave":1,"./morse-pro-decoder":4,"./morse-pro-decoder-adaptive":3,"./morse-pro-listener":6,"./morse-pro-listener-adaptive":5,"./morse-pro-player-waa":8}]},{},[50])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL0FldnVtL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYjIvbW9yc2UtcHJvLWN3LXdhdmUuanMiLCJsaWIyL21vcnNlLXByby1jdy5qcyIsImxpYjIvbW9yc2UtcHJvLWRlY29kZXItYWRhcHRpdmUuanMiLCJsaWIyL21vcnNlLXByby1kZWNvZGVyLmpzIiwibGliMi9tb3JzZS1wcm8tbGlzdGVuZXItYWRhcHRpdmUuanMiLCJsaWIyL21vcnNlLXByby1saXN0ZW5lci5qcyIsImxpYjIvbW9yc2UtcHJvLW1lc3NhZ2UuanMiLCJsaWIyL21vcnNlLXByby1wbGF5ZXItd2FhLmpzIiwibGliMi9tb3JzZS1wcm8td3BtLmpzIiwibGliMi9tb3JzZS1wcm8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYWR2YW5jZS1zdHJpbmctaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jbGFzc29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2N0eC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2ZpeC1yZS13a3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mbGFncy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLXJlZ2V4cC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWdleHAtZXhlYy1hYnN0cmFjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZ2V4cC1leGVjLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3N0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1wcmltaXRpdmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAuZXhlYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5tYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5yZXBsYWNlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLnNwbGl0LmpzIiwidGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25jQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxudmFyIF9tb3JzZVByb0N3ID0gcmVxdWlyZShcIi4vbW9yc2UtcHJvLWN3XCIpO1xuXG52YXIgX21vcnNlUHJvQ3cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9yc2VQcm9Ddyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgZGVmYXVsdDogb2JqXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn1cbi8qIVxyXG5UaGlzIGNvZGUgaXMgwqkgQ29weXJpZ2h0IFN0ZXBoZW4gQy4gUGhpbGxpcHMsIDIwMTguXHJcbkVtYWlsOiBzdGV2ZUBzY3BoaWxsaXBzLmNvbVxyXG4qL1xuXG4vKlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogQ2xhc3MgdG8gY3JlYXRlIHNpbmUtd2F2ZSBzYW1wbGVzIG9mIHN0YW5kYXJkIENXIE1vcnNlLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBpbXBvcnQgTW9yc2VDV1dhdmUgZnJvbSAnbW9yc2UtcHJvLWN3LXdhdmUnO1xyXG4gKiB2YXIgbW9yc2VDV1dhdmUgPSBuZXcgTW9yc2VDV1dhdmUoKTtcclxuICogbW9yc2VDV1dhdmUudHJhbnNsYXRlKFwiYWJjXCIpO1xyXG4gKiB2YXIgc2FtcGxlID0gbW9yc2VDV1dhdmUuZ2V0U2FtcGxlKCk7XHJcbiAqL1xuXG5cbnZhciBNb3JzZUNXV2F2ZSA9IGZ1bmN0aW9uIChfTW9yc2VDVykge1xuICBfaW5oZXJpdHMoTW9yc2VDV1dhdmUsIF9Nb3JzZUNXKTtcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtmcmVxdWVuY3k9NTUwXSAtIGZyZXF1ZW5jeSBvZiB3YXZlIGluIEh6XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzYW1wbGVSYXRlPTgwMDBdIC0gc2FtcGxlIHJhdGUgZm9yIHRoZSB3YXZlZm9ybSBpbiBIelxyXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gTW9yc2VDV1dhdmUodXNlUHJvc2lnbnMsIHdwbSwgZndwbSkge1xuICAgIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDU1MDtcbiAgICB2YXIgc2FtcGxlUmF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogODAwMDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb3JzZUNXV2F2ZSk7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChNb3JzZUNXV2F2ZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKE1vcnNlQ1dXYXZlKSkuY2FsbCh0aGlzLCB1c2VQcm9zaWducywgd3BtLCBmd3BtKSk7XG5cbiAgICBfdGhpcy5mcmVxdWVuY3kgPSBmcmVxdWVuY3k7IC8vIGZyZXF1ZW5jeSBvZiB3YXZlIGluIEh6XG5cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cblxuICAgIF90aGlzLnNhbXBsZVJhdGUgPSBzYW1wbGVSYXRlOyAvLyBzYW1wbGUgcmF0ZSBmb3IgdGhlIHdhdmVmb3JtIGluIEh6XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgLyoqXHJcbiAgICogR2V0IGEgc2FtcGxlIHdhdmVmb3JtLCBub3QgdXNpbmcgV2ViIEF1ZGlvIEFQSSAoc3luY2hyb25vdXMpLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kUGFkZGluZz0wXSAtIGhvdyBtdWNoIHNpbGVuY2UgaW4gbXMgdG8gYWRkIHRvIHRoZSBlbmQgb2YgdGhlIHdhdmVmb3JtLlxyXG4gICAqIEByZXR1cm4ge251bWJlcltdfSBhbiBhcnJheSBvZiBmbG9hdHMgaW4gcmFuZ2UgWy0xLCAxXSByZXByZXNlbnRpbmcgdGhlIHdhdmUtZm9ybS5cclxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhNb3JzZUNXV2F2ZSwgW3tcbiAgICBrZXk6IFwiZ2V0U2FtcGxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFNhbXBsZSgpIHtcbiAgICAgIHZhciBlbmRQYWRkaW5nID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xuICAgICAgcmV0dXJuIE1vcnNlQ1dXYXZlLmdldFNhbXBsZUdlbmVyYWwodGhpcy5nZXRUaW1pbmdzKCksIHRoaXMuZnJlcXVlbmN5LCB0aGlzLnNhbXBsZVJhdGUsIGVuZFBhZGRpbmcpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldCBhIHNhbXBsZSB3YXZlZm9ybSwgbm90IHVzaW5nIFdlYiBBdWRpbyBBUEkgKHN5bmNocm9ub3VzKS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyW119IHRpbWluZ3MgLSBtaWxsaXNlY29uZCB0aW1pbmdzLCArdmUgbnVtYmVycyByZXByZXNlbnRpbmcgc291bmQsIC12ZSBmb3Igbm8gc291bmQgKCt2ZS8tdmUgY2FuIGJlIGluIGFueSBvcmRlcilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmcmVxdWVuY3kgLSBmcmVxdWVuY3kgb2Ygc291bmQgaW4gSHouXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2FtcGxlUmF0ZSAtIHNhbXBsZSByYXRlIGluIEh6LlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtlbmRQYWRkaW5nPTBdIC0gaG93IG11Y2ggc2lsZW5jZSBpbiBtcyB0byBhZGQgdG8gdGhlIGVuZCBvZiB0aGUgd2F2ZWZvcm0uXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJbXX0gYW4gYXJyYXkgb2YgZmxvYXRzIGluIHJhbmdlIFstMSwgMV0gcmVwcmVzZW50aW5nIHRoZSB3YXZlLWZvcm0uXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImdldFdBQVNhbXBsZVwiLFxuXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYSBzYW1wbGUgd2F2ZWZvcm0gdXNpbmcgV2ViIEF1ZGlvIEFQSSAoYXN5bmNocm9ub3VzKS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kUGFkZGluZz0wXSAtIGhvdyBtdWNoIHNpbGVuY2UgaW4gbXMgdG8gYWRkIHRvIHRoZSBlbmQgb2YgdGhlIHdhdmVmb3JtLlxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZShudW1iZXJbXSl9IGEgUHJvbWlzZSByZXNvbHZpbmcgdG8gYW4gYXJyYXkgb2YgZmxvYXRzIGluIHJhbmdlIFstMSwgMV0gcmVwcmVzZW50aW5nIHRoZSB3YXZlLWZvcm0uXHJcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0V0FBU2FtcGxlKCkge1xuICAgICAgdmFyIGVuZFBhZGRpbmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7IC8vIGFkZCBtaW5pbXVtIG9mIDVtcyBzaWxlbmNlIHRvIHRoZSBlbmQgdG8gZW5zdXJlIHRoZSBmaWx0ZXJlZCBzaWduYWwgY2FuIGZpbmlzaCBjbGVhbmx5XG5cbiAgICAgIGVuZFBhZGRpbmcgPSBNYXRoLm1heCg1LCBlbmRQYWRkaW5nKTtcbiAgICAgIHZhciB0aW1pbmdzID0gdGhpcy5nZXRUaW1pbmdzKCk7XG4gICAgICB0aW1pbmdzLnB1c2goLWVuZFBhZGRpbmcpO1xuICAgICAgdmFyIG9mZmxpbmVBdWRpb0NvbnRleHRDbGFzcyA9IHdpbmRvdy5PZmZsaW5lQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRPZmZsaW5lQXVkaW9Db250ZXh0O1xuXG4gICAgICBpZiAob2ZmbGluZUF1ZGlvQ29udGV4dENsYXNzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gT2ZmbGluZUF1ZGlvQ29udGV4dCBjbGFzcyBkZWZpbmVkXCIpO1xuICAgICAgfSAvLyBidWZmZXIgbGVuZ3RoIGlzIHRoZSBNb3JzZSBkdXJhdGlvbiArIDVtcyB0byBsZXQgdGhlIGxvd3Bhc3MgZmlsdGVyIGVuZCBjbGVhbmx5XG5cblxuICAgICAgdmFyIG9mZmxpbmVDdHggPSBuZXcgb2ZmbGluZUF1ZGlvQ29udGV4dENsYXNzKDEsIHRoaXMuc2FtcGxlUmF0ZSAqICh0aGlzLmdldER1cmF0aW9uKCkgKyBlbmRQYWRkaW5nKSAvIDEwMDAsIHRoaXMuc2FtcGxlUmF0ZSk7XG4gICAgICB2YXIgZ2Fpbk5vZGUgPSBvZmZsaW5lQ3R4LmNyZWF0ZUdhaW4oKTsgLy8gZW1waXJpY2FsbHksIHRoZSBsb3dwYXNzIGZpbHRlciBvdXRwdXRzIHdhdmVmb3JtIG9mIG1hZ25pdHVkZSAxLjIzLCBzbyBuZWVkIHRvIHNjYWxlIGl0IGRvd24gdG8gYXZvaWQgY2xpcHBpbmdcblxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjgxMywgMCk7XG4gICAgICB2YXIgbG93UGFzc05vZGUgPSBvZmZsaW5lQ3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgICAgbG93UGFzc05vZGUudHlwZSA9IFwibG93cGFzc1wiO1xuICAgICAgbG93UGFzc05vZGUuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKHRoaXMuZnJlcXVlbmN5ICogMS4xLCAwKTsgLy8gVE9ETzogcmVtb3ZlIHRoaXMgbWFnaWMgbnVtYmVyIGFuZCBtYWtlIHRoZSBmaWx0ZXIgY29uZmlndXJhYmxlP1xuXG4gICAgICBnYWluTm9kZS5jb25uZWN0KGxvd1Bhc3NOb2RlKTtcbiAgICAgIGxvd1Bhc3NOb2RlLmNvbm5lY3Qob2ZmbGluZUN0eC5kZXN0aW5hdGlvbik7XG4gICAgICB2YXIgdCA9IDA7XG4gICAgICB2YXIgb3NjaWxsYXRvcjtcbiAgICAgIHZhciBkdXJhdGlvbjtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1pbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGR1cmF0aW9uID0gTWF0aC5hYnModGltaW5nc1tpXSkgLyAxMDAwO1xuXG4gICAgICAgIGlmICh0aW1pbmdzW2ldID4gMCkge1xuICAgICAgICAgIC8vIC12ZSB0aW1pbmdzIGFyZSBzaWxlbmNlXG4gICAgICAgICAgb3NjaWxsYXRvciA9IG9mZmxpbmVDdHguY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgICAgIG9zY2lsbGF0b3IudHlwZSA9ICdzaW5lJztcbiAgICAgICAgICBvc2NpbGxhdG9yLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSh0aGlzLmZyZXF1ZW5jeSwgdCk7XG4gICAgICAgICAgb3NjaWxsYXRvci5zdGFydCh0KTtcbiAgICAgICAgICBvc2NpbGxhdG9yLnN0b3AodCArIGR1cmF0aW9uKTtcbiAgICAgICAgICBvc2NpbGxhdG9yLmNvbm5lY3QoZ2Fpbk5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdCArPSBkdXJhdGlvbjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9mZmxpbmVDdHguc3RhcnRSZW5kZXJpbmcoKS50aGVuKGZ1bmN0aW9uIChyZW5kZXJlZEJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gcmVuZGVyZWRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1dLCBbe1xuICAgIGtleTogXCJnZXRTYW1wbGVHZW5lcmFsXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFNhbXBsZUdlbmVyYWwodGltaW5ncywgZnJlcXVlbmN5LCBzYW1wbGVSYXRlKSB7XG4gICAgICB2YXIgZW5kUGFkZGluZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMDtcbiAgICAgIHZhciBzYW1wbGUgPSBbXTtcblxuICAgICAgaWYgKHRpbWluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gLy8gYWRkIG1pbmltdW0gb2YgNW1zIHNpbGVuY2UgdG8gdGhlIGVuZCB0byBlbnN1cmUgdGhlIGZpbHRlcmVkIHNpZ25hbCBjYW4gZmluaXNoIGNsZWFubHlcblxuXG4gICAgICB0aW1pbmdzLnB1c2goLU1hdGgubWF4KDUsIGVuZFBhZGRpbmcpKTtcbiAgICAgIC8qXHJcbiAgICAgICAgICBDb21wdXRlIGxvd3Bhc3MgYmlxdWFkIGZpbHRlciBjb2VmZmljaWVudHMgdXNpbmcgbWV0aG9kIGZyb20gQ2hyb21pdW1cclxuICAgICAgKi9cbiAgICAgIC8vIHNldCBsb3dwYXNzIGZyZXF1ZW5jeSBjdXRvZmYgdG8gMS41IHggd2F2ZSBmcmVxdWVuY3lcblxuICAgICAgdmFyIGxvd3Bhc3NGcmVxID0gZnJlcXVlbmN5ICogMS41IC8gc2FtcGxlUmF0ZTtcbiAgICAgIHZhciBxID0gTWF0aC5TUVJUMV8yO1xuICAgICAgdmFyIHNpbiA9IE1hdGguc2luKDIgKiBNYXRoLlBJICogbG93cGFzc0ZyZXEpO1xuICAgICAgdmFyIGNvcyA9IE1hdGguY29zKDIgKiBNYXRoLlBJICogbG93cGFzc0ZyZXEpO1xuICAgICAgdmFyIGFscGhhID0gc2luIC8gKDIgKiBNYXRoLnBvdygxMCwgcSAvIDIwKSk7XG4gICAgICB2YXIgYTAgPSAxICsgYWxwaGE7XG4gICAgICB2YXIgYjAgPSAoMSAtIGNvcykgKiAwLjUgLyBhMDtcbiAgICAgIHZhciBiMSA9ICgxIC0gY29zKSAvIGEwO1xuICAgICAgdmFyIGIyID0gKDEgLSBjb3MpICogMC41IC8gYTA7XG4gICAgICB2YXIgYTEgPSAtMiAqIGNvcyAvIGEwO1xuICAgICAgdmFyIGEyID0gKDEgLSBhbHBoYSkgLyBhMDtcbiAgICAgIC8qXHJcbiAgICAgICAgICBDb21wdXRlIGZpbHRlcmVkIHNpZ25hbFxyXG4gICAgICAqL1xuXG4gICAgICB2YXIgc3RlcCA9IE1hdGguUEkgKiAyICogZnJlcXVlbmN5IC8gc2FtcGxlUmF0ZTtcbiAgICAgIHZhciBvbiA9IHRpbWluZ3NbMF0gPiAwID8gMSA6IDA7XG4gICAgICB2YXIgeDAsXG4gICAgICAgICAgeDEgPSAwLFxuICAgICAgICAgIHgyID0gMDtcbiAgICAgIHZhciB5MCxcbiAgICAgICAgICB5MSA9IDAsXG4gICAgICAgICAgeTIgPSAwO1xuICAgICAgdmFyIGdhaW4gPSAwLjgxMzsgLy8gZW1waXJpY2FsbHksIHRoZSBsb3dwYXNzIGZpbHRlciBvdXRwdXRzIHdhdmVmb3JtIG9mIG1hZ25pdHVkZSAxLjIzLCBzbyBuZWVkIHRvIHNjYWxlIGl0IGRvd24gdG8gYXZvaWQgY2xpcHBpbmdcblxuICAgICAgZm9yICh2YXIgdCA9IDA7IHQgPCB0aW1pbmdzLmxlbmd0aDsgdCArPSAxKSB7XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IHNhbXBsZVJhdGUgKiBNYXRoLmFicyh0aW1pbmdzW3RdKSAvIDEwMDA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdXJhdGlvbjsgaSArPSAxKSB7XG4gICAgICAgICAgeDAgPSBvbiAqIE1hdGguc2luKGkgKiBzdGVwKTsgLy8gdGhlIGlucHV0IHNpZ25hbFxuXG4gICAgICAgICAgeTAgPSBiMCAqIHgwICsgYjEgKiB4MSArIGIyICogeDIgLSBhMSAqIHkxIC0gYTIgKiB5MjtcbiAgICAgICAgICBzYW1wbGUucHVzaCh5MCAqIGdhaW4pO1xuICAgICAgICAgIHgyID0geDE7XG4gICAgICAgICAgeDEgPSB4MDtcbiAgICAgICAgICB5MiA9IHkxO1xuICAgICAgICAgIHkxID0geTA7XG4gICAgICAgIH1cblxuICAgICAgICBvbiA9IDEgLSBvbjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNhbXBsZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTW9yc2VDV1dhdmU7XG59KF9tb3JzZVByb0N3Mi5kZWZhdWx0KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTW9yc2VDV1dhdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAucmVwbGFjZVwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxudmFyIF9tb3JzZVByb1dwbSA9IHJlcXVpcmUoJy4vbW9yc2UtcHJvLXdwbScpO1xuXG52YXIgV1BNID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX21vcnNlUHJvV3BtKTtcblxudmFyIF9tb3JzZVByb01lc3NhZ2UgPSByZXF1aXJlKCcuL21vcnNlLXByby1tZXNzYWdlJyk7XG5cbnZhciBfbW9yc2VQcm9NZXNzYWdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21vcnNlUHJvTWVzc2FnZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgZGVmYXVsdDogb2JqXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikge1xuICBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbmV3T2JqID0ge307XG5cbiAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV3T2JqLmRlZmF1bHQgPSBvYmo7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XG4gIGlmICghc2VsZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmO1xufVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59XG4vKiFcclxuVGhpcyBjb2RlIGlzIMKpIENvcHlyaWdodCBTdGVwaGVuIEMuIFBoaWxsaXBzLCAyMDE4LlxyXG5FbWFpbDogc3RldmVAc2NwaGlsbGlwcy5jb21cclxuKi9cblxuLypcclxuTGljZW5zZWQgdW5kZXIgdGhlIEVVUEwsIFZlcnNpb24gMS4yIG9yIOKAkyBhcyBzb29uIHRoZXkgd2lsbCBiZSBhcHByb3ZlZCBieSB0aGUgRXVyb3BlYW4gQ29tbWlzc2lvbiAtIHN1YnNlcXVlbnQgdmVyc2lvbnMgb2YgdGhlIEVVUEwgKHRoZSBcIkxpY2VuY2VcIik7XHJcbllvdSBtYXkgbm90IHVzZSB0aGlzIHdvcmsgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5jZS5cclxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbmNlIGF0OiBodHRwczovL2pvaW51cC5lYy5ldXJvcGEuZXUvY29tbXVuaXR5L2V1cGwvXHJcblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2VuY2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuU2VlIHRoZSBMaWNlbmNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5jZS5cclxuKi9cblxuLyoqXHJcbiAqIENsYXNzIHRvIGNyZWF0ZSB0aGUgb24vb2ZmIHRpbWluZ3MgbmVlZGVkIGJ5IGUuZy4gc291bmQgZ2VuZXJhdG9ycy4gVGltaW5ncyBhcmUgaW4gbWlsbGlzZWNvbmRzOyBcIm9mZlwiIHRpbWluZ3MgYXJlIG5lZ2F0aXZlLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBpbXBvcnQgTW9yc2VDVyBmcm9tICdtb3JzZS1wcm8tY3cnO1xyXG4gKiB2YXIgbW9yc2VDVyA9IG5ldyBNb3JzZUNXKCk7XHJcbiAqIG1vcnNlQ1cudHJhbnNsYXRlKFwiYWJjXCIpO1xyXG4gKiB2YXIgdGltaW5ncyA9IG1vcnNlQ1cuZ2V0VGltaW5ncygpO1xyXG4gKi9cblxuXG52YXIgTW9yc2VDVyA9IGZ1bmN0aW9uIChfTW9yc2VNZXNzYWdlKSB7XG4gIF9pbmhlcml0cyhNb3JzZUNXLCBfTW9yc2VNZXNzYWdlKTtcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBbcHJvc2lnbnM9dHJ1ZV0gLSB3aGV0aGVyIG9yIG5vdCB0byBpbmNsdWRlIHByb3NpZ25zIGluIHRoZSB0cmFuc2xhdGlvbnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dwbT0yMF0gLSB0aGUgc3BlZWQgaW4gd29yZHMgcGVyIG1pbnV0ZSB1c2luZyBQQVJJUyBhcyB0aGUgc3RhbmRhcmQgd29yZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZndwbT13cG1dIC0gdGhlIEZhcm5zd29ydGggc3BlZWQgaW4gd29yZHMgcGVyIG1pbnV0ZSAoZGVmYXVsdHMgdG8gd3BtKVxyXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gTW9yc2VDVygpIHtcbiAgICB2YXIgdXNlUHJvc2lnbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHRydWU7XG4gICAgdmFyIHdwbSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMjA7XG4gICAgdmFyIGZ3cG0gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHdwbTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb3JzZUNXKTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cblxuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKE1vcnNlQ1cuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihNb3JzZUNXKSkuY2FsbCh0aGlzLCB1c2VQcm9zaWducykpO1xuXG4gICAgX3RoaXMud3BtID0gd3BtO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXG4gICAgX3RoaXMuZndwbSA9IGZ3cG07XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG4gIC8qKiBcclxuICAgKiBTZXQgdGhlIFdQTSBzcGVlZC4gRW5zdXJlcyB0aGF0IEZhcm5zd29ydGggV1BNIGlzIG5vIGZhc3RlciB0aGFuIFdQTS5cclxuICAgKiBAdHlwZSB7bnVtYmVyfSAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1vcnNlQ1csIFt7XG4gICAga2V5OiAnZ2V0VGltaW5ncycsXG5cbiAgICAvKipcclxuICAgICAqIFJldHVybiBhbiBhcnJheSBvZiBtaWxsaXNlY29uZCB0aW1pbmdzLlxyXG4gICAgICogV2l0aCB0aGUgRmFybnN3b3J0aCBtZXRob2QsIHRoZSBtb3JzZSBjaGFyYWN0ZXJzIGFyZSBwbGF5ZWQgYXQgb25lXHJcbiAgICAgKiBzcGVlZCBhbmQgdGhlIHNwYWNlcyBiZXR3ZWVuIGNoYXJhY3RlcnMgYXQgYSBzbG93ZXIgc3BlZWQuXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJbXX1cclxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUaW1pbmdzKCkge1xuICAgICAgcmV0dXJuIE1vcnNlQ1cuZ2V0VGltaW5nc0dlbmVyYWwoV1BNLmRpdExlbmd0aCh0aGlzLl93cG0pLCBXUE0uZGFoTGVuZ3RoKHRoaXMuX3dwbSksIFdQTS5kaXRTcGFjZSh0aGlzLl93cG0pLCBXUE0uY2hhclNwYWNlKHRoaXMuX3dwbSwgdGhpcy5fZndwbSksIFdQTS53b3JkU3BhY2UodGhpcy5fd3BtLCB0aGlzLl9md3BtKSwgdGhpcy5tb3JzZSk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGFuIGFycmF5IG9mIG1pbGxpc2Vjb25kIHRpbWluZ3MuXHJcbiAgICAgKiBFYWNoIHNvdW5kIGFuZCBzcGFjZSBoYXMgYSBkdXJhdGlvbi4gVGhlIGR1cmF0aW9ucyBvZiB0aGUgc3BhY2VzIGFyZSBkaXN0aW5ndWlzaGVkIGJ5IGJlaW5nIG5lZ2F0aXZlLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpdCAtIHRoZSBsZW5ndGggb2YgYSBkaXQgaW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGFoIC0gdGhlIGxlbmd0aCBvZiBhIGRhaCBpbiBtaWxsaXNlY29uZHMgKG5vcm1hbGx5IDMgKiBkaXQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGl0U3BhY2UgLSB0aGUgbGVuZ3RoIG9mIGFuIGludHJhLWNoYXJhY3RlciBzcGFjZSBpbiBtaWxsaXNlY29uZHMgKDEgKiBkaXQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhclNwYWNlIC0gdGhlIGxlbmd0aCBvZiBhbiBpbnRlci1jaGFyYWN0ZXIgc3BhY2UgaW4gbWlsbGlzZWNvbmRzIChub3JtYWxseSAzICogZGl0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdvcmRTcGFjZSAtIHRoZSBsZW5ndGggb2YgYW4gaW50ZXItd29yZCBzcGFjZSBpbiBtaWxsaXNlY29uZHMgKG5vcm1hbGx5IDcgKiBkaXQpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9yc2UgLSB0aGUgKGNhbm9uaWNhbCkgbW9yc2UgY29kZSBzdHJpbmcgKG1hdGNoaW5nIFsuLS8gXSopXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJbXX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdnZXREdXJhdGlvbicsXG5cbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgdG90YWwgZHVyYXRpb24gb2YgdGhlIG1lc3NhZ2UgaW4gbXNcclxuICAgICA4IEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXREdXJhdGlvbigpIHtcbiAgICAgIHZhciB0aW1lcyA9IHRoaXMuZ2V0VGltaW5ncygpO1xuICAgICAgdmFyIHQgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHQgKz0gTWF0aC5hYnModGltZXNbaV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd3cG0nLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHdwbSkge1xuICAgICAgdGhpcy5fd3BtID0gd3BtO1xuXG4gICAgICBpZiAod3BtIDwgdGhpcy5fZndwbSkge1xuICAgICAgICB0aGlzLl9md3BtID0gd3BtO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3BtO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgRmFybnN3b3J0aCBXUE0gc3BlZWQuIEVuc3VyZXMgdGhhdCBXUE0gaXMgbm8gc2xvd2VyIHRoYW4gRmFybnN3b3J0aCBXUE0uXHJcbiAgICAgKiAgQHR5cGUge251bWJlcn0gKi9cblxuICB9LCB7XG4gICAga2V5OiAnZndwbScsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoZndwbSkge1xuICAgICAgdGhpcy5fZndwbSA9IGZ3cG07XG5cbiAgICAgIGlmIChmd3BtID4gdGhpcy5fd3BtKSB7XG4gICAgICAgIHRoaXMuX3dwbSA9IGZ3cG07XG4gICAgICB9XG4gICAgfVxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9md3BtO1xuICAgIH1cbiAgICAvKiogXHJcbiAgICAgKiBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgc3BhY2UgYmV0d2VlbiB3b3JkcyBpbiBtcy5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9ICovXG5cbiAgfSwge1xuICAgIGtleTogJ3dvcmRTcGFjZScsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gV1BNLndvcmRTcGFjZSh0aGlzLl93cG0sIHRoaXMuX2Z3cG0pO1xuICAgIH1cbiAgfV0sIFt7XG4gICAga2V5OiAnZ2V0VGltaW5nc0dlbmVyYWwnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUaW1pbmdzR2VuZXJhbChkaXQsIGRhaCwgZGl0U3BhY2UsIGNoYXJTcGFjZSwgd29yZFNwYWNlLCBtb3JzZSkge1xuICAgICAgLy9jb25zb2xlLmxvZyhcIk1vcnNlOiBcIiArIG1vcnNlKTtcbiAgICAgIG1vcnNlID0gbW9yc2UucmVwbGFjZSgvIFxcLyAvZywgJy8nKTsgLy8gdGhpcyBtZWFucyB0aGF0IGEgc3BhY2UgaXMgb25seSB1c2VkIGZvciBpbnRlci1jaGFyYWN0ZXJcblxuICAgICAgbW9yc2UgPSBtb3JzZS5yZXBsYWNlKC8oW1xcLlxcLV0pKD89W1xcLlxcLV0pL2csIFwiJDErXCIpOyAvLyBwdXQgYSArIGluIGJldHdlZW4gYWxsIGRpdHMgYW5kIGRhaHNcblxuICAgICAgdmFyIHRpbWVzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9yc2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3dpdGNoIChtb3JzZVtpXSkge1xuICAgICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgdGltZXMucHVzaChkaXQpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHRpbWVzLnB1c2goZGFoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICB0aW1lcy5wdXNoKC1kaXRTcGFjZSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCIgXCI6XG4gICAgICAgICAgICB0aW1lcy5wdXNoKC1jaGFyU3BhY2UpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiL1wiOlxuICAgICAgICAgICAgdGltZXMucHVzaCgtd29yZFNwYWNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IC8vY29uc29sZS5sb2coXCJUaW1pbmdzOiBcIiArIHRpbWVzKTtcblxuXG4gICAgICByZXR1cm4gdGltZXM7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1vcnNlQ1c7XG59KF9tb3JzZVByb01lc3NhZ2UyLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNb3JzZUNXOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59O1xuXG52YXIgX21vcnNlUHJvV3BtID0gcmVxdWlyZSgnLi9tb3JzZS1wcm8td3BtJyk7XG5cbnZhciBXUE0gPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbW9yc2VQcm9XcG0pO1xuXG52YXIgX21vcnNlUHJvRGVjb2RlciA9IHJlcXVpcmUoJy4vbW9yc2UtcHJvLWRlY29kZXInKTtcblxudmFyIF9tb3JzZVByb0RlY29kZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9yc2VQcm9EZWNvZGVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBkZWZhdWx0OiBvYmpcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHZhciBuZXdPYmogPSB7fTtcblxuICAgIGlmIChvYmogIT0gbnVsbCkge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBuZXdPYmouZGVmYXVsdCA9IG9iajtcbiAgICByZXR1cm4gbmV3T2JqO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn1cbi8qIVxyXG5UaGlzIGNvZGUgaXMgwqkgQ29weXJpZ2h0IFN0ZXBoZW4gQy4gUGhpbGxpcHMsIDIwMTguXHJcbkVtYWlsOiBzdGV2ZUBzY3BoaWxsaXBzLmNvbVxyXG4qL1xuXG4vKlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogQ2xhc3MgdG8gY29udmVydCBmcm9tIHRpbWluZ3MgdG8gTW9yc2UgY29kZS4gQWRhcHRzIHRvIGNoYW5naW5nIHNwZWVkLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiB2YXIgbWVzc2FnZUNhbGxiYWNrID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gKiAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAqIH07XHJcbiAqIHZhciBzcGVlZENhbGxiYWNrID0gZnVuY3Rpb24ocykge1xyXG4gKiAgICAgY29uc29sZS5sb2coJ1NwZWVkIGlzIG5vdzogJyArIHMud3BtICsgJyBXUE0nKTtcclxuICogfTtcclxuICogdmFyIGRlY29kZXIgPSBuZXcgTW9yc2VBZGFwdGl2ZURlY29kZXIoMTApO1xyXG4gKiBkZWNvZGVyLm1lc3NhZ2VDYWxsYmFjayA9IG1lc3NhZ2VDYWxsYmFjaztcclxuICogZGVjb2Rlci5zcGVlZENhbGxiYWNrID0gc3BlZWRDYWxsYmFjaztcclxuICogdmFyIHQ7XHJcbiAqIHdoaWxlIChkZWNvZGVyX2lzX29wZXJhdGluZykge1xyXG4gKiAgICAgLy8gZ2V0IHNvbWUgdGltaW5nIFwidFwiIGZyb20gYSBzZW5zb3IsIG1ha2UgaXQgK3ZlIGZvciBub2lzZSBhbmQgLXZlIGZvciBzaWxlbmNlXHJcbiAqICAgICBkZWNvZGVyLmFkZFRpbWluZyh0KTtcclxuICogfVxyXG4gKiBkZWNvZGVyLmZsdXNoKCk7ICAvLyBtYWtlIHN1cmUgYWxsIHRoZSBkYXRhIGlzIHB1c2hlZCB0aHJvdWdoIHRoZSBkZWNvZGVyXHJcbiAqL1xuXG5cbnZhciBNb3JzZUFkYXB0aXZlRGVjb2RlciA9IGZ1bmN0aW9uIChfTW9yc2VEZWNvZGVyKSB7XG4gIF9pbmhlcml0cyhNb3JzZUFkYXB0aXZlRGVjb2RlciwgX01vcnNlRGVjb2Rlcik7XG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbYnVmZmVyU2l6ZT0zMF0gLSBTaXplIG9mIHRoZSBidWZmZXIgdG8gYXZlcmFnZSBvdmVyXHJcbiAgICovXG5cblxuICBmdW5jdGlvbiBNb3JzZUFkYXB0aXZlRGVjb2Rlcih3cG0sIGZ3cG0pIHtcbiAgICB2YXIgYnVmZmVyU2l6ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMzA7XG4gICAgdmFyIG1lc3NhZ2VDYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogdW5kZWZpbmVkO1xuICAgIHZhciBzcGVlZENhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiB1bmRlZmluZWQ7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTW9yc2VBZGFwdGl2ZURlY29kZXIpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKE1vcnNlQWRhcHRpdmVEZWNvZGVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTW9yc2VBZGFwdGl2ZURlY29kZXIpKS5jYWxsKHRoaXMsIHdwbSwgZndwbSwgbWVzc2FnZUNhbGxiYWNrLCBzcGVlZENhbGxiYWNrKSk7XG5cbiAgICBfdGhpcy5idWZmZXJTaXplID0gYnVmZmVyU2l6ZTtcbiAgICBfdGhpcy5kaXRMZW5ndGhzID0gW107XG4gICAgX3RoaXMuZmRpdExlbmd0aHMgPSBbXTtcbiAgICBfdGhpcy5sb2NrU3BlZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQGFjY2VzcyBwcml2YXRlXHJcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTW9yc2VBZGFwdGl2ZURlY29kZXIsIFt7XG4gICAga2V5OiAnYWRkRGVjb2RlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRGVjb2RlKGR1cmF0aW9uLCBjaGFyYWN0ZXIpIHtcbiAgICAgIF9nZXQoTW9yc2VBZGFwdGl2ZURlY29kZXIucHJvdG90eXBlLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTW9yc2VBZGFwdGl2ZURlY29kZXIucHJvdG90eXBlKSwgJ2FkZERlY29kZScsIHRoaXMpLmNhbGwodGhpcywgZHVyYXRpb24sIGNoYXJhY3Rlcik7IC8vIGFkYXB0IVxuXG5cbiAgICAgIHZhciBkaXQ7XG4gICAgICB2YXIgZmRpdDtcblxuICAgICAgc3dpdGNoIChjaGFyYWN0ZXIpIHtcbiAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgZGl0ID0gZHVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgZGl0ID0gZHVyYXRpb24gLyAzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgICAgZGl0ID0gZHVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgZmRpdCA9IGR1cmF0aW9uIC8gMztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gZW5hYmxlIHRoaXMgaWYgdGhlIGRlY29kZXIgY2FuIGJlIG1hZGUgdG8gaWdub3JlIGV4dHJhIGxvbmcgcGF1c2VzXG4gICAgICAgIC8vIGNhc2UgJy8nOlxuICAgICAgICAvLyAgICAgZmRpdCA9IGR1cmF0aW9uIC8gNztcbiAgICAgICAgLy8gICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRpdExlbmd0aHMucHVzaChkaXQpO1xuICAgICAgdGhpcy5mZGl0TGVuZ3Rocy5wdXNoKGZkaXQpO1xuICAgICAgdGhpcy5kaXRMZW5ndGhzID0gdGhpcy5kaXRMZW5ndGhzLnNsaWNlKC10aGlzLmJ1ZmZlclNpemUpO1xuICAgICAgdGhpcy5mZGl0TGVuZ3RocyA9IHRoaXMuZmRpdExlbmd0aHMuc2xpY2UoLXRoaXMuYnVmZmVyU2l6ZSk7XG5cbiAgICAgIGlmICh0aGlzLmxvY2tTcGVlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgdmFyIGRlbm9tID0gMDtcbiAgICAgIHZhciBmU3VtID0gMDtcbiAgICAgIHZhciBmRGVub20gPSAwO1xuICAgICAgdmFyIHdlaWdodDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1ZmZlclNpemU7IGkrKykge1xuICAgICAgICAvLyB3ZWlnaHQgPSBNYXRoLmV4cCgtdGhpcy5idWZmZXJTaXplICsgMSArIGkpOyAgLy8gZXhwb25lbnRpYWwgd2VpZ2h0aW5nXG4gICAgICAgIHdlaWdodCA9IGkgKyAxOyAvLyBsaW5lYXIgd2VpZ2h0aW5nXG4gICAgICAgIC8vIHdlaWdodCA9IDE7ICAvLyBjb25zdGFudCB3ZWlnaHRpbmdcblxuICAgICAgICBpZiAodGhpcy5kaXRMZW5ndGhzW2ldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzdW0gKz0gdGhpcy5kaXRMZW5ndGhzW2ldICogd2VpZ2h0O1xuICAgICAgICAgIGRlbm9tICs9IHdlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmZkaXRMZW5ndGhzW2ldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBmU3VtICs9IHRoaXMuZmRpdExlbmd0aHNbaV0gKiB3ZWlnaHQ7XG4gICAgICAgICAgZkRlbm9tICs9IHdlaWdodDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZkRlbm9tKSB7XG4gICAgICAgIHRoaXMuZmRpdExlbiA9IGZTdW0gLyBmRGVub207XG4gICAgICB9XG5cbiAgICAgIGlmIChkZW5vbSkge1xuICAgICAgICB0aGlzLmRpdExlbiA9IHN1bSAvIGRlbm9tO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNwZWVkQ2FsbGJhY2soe1xuICAgICAgICB3cG06IHRoaXMud3BtLFxuICAgICAgICBmd3BtOiB0aGlzLmZ3cG1cbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNb3JzZUFkYXB0aXZlRGVjb2Rlcjtcbn0oX21vcnNlUHJvRGVjb2RlcjIuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE1vcnNlQWRhcHRpdmVEZWNvZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcbi8qXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxOC5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG5cbnZhciBfbW9yc2VQcm8gPSByZXF1aXJlKCcuL21vcnNlLXBybycpO1xuXG52YXIgTW9yc2UgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbW9yc2VQcm8pO1xuXG52YXIgX21vcnNlUHJvV3BtID0gcmVxdWlyZSgnLi9tb3JzZS1wcm8td3BtJyk7XG5cbnZhciBXUE0gPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbW9yc2VQcm9XcG0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cbi8qKlxyXG4gKiBDbGFzcyB0byBjb252ZXJ0IGZyb20gdGltaW5ncyB0byBNb3JzZSBjb2RlLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAvLyBUaGUgbWVzc2FnZUNhbGxiYWNrIGlzIGNhbGxlZCB3aGVuIGEgY2hhcmFjdGVyIG9yIG1vcmUgaXMgZGVjb2RlZFxyXG4gKiAvLyBJdCByZWNlaXZlcyBhIGRpY3Rpb25hcnkgb2YgdGhlIHRpbWluZ3MsIG1vcnNlLCBhbmQgdGhlIG1lc3NhZ2VcclxuICogdmFyIG1lc3NhZ2VDYWxsYmFjayA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICogICAgIGNvbnNvbGUubG9nKFwiRGVjb2RlZDoge1xcbiAgdGltaW5nczogXCIgKyBkYXRhLnRpbWluZ3MgKyBcIlxcbiAgbW9yc2U6IFwiICsgZGF0YS5tb3JzZSArIFwiXFxuICBtZXNzYWdlOiBcIiArIGRhdGEubWVzc2FnZSArIFwiXFxufVwiKTtcclxuICogfVxyXG4gKiB2YXIgZGVjb2RlciA9IG5ldyBNb3JzZURlY29kZXIoMTApO1xyXG4gKiBkZWNvZGVyLm1lc3NhZ2VDYWxsYmFjayA9IG1lc3NhZ2VDYWxsYmFjaztcclxuICogdmFyIHQ7XHJcbiAqIHdoaWxlIChkZWNvZGVyX2lzX29wZXJhdGluZykge1xyXG4gKiAgICAgLy8gZ2V0IHNvbWUgdGltaW5nIFwidFwiIGZyb20gYSBzZW5zb3IsIG1ha2UgaXQgK3ZlIGZvciBub2lzZSBhbmQgLXZlIGZvciBzaWxlbmNlXHJcbiAqICAgICBkZWNvZGVyLmFkZFRpbWluZyh0KTtcclxuICogfVxyXG4gKiBkZWNvZGVyLmZsdXNoKCk7ICAvLyBtYWtlIHN1cmUgYWxsIHRoZSBkYXRhIGlzIHB1c2hlZCB0aHJvdWdoIHRoZSBkZWNvZGVyXHJcbiAqL1xuXG5cbnZhciBNb3JzZURlY29kZXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd3BtPTIwXSAtIFRoZSBzcGVlZCBvZiB0aGUgTW9yc2UgaW4gd29yZHMgcGVyIG1pbnV0ZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2Z3cG09d3BtXSAtIFRoZSBGYXJuc3dvcnRoIHNwZWVkIG9mIHRoZSBNb3JzZSBpbiB3b3JkcyBwZXIgbWludXRlLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbWVzc2FnZUNhbGxiYWNrIC0gQ2FsbGJhY2sgZXhlY3V0ZWQgd2l0aCB7bWVzc2FnZTogc3RyaW5nLCB0aW1pbmdzOiBudW1iZXJbXSwgbW9yc2U6IHN0cmluZ30gd2hlbiBkZWNvZGVyIGJ1ZmZlciBpcyBmbHVzaGVkIChldmVyeSBjaGFyYWN0ZXIpLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gc3BlZWRDYWxsYmFjayAtIENhbGxiYWNrIGV4ZWN1dGVkIHdpdGgge3dwbTogbnVtYmVyLCBmd3BtOiBudW1iZXJ9IGlmIHRoZSB3cG0gb3IgZndwbSBzcGVlZCBjaGFuZ2VzLiBUaGUgc3BlZWQgaW4gdGhpcyBjbGFzcyBkb2Vzbid0IGNoYW5nZSBieSBpdHNlbGYsIGJ1dCBlLmcuIHRoZSBmd3BtIGNhbiBjaGFuZ2UgaWYgd3BtIGlzIGNoYW5nZWQuIFJldHVybmVkIGRpY3Rpb25hcnkgaGFzIGtleXMgJ2Z3cG0nIGFuZCAnd3BtJy5cclxuICAqL1xuICBmdW5jdGlvbiBNb3JzZURlY29kZXIoKSB7XG4gICAgdmFyIHdwbSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMjA7XG4gICAgdmFyIGZ3cG0gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHdwbTtcbiAgICB2YXIgbWVzc2FnZUNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG4gICAgdmFyIHNwZWVkQ2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IHVuZGVmaW5lZDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb3JzZURlY29kZXIpO1xuXG4gICAgdGhpcy5fd3BtID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2Z3cG0gPSB1bmRlZmluZWQ7IC8vIGZhcm5zd29ydGggc3BlZWRcblxuICAgIHRoaXMuX2RpdExlbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9mZGl0TGVuID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICB3cG06IDIwLFxuICAgICAgZndwbTogMjBcbiAgICB9O1xuICAgIHRoaXMud3BtID0gd3BtO1xuICAgIHRoaXMuZndwbSA9IGZ3cG07XG4gICAgaWYgKG1lc3NhZ2VDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLm1lc3NhZ2VDYWxsYmFjayA9IG1lc3NhZ2VDYWxsYmFjaztcbiAgICBpZiAoc3BlZWRDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLnNwZWVkQ2FsbGJhY2sgPSBzcGVlZENhbGxiYWNrOyAvLyBmdW5jdGlvbiByZWNlaXZlcyBkaWN0aW9uYXJ5IHdpdGggd3BtIGFuZCBmd3BtIHNldCB3aGVuIHRoZSBzcGVlZCBjaGFuZ2VzXG5cbiAgICB0aGlzLnRpbWluZ3MgPSBbXTsgLy8gYWxsIHRoZSBtcyB0aW1pbmdzIHJlY2VpdmVkLCBhbGwgK3ZlXG5cbiAgICB0aGlzLmNoYXJhY3RlcnMgPSBbXTsgLy8gYWxsIHRoZSBkZWNvZGVkIGNoYXJhY3RlcnMgKCcuJywgJy0nLCBldGMpXG5cbiAgICB0aGlzLnVudXNlZFRpbWVzID0gW107XG4gICAgdGhpcy5ub2lzZVRocmVzaG9sZCA9IDE7IC8vIGEgZHVyYXRpb24gPD0gbm9pc2VUaHJlc2hvbGQgaXMgYXNzdW1lZCB0byBiZSBhbiBlcnJvclxuXG4gICAgdGhpcy5tb3JzZSA9IFwiXCI7IC8vIHN0cmluZyBvZiBtb3JzZVxuXG4gICAgdGhpcy5tZXNzYWdlID0gXCJcIjsgLy8gc3RyaW5nIG9mIGRlY29kZWQgbWVzc2FnZVxuICB9XG4gIC8qKlxyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1vcnNlRGVjb2RlciwgW3tcbiAgICBrZXk6ICd1cGRhdGVUaHJlc2hvbGRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlVGhyZXNob2xkcygpIHtcbiAgICAgIHRoaXMuX2RpdERhaFRocmVzaG9sZCA9ICgxICogdGhpcy5fZGl0TGVuICsgMyAqIHRoaXMuX2RpdExlbikgLyAyO1xuICAgICAgdGhpcy5fZGFoU3BhY2VUaHJlc2hvbGQgPSAoMyAqIHRoaXMuX2ZkaXRMZW4gKyA3ICogdGhpcy5fZmRpdExlbikgLyAyO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNob3VsZCBiZSBzZXQgdG8gdGhlIFdQTSBzcGVlZCBvZiB0aGUgaW5wdXQgc291bmQuXHJcbiAgICAgKiBUaGUgaW5wdXQgZGF0YSBpcyB2YWxpZGF0ZWQgYW5kIHRoaXMuZGVmYXVsdHMud3BtIHdpbGwgYmUgdXNlZCBpZiB0aGVyZSBpcyBhbiBlcnJvciBpbiBpbnB1dC5cclxuICAgICAqIFRoZSBwcml2YXRlIF9md3BtLCBfZGl0TGVuIGFuZCBfZmRpdExlbiB2YXJpYWJsZXMgYXJlIGFsc28gdXBkYXRlZCBhbmQgdGhlIHNwZWVkQ2FsbGJhY2sgaXMgZXhlY3V0ZWQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd3BtIC0gU3BlZWQgaW4gd29yZHMgcGVyIG1pbnV0ZS5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdhZGRUaW1pbmcnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0aW1pbmcgaW4gbXMgdG8gdGhlIGxpc3Qgb2YgcmVjb3JkZWQgdGltaW5ncy5cclxuICAgICAqIFRoZSBkdXJhdGlvbiBzaG91bGQgYmUgcG9zaXRpdmUgZm9yIGEgZGl0IG9yIGRhaCBhbmQgbmVnYXRpdmUgZm9yIGEgc3BhY2UuXHJcbiAgICAgKiBJZiB0aGUgZHVyYXRpb24gaXMgPD0gbm9pc2VUaHJlc2hvbGQgaXQgaXMgYXNzdW1lZCB0byBiZSBub2lzZSBhbmQgaXMgYWRkZWQgdG8gdGhlIHByZXZpb3VzIGR1cmF0aW9uLlxyXG4gICAgICogSWYgYSBkdXJhdGlvbiBpcyB0aGUgc2FtZSBzaWduIGFzIHRoZSBwcmV2aW91cyBvbmUgdGhlbiB0aGV5IGFyZSBjb21iaW5lZC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiAtIG1pbGxpc2Vjb25kIGR1cmF0aW9uIHRvIGFkZCwgcG9zaXRpdmUgZm9yIGEgZGl0IG9yIGRhaCwgbmVnYXRpdmUgZm9yIGEgc3BhY2VcclxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUaW1pbmcoZHVyYXRpb24pIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiUmVjZWl2ZWQ6IFwiICsgZHVyYXRpb24pO1xuICAgICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudW51c2VkVGltZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgbGFzdCA9IHRoaXMudW51c2VkVGltZXNbdGhpcy51bnVzZWRUaW1lcy5sZW5ndGggLSAxXTtcblxuICAgICAgICBpZiAoZHVyYXRpb24gKiBsYXN0ID4gMCkge1xuICAgICAgICAgIC8vIGlmIHRoZSBzaWduIG9mIHRoZSBkdXJhdGlvbiBpcyB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXMgb25lIHRoZW4gYWRkIGl0IG9uXG4gICAgICAgICAgdGhpcy51bnVzZWRUaW1lcy5wb3AoKTtcbiAgICAgICAgICBkdXJhdGlvbiA9IGxhc3QgKyBkdXJhdGlvbjtcbiAgICAgICAgfSBlbHNlIGlmIChNYXRoLmFicyhkdXJhdGlvbikgPD0gdGhpcy5ub2lzZVRocmVzaG9sZCkge1xuICAgICAgICAgIC8vIGlmIHRoZSBkdXJhdGlvbiBpcyB2ZXJ5IHNob3J0LCBhc3N1bWUgaXQgaXMgYSBtaXN0YWtlIGFuZCBhZGQgaXQgdG8gdGhlIHByZXZpb3VzIG9uZVxuICAgICAgICAgIHRoaXMudW51c2VkVGltZXMucG9wKCk7XG4gICAgICAgICAgZHVyYXRpb24gPSBsYXN0IC0gZHVyYXRpb247IC8vIHRha2UgY2FyZSBvZiB0aGUgc2lnbiBjaGFuZ2VcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnVudXNlZFRpbWVzLnB1c2goZHVyYXRpb24pOyAvLyBJZiB3ZSBoYXZlIGp1c3QgcmVjZWl2ZWQgYSBjaGFyYWN0ZXIgc3BhY2Ugb3IgbG9uZ2VyIHRoZW4gZmx1c2ggdGhlIHRpbWluZ3NcblxuICAgICAgaWYgKC1kdXJhdGlvbiA+PSB0aGlzLl9kaXREYWhUaHJlc2hvbGQpIHtcbiAgICAgICAgLy8gVE9ETzogaWYgZndwbSAhPSB3cG0gdGhlbiB0aGUgZGl0RGFoVGhyZXNob2xkIG9ubHkgYXBwbGllcyB0byBzb3VuZCwgbm90IHNwYWNlcyBzbyB0aGlzIGlzIHNsaWdodGx5IHdyb25nIChuZWVkIGFub3RoZXIgdGhyZXNob2xkKVxuICAgICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogUHJvY2VzcyB0aGUgYnVmZmVyIG9mIHVudXNlZCB0aW1pbmdzLCBjb252ZXJ0aW5nIHRoZW0gaW50byBNb3JzZSBhbmQgY29udmVydGluZyB0aGUgZ2VuZXJhdGVkIE1vcnNlIGludG8gYSBtZXNzYWdlLlxyXG4gICAgICogU2hvdWxkIGJlIGNhbGxlZCBvbmx5IHdoZW4gYSBjaGFyYWN0ZXIgc3BhY2UgaGFzIGJlZW4gcmVhY2hlZCAob3IgdGhlIG1lc3NhZ2UgaXMgYXQgYW4gZW5kKS5cclxuICAgICAqIFdpbGwgY2FsbCB0aGUgbWVzc2FnZUNhbGxiYWNrIHdpdGggdGhlIGxhdGVzdCB0aW1pbmdzLCBtb3JzZSAoZG90cyBhbmQgZGFzaGVzKSBhbmQgbWVzc2FnZS5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdmbHVzaCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgLy8gVGhlbiB3ZSd2ZSByZWFjaGVkIHRoZSBlbmQgb2YgYSBjaGFyYWN0ZXIgb3Igd29yZCBvciBhIGZsdXNoIGhhcyBiZWVuIGZvcmNlZFxuICAgICAgLy8gSWYgdGhlIGxhc3QgY2hhcmFjdGVyIGRlY29kZWQgd2FzIGEgc3BhY2UgdGhlbiBqdXN0IGlnbm9yZSBhZGRpdGlvbmFsIHF1aWV0XG4gICAgICBpZiAodGhpcy5tZXNzYWdlW3RoaXMubWVzc2FnZS5sZW5ndGggLSAxXSA9PT0gJyAnKSB7XG4gICAgICAgIGlmICh0aGlzLnVudXNlZFRpbWVzWzBdIDwgMCkge1xuICAgICAgICAgIHRoaXMudW51c2VkVGltZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuICAgICAgfSAvLyBNYWtlIHN1cmUgdGhlcmUgaXMgKHN0aWxsKSBzb21ldGhpbmcgdG8gZGVjb2RlXG5cblxuICAgICAgaWYgKHRoaXMudW51c2VkVGltZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gSWYgbGFzdCBlbGVtZW50IGlzIHF1aWV0IGJ1dCBpdCBpcyBub3QgZW5vdWdoIGZvciBhIHNwYWNlIGNoYXJhY3RlciB0aGVuIHBvcCBpdCBvZmYgYW5kIHJlcGxhY2UgYWZ0ZXJ3YXJkc1xuXG5cbiAgICAgIHZhciBsYXN0ID0gdGhpcy51bnVzZWRUaW1lc1t0aGlzLnVudXNlZFRpbWVzLmxlbmd0aCAtIDFdO1xuXG4gICAgICBpZiAobGFzdCA8IDAgJiYgLWxhc3QgPCB0aGlzLl9kYWhTcGFjZVRocmVzaG9sZCkge1xuICAgICAgICB0aGlzLnVudXNlZFRpbWVzLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdSA9IHRoaXMudW51c2VkVGltZXM7XG4gICAgICB2YXIgbSA9IHRoaXMudGltaW5nczJtb3JzZSh0aGlzLnVudXNlZFRpbWVzKTtcbiAgICAgIHZhciB0ID0gTW9yc2UubW9yc2UydGV4dChtKS5tZXNzYWdlOyAvLyB3aWxsIGJlICcjJyBpZiB0aGVyZSdzIGFuIGVycm9yXG5cbiAgICAgIHRoaXMubW9yc2UgKz0gbTtcbiAgICAgIHRoaXMubWVzc2FnZSArPSB0O1xuXG4gICAgICBpZiAobGFzdCA8IDApIHtcbiAgICAgICAgdGhpcy51bnVzZWRUaW1lcyA9IFtsYXN0XTsgLy8gcHV0IHRoZSBzcGFjZSBiYWNrIG9uIHRoZSBlbmQgaW4gY2FzZSB0aGVyZSBpcyBtb3JlIHF1aWV0IHRvIGNvbWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudW51c2VkVGltZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tZXNzYWdlQ2FsbGJhY2soe1xuICAgICAgICB0aW1pbmdzOiB1LFxuICAgICAgICBtb3JzZTogbSxcbiAgICAgICAgbWVzc2FnZTogdFxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBmcm9tIG1pbGxpc2Vjb25kIHRpbWluZ3MgdG8gZG90cyBhbmQgZGFzaGVzLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gdGltZXMgLSBhcnJheSBvZiBtaWxsaXNlY29uZCB0aW1pbmdzLCArdmUgbnVtYmVycyByZXByZXNlbnRpbmcgYSBzaWduYWwsIC12ZSByZXByZXNlbnRpbmcgYSBzcGFjZS5cclxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgZG90cyBhbmQgZGFzaGVzIGFzIGEgc3RyaW5nLlxyXG4gICAgICogQGFjY2VzcyBwcml2YXRlXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAndGltaW5nczJtb3JzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRpbWluZ3MybW9yc2UodGltZXMpIHtcbiAgICAgIHZhciBkaXRkYWggPSBcIlwiO1xuICAgICAgdmFyIGM7XG4gICAgICB2YXIgZDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkID0gdGltZXNbaV07XG5cbiAgICAgICAgaWYgKGQgPiAwKSB7XG4gICAgICAgICAgaWYgKGQgPCB0aGlzLl9kaXREYWhUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGMgPSBcIi5cIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYyA9IFwiLVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkID0gLWQ7XG5cbiAgICAgICAgICBpZiAoZCA8IHRoaXMuX2RpdERhaFRocmVzaG9sZCkge1xuICAgICAgICAgICAgYyA9IFwiXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChkIDwgdGhpcy5fZGFoU3BhY2VUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGMgPSBcIiBcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYyA9IFwiL1wiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkRGVjb2RlKGQsIGMpO1xuICAgICAgICBkaXRkYWggPSBkaXRkYWggKyBjO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGl0ZGFoO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFN0b3JlIHRoZSB0aW1pbmcgYW5kIHRoZSBjb3JyZXNwb25kaW5nIGRlY29kZWQgY2hhcmFjdGVyIGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSB0aGUgbWlsbGlzZWNvbmQgZHVyYXRpb24gKGFsd2F5cyArdmUpLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJhY3RlciAtIHRoZSBjb3JyZXNwb25kaW5nIGNoYXJhY3RlciBlbGVtZW50IFsuLS8gXS5cclxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2FkZERlY29kZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZERlY29kZShkdXJhdGlvbiwgY2hhcmFjdGVyKSB7XG4gICAgICB0aGlzLnRpbWluZ3MucHVzaChkdXJhdGlvbik7XG4gICAgICB0aGlzLmNoYXJhY3RlcnMucHVzaChjaGFyYWN0ZXIpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2dldFRpbWluZ3MnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUaW1pbmdzKGNoYXJhY3Rlcikge1xuICAgICAgdmFyIHJldCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGltaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5jaGFyYWN0ZXJzW2ldID09PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICByZXQucHVzaCh0aGlzLnRpbWluZ3NbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBtaWxsaXNlY29uZCB0aW1pbmdzIG9mIGFsbCBkdXJhdGlvbnMgZGV0ZXJtaW5lZCB0byBiZSBkaXRzXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJbXX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdtZXNzYWdlQ2FsbGJhY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtZXNzYWdlQ2FsbGJhY2soanNvbkRhdGEpIHt9XG4gIH0sIHtcbiAgICBrZXk6ICdzcGVlZENhbGxiYWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3BlZWRDYWxsYmFjayhqc29uRGF0YSkge31cbiAgfSwge1xuICAgIGtleTogJ3dwbScsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQod3BtKSB7XG4gICAgICBpZiAoaXNOYU4od3BtKSkgd3BtID0gdGhpcy5kZWZhdWx0cy53cG07XG4gICAgICB3cG0gPSBNYXRoLm1heCh3cG0sIDEpO1xuICAgICAgdGhpcy5fd3BtID0gd3BtO1xuXG4gICAgICBpZiAodGhpcy5fZndwbSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuX2Z3cG0gPiB3cG0pIHtcbiAgICAgICAgdGhpcy5fZndwbSA9IHRoaXMuX3dwbTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGl0TGVuID0gV1BNLmRpdExlbmd0aCh0aGlzLl93cG0pO1xuICAgICAgdGhpcy5fZmRpdExlbiA9IFdQTS5mZGl0TGVuZ3RoKHRoaXMuX3dwbSwgdGhpcy5fZndwbSk7XG4gICAgICB0aGlzLnVwZGF0ZVRocmVzaG9sZHMoKTtcbiAgICAgIHRoaXMuc3BlZWRDYWxsYmFjayh7XG4gICAgICAgIHdwbTogdGhpcy53cG0sXG4gICAgICAgIGZ3cG06IHRoaXMuZndwbVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl93cG07XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2hvdWxkIGJlIHNldCB0byB0aGUgRmFybnN3b3J0aCBXUE0gc3BlZWQgb2YgdGhlIGlucHV0IHNvdW5kLlxyXG4gICAgICogVGhlIGlucHV0IGRhdGEgaXMgdmFsaWRhdGVkIGFuZCB0aGlzLmRlZmF1bHRzLmZ3cG0gd2lsbCBiZSB1c2VkIGlmIHRoZXJlIGlzIGFuIGVycm9yIGluIGlucHV0LlxyXG4gICAgICogVGhlIHByaXZhdGUgX3dwbSwgX2RpdExlbiBhbmQgX2ZkaXRMZW4gdmFyaWFibGVzIGFyZSBhbHNvIHVwZGF0ZWQgYW5kIHRoZSBzcGVlZENhbGxiYWNrIGlzIGV4ZWN1dGVkLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZ3cG0gLSBTcGVlZCBpbiB3b3JkcyBwZXIgbWludXRlLlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2Z3cG0nLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGZ3cG0pIHtcbiAgICAgIGlmIChpc05hTihmd3BtKSkgZndwbSA9IHRoaXMuZGVmYXVsdHMuZndwbTtcbiAgICAgIGZ3cG0gPSBNYXRoLm1heChmd3BtLCAxKTtcbiAgICAgIHRoaXMuX2Z3cG0gPSBmd3BtO1xuXG4gICAgICBpZiAodGhpcy5fd3BtID09PSB1bmRlZmluZWQgfHwgdGhpcy5fd3BtIDwgZndwbSkge1xuICAgICAgICB0aGlzLndwbSA9IGZ3cG07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2RpdExlbiA9IFdQTS5kaXRMZW5ndGgodGhpcy5fd3BtKTtcbiAgICAgIHRoaXMuX2ZkaXRMZW4gPSBXUE0uZmRpdExlbmd0aCh0aGlzLl93cG0sIHRoaXMuX2Z3cG0pO1xuICAgICAgdGhpcy51cGRhdGVUaHJlc2hvbGRzKCk7XG4gICAgICB0aGlzLnNwZWVkQ2FsbGJhY2soe1xuICAgICAgICB3cG06IHRoaXMud3BtLFxuICAgICAgICBmd3BtOiB0aGlzLmZ3cG1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZndwbTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGxlbmd0aCBvZiBhIGRpdCB0aGUgZGVjb2RlciB3aWxsIGxvb2sgZm9yLlxyXG4gICAgICogVGhlIHByaXZhdGUgX3dwbSwgX2Z3cG0sIGFuZCBfZmRpdExlbiB2YXJpYWJsZXMgYXJlIGFsc28gdXBkYXRlZC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaXQgLSBMZW5ndGggb2YgYSBkaXQgaW4gbXMuXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZGl0TGVuJyxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChkaXQpIHtcbiAgICAgIHRoaXMuX2RpdExlbiA9IGRpdDtcblxuICAgICAgaWYgKHRoaXMuX2ZkaXRMZW4gPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9mZGl0TGVuIDwgdGhpcy5fZGl0TGVuKSB7XG4gICAgICAgIHRoaXMuX2ZkaXRMZW4gPSB0aGlzLl9kaXRMZW47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3dwbSA9IFdQTS53cG0odGhpcy5fZGl0TGVuKTtcbiAgICAgIHRoaXMuX2Z3cG0gPSBXUE0uZndwbSh0aGlzLl93cG0sIHRoaXMuX2ZkaXRMZW4gLyB0aGlzLl9kaXRMZW4pO1xuICAgICAgdGhpcy51cGRhdGVUaHJlc2hvbGRzKCk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaXRMZW47XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBsZW5ndGggb2YgYSBGYXJuc3dvcnRoIGRpdCB0aGUgZGVjb2RlciB3aWxsIGxvb2sgZm9yLlxyXG4gICAgICogVGhlIHByaXZhdGUgX3dwbSwgX2Z3cG0sIGFuZCBfZGl0TGVuIHZhcmlhYmxlcyBhcmUgYWxzbyB1cGRhdGVkLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpdCAtIExlbmd0aCBvZiBhIEZhcm5zd29ydGggZGl0IGluIG1zLlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2ZkaXRMZW4nLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGZkaXQpIHtcbiAgICAgIHRoaXMuX2ZkaXRMZW4gPSBmZGl0O1xuXG4gICAgICBpZiAodGhpcy5fZGl0TGVuID09PSB1bmRlZmluZWQgfHwgdGhpcy5fZGl0TGVuID4gdGhpcy5fZmRpdExlbikge1xuICAgICAgICB0aGlzLl9kaXRMZW4gPSB0aGlzLl9mZGl0TGVuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl93cG0gPSBXUE0ud3BtKHRoaXMuX2RpdExlbik7XG4gICAgICB0aGlzLl9md3BtID0gV1BNLmZ3cG0odGhpcy5fd3BtLCB0aGlzLl9mZGl0TGVuIC8gdGhpcy5fZGl0TGVuKTtcbiAgICAgIHRoaXMudXBkYXRlVGhyZXNob2xkcygpO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmRpdExlbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXRzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJy4nKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIG1pbGxpc2Vjb25kIHRpbWluZ3Mgb2YgYWxsIGR1cmF0aW9ucyBkZXRlcm1pbmVkIHRvIGJlIGRhaHNcclxuICAgICAqIEByZXR1cm4ge251bWJlcltdfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2RhaHMnLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGltaW5ncygnLScpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbWlsbGlzZWNvbmQgdGltaW5ncyBvZiBhbGwgZHVyYXRpb25zIGRldGVybWluZWQgdG8gYmUgZGl0LXNwYWNlc1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZGl0U3BhY2VzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJycpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbWlsbGlzZWNvbmQgdGltaW5ncyBvZiBhbGwgZHVyYXRpb25zIGRldGVybWluZWQgdG8gYmUgZGFoLXNwYWNlc1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZGFoU3BhY2VzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJyAnKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIG1pbGxpc2Vjb25kIHRpbWluZ3Mgb2YgYWxsIGR1cmF0aW9ucyBkZXRlcm1pbmVkIHRvIGJlIHNwYWNlc1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc3BhY2VzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJy8nKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTW9yc2VEZWNvZGVyO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNb3JzZURlY29kZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gIH1cbn07XG5cbnZhciBfbW9yc2VQcm9MaXN0ZW5lciA9IHJlcXVpcmUoJy4vbW9yc2UtcHJvLWxpc3RlbmVyJyk7XG5cbnZhciBfbW9yc2VQcm9MaXN0ZW5lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tb3JzZVByb0xpc3RlbmVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBkZWZhdWx0OiBvYmpcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufVxuLyohXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxOC5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcbiovXG5cbi8qXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBFVVBMLCBWZXJzaW9uIDEuMiBvciDigJMgYXMgc29vbiB0aGV5IHdpbGwgYmUgYXBwcm92ZWQgYnkgdGhlIEV1cm9wZWFuIENvbW1pc3Npb24gLSBzdWJzZXF1ZW50IHZlcnNpb25zIG9mIHRoZSBFVVBMICh0aGUgXCJMaWNlbmNlXCIpO1xyXG5Zb3UgbWF5IG5vdCB1c2UgdGhpcyB3b3JrIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2VuY2UuXHJcbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5jZSBhdDogaHR0cHM6Ly9qb2ludXAuZWMuZXVyb3BhLmV1L2NvbW11bml0eS9ldXBsL1xyXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbmNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcblNlZSB0aGUgTGljZW5jZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2VuY2UuXHJcbiovXG5cbi8qKlxyXG4gKiBFeHRlbnNpb24gb2YgdGhlIE1vcnNlTGlzdGVuZXIgY2xhc3Mgd2hpY2ggYXV0b21hdGljYWxseSBhZGFwdHMgdG8gdGhlIGRvbWluYW50IGZyZXF1ZW5jeS5cclxuICovXG5cblxudmFyIE1vcnNlQWRhcHRpdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChfTW9yc2VMaXN0ZW5lcikge1xuICBfaW5oZXJpdHMoTW9yc2VBZGFwdGl2ZUxpc3RlbmVyLCBfTW9yc2VMaXN0ZW5lcik7XG4gIC8qKlxyXG4gICAqIFBhcmFtZXRlcnMgYXJlIGFsbCB0aGUgc2FtZSBhcyB0aGUgTW9yc2VMaXN0ZW5lciBjbGFzcyB3aXRoIHRoZSBhZGRpdGlvbiBvZiB0aGUgYnVmZmVyRHVyYXRpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtidWZmZXJEdXJhdGlvbj01MDBdIC0gSG93IGxvbmcgaW4gbXMgdG8gbG9vayBiYWNrIHRvIGZpbmQgdGhlIGZyZXF1ZW5jeSB3aXRoIHRoZSBtYXhpbXVtIHZvbHVtZS5cclxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIE1vcnNlQWRhcHRpdmVMaXN0ZW5lcihmZnRTaXplLCB2b2x1bWVNaW4sIHZvbHVtZU1heCwgZnJlcXVlbmN5TWluLCBmcmVxdWVuY3lNYXgsIHZvbHVtZVRocmVzaG9sZCwgZGVjb2Rlcikge1xuICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiA3ICYmIGFyZ3VtZW50c1s3XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzddIDogNTAwO1xuICAgIHZhciBzcGVjdHJvZ3JhbUNhbGxiYWNrID0gYXJndW1lbnRzWzhdO1xuICAgIHZhciBmcmVxdWVuY3lGaWx0ZXJDYWxsYmFjayA9IGFyZ3VtZW50c1s5XTtcbiAgICB2YXIgdm9sdW1lRmlsdGVyQ2FsbGJhY2sgPSBhcmd1bWVudHNbMTBdO1xuICAgIHZhciB2b2x1bWVUaHJlc2hvbGRDYWxsYmFjayA9IGFyZ3VtZW50c1sxMV07XG4gICAgdmFyIG1pY1N1Y2Nlc3NDYWxsYmFjayA9IGFyZ3VtZW50c1sxMl07XG4gICAgdmFyIG1pY0Vycm9yQ2FsbGJhY2sgPSBhcmd1bWVudHNbMTNdO1xuICAgIHZhciBmaWxlTG9hZENhbGxiYWNrID0gYXJndW1lbnRzWzE0XTtcbiAgICB2YXIgZmlsZUVycm9yQ2FsbGJhY2sgPSBhcmd1bWVudHNbMTVdO1xuICAgIHZhciBFT0ZDYWxsYmFjayA9IGFyZ3VtZW50c1sxNl07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTW9yc2VBZGFwdGl2ZUxpc3RlbmVyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChNb3JzZUFkYXB0aXZlTGlzdGVuZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihNb3JzZUFkYXB0aXZlTGlzdGVuZXIpKS5jYWxsKHRoaXMsIGZmdFNpemUsIHZvbHVtZU1pbiwgdm9sdW1lTWF4LCBmcmVxdWVuY3lNaW4sIGZyZXF1ZW5jeU1heCwgdm9sdW1lVGhyZXNob2xkLCBkZWNvZGVyLCBzcGVjdHJvZ3JhbUNhbGxiYWNrLCBmcmVxdWVuY3lGaWx0ZXJDYWxsYmFjaywgdm9sdW1lRmlsdGVyQ2FsbGJhY2ssIHZvbHVtZVRocmVzaG9sZENhbGxiYWNrLCBtaWNTdWNjZXNzQ2FsbGJhY2ssIG1pY0Vycm9yQ2FsbGJhY2ssIGZpbGVMb2FkQ2FsbGJhY2ssIGZpbGVFcnJvckNhbGxiYWNrLCBFT0ZDYWxsYmFjaykpO1xuXG4gICAgX3RoaXMuYnVmZmVyU2l6ZSA9IE1hdGguZmxvb3IoYnVmZmVyRHVyYXRpb24gLyBfdGhpcy50aW1lU3RlcCk7XG4gICAgX3RoaXMuYnVmZmVySW5kZXggPSAwO1xuICAgIF90aGlzLmJ1ZmZlciA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdGhpcy5idWZmZXJTaXplOyBpKyspIHtcbiAgICAgIF90aGlzLmJ1ZmZlcltpXSA9IG5ldyBVaW50OEFycmF5KF90aGlzLmZyZXFCaW5zKTtcbiAgICB9XG5cbiAgICBfdGhpcy5hdmVyYWdlVm9sdW1lID0gbmV3IFVpbnQzMkFycmF5KF90aGlzLmZyZXFCaW5zKTtcbiAgICBfdGhpcy5sb2NrRnJlcXVlbmN5ID0gZmFsc2U7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG4gIC8qKlxyXG4gICAqIEBhY2Nlc3M6IHByaXZhdGVcclxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhNb3JzZUFkYXB0aXZlTGlzdGVuZXIsIFt7XG4gICAga2V5OiAncHJvY2Vzc1NvdW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzc1NvdW5kKCkge1xuICAgICAgX2dldChNb3JzZUFkYXB0aXZlTGlzdGVuZXIucHJvdG90eXBlLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTW9yc2VBZGFwdGl2ZUxpc3RlbmVyLnByb3RvdHlwZSksICdwcm9jZXNzU291bmQnLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgICB2YXIgc3VtID0gdGhpcy5mcmVxdWVuY3lEYXRhLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICB9KTtcbiAgICAgIHN1bSAtPSB0aGlzLmZyZXF1ZW5jeURhdGFbMF07IC8vIHJlbW92ZSBEQyBjb21wb25lbnRcblxuICAgICAgaWYgKHN1bSkge1xuICAgICAgICB2YXIgbWF4ID0gMDtcbiAgICAgICAgdmFyIG1heEluZGV4ID0gMDsgLy8gbG9vcCBvdmVyIGFsbCBmcmVxdWVuY2llcywgaWdub3JpbmcgRENcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuZnJlcUJpbnM7IGkrKykge1xuICAgICAgICAgIHRoaXMuYXZlcmFnZVZvbHVtZVtpXSA9IHRoaXMuYXZlcmFnZVZvbHVtZVtpXSArIHRoaXMuZnJlcXVlbmN5RGF0YVtpXSAtIHRoaXMuYnVmZmVyW3RoaXMuYnVmZmVySW5kZXhdW2ldO1xuICAgICAgICAgIHRoaXMuYnVmZmVyW3RoaXMuYnVmZmVySW5kZXhdW2ldID0gdGhpcy5mcmVxdWVuY3lEYXRhW2ldO1xuXG4gICAgICAgICAgaWYgKHRoaXMuYXZlcmFnZVZvbHVtZVtpXSA+IG1heCkge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBpO1xuICAgICAgICAgICAgbWF4ID0gdGhpcy5hdmVyYWdlVm9sdW1lW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYnVmZmVySW5kZXggPSAodGhpcy5idWZmZXJJbmRleCArIDEpICUgdGhpcy5idWZmZXJTaXplO1xuXG4gICAgICAgIGlmICghdGhpcy5sb2NrRnJlcXVlbmN5KSB7XG4gICAgICAgICAgdGhpcy5mcmVxdWVuY3lGaWx0ZXIgPSBtYXhJbmRleCAqIHRoaXMuZnJlcVN0ZXA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTW9yc2VBZGFwdGl2ZUxpc3RlbmVyO1xufShfbW9yc2VQcm9MaXN0ZW5lcjIuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE1vcnNlQWRhcHRpdmVMaXN0ZW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cbi8qIVxyXG5UaGlzIGNvZGUgaXMgwqkgQ29weXJpZ2h0IFN0ZXBoZW4gQy4gUGhpbGxpcHMsIDIwMTguXHJcbkVtYWlsOiBzdGV2ZUBzY3BoaWxsaXBzLmNvbVxyXG4qL1xuXG4vKlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogQSBjbGFzcyB0byAnbGlzdGVuJyBmb3IgTW9yc2UgY29kZSBmcm9tIHRoZSBtaWNyb3Bob25lIG9yIGFuIGF1ZGlvIGZpbGUsIGZpbHRlciB0aGUgc291bmQgYW5kIHBhc3MgdGltaW5ncyB0byBhIGRlY29kZXIgdG8gY29udmVydCB0byB0ZXh0LlxyXG4gKi9cblxuXG52YXIgTW9yc2VMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZmdFNpemUgLSBTaXplIG9mIHRoZSBkaXNjcmV0ZSBGb3VyaWVyIHRyYW5zZm9ybSB0byB1c2UuIE11c3QgYmUgYSBwb3dlciBvZiAyID49IDI1NiAoZGVmYXVsdHMgdG8gMjU2KS4gQSBzbWFsbGVyIGZmdFNpemUgZ2l2ZXMgYmV0dGVyIHRpbWUgcmVzb2x1dGlvbiBidXQgd29yc2UgZnJlcXVlbmN5IHJlc29sdXRpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2b2x1bWVGaWx0ZXJNaW49LTYwXSAtIFNvdW5kIGxlc3MgdGhhbiB0aGlzIHZvbHVtZSAoaW4gZEIpIGlzIGlnbm9yZWQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2b2x1bWVGaWx0ZXJNYXg9LTMwXSAtIFNvdW5kIGdyZWF0ZXIgdGhhbiB0aGlzIHZvbHVtZSAoaW4gZEIpIGlzIGlnbm9yZWQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtmcmVxdWVuY3lGaWx0ZXJNaW49NTUwXSAtIFNvdW5kIGxlc3MgdGhhbiB0aGlzIGZyZXF1ZW5jeSAoaW4gSHopIGlzIGlnbm9yZWQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtmcmVxdWVuY3lGaWx0ZXJNYXg9NTUwXSAtIFNvdW5kIGdyZWF0ZXIgdGhhbiB0aGlzIGZyZXF1ZW5jeSAoaW4gSHopIGlzIGlnbm9yZWQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2b2x1bWVUaHJlc2hvbGQ9MjIwXSAtIElmIHRoZSB2b2x1bWUgaXMgZ3JlYXRlciB0aGFuIHRoaXMgdGhlbiB0aGUgc2lnbmFsIGlzIHRha2VuIGFzIFwib25cIiAocGFydCBvZiBhIGRpdCBvciBkYWgpIChyYW5nZSAwLTI1NSkuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGRlY29kZXIgLSBBbiBpbnN0YW5jZSBvZiBhIGNvbmZpZ3VyZWQgZGVjb2RlciBjbGFzcy5cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IHNwZWN0cm9ncmFtQ2FsbGJhY2sgLSBDYWxsZWQgZXZlcnkgdGltZSBmZnRTaXplIHNhbXBsZXMgYXJlIHJlYWQuXHJcbiAgICAgIENhbGxlZCB3aXRoIGEgZGljdGlvbmFyeSBwYXJhbWV0ZXI6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZnJlcXVlbmN5RGF0YTogb3V0cHV0IG9mIHRoZSBERlQgKHRoZSByZWFsIHZhbHVlcyBpbmNsdWRpbmcgREMgY29tcG9uZW50KVxyXG4gICAgICAgICAgICAgIGZyZXF1ZW5jeVN0ZXA6IGZyZXF1ZW5jeSByZXNvbHV0aW9uIGluIEh6XHJcbiAgICAgICAgICAgICAgdGltZVN0ZXA6IHRpbWUgcmVzb2x1dGlvbiBpbiBIelxyXG4gICAgICAgICAgICAgIGZpbHRlckJpbkxvdzogaW5kZXggb2YgdGhlIGxvd2VzdCBmcmVxdWVuY3kgYmluIGJlaW5nIGFuYWx5c2VkXHJcbiAgICAgICAgICAgICAgZmlsdGVyQmluSGlnaDogaW5kZXggb2YgdGhlIGhpZ2hlc3QgZnJlcXVlbmN5IGJpbiBiZWluZyBhbmFseXNlZFxyXG4gICAgICAgICAgICAgIGZpbHRlclJlZ2lvblZvbHVtZTogdm9sdW1lIGluIHRoZSBhbmFseXNlZCByZWdpb25cclxuICAgICAgICAgICAgICBpc09uOiB3aGV0aGVyIHRoZSBhbmFseXNpcyBkZXRlY3RlZCBhIHNpZ25hbCBvciBub3RcclxuICAgICAgICAgIH1cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGZyZXF1ZW5jeUZpbHRlckNhbGxiYWNrIC0gQ2FsbGVkIHdoZW4gdGhlIGZyZXF1ZW5jeSBmaWx0ZXIgcGFyYW1ldGVycyBjaGFuZ2UuXHJcbiAgICAgIENhbGxlZCB3aXRoIGEgZGljdGlvbmFyeSBwYXJhbWV0ZXI6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgbWluOiBsb3dlc3QgZnJlcXVlbmN5IGluIEh6XHJcbiAgICAgICAgICAgICAgbWF4OiBoaWdoZXN0IGZyZXF1ZW5jeSBpbiBIelxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgVGhlIGZyZXF1ZW5jaWVzIG1heSB3ZWxsIGJlIGRpZmZlcmVudCB0byB0aGF0IHdoaWNoIGlzIHNldCBhcyB0aGV5IGFyZSBxdWFudGlzZWQuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSB2b2x1bWVGaWx0ZXJDYWxsYmFjayAtIENhbGxlZCB3aGVuIHRoZSB2b2x1bWUgZmlsdGVyIHBhcmFtZXRlcnMgY2hhbmdlLlxyXG4gICAgICBDYWxsZWQgd2l0aCBhIGRpY3Rpb25hcnkgcGFyYW1ldGVyOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIG1pbjogbG93IHZvbHVtZSAoaW4gZEIpXHJcbiAgICAgICAgICAgICAgbWF4OiBoaWdoIHZvbHVtZSAoaW4gZEIpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBJZiB0aGUgc2V0IHZvbHVtZXMgYXJlIG5vdCBudW1lcmljIG9yIG91dCBvZiByYW5nZSB0aGVuIHRoZSBjYWxsYmFjayB3aWxsIHJldHVybiBpbiByYW5nZSBudW1iZXJzLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gdm9sdW1lVGhyZXNob2xkQ2FsbGJhY2sgLSBDYWxsZWQgd2l0aCBhIHNpbmdsZSBudW1iZXIgYXMgdGhlIGFyZ3VtZW50IHdoZW4gdGhlIHZvbHVtZSBmaWx0ZXIgdGhyZXNob2xkIGNoYW5nZXMuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBtaWNTdWNjZXNzQ2FsbGJhY2sgLSBDYWxsZWQgd2hlbiB0aGUgbWljcm9waG9uZSBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gY29ubmVjdGVkLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbWljRXJyb3JDYWxsYmFjayAtIENhbGxlZCB3aXRoIHRoZSBlcnJvciBhcyB0aGUgYXJndW1lbnQgaWYgdGhlcmUgaXMgYW4gZXJyb3IgY29ubmVjdGluZyB0byB0aGUgbWljcm9waG9uZS5cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGZpbGVMb2FkQ2FsbGJhY2sgLSBDYWxsZWQgd2l0aCB0aGUgQXVkaW9CdWZmZXIgb2JqZWN0IGFzIHRoZSBhcmd1bWVudCB3aGVuIGEgZmlsZSBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gbG9hZGVkIChhbmQgZGVjb2RlZCkuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBmaWxlRXJyb3JDYWxsYmFjayAtIENhbGxlZCB3aXRoIHRoZSBlcnJvciBhcyB0aGUgYXJndW1lbnQgaWYgdGhlcmUgaXMgYW4gZXJyb3IgaW4gZGVjb2RpbmcgYSBmaWxlLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gRU9GQ2FsbGJhY2sgLSBDYWxsZWQgd2hlbiB0aGUgcGxheWJhY2sgb2YgYSBmaWxlIGVuZHMuXHJcbiAgICovXG4gIGZ1bmN0aW9uIE1vcnNlTGlzdGVuZXIoZmZ0U2l6ZSwgdm9sdW1lRmlsdGVyTWluLCB2b2x1bWVGaWx0ZXJNYXgsIGZyZXF1ZW5jeUZpbHRlck1pbiwgZnJlcXVlbmN5RmlsdGVyTWF4LCB2b2x1bWVUaHJlc2hvbGQsIGRlY29kZXIsIHNwZWN0cm9ncmFtQ2FsbGJhY2ssIGZyZXF1ZW5jeUZpbHRlckNhbGxiYWNrLCB2b2x1bWVGaWx0ZXJDYWxsYmFjaywgdm9sdW1lVGhyZXNob2xkQ2FsbGJhY2ssIG1pY1N1Y2Nlc3NDYWxsYmFjaywgbWljRXJyb3JDYWxsYmFjaywgZmlsZUxvYWRDYWxsYmFjaywgZmlsZUVycm9yQ2FsbGJhY2ssIEVPRkNhbGxiYWNrKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1vcnNlTGlzdGVuZXIpOyAvLyBhdWRpbyBpbnB1dCBhbmQgb3V0cHV0XG5cblxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpIHx8IG5ldyB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KCk7XG4gICAgaWYgKHNwZWN0cm9ncmFtQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5zcGVjdHJvZ3JhbUNhbGxiYWNrID0gc3BlY3Ryb2dyYW1DYWxsYmFjaztcbiAgICBpZiAoZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5mcmVxdWVuY3lGaWx0ZXJDYWxsYmFjayA9IGZyZXF1ZW5jeUZpbHRlckNhbGxiYWNrO1xuICAgIGlmICh2b2x1bWVGaWx0ZXJDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLnZvbHVtZUZpbHRlckNhbGxiYWNrID0gdm9sdW1lRmlsdGVyQ2FsbGJhY2s7XG4gICAgaWYgKHZvbHVtZVRocmVzaG9sZENhbGxiYWNrICE9PSB1bmRlZmluZWQpIHRoaXMudm9sdW1lVGhyZXNob2xkQ2FsbGJhY2sgPSB2b2x1bWVUaHJlc2hvbGRDYWxsYmFjaztcbiAgICBpZiAobWljU3VjY2Vzc0NhbGxiYWNrICE9PSB1bmRlZmluZWQpIHRoaXMubWljU3VjY2Vzc0NhbGxiYWNrID0gbWljU3VjY2Vzc0NhbGxiYWNrO1xuICAgIGlmIChtaWNFcnJvckNhbGxiYWNrICE9PSB1bmRlZmluZWQpIHRoaXMubWljRXJyb3JDYWxsYmFjayA9IG1pY0Vycm9yQ2FsbGJhY2s7XG4gICAgaWYgKGZpbGVMb2FkQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5maWxlTG9hZENhbGxiYWNrID0gZmlsZUxvYWRDYWxsYmFjaztcbiAgICBpZiAoZmlsZUVycm9yQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5maWxlRXJyb3JDYWxsYmFjayA9IGZpbGVFcnJvckNhbGxiYWNrO1xuICAgIGlmIChFT0ZDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLkVPRkNhbGxiYWNrID0gRU9GQ2FsbGJhY2s7XG4gICAgdGhpcy5mZnRTaXplID0gZmZ0U2l6ZTsgLy8gYmFzaWMgcGFyYW1ldGVycyBmcm9tIHRoZSBzYW1wbGUgcmF0ZVxuXG4gICAgdGhpcy5zYW1wbGVSYXRlID0gdGhpcy5hdWRpb0NvbnRleHQuc2FtcGxlUmF0ZTsgLy8gaW4gSHosIDQ4MDAwIG9uIENocm9tZVxuXG4gICAgdGhpcy5tYXhGcmVxID0gdGhpcy5zYW1wbGVSYXRlIC8gMjsgLy8gaW4gSHo7IE55cXVpc3QgdGhlb3JlbVxuXG4gICAgdGhpcy5mcmVxQmlucyA9IHRoaXMuZmZ0U2l6ZSAvIDI7XG4gICAgdGhpcy50aW1lU3RlcCA9IDEwMDAgLyAodGhpcy5zYW1wbGVSYXRlIC8gdGhpcy5mZnRTaXplKTsgLy8gaW4gbXNcblxuICAgIHRoaXMuZnJlcVN0ZXAgPSB0aGlzLm1heEZyZXEgLyB0aGlzLmZyZXFCaW5zO1xuICAgIHRoaXMuaW5pdGlhbGlzZUF1ZGlvTm9kZXMoKTtcbiAgICB0aGlzLmRlZmF1bHRzID0ge1xuICAgICAgZmZ0U2l6ZTogMjU2LFxuICAgICAgdm9sdW1lRmlsdGVyTWluOiAtNjAsXG4gICAgICB2b2x1bWVGaWx0ZXJNYXg6IC0zMCxcbiAgICAgIGZyZXF1ZW5jeUZpbHRlck1pbjogNTUwLFxuICAgICAgZnJlcXVlbmN5RmlsdGVyTWF4OiA1NTAsXG4gICAgICB2b2x1bWVUaHJlc2hvbGQ6IDIwMFxuICAgIH07XG4gICAgdGhpcy52b2x1bWVGaWx0ZXJNaW4gPSB2b2x1bWVGaWx0ZXJNaW47IC8vIGluIGRCXG5cbiAgICB0aGlzLnZvbHVtZUZpbHRlck1heCA9IHZvbHVtZUZpbHRlck1heDtcbiAgICB0aGlzLmZyZXF1ZW5jeUZpbHRlck1pbiA9IGZyZXF1ZW5jeUZpbHRlck1pbjsgLy8gaW4gSHpcblxuICAgIHRoaXMuZnJlcXVlbmN5RmlsdGVyTWF4ID0gZnJlcXVlbmN5RmlsdGVyTWF4O1xuICAgIHRoaXMudm9sdW1lVGhyZXNob2xkID0gdm9sdW1lVGhyZXNob2xkOyAvLyBpbiByYW5nZSBbMC0yNTVdXG5cbiAgICB0aGlzLmRlY29kZXIgPSBkZWNvZGVyO1xuICAgIHRoaXMubm90U3RhcnRlZCA9IHRydWU7XG4gICAgdGhpcy5mbHVzaFRpbWUgPSA1MDA7IC8vIGhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIHB1c2hpbmcgZGF0YSB0byB0aGUgZGVjb2RlciBpZiBlLmcuIHlvdSBoYXZlIGEgdmVyeSBsb25nIHBhdXNlXG5cbiAgICB0aGlzLmlucHV0ID0gdW5kZWZpbmVkOyAvLyBjdXJyZW50IHN0YXRlOiB1bmRlZmluZWQsIFwibWljXCIsIFwiZmlsZVwiXG4gIH1cbiAgLyoqXHJcbiAgICogU2V0IHRoZSBtaW5pbXVtIHRocmVzaG9sZCBvbiB0aGUgdm9sdW1lIGZpbHRlci4gaS5lLiB0aGUgbWluaW11bSB2b2x1bWUgY29uc2lkZXJlZCB0byBiZSBhIHNpZ25hbC5cclxuICAgKiBJbnB1dCB2YWxpZGF0aW9uIGlzIGRvbmUgdG8gc2V0IGEgc2Vuc2libGUgZGVmYXVsdCBvbiBub24tbnVtZXJpYyBpbnB1dCBhbmQgY2xhbXAgdGhlIG1heGltdW0gdG8gYmUgemVyby5cclxuICAgKiBUaGUgdm9sdW1GaWx0ZXJNYXggcHJvcGVydHkgaXMgYWxzbyBzZXQgYnkgdGhpcyB0byBiZSBubyBsZXNzIHRoYW4gdGhlIG1pbmltdW0uXHJcbiAgICogQ2FsbHMgdGhlIHZvbHVtZUZpbHRlckNhbGxiYWNrIHdpdGggdGhlIG5ldyBtaW4gYW5kIG1heC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdiAtIHRoZSBtaW5pbXVtIHZvbHVtZSBpbiBkQiAoLXZlKS5cclxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhNb3JzZUxpc3RlbmVyLCBbe1xuICAgIGtleTogXCJpbml0aWFsaXNlQXVkaW9Ob2Rlc1wiLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAYWNjZXNzOiBwcml2YXRlXHJcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdGlhbGlzZUF1ZGlvTm9kZXMoKSB7XG4gICAgICAvLyBzZXQgdXAgYSBqYXZhc2NyaXB0IG5vZGUgKEJVRkZFUl9TSVpFLCBOVU1fSU5QVVRTLCBOVU1fT1VUUFVUUylcbiAgICAgIHRoaXMuanNOb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKHRoaXMuZmZ0U2l6ZSwgMSwgMSk7IC8vIGJ1ZmZlciBzaXplIGNhbiBiZSAyNTYsIDUxMiwgMTAyNCwgMjA0OCwgNDA5NiwgODE5MiBvciAxNjM4NFxuICAgICAgLy8gc2V0IHRoZSBldmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSBidWZmZXIgaXMgZnVsbFxuXG4gICAgICB0aGlzLmpzTm9kZS5vbmF1ZGlvcHJvY2VzcyA9IHRoaXMucHJvY2Vzc1NvdW5kLmJpbmQodGhpcyk7IC8vIHNldCB1cCBhbiBhbmFseXNlck5vZGVcblxuICAgICAgdGhpcy5hbmFseXNlck5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuICAgICAgdGhpcy5hbmFseXNlck5vZGUuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gMDsgLy8gbm8gbWl4aW5nIHdpdGggdGhlIHByZXZpb3VzIGZyYW1lXG5cbiAgICAgIHRoaXMuYW5hbHlzZXJOb2RlLmZmdFNpemUgPSB0aGlzLmZmdFNpemU7IC8vIGNhbiBiZSAzMiB0byAyMDQ4IGluIHdlYmtpdFxuXG4gICAgICB0aGlzLmZyZXF1ZW5jeURhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLmZyZXFCaW5zKTsgLy8gY3JlYXRlIGFuIGFycnJheSBvZiB0aGUgcmlnaHQgc2l6ZSBmb3IgdGhlIGZyZXF1ZW5jeSBkYXRhXG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgdGhlIGRlY29kZXIgbGlzdGVuaW5nIHRvIHRoZSBtaWNyb3Bob25lLlxyXG4gICAgICogQ2FsbHMgbWljU3VjY2Vzc0NhbGxiYWNrIG9yIG1pY0Vycm9yQ2FsbGJhY2sgb24gc3VjY2VzcyBvciBlcnJvci5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic3RhcnRMaXN0ZW5pbmdcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RhcnRMaXN0ZW5pbmcoKSB7XG4gICAgICB0aGlzLnN0b3AoKTsgLy8gVE9ETzogcmVwbGFjZSB0aGlzIHdpdGggbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoKSBpbnN0ZWFkIGFuZCBzaGltIGZvciBsZWdhY3kgYnJvd3NlcnMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9NZWRpYURldmljZXMvZ2V0VXNlck1lZGlhKVxuXG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHtcbiAgICAgICAgYXVkaW86IHRydWUsXG4gICAgICAgIHZpZGVvOiBmYWxzZVxuICAgICAgfSwgZnVuY3Rpb24gKHN0cmVhbSkge1xuICAgICAgICAvLyBjcmVhdGUgYW4gYXVkaW8gbm9kZSBmcm9tIHRoZSBzdHJlYW1cbiAgICAgICAgdGhpcy5zb3VyY2VOb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2Uoc3RyZWFtKTtcbiAgICAgICAgdGhpcy5pbnB1dCA9IFwibWljXCI7IC8vIGNvbm5lY3Qgbm9kZXMgYnV0IGRvbid0IGNvbm5lY3QgbWljIHRvIGF1ZGlvIG91dHB1dCB0byBhdm9pZCBmZWVkYmFja1xuXG4gICAgICAgIHRoaXMuc291cmNlTm9kZS5jb25uZWN0KHRoaXMuYW5hbHlzZXJOb2RlKTtcbiAgICAgICAgdGhpcy5qc05vZGUuY29ubmVjdCh0aGlzLmF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICAgIHRoaXMubWljU3VjY2Vzc0NhbGxiYWNrKCk7XG4gICAgICB9LmJpbmQodGhpcyksIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICB0aGlzLmlucHV0ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLm1pY0Vycm9yQ2FsbGJhY2soZXJyb3IpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBMb2FkIGF1ZGlvIGRhdGEgZnJvbSBhbiBBcnJheUJ1ZmZlci4gVXNlIGEgRmlsZVJlYWRlciB0byBsb2FkIGZyb20gYSBmaWxlLlxyXG4gICAgICogQ2FsbHMgZmlsZUxvYWRDYWxsYmFjayBvciBmaWxlRXJyb3JDYWxsYmFjayBvbiBzdWNjZXNzIG9yIGVycm9yLlxyXG4gICAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImxvYWRBcnJheUJ1ZmZlclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQXJyYXlCdWZmZXIoYXJyYXlCdWZmZXIpIHtcbiAgICAgIC8vIGJ5IHNlcGFyYXRpbmcgbG9hZGluZyAoZGVjb2RpbmcpIGFuZCBwbGF5aW5nLCB0aGUgcGxheWluZyBjYW4gYmUgZG9uZSBtdWx0aXBsZSB0aW1lc1xuICAgICAgdGhpcy5hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGFycmF5QnVmZmVyLCBmdW5jdGlvbiAoYXVkaW9CdWZmZXIpIHtcbiAgICAgICAgdGhpcy5maWxlQXVkaW9CdWZmZXIgPSBhdWRpb0J1ZmZlcjtcbiAgICAgICAgdGhpcy5maWxlTG9hZENhbGxiYWNrKGF1ZGlvQnVmZmVyKTtcbiAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHRoaXMuZmlsZUF1ZGlvQnVmZmVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmZpbGVFcnJvckNhbGxiYWNrKGVycm9yKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogUGxheSBhIGxvYWRlZCBhdWRpbyBmaWxlICh0aHJvdWdoIHNwZWFrZXJzKSBhbmQgZGVjb2RlIGl0LlxyXG4gICAgICogQ2FsbHMgRU9GQ2FsbGJhY2sgd2hlbiBidWZmZXIgZW5kcy5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicGxheUFycmF5QnVmZmVyXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBsYXlBcnJheUJ1ZmZlcigpIHtcbiAgICAgIHRoaXMuc3RvcCgpOyAvLyBtYWtlIEJ1ZmZlclNvdXJjZSBub2RlXG5cbiAgICAgIHRoaXMuc291cmNlTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgdGhpcy5zb3VyY2VOb2RlLmJ1ZmZlciA9IHRoaXMuZmlsZUF1ZGlvQnVmZmVyO1xuXG4gICAgICB0aGlzLnNvdXJjZU5vZGUub25lbmRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIHRoaXMuRU9GQ2FsbGJhY2soKTtcbiAgICAgIH0uYmluZCh0aGlzKTsgLy8gY29ubmVjdCBub2Rlc1xuXG5cbiAgICAgIHRoaXMuanNOb2RlLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5zb3VyY2VOb2RlLmNvbm5lY3QodGhpcy5hbmFseXNlck5vZGUpO1xuICAgICAgdGhpcy5zb3VyY2VOb2RlLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5pbnB1dCA9IFwiZmlsZVwiOyAvLyBwbGF5XG5cbiAgICAgIHRoaXMuc291cmNlTm9kZS5zdGFydCgpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFN0b3AgbGlzdGVuaW5nLlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzdG9wXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICBpZiAodGhpcy5pbnB1dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaW5wdXQgPT09IFwiZmlsZVwiKSB7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZS5zdG9wKCk7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZS5kaXNjb25uZWN0KHRoaXMuYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb3VyY2VOb2RlLmRpc2Nvbm5lY3QodGhpcy5hbmFseXNlck5vZGUpO1xuICAgICAgdGhpcy5qc05vZGUuZGlzY29ubmVjdCh0aGlzLmF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICB0aGlzLmRlY29kZXIuZmx1c2goKTtcbiAgICAgIHRoaXMuaW5wdXQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogVGhpcyBTY3JpcHRQcm9jZXNzb3JOb2RlIGlzIGNhbGxlZCB3aGVuIGl0IGlzIGZ1bGwsIHdlIHRoZW4gYWN0dWFsbHkgbG9vayBhdCB0aGUgZGF0YSBpbiB0aGUgYW5hbHlzZXJOb2RlIG5vZGUgdG8gbWVhc3VyZSB0aGUgdm9sdW1lIGluIHRoZSBmcmVxdWVuY3kgYmFuZCBvZiBpbnRlcmVzdC4gV2UgZG9uJ3QgYWN0dWFsbHkgdXNlIHRoZSBpbnB1dCBvciBvdXRwdXQgb2YgdGhlIFNjcmlwdFByb2Nlc29yTm9kZS5cclxuICAgICAqIEBhY2Nlc3M6IHByaXZhdGVcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicHJvY2Vzc1NvdW5kXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByb2Nlc3NTb3VuZCgpIHtcbiAgICAgIC8vIGdldCB0aGUgZGF0YSBmcm9tIHRoZSBhbmFseXNlck5vZGUgbm9kZSBhbmQgcHV0IGludG8gZnJlcXVlbmN5RGF0YVxuICAgICAgdGhpcy5hbmFseXNlck5vZGUuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEodGhpcy5mcmVxdWVuY3lEYXRhKTsgLy8gZmluZCB0aGUgYXZlcmFnZSB2b2x1bWUgaW4gdGhlIGZpbHRlciByZWdpb25cblxuICAgICAgdmFyIGZpbHRlclJlZ2lvblZvbHVtZSA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLl9maWx0ZXJCaW5Mb3c7IGkgPD0gdGhpcy5fZmlsdGVyQmluSGlnaDsgaSsrKSB7XG4gICAgICAgIGZpbHRlclJlZ2lvblZvbHVtZSArPSB0aGlzLmZyZXF1ZW5jeURhdGFbaV07XG4gICAgICB9XG5cbiAgICAgIGZpbHRlclJlZ2lvblZvbHVtZSAvPSAxLjAgKiAodGhpcy5fZmlsdGVyQmluSGlnaCAtIHRoaXMuX2ZpbHRlckJpbkxvdyArIDEpOyAvLyByZWNvcmQgdGhlIGRhdGFcblxuICAgICAgdmFyIGlzT24gPSBmaWx0ZXJSZWdpb25Wb2x1bWUgPj0gdGhpcy5fdm9sdW1lVGhyZXNob2xkO1xuICAgICAgdGhpcy5yZWNvcmRPbk9yT2ZmKGlzT24pO1xuICAgICAgdGhpcy5zcGVjdHJvZ3JhbUNhbGxiYWNrKHtcbiAgICAgICAgZnJlcXVlbmN5RGF0YTogdGhpcy5mcmVxdWVuY3lEYXRhLFxuICAgICAgICBmcmVxdWVuY3lTdGVwOiB0aGlzLmZyZXFTdGVwLFxuICAgICAgICB0aW1lU3RlcDogdGhpcy50aW1lU3RlcCxcbiAgICAgICAgZmlsdGVyQmluTG93OiB0aGlzLl9maWx0ZXJCaW5Mb3csXG4gICAgICAgIGZpbHRlckJpbkhpZ2g6IHRoaXMuX2ZpbHRlckJpbkhpZ2gsXG4gICAgICAgIGZpbHRlclJlZ2lvblZvbHVtZTogZmlsdGVyUmVnaW9uVm9sdW1lLFxuICAgICAgICBpc09uOiBpc09uXG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgZWFjaCB0aWNrIHdpdGggd2hldGhlciB0aGUgc291bmQgaXMganVkZ2VkIHRvIGJlIG9uIG9yIG9mZi4gSWYgYSBjaGFuZ2UgZnJvbSBvbiB0byBvZmYgb3Igb2ZmIHRvIG9uIGlzIGRldGVjdGVkIHRoZW4gdGhlIG51bWJlciBvZiB0aWNrcyBvZiB0aGUgc2VnbWVudCBpcyBwYXNzZWQgdG8gdGhlIGRlY29kZXIuXHJcbiAgICAgKiBAYWNjZXNzOiBwcml2YXRlXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInJlY29yZE9uT3JPZmZcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVjb3JkT25Pck9mZihzb3VuZElzT24pIHtcbiAgICAgIGlmICh0aGlzLm5vdFN0YXJ0ZWQpIHtcbiAgICAgICAgaWYgKCFzb3VuZElzT24pIHtcbiAgICAgICAgICAvLyB3YWl0IHVudGlsIHdlIGhlYXIgc29tZXRoaW5nXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubm90U3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMubGFzdFNvdW5kV2FzT24gPSB0cnVlO1xuICAgICAgICAgIHRoaXMudGlja3MgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmxhc3RTb3VuZFdhc09uID09PSBzb3VuZElzT24pIHtcbiAgICAgICAgLy8gYWNjdW11bGF0aW5nIGFuIG9uIG9yIGFuIG9mZlxuICAgICAgICB0aGlzLnRpY2tzKys7XG5cbiAgICAgICAgaWYgKHRoaXMudGlja3MgKiB0aGlzLnRpbWVTdGVwID4gdGhpcy5mbHVzaFRpbWUpIHtcbiAgICAgICAgICAvLyB0aGVuIGl0J3MgZS5nLiBhIHZlcnkgbG9uZyBwYXVzZSwgc28gZmx1c2ggaXQgdGhyb3VnaCB0byBkZWNvZGVyIGFuZCBrZWVwIGNvdW50aW5nXG4gICAgICAgICAgdGhpcy5mbHVzaChzb3VuZElzT24pO1xuICAgICAgICAgIHRoaXMudGlja3MgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3ZSd2ZSBqdXN0IGNoYW5nZWQgZnJvbSBvbiB0byBvZmYgb3IgdmljZSB2ZXJzYVxuICAgICAgICB0aGlzLmZsdXNoKCFzb3VuZElzT24pOyAvLyBmbHVzaCB0aGUgcHJldmlvdXMgc2VnbWVudFxuXG4gICAgICAgIHRoaXMubGFzdFNvdW5kV2FzT24gPSBzb3VuZElzT247XG4gICAgICAgIHRoaXMudGlja3MgPSAxOyAvLyBhdCB0aGlzIG1vbWVudCB3ZSBqdXN0IHNhdyB0aGUgZmlyc3QgdGljayBvZiB0aGUgbmV3IHNlZ21lbnRcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBGbHVzaCB0aGUgY3VycmVudCB0aWNrcyB0byB0aGUgZGVjb2Rlci4gUGFyYW1ldGVyIGlzIHdoZXRoZXIgdGhlIHRpY2tzIHJlcHJlc2VudCBzb3VuZCAob24pIG9yIG5vdC5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZmx1c2hcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICB2YXIgb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHRoaXMubGFzdFNvdW5kV2FzT247XG4gICAgICB0aGlzLmRlY29kZXIuYWRkVGltaW5nKChvbiA/IDEgOiAtMSkgKiB0aGlzLnRpY2tzICogdGhpcy50aW1lU3RlcCk7XG4gICAgfSAvLyBlbXB0eSBjYWxsYmFja3MgdG8gYXZvaWQgZXJyb3JzXG5cbiAgfSwge1xuICAgIGtleTogXCJzcGVjdHJvZ3JhbUNhbGxiYWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNwZWN0cm9ncmFtQ2FsbGJhY2soanNvbkRhdGEpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwiZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2soanNvbkRhdGEpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwidm9sdW1lRmlsdGVyQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdm9sdW1lRmlsdGVyQ2FsbGJhY2soanNvbkRhdGEpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwidm9sdW1lVGhyZXNob2xkQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdm9sdW1lVGhyZXNob2xkQ2FsbGJhY2sodm9sdW1lKSB7fVxuICB9LCB7XG4gICAga2V5OiBcIm1pY1N1Y2Nlc3NDYWxsYmFja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtaWNTdWNjZXNzQ2FsbGJhY2soKSB7fVxuICB9LCB7XG4gICAga2V5OiBcIm1pY0Vycm9yQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWljRXJyb3JDYWxsYmFjayhlcnJvcikge31cbiAgfSwge1xuICAgIGtleTogXCJmaWxlTG9hZENhbGxiYWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpbGVMb2FkQ2FsbGJhY2soYXVkaW9CdWZmZXIpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwiZmlsZUVycm9yQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZmlsZUVycm9yQ2FsbGJhY2soZXJyb3IpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwiRU9GQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gRU9GQ2FsbGJhY2soKSB7fVxuICB9LCB7XG4gICAga2V5OiBcInZvbHVtZUZpbHRlck1pblwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmIChpc05hTih2KSkgdiA9IHRoaXMuZGVmYXVsdHMudm9sdW1lRmlsdGVyTWluOyAvLyB2IGlzIGluIGRCIGFuZCB0aGVyZWZvcmUgLXZlXG5cbiAgICAgIHYgPSBNYXRoLm1pbigwLCB2KTtcbiAgICAgIHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzID0gdjtcbiAgICAgIHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzID0gTWF0aC5tYXgodGhpcy5hbmFseXNlck5vZGUubWF4RGVjaWJlbHMsIHYpO1xuICAgICAgdGhpcy52b2x1bWVGaWx0ZXJDYWxsYmFjayh7XG4gICAgICAgIG1pbjogdGhpcy5hbmFseXNlck5vZGUubWluRGVjaWJlbHMsXG4gICAgICAgIG1heDogdGhpcy5hbmFseXNlck5vZGUubWF4RGVjaWJlbHNcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hbmFseXNlck5vZGUubWluRGVjaWJlbHM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBtYXhpbXVtIHRocmVzaG9sZCBvbiB0aGUgdm9sdW1lIGZpbHRlci4gaS5lLiB0aGUgbWF4aW11bSB2b2x1bWUgY29uc2lkZXJlZCB0byBiZSBhIHNpZ25hbC5cclxuICAgICAqIElucHV0IHZhbGlkYXRpb24gaXMgZG9uZSB0byBzZXQgYSBzZW5zaWJsZSBkZWZhdWx0IG9uIG5vbi1udW1lcmljIGlucHV0IGFuZCBjbGFtcCB0aGUgbWF4aW11bSB0byBiZSB6ZXJvLlxyXG4gICAgICogVGhlIHZvbHVtRmlsdGVyTWluIHByb3BlcnR5IGlzIGFsc28gc2V0IGJ5IHRoaXMgdG8gYmUgbm8gbW9yZSB0aGFuIHRoZSBtYXhpbXVtLlxyXG4gICAgICogQ2FsbHMgdGhlIHZvbHVtZUZpbHRlckNhbGxiYWNrIHdpdGggdGhlIG5ldyBtaW4gYW5kIG1heC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2IC0gdGhlIG1heGltdW0gdm9sdW1lIGluIGRCICgtdmUpLlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJ2b2x1bWVGaWx0ZXJNYXhcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAoaXNOYU4odikpIHYgPSB0aGlzLmRlZmF1bHRzLnZvbHVtZUZpbHRlck1heDsgLy8gdiBpcyBpbiBkQiBhbmQgdGhlcmVmb3JlIC12ZVxuXG4gICAgICB2ID0gTWF0aC5taW4oMCwgdik7XG4gICAgICB0aGlzLmFuYWx5c2VyTm9kZS5tYXhEZWNpYmVscyA9IHY7XG4gICAgICB0aGlzLmFuYWx5c2VyTm9kZS5taW5EZWNpYmVscyA9IE1hdGgubWluKHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzLCB2KTtcbiAgICAgIHRoaXMudm9sdW1lRmlsdGVyQ2FsbGJhY2soe1xuICAgICAgICBtaW46IHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzLFxuICAgICAgICBtYXg6IHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgbWluaW11bSB0aHJlc2hvbGQgb24gdGhlIGZyZXF1ZW5jeSBmaWx0ZXIuIGkuZS4gdGhlIG1pbmltdW0gZnJlcXVlbmN5IHRvIGJlIGNvbnNpZGVyZWQuXHJcbiAgICAgKiBJbnB1dCB2YWxpZGF0aW9uIGlzIGRvbmUgdG8gc2V0IGEgc2Vuc2libGUgZGVmYXVsdCBvbiBub24tbnVtZXJpYyBpbnB1dCBhbmQgdGhlIHZhbHVlIGlzIGNsYW1wZWQgdG8gYmUgYmV0d2VlbiB6ZXJvIGFuZCB0aGUgY3VycmVudCBtYXhpbXVtIGZyZXF1ZW5jeS5cclxuICAgICAqIFRoZSBhY3R1YWwgbWluaW11bSB3aWxsIGJlIHRoZSBtaW5pbXVtIGZyZXF1ZW5jeSBvZiB0aGUgZnJlcXVlbmN5IGJpbiB0aGUgY2hvc2VuIGZyZXF1ZW5jeSBsaWVzIGluLlxyXG4gICAgICogQ2FsbHMgdGhlIGZyZXF1ZW5jeUZpbHRlckNhbGxiYWNrIHdpdGggdGhlIG5ldyBtaW4gYW5kIG1heC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2IC0gdGhlIG1pbmltdW0gZnJlcXVlbmN5IGluIEh6LlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJmcmVxdWVuY3lGaWx0ZXJNaW5cIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChmKSB7XG4gICAgICBpZiAoaXNOYU4oZikpIGYgPSB0aGlzLmRlZmF1bHRzLmZyZXF1ZW5jeUZpbHRlck1pbjtcbiAgICAgIGYgPSBNYXRoLm1pbihNYXRoLm1heChmLCAwKSwgdGhpcy5tYXhGcmVxKTtcbiAgICAgIHRoaXMuX2ZpbHRlckJpbkxvdyA9IE1hdGgubWluKE1hdGgubWF4KE1hdGgucm91bmQoZiAvIHRoaXMuZnJlcVN0ZXApLCAxKSwgdGhpcy5mcmVxQmlucyk7IC8vIGF0IGxlYXN0IDEgdG8gYXZvaWQgREMgY29tcG9uZW50XG5cbiAgICAgIHRoaXMuX2ZpbHRlckJpbkhpZ2ggPSBNYXRoLm1heCh0aGlzLl9maWx0ZXJCaW5Mb3csIHRoaXMuX2ZpbHRlckJpbkhpZ2gpOyAvLyBoaWdoIG11c3QgYmUgYXQgbGVhc3QgbG93XG5cbiAgICAgIHRoaXMuZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2soe1xuICAgICAgICBtaW46IHRoaXMuZnJlcXVlbmN5RmlsdGVyTWluLFxuICAgICAgICBtYXg6IHRoaXMuZnJlcXVlbmN5RmlsdGVyTWF4XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMuX2ZpbHRlckJpbkxvdyAqIHRoaXMuZnJlcVN0ZXAsIDApO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgbWF4aW11bSB0aHJlc2hvbGQgb24gdGhlIGZyZXF1ZW5jeSBmaWx0ZXIuIGkuZS4gdGhlIG1heGltdW0gZnJlcXVlbmN5IHRvIGJlIGNvbnNpZGVyZWQuXHJcbiAgICAgKiBJbnB1dCB2YWxpZGF0aW9uIGlzIGRvbmUgdG8gc2V0IGEgc2Vuc2libGUgZGVmYXVsdCBvbiBub24tbnVtZXJpYyBpbnB1dCBhbmQgdGhlIHZhbHVlIGlzIGNsYW1wZWQgdG8gYmUgYmV0d2VlbiB6ZXJvIGFuZCB0aGUgY3VycmVudCBtYXhpbXVtIGZyZXF1ZW5jeS5cclxuICAgICAqIFRoZSBhY3R1YWwgbWluaW11bSB3aWxsIGJlIHRoZSBtYXhpbXVtIGZyZXF1ZW5jeSBvZiB0aGUgZnJlcXVlbmN5IGJpbiB0aGUgY2hvc2VuIGZyZXF1ZW5jeSBsaWVzIGluLlxyXG4gICAgICogQ2FsbHMgdGhlIGZyZXF1ZW5jeUZpbHRlckNhbGxiYWNrIHdpdGggdGhlIG5ldyBtaW4gYW5kIG1heC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2IC0gdGhlIG1heGltdW0gZnJlcXVlbmN5IGluIEh6LlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJmcmVxdWVuY3lGaWx0ZXJNYXhcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChmKSB7XG4gICAgICBpZiAoaXNOYU4oZikpIGYgPSB0aGlzLmRlZmF1bHRzLmZyZXF1ZW5jeUZpbHRlck1pbjtcbiAgICAgIGYgPSBNYXRoLm1pbihNYXRoLm1heChmLCAwKSwgdGhpcy5tYXhGcmVxKTtcbiAgICAgIHRoaXMuX2ZpbHRlckJpbkhpZ2ggPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnJvdW5kKGYgLyB0aGlzLmZyZXFTdGVwKSwgMSksIHRoaXMuZnJlcUJpbnMpOyAvLyBhdCBsZWFzdCAxIHRvIGF2b2lkIERDIGNvbXBvbmVudFxuXG4gICAgICB0aGlzLl9maWx0ZXJCaW5Mb3cgPSBNYXRoLm1pbih0aGlzLl9maWx0ZXJCaW5IaWdoLCB0aGlzLl9maWx0ZXJCaW5Mb3cpOyAvLyBsb3cgbXVzdCBiZSBhdCBtb3N0IGhpZ2hcblxuICAgICAgdGhpcy5mcmVxdWVuY3lGaWx0ZXJDYWxsYmFjayh7XG4gICAgICAgIG1pbjogdGhpcy5mcmVxdWVuY3lGaWx0ZXJNaW4sXG4gICAgICAgIG1heDogdGhpcy5mcmVxdWVuY3lGaWx0ZXJNYXhcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4odGhpcy5fZmlsdGVyQmluSGlnaCAqIHRoaXMuZnJlcVN0ZXAsIHRoaXMubWF4RnJlcSk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIGZyZXF1ZW5jeSBmaWx0ZXIgdmFsdWVzIHRvIGJlIGNsb3NlbHkgc3Vycm91bmRpbmcgYSBzcGVjaWZpYyBmcmVxdWVuY3kuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZiAtIHRoZSBmcmVxdWVuY3kgdG8gdGFyZ2V0LlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJmcmVxdWVuY3lGaWx0ZXJcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChmKSB7XG4gICAgICB0aGlzLmZyZXF1ZW5jeUZpbHRlck1pbiA9IGY7XG4gICAgICB0aGlzLmZyZXF1ZW5jeUZpbHRlck1heCA9IGY7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0aHJlc2hvbGQgdXNlZCB0byBkZXRlcm1pbmUgaWYgYW4gYW5sYXlzZWQgcmVnaW9uIGhhcyBzdWZmaWNpZW50IHNvdW5kIHRvIGJlIFwib25cIi5cclxuICAgICAqIElucHV0IHZhbGlkYXRpb24gaXMgZG9uZSB0byBzZXQgYSBzZW5zaWJsZSBkZWZhdWx0IG9uIG5vbi1udW1lcmljIGlucHV0IGFuZCB0aGUgdmFsdWUgaXMgY2xhbXBlZCB0byBiZSBiZXR3ZWVuIHplcm8gYW5kIDI1NS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2IC0gdGhyZXNob2xkIHZvbHVtZSBbMCwgMjU1XVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJ2b2x1bWVUaHJlc2hvbGRcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAoaXNOYU4odikpIHYgPSB0aGlzLmRlZmF1bHRzLnZvbHVtZVRocmVzaG9sZDtcbiAgICAgIHRoaXMuX3ZvbHVtZVRocmVzaG9sZCA9IE1hdGgubWluKE1hdGgubWF4KE1hdGgucm91bmQodiksIDApLCAyNTUpO1xuICAgICAgdGhpcy52b2x1bWVUaHJlc2hvbGRDYWxsYmFjayh0aGlzLl92b2x1bWVUaHJlc2hvbGQpO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdm9sdW1lVGhyZXNob2xkO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNb3JzZUxpc3RlbmVyO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNb3JzZUxpc3RlbmVyOyIsIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAucmVwbGFjZVwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcbi8qIVxyXG5UaGlzIGNvZGUgaXMgwqkgQ29weXJpZ2h0IFN0ZXBoZW4gQy4gUGhpbGxpcHMsIDIwMTguXHJcbkVtYWlsOiBzdGV2ZUBzY3BoaWxsaXBzLmNvbVxyXG4qL1xuXG4vKlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG5cbnZhciBfbW9yc2VQcm8gPSByZXF1aXJlKFwiLi9tb3JzZS1wcm9cIik7XG5cbnZhciBNb3JzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9tb3JzZVBybyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikge1xuICBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbmV3T2JqID0ge307XG5cbiAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV3T2JqLmRlZmF1bHQgPSBvYmo7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuLyoqXHJcbiAqIENsYXNzIGZvciBjb252ZW5pZW50bHkgdHJhbnNsYXRpbmcgdG8gYW5kIGZyb20gTW9yc2UgY29kZS5cclxuICogRGVhbHMgd2l0aCBlcnJvciBoYW5kbGluZy5cclxuICogV29ya3Mgb3V0IGlmIHRoZSBpbnB1dCBpcyBNb3JzZSBjb2RlIG9yIG5vdC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogaW1wb3J0IE1vcnNlTWVzc2FnZSBmcm9tICdtb3JzZS1wcm8tbWVzc2FnZSc7XHJcbiAqIHZhciBtb3JzZU1lc3NhZ2UgPSBuZXcgTW9yc2VNZXNzYWdlKCk7XHJcbiAqIHZhciBpbnB1dDtcclxuICogdmFyIG91dHB1dDtcclxuICogdHJ5IHtcclxuICogICAgIG91dHB1dCA9IG1vcnNlTWVzc2FnZS50cmFuc2xhdGUoXCJhYmNcIik7XHJcbiAqIGNhdGNoIChleCkge1xyXG4gKiAgICAgLy8gaW5wdXQgd2lsbCBoYXZlIGVycm9ycyBzdXJyb3VuZGVkIGJ5IHBhaXJlZCAnIycgc2lnbnNcclxuICogICAgIC8vIG91dHB1dCB3aWxsIGJlIGJlc3QgYXR0ZW1wdCBhdCB0cmFuc2xhdGlvbiwgd2l0aCB1bnRyYW5zbGF0YWJsZXMgcmVwbGFjZWQgd2l0aCAnIydcclxuICogICAgIG1vcnNlTWVzc2FnZS5jbGVhckVycm9yKCk7ICAvLyByZW1vdmUgYWxsIHRoZSAnIydcclxuICogfVxyXG4gKiBpZiAobW9yc2VNZXNzYWdlLmlucHV0V2FzTW9yc2UpIHtcclxuICogICAgIC8vIGRvIHNvbWV0aGluZ1xyXG4gKiB9XHJcbiAqL1xuXG5cbnZhciBNb3JzZU1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Byb3NpZ25zPXRydWVdIC0gd2hldGhlciBvciBub3QgdG8gaW5jbHVkZSBwcm9zaWducyBpbiB0aGUgdHJhbnNsYXRpb25zXHJcbiAgICovXG4gIGZ1bmN0aW9uIE1vcnNlTWVzc2FnZSgpIHtcbiAgICB2YXIgdXNlUHJvc2lnbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHRydWU7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTW9yc2VNZXNzYWdlKTtcblxuICAgIHRoaXMudXNlUHJvc2lnbnMgPSB1c2VQcm9zaWducztcbiAgICB0aGlzLmlucHV0ID0gXCJcIjtcbiAgICB0aGlzLm91dHB1dCA9IFwiXCI7XG4gICAgdGhpcy5tb3JzZSA9IFwiXCI7XG4gICAgdGhpcy5tZXNzYWdlID0gXCJcIjtcbiAgICB0aGlzLmlucHV0V2FzTW9yc2UgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5oYXNFcnJvciA9IHVuZGVmaW5lZDtcbiAgfVxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgLSBhbHBoYW51bWVyaWMgdGV4dCBvciBtb3JzZSBjb2RlIHRvIHRyYW5zbGF0ZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNNb3JzZSAtIHdoZXRoZXIgdGhlIGlucHV0IGlzIE1vcnNlIGNvZGUgb3Igbm90IChpZiBub3Qgc2V0IHRoZW4gdGhlIGxvb2tzTGlrZU1vcnNlIG1ldGhvZCB3aWxsIGJlIHVzZWQpXHJcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTW9yc2VNZXNzYWdlLCBbe1xuICAgIGtleTogXCJ0cmFuc2xhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHJhbnNsYXRlKGlucHV0LCBpc01vcnNlKSB7XG4gICAgICB2YXIgdHJhbnNsYXRpb247XG5cbiAgICAgIGlmICh0eXBlb2YgaXNNb3JzZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtYWtlIGEgZ3Vlc3M6IGNvdWxkIGJlIHdyb25nIGlmIHNvbWVvbmUgd2FudHMgdG8gdHJhbnNsYXRlIFwiLlwiIGludG8gTW9yc2UgZm9yIGluc3RhbmNlXG4gICAgICAgIGlzTW9yc2UgPSBNb3JzZS5sb29rc0xpa2VNb3JzZShpbnB1dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc01vcnNlKSB7XG4gICAgICAgIHRoaXMuaW5wdXRXYXNNb3JzZSA9IHRydWU7XG4gICAgICAgIHRyYW5zbGF0aW9uID0gTW9yc2UubW9yc2UydGV4dChpbnB1dCwgdGhpcy51c2VQcm9zaWducyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlucHV0V2FzTW9yc2UgPSBmYWxzZTtcbiAgICAgICAgdHJhbnNsYXRpb24gPSBNb3JzZS50ZXh0Mm1vcnNlKGlucHV0LCB0aGlzLnVzZVByb3NpZ25zKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3JzZSA9IHRyYW5zbGF0aW9uLm1vcnNlO1xuICAgICAgdGhpcy5tZXNzYWdlID0gdHJhbnNsYXRpb24ubWVzc2FnZTtcblxuICAgICAgaWYgKHRoaXMuaW5wdXRXYXNNb3JzZSkge1xuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5tb3JzZTtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5tZXNzYWdlO1xuICAgICAgICB0aGlzLm91dHB1dCA9IHRoaXMubW9yc2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGFzRXJyb3IgPSB0cmFuc2xhdGlvbi5oYXNFcnJvcjtcblxuICAgICAgaWYgKHRoaXMuaGFzRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgaW4gaW5wdXRcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLm91dHB1dDtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBDbGVhciBhbGwgdGhlIGVycm9ycyBmcm9tIHRoZSBtb3JzZSBhbmQgbWVzc2FnZS4gVXNlZnVsIGlmIHlvdSB3YW50IHRvIHBsYXkgdGhlIHNvdW5kIGV2ZW4gdGhvdWdoIGl0IGRpZG4ndCB0cmFuc2xhdGUuXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNsZWFyRXJyb3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJFcnJvcigpIHtcbiAgICAgIGlmICh0aGlzLmlucHV0V2FzTW9yc2UpIHtcbiAgICAgICAgdGhpcy5tb3JzZSA9IHRoaXMubW9yc2UucmVwbGFjZSgvIy9nLCBcIlwiKTsgLy8gbGVhdmUgaW4gdGhlIGJhZCBNb3JzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gdGhpcy5tZXNzYWdlLnJlcGxhY2UoLyNbXiNdKj8jL2csIFwiXCIpO1xuICAgICAgICB0aGlzLm1vcnNlID0gdGhpcy5tb3JzZS5yZXBsYWNlKC8jL2csIFwiXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhhc0Vycm9yID0gZmFsc2U7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1vcnNlTWVzc2FnZTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTW9yc2VNZXNzYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuLyohXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxOC5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcbiovXG5cbi8qXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBFVVBMLCBWZXJzaW9uIDEuMiBvciDigJMgYXMgc29vbiB0aGV5IHdpbGwgYmUgYXBwcm92ZWQgYnkgdGhlIEV1cm9wZWFuIENvbW1pc3Npb24gLSBzdWJzZXF1ZW50IHZlcnNpb25zIG9mIHRoZSBFVVBMICh0aGUgXCJMaWNlbmNlXCIpO1xyXG5Zb3UgbWF5IG5vdCB1c2UgdGhpcyB3b3JrIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2VuY2UuXHJcbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5jZSBhdDogaHR0cHM6Ly9qb2ludXAuZWMuZXVyb3BhLmV1L2NvbW11bml0eS9ldXBsL1xyXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbmNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcblNlZSB0aGUgTGljZW5jZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2VuY2UuXHJcbiovXG5cbi8qKlxyXG4gKiBXZWIgYnJvd3NlciBzb3VuZCBwbGF5ZXIgdXNpbmcgV2ViIEF1ZGlvIEFQSS5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogaW1wb3J0IE1vcnNlQ1dXYXZlIGZyb20gJ21vcnNlLXByby1jdy13YXZlJztcclxuICogaW1wb3J0IE1vcnNlUGxheWVyV0FBIGZyb20gJ21vcnNlLXByby1wbGF5ZXItd2FhJztcclxuICogdmFyIG1vcnNlQ1dXYXZlID0gbmV3IE1vcnNlQ1dXYXZlKCk7XHJcbiAqIG1vcnNlQ1dXYXZlLnRyYW5zbGF0ZShcImFiY1wiKTtcclxuICogdmFyIG1vcnNlUGxheWVyV0FBID0gbmV3IE1vcnNlUGxheWVyV0FBKCk7XHJcbiAqIG1vcnNlUGxheWVyV0FBLmxvYWRDV1dhdmUobW9yc2VDV1dhdmUpO1xyXG4gKiBtb3JzZVBsYXllcldBQS5wbGF5RnJvbVN0YXJ0KCk7XHJcbiAqL1xuXG5cbnZhciBNb3JzZVBsYXllcldBQSA9IGZ1bmN0aW9uICgpIHtcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBzZXF1ZW5jZVN0YXJ0Q2FsbGJhY2sgLSBmdW5jdGlvbiB0byBjYWxsIGVhY2ggdGltZSB0aGUgc2VxdWVuY2Ugc3RhcnRzLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gc2VxdWVuY2VFbmRpbmdDYWxsYmFjayAtIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgc2VxdWVuY2UgaXMgbmVhcmluZyB0aGUgZW5kLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gc291bmRTdG9wcGVkQ2FsbGJhY2sgLSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIHNlcXVlbmNlIHN0b3BzLlxyXG4gICAqL1xuICBmdW5jdGlvbiBNb3JzZVBsYXllcldBQShzZXF1ZW5jZVN0YXJ0Q2FsbGJhY2ssIHNlcXVlbmNlRW5kaW5nQ2FsbGJhY2ssIHNvdW5kU3RvcHBlZENhbGxiYWNrKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1vcnNlUGxheWVyV0FBKTtcblxuICAgIGlmIChzZXF1ZW5jZVN0YXJ0Q2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5zZXF1ZW5jZVN0YXJ0Q2FsbGJhY2sgPSBzZXF1ZW5jZVN0YXJ0Q2FsbGJhY2s7XG4gICAgaWYgKHNlcXVlbmNlRW5kaW5nQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5zZXF1ZW5jZUVuZGluZ0NhbGxiYWNrID0gc2VxdWVuY2VFbmRpbmdDYWxsYmFjaztcbiAgICBpZiAoc291bmRTdG9wcGVkQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5zb3VuZFN0b3BwZWRDYWxsYmFjayA9IHNvdW5kU3RvcHBlZENhbGxiYWNrO1xuICAgIHRoaXMuX25vQXVkaW8gPSBmYWxzZTtcbiAgICBjb25zb2xlLmxvZyhcIlRyeWluZyBXZWIgQXVkaW8gQVBJIChPc2NpbGxhdG9ycylcIik7XG4gICAgdGhpcy5hdWRpb0NvbnRleHRDbGFzcyA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmF1ZGlvQ29udGV4dENsYXNzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX25vQXVkaW8gPSB0cnVlO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gQXVkaW9Db250ZXh0IGNsYXNzIGRlZmluZWRcIik7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wID0gZmFsc2U7XG4gICAgdGhpcy5mcmVxdWVuY3kgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGFydFBhZGRpbmcgPSAwOyAvLyBudW1iZXIgb2YgbXMgdG8gd2FpdCBiZWZvcmUgcGxheWluZyBmaXJzdCBub3RlIG9mIGluaXRpYWwgc2VxdWVuY2VcblxuICAgIHRoaXMuZW5kUGFkZGluZyA9IDA7IC8vIG51bWJlciBvZiBtcyB0byB3YWl0IGF0IHRoZSBlbmQgb2YgYSBzZXF1ZW5jZSBiZWZvcmUgcGxheWluZyB0aGUgbmV4dCBvbmUgKG9yIGxvb3BpbmcpXG5cbiAgICB0aGlzLl9jVGltaW5ncyA9IFtdO1xuICAgIHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMuX2lzUGF1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5fdm9sdW1lID0gMTtcbiAgICB0aGlzLl9sb29rQWhlYWRUaW1lID0gMC4xOyAvLyBzZWNvbmRzXG5cbiAgICB0aGlzLl90aW1lckludGVydmFsID0gMC4wNTsgLy8gc2Vjb25kc1xuXG4gICAgdGhpcy5fdGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc3RvcFRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX25vdFBsYXllZEFOb3RlID0gdHJ1ZTtcbiAgfVxuICAvKipcclxuICAgKiBTZXQgdXAgdGhlIGF1ZGlvIGdyYXBoXHJcbiAgICogQGFjY2VzczogcHJpdmF0ZVxyXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1vcnNlUGxheWVyV0FBLCBbe1xuICAgIGtleTogXCJfaW5pdGlhbGlzZUF1ZGlvTm9kZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXRpYWxpc2VBdWRpb05vZGVzKCkge1xuICAgICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgdGhpcy5hdWRpb0NvbnRleHRDbGFzcygpO1xuICAgICAgdGhpcy5zcGxpdHRlck5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7IC8vIHRoaXMgbm9kZSBpcyBoZXJlIHRvIGF0dGFjaCBvdGhlciBub2RlcyB0byBpbiBzdWJjbGFzc1xuXG4gICAgICB0aGlzLmxvd1Bhc3NOb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XG4gICAgICB0aGlzLmxvd1Bhc3NOb2RlLnR5cGUgPSBcImxvd3Bhc3NcIjsgLy8gVE9ETzogcmVtb3ZlIHRoaXMgbWFnaWMgbnVtYmVyIGFuZCBtYWtlIHRoZSBmaWx0ZXIgY29uZmlndXJhYmxlP1xuXG4gICAgICB0aGlzLmxvd1Bhc3NOb2RlLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSh0aGlzLmZyZXF1ZW5jeSAqIDEuMSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTsgLy8gdGhpcyBub2RlIGlzIGFjdHVhbGx5IHVzZWQgZm9yIHZvbHVtZVxuXG4gICAgICB0aGlzLnZvbHVtZSA9IHRoaXMuX3ZvbHVtZTtcbiAgICAgIHRoaXMuc3BsaXR0ZXJOb2RlLmNvbm5lY3QodGhpcy5sb3dQYXNzTm9kZSk7XG4gICAgICB0aGlzLmxvd1Bhc3NOb2RlLmNvbm5lY3QodGhpcy5nYWluTm9kZSk7XG4gICAgICB0aGlzLmdhaW5Ob2RlLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5fbm90UGxheWVkQU5vdGUgPSB0cnVlO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdm9sdW1lIGZvciB0aGUgcGxheWVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdiAtIHRoZSB2b2x1bWUsIGNsYW1wZWQgdG8gWzAsMV1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibG9hZENXV2F2ZVwiLFxuXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZW5pZW5jZSBtZXRob2QgdG8gaGVscCBwbGF5aW5nIGRpcmVjdGx5IGZyb20gYSBNb3JzZUNXV2F2ZSBpbnN0YW5jZS4gVXNlcyB0aGUgQ1dXYXZlIHRpbWluZ3MgYW5kIGZyZXF1ZW5jeS5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjd1dhdmUgLSBhIE1vcnNlQ1dXYXZlIGluc3RhbmNlXHJcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZENXV2F2ZShjd1dhdmUpIHtcbiAgICAgIHRoaXMubG9hZChjd1dhdmUuZ2V0VGltaW5ncygpKTtcbiAgICAgIHRoaXMuZnJlcXVlbmN5ID0gY3dXYXZlLmZyZXF1ZW5jeTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBMb2FkIHRpbWluZyBzZXF1ZW5jZSwgcmVwbGFjaW5nIGFueSBleGlzdGluZyBzZXF1ZW5jZS5cclxuICAgICAqIElmIGVuZFBhZGRpbmcgaXMgbm9uLXplcm8gdGhlbiBhbiBhcHByb3ByaWF0ZSBwYXVzZSBpcyBhZGRlZCB0byB0aGUgZW5kLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gdGltaW5ncyAtIGxpc3Qgb2YgbWlsbGlzZWNvbmQgdGltaW5nczsgK3ZlIG51bWJlcnMgYXJlIGJlZXBzLCAtdmUgbnVtYmVycyBhcmUgc2lsZW5jZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJsb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQodGltaW5ncykge1xuICAgICAgLy8gVE9ETzogdW5kZWZpbmVkIGJlaGF2aW91ciBpZiB0aGlzIGlzIGNhbGxlZCBpbiB0aGUgbWlkZGxlIG9mIGEgc2VxdWVuY2VcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdUaW1pbmdzOiAnICsgdGltaW5ncyk7XG5cbiAgICAgIC8qXHJcbiAgICAgICAgICBUaGUgaXRoIGVsZW1lbnQgb2YgdGhlIHNlcXVlbmNlIHN0YXJ0cyBhdCBfY1RpbWluZ3NbaV0gYW5kIGVuZHMgYXQgX2NUaW1pbmdzW2krMV0gKGluIGZyYWN0aW9uYWwgc2Vjb25kcylcclxuICAgICAgICAgIEl0IGlzIGEgbm90ZSAoaS5lLiBub3Qgc2lsZW5jZSkgaWYgaXNOb3RlW2ldID09PSBUcnVlXHJcbiAgICAgICovXG4gICAgICBpZiAodGhpcy5lbmRQYWRkaW5nID4gMCkge1xuICAgICAgICB0aW1pbmdzLnB1c2goLXRoaXMuZW5kUGFkZGluZyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NUaW1pbmdzID0gWzBdO1xuICAgICAgdGhpcy5pc05vdGUgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1pbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuX2NUaW1pbmdzW2kgKyAxXSA9IHRoaXMuX2NUaW1pbmdzW2ldICsgTWF0aC5hYnModGltaW5nc1tpXSkgLyAxMDAwOyAvLyBBdWRpb0NvbnRleHQgcnVucyBpbiBzZWNvbmRzIG5vdCBtc1xuXG4gICAgICAgIHRoaXMuaXNOb3RlW2ldID0gdGltaW5nc1tpXSA+IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VxdWVuY2VMZW5ndGggPSB0aGlzLmlzTm90ZS5sZW5ndGg7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIGhlbHAgcGxheWluZyBkaXJlY3RseSBmcm9tIGEgTW9yc2VDV1dhdmUgaW5zdGFuY2UuIFVzZXMgdGhlIENXV2F2ZSB0aW1pbmdzLlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGN3V2F2ZSAtIGEgTW9yc2VDV1dhdmUgaW5zdGFuY2VcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibG9hZE5leHRDV1dhdmVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZE5leHRDV1dhdmUoY3dXYXZlKSB7XG4gICAgICB0aGlzLmxvYWROZXh0KGN3V2F2ZS5nZXRUaW1pbmdzKCkpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIExvYWQgdGltaW5nIHNlcXVlbmNlIHdoaWNoIHdpbGwgYmUgcGxheWVkIHdoZW4gdGhlIGN1cnJlbnQgc2VxdWVuY2UgaXMgY29tcGxldGVkIChvbmx5IG9uZSBzZXF1ZW5jZSBpcyBxdWV1ZWQpLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gdGltaW5ncyAtIGxpc3Qgb2YgbWlsbGlzZWNvbmQgdGltaW5nczsgK3ZlIG51bWJlcnMgYXJlIGJlZXBzLCAtdmUgbnVtYmVycyBhcmUgc2lsZW5jZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJsb2FkTmV4dFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkTmV4dCh0aW1pbmdzKSB7XG4gICAgICB0aGlzLnVwTmV4dCA9IHRpbWluZ3M7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogUGxheXMgdGhlIGxvYWRlZCB0aW1pbmcgc2VxdWVuY2UgZnJvbSB0aGUgc3RhcnQsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBwbGF5YmFjayBpcyBvbmdvaW5nIG9yIHBhdXNlZC5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicGxheUZyb21TdGFydFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5RnJvbVN0YXJ0KCkge1xuICAgICAgLy8gVE9ETzogd2h5IGRvIHdlIGhhdmUgdGhpcyBtZXRob2QgYXQgYWxsPyBCZXR0ZXIganVzdCB0byBoYXZlIHBsYXkoKSBhbmQgaWYgdXNlciBuZWVkcyBwbGF5RnJvbVN0YXJ0LCBqdXN0IGNhbGwgc3RvcCgpIGZpcnN0P1xuICAgICAgaWYgKHRoaXMuX25vQXVkaW8gfHwgdGhpcy5fY1RpbWluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdG9wKCk7XG5cbiAgICAgIHRoaXMuX2luaXRpYWxpc2VBdWRpb05vZGVzKCk7XG5cbiAgICAgIHRoaXMuX25leHROb3RlID0gMDtcbiAgICAgIHRoaXMuX2lzUGxheWluZyA9IHRydWU7XG4gICAgICB0aGlzLl9pc1BhdXNlZCA9IHRydWU7IC8vIHByZXRlbmQgd2Ugd2VyZSBwYXVzZWQgc28gdGhhdCBwbGF5KCkgXCJyZXN1bWVzXCIgcGxheWJhY2tcblxuICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU3RhcnRzIG9yIHJlc3VtZXMgcGxheWJhY2sgb2YgdGhlIGxvYWRlZCB0aW1pbmcgc2VxdWVuY2UuXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInBsYXlcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGxheSgpIHtcbiAgICAgIGlmICghdGhpcy5faXNQbGF5aW5nKSB7XG4gICAgICAgIC8vIGlmIHdlJ3JlIG5vdCBhY3R1YWxseSBwbGF5aW5nIHRoZW4gcGxheSBmcm9tIHN0YXJ0XG4gICAgICAgIHRoaXMucGxheUZyb21TdGFydCgpO1xuICAgICAgfSAvLyBvdGhlcndpc2Ugd2UgYXJlIHJlc3VtaW5nIHBsYXliYWNrIGFmdGVyIGEgcGF1c2VcblxuXG4gICAgICBpZiAoIXRoaXMuX2lzUGF1c2VkKSB7XG4gICAgICAgIC8vIGlmIHdlJ3JlIG5vdCBhY3R1YWxseSBwYXVzZWQgdGhlbiBkbyBub3RoaW5nXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gb3RoZXJ3aXNlIHdlIHJlYWxseSBhcmUgcmVzdW1pbmcgcGxheWJhY2sgKG9yIHByZXRlbmRpbmcgd2UgYXJlLCBhbmQgYWN0dWFsbHkgcGxheWluZyBmcm9tIHN0YXJ0Li4uKVxuXG5cbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fc3RvcFRpbWVyKTsgLy8gaWYgd2Ugd2VyZSBnb2luZyB0byBzZW5kIGEgc291bmRTdG9wcGVkQ2FsbGJhY2sgdGhlbiBkb24ndFxuXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuX3N0YXJ0VGltZXIpOyAvLyBkaXR0b1xuXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVyKTtcbiAgICAgIHRoaXMuX2lzUGF1c2VkID0gZmFsc2U7IC8vIGJhc2ljYWxseSBzZXQgdGhlIHRpbWUgYmFzZSB0byBub3cgYnV0IFxuICAgICAgLy8gICAgLSB0byB3b3JrIGFmdGVyIGEgcGF1c2U6IHN1YnRyYWN0IHRoZSBzdGFydCB0aW1lIG9mIHRoZSBuZXh0IG5vdGUgc28gdGhhdCBpdCB3aWxsIHBsYXkgaW1tZWRpYXRlbHlcbiAgICAgIC8vICAgIC0gdG8gYXZvaWQgY2xpcHBpbmcgdGhlIHZlcnkgZmlyc3Qgbm90ZTogYWRkIG9uIHN0YXJ0UGFkZGluZyBpZiBub3RQbGF5ZWRBTm90ZVxuXG4gICAgICB0aGlzLl90WmVybyA9IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lIC0gdGhpcy5fY1RpbWluZ3NbdGhpcy5fbmV4dE5vdGVdICsgKHRoaXMuX25vdFBsYXllZEFOb3RlID8gdGhpcy5zdGFydFBhZGRpbmcgLyAxMDAwIDogMCk7IC8vIHNjaGVkdWxlIHRoZSBmaXJzdCBub3RlIEFTQVAgKGRpcmVjdGx5KSBhbmQgdGhlbiBpZiB0aGVyZSBpcyBtb3JlIHRvIHNjaGVkdWxlLCBzZXQgdXAgYW4gaW50ZXJ2YWwgdGltZXJcblxuICAgICAgaWYgKHRoaXMuX3NjaGVkdWxlTm90ZXMoKSkge1xuICAgICAgICB0aGlzLl90aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLl9zY2hlZHVsZU5vdGVzKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCAqIHRoaXMuX3RpbWVySW50ZXJ2YWwpOyAvLyByZWd1bGFybHkgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGFyZSBtb3JlIG5vdGVzIHRvIHNjaGVkdWxlXG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogUGF1c2UgcGxheWJhY2sgKHJlc3VtZSB3aXRoIHBsYXkoKSlcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicGF1c2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzUGxheWluZykge1xuICAgICAgICAvLyBpZiB3ZSdyZSBub3QgYWN0dWFsbHkgcGxheWluZyB0aGVuIGlnbm9yZSB0aGlzXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5faXNQYXVzZWQgPSB0cnVlO1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lcik7IC8vIGVuc3VyZSB0aGF0IHRoZSBuZXh0IG5vdGUgdGhhdCBpcyBzY2hlZHVsZWQgaXMgYSBiZWVwLCBub3QgYSBwYXVzZSAodG8gaGVscCBzeW5jIHdpdGggdmlicmF0aW9uIHBhdHRlcm5zKVxuXG4gICAgICBpZiAoIXRoaXMuaXNOb3RlW3RoaXMuX25leHROb3RlXSkge1xuICAgICAgICB0aGlzLl9uZXh0Tm90ZSsrOyAvLyBpZiB3ZSdlIGdvdCB0byB0aGUgZW5kIG9mIHRoZSBzZXF1ZW5jZSwgdGhlbiBsb29wIG9yIGxvYWQgbmV4dCBzZXF1ZW5jZSBhcyBhcHByb3ByaWF0ZVxuXG4gICAgICAgIGlmICh0aGlzLl9uZXh0Tm90ZSA9PT0gdGhpcy5zZXF1ZW5jZUxlbmd0aCkge1xuICAgICAgICAgIGlmICh0aGlzLmxvb3AgfHwgdGhpcy51cE5leHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fbmV4dE5vdGUgPSAwO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51cE5leHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICB0aGlzLmxvYWQodGhpcy51cE5leHQpO1xuICAgICAgICAgICAgICB0aGlzLnVwTmV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTdG9wIHBsYXliYWNrIChjYWxsaW5nIHBsYXkoKSBhZnRlcndhcmRzIHdpbGwgc3RhcnQgZnJvbSB0aGUgYmVnaW5uaW5nKVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzdG9wXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICBpZiAodGhpcy5faXNQbGF5aW5nKSB7XG4gICAgICAgIHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVyKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLl9zdG9wVGltZXIpO1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX3N0YXJ0VGltZXIpO1xuICAgICAgICB0aGlzLmF1ZGlvQ29udGV4dC5jbG9zZSgpO1xuICAgICAgICB0aGlzLnNvdW5kU3RvcHBlZENhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2NoZWR1bGUgbm90ZXMgdGhhdCBzdGFydCBiZWZvcmUgbm93ICsgbG9va0FoZWFkVGltZS5cclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlcmUgaXMgbW9yZSB0byBzY2hlZHVsZSwgZmFsc2UgaWYgc2VxdWVuY2UgaXMgY29tcGxldGVcclxuICAgICAqIEBhY2Nlc3M6IHByaXZhdGVcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX3NjaGVkdWxlTm90ZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3NjaGVkdWxlTm90ZXMoKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnU2NoZWR1bGluZzonKTtcbiAgICAgIHZhciBvc2NpbGxhdG9yLCBzdGFydCwgZW5kO1xuICAgICAgdmFyIG5vdyA9IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gICAgICB3aGlsZSAodGhpcy5fbmV4dE5vdGUgPCB0aGlzLnNlcXVlbmNlTGVuZ3RoICYmIHRoaXMuX2NUaW1pbmdzW3RoaXMuX25leHROb3RlXSA8IG5vdyAtIHRoaXMuX3RaZXJvICsgdGhpcy5fbG9va0FoZWFkVGltZSkge1xuICAgICAgICB0aGlzLl9ub3RQbGF5ZWRBTm90ZSA9IGZhbHNlOyAvLyBjb25zb2xlLmxvZygnVDogJyArIE1hdGgucm91bmQoMTAwMCAqIG5vdykvMTAwMCArICcgKCsnICsgTWF0aC5yb3VuZCgxMDAwICogKG5vdyAtIHRoaXMuX3RaZXJvKSkvMTAwMCArICcpJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuX25leHROb3RlICsgJzogJyArIFxuICAgICAgICAvLyAgICAgKHRoaXMuaXNOb3RlW3RoaXMuX25leHROb3RlXSA/ICdOb3RlICAnIDogJ1BhdXNlICcpICsgXG4gICAgICAgIC8vICAgICBNYXRoLnJvdW5kKDEwMDAgKiB0aGlzLl9jVGltaW5nc1t0aGlzLl9uZXh0Tm90ZV0pLzEwMDAgKyAnIC0gJyArIFxuICAgICAgICAvLyAgICAgTWF0aC5yb3VuZCgxMDAwICogdGhpcy5fY1RpbWluZ3NbdGhpcy5fbmV4dE5vdGUgKyAxXSkvMTAwMCArICcgKCcgKyBcbiAgICAgICAgLy8gICAgIE1hdGgucm91bmQoMTAwMCAqICh0aGlzLl9jVGltaW5nc1t0aGlzLl9uZXh0Tm90ZSArIDFdIC0gdGhpcy5fY1RpbWluZ3NbdGhpcy5fbmV4dE5vdGVdKSkvMTAwMCArICcpJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuX25leHROb3RlID09PSAwICYmICF0aGlzLnNlcXVlbmNlU3RhcnRDYWxsYmFja0ZpcmVkKSB7XG4gICAgICAgICAgLy8gd2hlbiBzY2hlZHVsaW5nIHRoZSBmaXJzdCBub3RlLCBzY2hlZHVsZSBhIGNhbGxiYWNrIGFzIHdlbGxcbiAgICAgICAgICB0aGlzLl9zdGFydFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNlcXVlbmNlU3RhcnRDYWxsYmFjaygpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCAqICh0aGlzLl90WmVybyArIHRoaXMuX2NUaW1pbmdzW3RoaXMuX25leHROb3RlXSAtIG5vdykpO1xuICAgICAgICAgIHRoaXMuc2VxdWVuY2VTdGFydENhbGxiYWNrRmlyZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNOb3RlW3RoaXMuX25leHROb3RlXSkge1xuICAgICAgICAgIHN0YXJ0ID0gdGhpcy5fdFplcm8gKyB0aGlzLl9jVGltaW5nc1t0aGlzLl9uZXh0Tm90ZV07XG4gICAgICAgICAgZW5kID0gdGhpcy5fdFplcm8gKyB0aGlzLl9jVGltaW5nc1t0aGlzLl9uZXh0Tm90ZSArIDFdO1xuICAgICAgICAgIHRoaXMuX3NvdW5kRW5kVGltZSA9IGVuZDsgLy8gd2UgbmVlZCB0byBzdG9yZSB0aGlzIGZvciB0aGUgc3RvcCgpIGNhbGxiYWNrXG5cbiAgICAgICAgICBvc2NpbGxhdG9yID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgICAgIG9zY2lsbGF0b3IudHlwZSA9ICdzaW5lJztcbiAgICAgICAgICBvc2NpbGxhdG9yLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSh0aGlzLmZyZXF1ZW5jeSwgc3RhcnQpO1xuICAgICAgICAgIG9zY2lsbGF0b3Iuc3RhcnQoc3RhcnQpO1xuICAgICAgICAgIG9zY2lsbGF0b3Iuc3RvcCh0aGlzLl9zb3VuZEVuZFRpbWUpO1xuICAgICAgICAgIG9zY2lsbGF0b3IuY29ubmVjdCh0aGlzLnNwbGl0dGVyTm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9uZXh0Tm90ZSsrO1xuXG4gICAgICAgIGlmICh0aGlzLl9uZXh0Tm90ZSA9PT0gdGhpcy5zZXF1ZW5jZUxlbmd0aCkge1xuICAgICAgICAgIGlmICh0aGlzLmxvb3AgfHwgdGhpcy51cE5leHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gaW5jcmVtZW50IHRpbWUgYmFzZSB0byBiZSB0aGUgYWJzb2x1dGUgZW5kIHRpbWUgb2YgdGhlIGZpbmFsIGVsZW1lbnQgaW4gdGhlIHNlcXVlbmNlXG4gICAgICAgICAgICB0aGlzLl90WmVybyArPSB0aGlzLl9jVGltaW5nc1t0aGlzLl9uZXh0Tm90ZV07XG4gICAgICAgICAgICB0aGlzLl9uZXh0Tm90ZSA9IDA7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnVwTmV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9hZCh0aGlzLnVwTmV4dCk7XG4gICAgICAgICAgICAgIHRoaXMudXBOZXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fbmV4dE5vdGUgPT09IHRoaXMuc2VxdWVuY2VMZW5ndGgpIHtcbiAgICAgICAgLy8gdGhlbiBhbGwgbm90ZXMgaGF2ZSBiZWVuIHNjaGVkdWxlZCBhbmQgd2UgYXJlIG5vdCBsb29waW5nXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZXIpOyAvLyBzY2hlZHVsZSBzdG9wKCkgZm9yIGFmdGVyIHdoZW4gdGhlIHNjaGVkdWxlZCBzZXF1ZW5jZSBlbmRzXG4gICAgICAgIC8vIGFkZGluZyBvbiAzICogbG9va0FoZWFkVGltZSBmb3Igc2FmZXR5IGJ1dCBzaG91bGRuJ3QgYmUgbmVlZGVkXG5cbiAgICAgICAgdGhpcy5fc3RvcFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCAqICh0aGlzLl9zb3VuZEVuZFRpbWUgLSBub3cgKyAzICogdGhpcy5fbG9va0FoZWFkVGltZSkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGluZGljYXRlIHRoYXQgc2VxdWVuY2UgaXMgY29tcGxldGVcbiAgICAgIH0gZWxzZSBpZiAobm93IC0gdGhpcy5fdFplcm8gKyB0aGlzLl90aW1lckludGVydmFsICsgdGhpcy5fbG9va0FoZWFkVGltZSA+IHRoaXMuX2NUaW1pbmdzW3RoaXMuc2VxdWVuY2VMZW5ndGggLSAxXSAmJiB0aGlzLnNlcXVlbmNlU3RhcnRDYWxsYmFja0ZpcmVkKSB7XG4gICAgICAgIC8vIHRoZW4gd2UgYXJlIGdvaW5nIHRvIHNjaGVkdWxlIHRoZSBsYXN0IG5vdGUgaW4gdGhlIHNlcXVlbmNlIG5leHQgdGltZVxuICAgICAgICB0aGlzLnNlcXVlbmNlRW5kaW5nQ2FsbGJhY2soKTtcbiAgICAgICAgdGhpcy5zZXF1ZW5jZVN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gaW5kaWNhdGUgdGhlcmUgYXJlIG1vcmUgbm90ZXMgdG8gc2NoZWR1bGVcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciB0aGVyZSB3YXMgYW4gZXJyb3IgaW4gaW5pdGlhbGlzYXRpb25cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaGFzRXJyb3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFzRXJyb3IoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbm9BdWRpbztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciBhIHNlcXVlbmNlIGlzIGJlaW5nIHBsYXllZCBvciBub3QgKHN0aWxsIHRydWUgZXZlbiB3aGVuIHBhdXNlZCk7IGJlY29tZXMgZmFsc2Ugd2hlbiBzdG9wIGlzIHVzZWRcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VxdWVuY2VTdGFydENhbGxiYWNrXCIsXG4gICAgLy8gZW1wdHkgY2FsbGJhY2tzIGluIGNhc2UgdXNlciBkb2VzIG5vdCBkZWZpbmUgYW55XG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlcXVlbmNlU3RhcnRDYWxsYmFjaygpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwic2VxdWVuY2VFbmRpbmdDYWxsYmFja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXF1ZW5jZUVuZGluZ0NhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogXCJzb3VuZFN0b3BwZWRDYWxsYmFja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzb3VuZFN0b3BwZWRDYWxsYmFjaygpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwidm9sdW1lXCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgdGhpcy5fdm9sdW1lID0gTWF0aC5taW4oTWF0aC5tYXgodiwgMCksIDEpO1xuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBtdWx0aXBseSBieSAwLjgxMyB0byByZWR1Y2UgZ2FpbiBhZGRlZCBieSBsb3dwYXNzIGZpbHRlciBhbmQgYXZvaWQgY2xpcHBpbmdcbiAgICAgICAgdGhpcy5nYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuODEzICogdGhpcy5fdm9sdW1lLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB9IGNhdGNoIChleCkgey8vIGdldHRpbmcgaGVyZSBtZWFucyBfaW5pdGlhbGlzZUF1ZGlvTm9kZXMoKSBoYXMgbm90IHlldCBiZWVuIGNhbGxlZDogdGhhdCdzIG9rYXlcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY3VycmVudCB2b2x1bWUgWzAsMV1cclxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl92b2x1bWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImlzUGxheWluZ1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzUGxheWluZztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciB0aGUgcGxheWJhY2sgaXMgcGF1c2VkIG9yIG5vdFxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJpc1BhdXNlZFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzUGF1c2VkO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgaW5kZXggb2YgdGhlIG5leHQgbm90ZSBpbiB0aGUgc2VxdWVuY2UgdG8gYmUgc2NoZWR1bGVkLlxyXG4gICAgICogVXNlZnVsIGlmIHRoZSBzZXF1ZW5jZSBoYXMgYmVlbiBwYXVzZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBub3RlIGluZGV4XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm5leHROb3RlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbmV4dE5vdGU7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gcmVwcmVzZW50aW5nIHRoaXMgYXVkaW8gcGxheWVyIHR5cGU6IDRcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiYXVkaW9UeXBlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gNDsgLy8gNDogV2ViIEF1ZGlvIEFQSSB1c2luZyBvc2NpbGxhdG9yc1xuICAgICAgLy8gMzogQXVkaW8gZWxlbWVudCB1c2luZyBtZWRpYSBzdHJlYW0gd29ya2VyICh1c2luZyBQQ00gYXVkaW8gZGF0YSlcbiAgICAgIC8vIDI6IEZsYXNoICh1c2luZyBQQ00gYXVkaW8gZGF0YSlcbiAgICAgIC8vIDE6IFdlYiBBdWRpbyBBUEkgd2l0aCB3ZWJraXQgYW5kIG5hdGl2ZSBzdXBwb3J0ICh1c2luZyBQQ00gYXVkaW8gZGF0YSlcbiAgICAgIC8vIDA6IEF1ZGlvIGVsZW1lbnQgdXNpbmcgTW96aWxsYSBBdWRpbyBEYXRhIEFQSSAoaHR0cHM6Ly93aWtpLm1vemlsbGEub3JnL0F1ZGlvX0RhdGFfQVBJKSAodXNpbmcgUENNIGF1ZGlvIGRhdGEpXG4gICAgICAvLyAtMTogbm8gYXVkaW8gc3VwcG9ydFxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNb3JzZVBsYXllcldBQTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTW9yc2VQbGF5ZXJXQUE7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRpdExlbmd0aCA9IGRpdExlbmd0aDtcbmV4cG9ydHMuZGFoTGVuZ3RoID0gZGFoTGVuZ3RoO1xuZXhwb3J0cy5kaXRTcGFjZSA9IGRpdFNwYWNlO1xuZXhwb3J0cy5jaGFyU3BhY2UgPSBjaGFyU3BhY2U7XG5leHBvcnRzLndvcmRTcGFjZSA9IHdvcmRTcGFjZTtcbmV4cG9ydHMud3BtID0gd3BtO1xuZXhwb3J0cy5mZGl0TGVuZ3RoID0gZmRpdExlbmd0aDtcbmV4cG9ydHMucmF0aW8gPSByYXRpbztcbmV4cG9ydHMuZndwbSA9IGZ3cG07XG4vKiFcclxuVGhpcyBjb2RlIGlzIMKpIENvcHlyaWdodCBTdGVwaGVuIEMuIFBoaWxsaXBzLCAyMDE4LlxyXG5FbWFpbDogc3RldmVAc2NwaGlsbGlwcy5jb21cclxuKi9cblxuLypcclxuTGljZW5zZWQgdW5kZXIgdGhlIEVVUEwsIFZlcnNpb24gMS4yIG9yIOKAkyBhcyBzb29uIHRoZXkgd2lsbCBiZSBhcHByb3ZlZCBieSB0aGUgRXVyb3BlYW4gQ29tbWlzc2lvbiAtIHN1YnNlcXVlbnQgdmVyc2lvbnMgb2YgdGhlIEVVUEwgKHRoZSBcIkxpY2VuY2VcIik7XHJcbllvdSBtYXkgbm90IHVzZSB0aGlzIHdvcmsgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5jZS5cclxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbmNlIGF0OiBodHRwczovL2pvaW51cC5lYy5ldXJvcGEuZXUvY29tbXVuaXR5L2V1cGwvXHJcblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2VuY2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuU2VlIHRoZSBMaWNlbmNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5jZS5cclxuKi9cblxuLyoqXHJcbiAqIFVzZWZ1bCBjb25zdGFudHMgYW5kIGZ1bmN0aW9ucyBmb3IgY29tcHV0aW5nIHRoZSBzcGVlZCBvZiBNb3JzZSBjb2RlLlxyXG4gKi9cblxudmFyIERJVFNfUEVSX1dPUkQgPSA1MDtcbi8qKiBkaXRzIGluIFwiUEFSSVMgXCIgKi9cblxudmFyIFNQQUNFU19JTl9QQVJJUyA9IDE5O1xuLyoqIDV4IDMtZGl0IGludGVyLWNoYXJhY3RlciBzcGFjZXMgKyAxeCA3LWRpdCBzcGFjZSAqL1xuXG52YXIgTVNfSU5fTUlOVVRFID0gNjAwMDA7XG4vKiogbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpbiAxIG1pbnV0ZSAqL1xuXG4vKiogR2V0IHRoZSBkaXQgbGVuZ3RoIGluIG1zXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3cG0gLSBzcGVlZCBpbiB3b3JkcyBwZXIgbWludXRlXHJcbiAqIEByZXR1cm4ge2ludGVnZXJ9XHJcbiAqL1xuXG5mdW5jdGlvbiBkaXRMZW5ndGgod3BtKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKF9kaXRMZW5ndGgod3BtKSk7XG59XG5cbmZ1bmN0aW9uIF9kaXRMZW5ndGgod3BtKSB7XG4gIHJldHVybiBNU19JTl9NSU5VVEUgLyBESVRTX1BFUl9XT1JEIC8gd3BtO1xufVxuLyoqXHJcbiAqIEdldCB0aGUgZGFoIGxlbmd0aCBpbiBtc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gd3BtIC0gc3BlZWQgaW4gd29yZHMgcGVyIG1pbnV0ZVxyXG4gKiBAcmV0dXJuIHtpbnRlZ2VyfVxyXG4gKi9cblxuXG5mdW5jdGlvbiBkYWhMZW5ndGgod3BtKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKDMgKiBfZGl0TGVuZ3RoKHdwbSkpO1xufVxuLyoqXHJcbiAqIEdldCB0aGUgZGl0IHNwYWNlIGluIG1zXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3cG0gLSBzcGVlZCBpbiB3b3JkcyBwZXIgbWludXRlXHJcbiAqIEByZXR1cm4ge2ludGVnZXJ9XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRpdFNwYWNlKHdwbSkge1xuICByZXR1cm4gZGl0TGVuZ3RoKHdwbSk7XG59XG4vKipcclxuICogR2V0IHRoZSBjaGFyYWN0ZXItc3BhY2UgaW4gbXNcclxuICogQHBhcmFtIHtudW1iZXJ9IHdwbSAtIHNwZWVkIGluIHdvcmRzIHBlciBtaW51dGVcclxuICogQHBhcmFtIHtudW1iZXJ9IFtmd3BtID0gd3BtXSAtIEZhcm5zd29ydGggc3BlZWQgaW4gd29yZHMgcGVyIG1pbnV0ZVxyXG4gKiBAcmV0dXJuIHtpbnRlZ2VyfVxyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGFyU3BhY2Uod3BtKSB7XG4gIHZhciBmd3BtID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB3cG07XG4gIHJldHVybiBNYXRoLnJvdW5kKDMgKiBfZmRpdExlbmd0aCh3cG0sIGZ3cG0pKTtcbn1cbi8qKlxyXG4gKiBHZXQgdGhlIHdvcmQtc3BhY2UgaW4gbXNcclxuICogQHBhcmFtIHtudW1iZXJ9IHdwbSAtIHNwZWVkIGluIHdvcmRzIHBlciBtaW51dGVcclxuICogQHBhcmFtIHtudW1iZXJ9IFtmd3BtID0gd3BtXSAtIEZhcm5zd29ydGggc3BlZWQgaW4gd29yZHMgcGVyIG1pbnV0ZVxyXG4gKiBAcmV0dXJuIHtpbnRlZ2VyfVxyXG4gKi9cblxuXG5mdW5jdGlvbiB3b3JkU3BhY2Uod3BtKSB7XG4gIHZhciBmd3BtID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB3cG07XG4gIHJldHVybiBNYXRoLnJvdW5kKDcgKiBfZmRpdExlbmd0aCh3cG0sIGZ3cG0pKTtcbn1cbi8qKlxyXG4gKiBHZXQgdGhlIFdQTSBmb3IgYSBnaXZlbiBkaXQgbGVuZ3RoIGluIG1zXHJcbiAqIEByZXR1cm4ge251bWJlcn1cclxuICovXG5cblxuZnVuY3Rpb24gd3BtKGRpdExlbikge1xuICByZXR1cm4gTVNfSU5fTUlOVVRFIC8gRElUU19QRVJfV09SRCAvIGRpdExlbjtcbn1cbi8qKlxyXG4gKiBHZXQgdGhlIEZhcm5zd29ydGggZGl0IGxlbmd0aCBpbiBtcyBmb3IgYSBnaXZlbiBXUE0gYW5kIEZhcm5zd29ydGggV1BNLiBOb3RlLCBhY3R1YWwgZGl0LXNwYWNlcyBzaG91bGQgbm90IGJlIHNsb3dlZCBkb3duXHJcbiAqIEByZXR1cm4ge2ludGVnZXJ9XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGZkaXRMZW5ndGgod3BtLCBmd3BtKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKF9mZGl0TGVuZ3RoKHdwbSwgZndwbSkpO1xufVxuXG5mdW5jdGlvbiBfZmRpdExlbmd0aCh3cG0sIGZ3cG0pIHtcbiAgcmV0dXJuIF9kaXRMZW5ndGgod3BtKSAqIHJhdGlvKHdwbSwgZndwbSk7XG59XG4vKipcclxuICogR2V0IHRoZSBkaXQgbGVuZ3RoIHJhdGlvIGZvciBhIGdpdmVuIFdQTSBhbmQgRmFybnN3b3J0aCBXUE1cclxuICogQHBhcmFtIHtudW1iZXJ9IHdwbSAtIHNwZWVkIGluIHdvcmRzIHBlciBtaW51dGVcclxuICogQHBhcmFtIHtudW1iZXJ9IGZ3cG0gLSBGYXJuc3dvcnRoIHNwZWVkIGluIHdvcmRzIHBlciBtaW51dGVcclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cblxuXG5mdW5jdGlvbiByYXRpbyh3cG0sIGZ3cG0pIHtcbiAgLy8gXCJQQVJJUyBcIiBpcyAzMSB1bml0cyBmb3IgdGhlIGNoYXJhY3RlcnMgYW5kIDE5IHVuaXRzIGZvciB0aGUgaW50ZXItY2hhcmFjdGVyIHNwYWNlcyBhbmQgaW50ZXItd29yZCBzcGFjZVxuICAvLyBPbmUgdW5pdCB0YWtlcyAxICogNjAgLyAoNTAgKiB3cG0pXG4gIC8vIFRoZSAzMSB1bml0cyBzaG91bGQgdGFrZSAzMSAqIDYwIC8gKDUwICogd3BtKSBzZWNvbmRzIGF0IHdwbVxuICAvLyBcIlBBUklTIFwiIHNob3VsZCB0YWtlIDUwICogNjAgLyAoNTAgKiBmd3BtKSB0byB0cmFuc21pdCBhdCBmd3BtLCBvciA2MCAvIGZ3cG0gIHNlY29uZHMgYXQgZndwbVxuICAvLyBLZWVwaW5nIHRoZSB0aW1lIGZvciB0aGUgY2hhcmFjdGVycyBjb25zdGFudCxcbiAgLy8gVGhlIHNwYWNlcyBuZWVkIHRvIHRha2U6ICg2MCAvIGZ3cG0pIC0gWzMxICogNjAgLyAoNTAgKiB3cG0pXSBzZWNvbmRzIGluIHRvdGFsXG4gIC8vIFRoZSBzcGFjZXMgYXJlIDQgaW50ZXItY2hhcmFjdGVyIHNwYWNlcyBvZiAzIHVuaXRzIGFuZCAxIGludGVyLXdvcmQgc3BhY2Ugb2YgNyB1bml0cy4gVGhlaXIgcmF0aW8gbXVzdCBiZSBtYWludGFpbmVkLlxuICAvLyBBIHNwYWNlIHVuaXQgaXM6IFsoNjAgLyBmd3BtKSAtIFszMSAqIDYwIC8gKDUwICogd3BtKV1dIC8gMTkgc2Vjb25kc1xuICAvLyBDb21wYXJpbmcgdGhhdCB0byA2MCAvICg1MCAqIHdwbSkgZ2l2ZXMgYSByYXRpbyBvZiAoNTAud3BtIC0gMzEuZndwbSkgLyAxOS5md3BtXG4gIHJldHVybiAoRElUU19QRVJfV09SRCAqIHdwbSAtIChESVRTX1BFUl9XT1JEIC0gU1BBQ0VTX0lOX1BBUklTKSAqIGZ3cG0pIC8gKFNQQUNFU19JTl9QQVJJUyAqIGZ3cG0pO1xufVxuLyoqIEdldCB0aGUgRmFybnN3b3J0aCBXUE0gZm9yIGEgZ2l2ZW4gV1BNIGFuZCByYXRpbyAqL1xuXG5cbmZ1bmN0aW9uIGZ3cG0od3BtLCByKSB7XG4gIHJldHVybiBESVRTX1BFUl9XT1JEICogd3BtIC8gKFNQQUNFU19JTl9QQVJJUyAqIHIgKyAoRElUU19QRVJfV09SRCAtIFNQQUNFU19JTl9QQVJJUykpO1xufSIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZShcImNvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLnNwbGl0XCIpO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAubWF0Y2hcIik7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5yZXBsYWNlXCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50ZXh0Mm1vcnNlID0gdGV4dDJtb3JzZTtcbmV4cG9ydHMudGV4dDJkaXRkYWggPSB0ZXh0MmRpdGRhaDtcbmV4cG9ydHMubW9yc2UydGV4dCA9IG1vcnNlMnRleHQ7XG5leHBvcnRzLmxvb2tzTGlrZU1vcnNlID0gbG9va3NMaWtlTW9yc2U7XG4vKiFcclxuVGhpcyBjb2RlIGlzIMKpIENvcHlyaWdodCBTdGVwaGVuIEMuIFBoaWxsaXBzLCAyMDE4LlxyXG5FbWFpbDogc3RldmVAc2NwaGlsbGlwcy5jb21cclxuKi9cblxuLypcclxuTGljZW5zZWQgdW5kZXIgdGhlIEVVUEwsIFZlcnNpb24gMS4yIG9yIOKAkyBhcyBzb29uIHRoZXkgd2lsbCBiZSBhcHByb3ZlZCBieSB0aGUgRXVyb3BlYW4gQ29tbWlzc2lvbiAtIHN1YnNlcXVlbnQgdmVyc2lvbnMgb2YgdGhlIEVVUEwgKHRoZSBcIkxpY2VuY2VcIik7XHJcbllvdSBtYXkgbm90IHVzZSB0aGlzIHdvcmsgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5jZS5cclxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbmNlIGF0OiBodHRwczovL2pvaW51cC5lYy5ldXJvcGEuZXUvY29tbXVuaXR5L2V1cGwvXHJcblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2VuY2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuU2VlIHRoZSBMaWNlbmNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5jZS5cclxuKi9cblxuLyoqXHJcbiAqIEJhc2ljIG1ldGhvZHMgdG8gdHJhbnNsYXRlIE1vcnNlIGNvZGUuXHJcbiAqL1xuXG5pZiAodHlwZW9mIFN0cmluZy5wcm90b3R5cGUudHJpbSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIH07XG59XG5cbnZhciB0ZXh0Mm1vcnNlSCA9IHtcbiAgJ0EnOiBcIi4tXCIsXG4gICdCJzogXCItLi4uXCIsXG4gICdDJzogXCItLi0uXCIsXG4gICdEJzogXCItLi5cIixcbiAgJ0UnOiBcIi5cIixcbiAgJ0YnOiBcIi4uLS5cIixcbiAgJ0cnOiBcIi0tLlwiLFxuICAnSCc6IFwiLi4uLlwiLFxuICAnSSc6IFwiLi5cIixcbiAgJ0onOiBcIi4tLS1cIixcbiAgJ0snOiBcIi0uLVwiLFxuICAnTCc6IFwiLi0uLlwiLFxuICAnTSc6IFwiLS1cIixcbiAgJ04nOiBcIi0uXCIsXG4gICdPJzogXCItLS1cIixcbiAgJ1AnOiBcIi4tLS5cIixcbiAgJ1EnOiBcIi0tLi1cIixcbiAgJ1InOiBcIi4tLlwiLFxuICAnUyc6IFwiLi4uXCIsXG4gICdUJzogXCItXCIsXG4gICdVJzogXCIuLi1cIixcbiAgJ1YnOiBcIi4uLi1cIixcbiAgJ1cnOiBcIi4tLVwiLFxuICAnWCc6IFwiLS4uLVwiLFxuICAnWSc6IFwiLS4tLVwiLFxuICAnWic6IFwiLS0uLlwiLFxuICAnMSc6IFwiLi0tLS1cIixcbiAgJzInOiBcIi4uLS0tXCIsXG4gICczJzogXCIuLi4tLVwiLFxuICAnNCc6IFwiLi4uLi1cIixcbiAgJzUnOiBcIi4uLi4uXCIsXG4gICc2JzogXCItLi4uLlwiLFxuICAnNyc6IFwiLS0uLi5cIixcbiAgJzgnOiBcIi0tLS4uXCIsXG4gICc5JzogXCItLS0tLlwiLFxuICAnMCc6IFwiLS0tLS1cIixcbiAgJy4nOiBcIi4tLi0uLVwiLFxuICAnLCc6IFwiLS0uLi0tXCIsXG4gICc6JzogXCItLS0uLi5cIixcbiAgJz8nOiBcIi4uLS0uLlwiLFxuICAnXFwnJzogXCIuLS0tLS5cIixcbiAgJy0nOiBcIi0uLi4uLVwiLFxuICAnLyc6IFwiLS4uLS5cIixcbiAgJygnOiBcIi0uLS0uXCIsXG4gICcpJzogXCItLi0tLi1cIixcbiAgJ1wiJzogXCIuLS4uLS5cIixcbiAgJ0AnOiBcIi4tLS4tLlwiLFxuICAnPSc6IFwiLS4uLi1cIixcbiAgJyYnOiBcIi4tLi4uXCIsXG4gICcrJzogXCIuLS4tLlwiLFxuICAnISc6IFwiLS4tLi0tXCIsXG4gICcgJzogXCIvXCIgLy9Ob3QgbW9yc2UgYnV0IGhlbHBzIHRyYW5zbGF0aW9uXG5cbn07XG52YXIgbW9yc2UydGV4dEggPSB7fTtcbnZhciBwcm9zaWduMm1vcnNlSCA9IHtcbiAgJzxBQT4nOiAnLi0uLScsXG4gICc8QVI+JzogJy4tLi0uJyxcbiAgJzxBUz4nOiAnLi0uLi4nLFxuICAnPEJLPic6ICctLi4uLS4tJyxcbiAgJzxCVD4nOiAnLS4uLi0nLFxuICAvLyBhbHNvIDxUVj5cbiAgJzxDTD4nOiAnLS4tLi4tLi4nLFxuICAnPENUPic6ICctLi0uLScsXG4gICc8RE8+JzogJy0uLi0tLScsXG4gICc8S04+JzogJy0uLS0uJyxcbiAgJzxTSz4nOiAnLi4uLS4tJyxcbiAgLy8gYWxzbyA8VkE+XG4gICc8VkE+JzogJy4uLi0uLScsXG4gICc8U04+JzogJy4uLi0uJyxcbiAgLy8gYWxzbyA8VkU+XG4gICc8VkU+JzogJy4uLi0uJyxcbiAgJzxTT1M+JzogJy4uLi0tLS4uLidcbn07XG52YXIgbW9yc2Vwcm8ydGV4dEggPSB7fTtcbnZhciB0ZXh0Mm1vcnNlcHJvSCA9IHt9O1xuXG5mb3IgKHZhciB0ZXh0IGluIHRleHQybW9yc2VIKSB7XG4gIHRleHQybW9yc2Vwcm9IW3RleHRdID0gdGV4dDJtb3JzZUhbdGV4dF07XG4gIG1vcnNlMnRleHRIW3RleHQybW9yc2VIW3RleHRdXSA9IHRleHQ7XG4gIG1vcnNlcHJvMnRleHRIW3RleHQybW9yc2VIW3RleHRdXSA9IHRleHQ7XG59XG5cbmZvciAodmFyIHNpZ24gaW4gcHJvc2lnbjJtb3JzZUgpIHtcbiAgdGV4dDJtb3JzZXByb0hbc2lnbl0gPSBwcm9zaWduMm1vcnNlSFtzaWduXTtcbiAgbW9yc2Vwcm8ydGV4dEhbcHJvc2lnbjJtb3JzZUhbc2lnbl1dID0gc2lnbjtcbn1cblxudmFyIHRpZHlUZXh0ID0gZnVuY3Rpb24gdGlkeVRleHQodGV4dCkge1xuICB0ZXh0ID0gdGV4dC50b1VwcGVyQ2FzZSgpO1xuICB0ZXh0ID0gdGV4dC50cmltKCk7XG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgcmV0dXJuIHRleHQ7XG59O1xuLyoqXHJcbiAqIFRyYW5zbGF0ZSB0ZXh0IHRvIG1vcnNlIGluICcuLi0gLi4gLyAtLScgZm9ybS5cclxuICogSWYgc29tZXRoaW5nIGluIHRoZSB0ZXh0IGlzIHVudHJhbnNsYXRhYmxlIHRoZW4gaXQgaXMgc3Vycm91bmRlZCBieSBoYXNoLXNpZ25zICgnIycpIGFuZCBhIGhhc2ggaXMgcGxhY2VkIGluIHRoZSBtb3JzZS5cclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBhbHBoYW51bWVyaWMgbWVzc2FnZVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHVzZVByb3NpZ25zIC0gdHJ1ZSBpZiBwcm9zaWducyBhcmUgdG8gYmUgdXNlZCAoZGVmYXVsdCBpcyB0cnVlKVxyXG4gKiBAcmV0dXJuIHt7bWVzc2FnZTogc3RyaW5nLCBtb3JzZTogc3RyaW5nLCBoYXNFcnJvcjogYm9vbGVhbn19XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHRleHQybW9yc2UodGV4dCkge1xuICB2YXIgdXNlUHJvc2lnbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRydWU7XG4gIHRleHQgPSB0aWR5VGV4dCh0ZXh0KTtcbiAgdmFyIHJldCA9IHtcbiAgICBtb3JzZTogXCJcIixcbiAgICBtZXNzYWdlOiBcIlwiLFxuICAgIGhhc0Vycm9yOiBmYWxzZVxuICB9O1xuXG4gIGlmICh0ZXh0ID09PSBcIlwiKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHZhciB0b2tlbnMgPSBbXTtcbiAgdmFyIHByb3NpZ247XG4gIHZhciB0b2tlbl9sZW5ndGg7XG5cbiAgd2hpbGUgKHRleHQubGVuZ3RoID4gMCkge1xuICAgIHRva2VuX2xlbmd0aCA9IDE7XG5cbiAgICBpZiAodXNlUHJvc2lnbnMpIHtcbiAgICAgIHByb3NpZ24gPSB0ZXh0Lm1hdGNoKC9ePC4uLj8+Lyk7IC8vIGFycmF5IG9mIG1hdGNoZXNcblxuICAgICAgaWYgKHByb3NpZ24pIHtcbiAgICAgICAgdG9rZW5fbGVuZ3RoID0gcHJvc2lnblswXS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdG9rZW5zLnB1c2godGV4dC5zbGljZSgwLCB0b2tlbl9sZW5ndGgpKTtcbiAgICB0ZXh0ID0gdGV4dC5zbGljZSh0b2tlbl9sZW5ndGgsIHRleHQubGVuZ3RoKTtcbiAgfVxuXG4gIHZhciBkaWN0O1xuXG4gIGlmICh1c2VQcm9zaWducykge1xuICAgIGRpY3QgPSB0ZXh0Mm1vcnNlcHJvSDtcbiAgfSBlbHNlIHtcbiAgICBkaWN0ID0gdGV4dDJtb3JzZUg7XG4gIH1cblxuICB2YXIgaSwgYywgdDtcblxuICBmb3IgKGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgdCA9IHRva2Vuc1tpXTtcbiAgICBjID0gZGljdFt0XTtcblxuICAgIGlmIChjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldC5tZXNzYWdlICs9IFwiI1wiICsgdCArIFwiI1wiO1xuICAgICAgcmV0Lm1vcnNlICs9IFwiIyBcIjtcbiAgICAgIHJldC5oYXNFcnJvciA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldC5tZXNzYWdlICs9IHQ7XG4gICAgICByZXQubW9yc2UgKz0gYyArIFwiIFwiO1xuICAgIH1cbiAgfVxuXG4gIHJldC5tb3JzZSA9IHJldC5tb3JzZS5zbGljZSgwLCByZXQubW9yc2UubGVuZ3RoIC0gMSk7XG4gIHJldHVybiByZXQ7XG59XG4vKipcclxuICogVHJhbnNsYXRlIHRleHQgdG8gbW9yc2UgaW4gJ0RpLWRpLWRhaCBkYWgnIGZvcm0uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gYWxwaGFudW1lcmljIG1lc3NhZ2VcclxuICogQHBhcmFtIHtib29sZWFufSB1c2VQcm9zaWducyAtIHRydWUgaWYgcHJvc2lnbnMgYXJlIHRvIGJlIHVzZWQgKGRlZmF1bHQgaXMgdHJ1ZSlcclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cblxuXG5mdW5jdGlvbiB0ZXh0MmRpdGRhaCh0ZXh0LCB1c2VQcm9zaWducykge1xuICAvLyBUT0RPOiBkZWFsIHdpdGggZXJyb3JzIGluIHRoZSB0cmFuc2xhdGlvblxuICB2YXIgZGl0ZGFoID0gdGV4dDJtb3JzZSh0ZXh0LCB1c2VQcm9zaWducykubW9yc2UgKyAnICc7IC8vIGdldCB0aGUgZG90cyBhbmQgZGFzaGVzXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoL1xcLi9nLCAnZGl+JykucmVwbGFjZSgvXFwtL2csICdkYWh+Jyk7IC8vIGRvIHRoZSBiYXNpYyBqb2JcblxuICBkaXRkYWggPSBkaXRkYWgucmVwbGFjZSgvfi9nLCAnLScpOyAvLyByZXBsYWNlIHBsYWNlaG9sZGVyIHdpdGggZGFzaFxuXG4gIGRpdGRhaCA9IGRpdGRhaC5yZXBsYWNlKC9cXC0gL2csICcgJyk7IC8vIHJlbW92ZSB0cmFpbGluZyBkYXNoZXNcblxuICBkaXRkYWggPSBkaXRkYWgucmVwbGFjZSgvZGkgL2csICdkaXQgJyk7IC8vIHVzZSAnZGl0JyBhdCBlbmQgb2YgbGV0dGVyXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoLyBcXC8gL2csICcsICcpOyAvLyBkbyBwdW5jdHVhdGlvblxuXG4gIGRpdGRhaCA9IGRpdGRhaC5yZXBsYWNlKC9eZC8sICdEJyk7IC8vIGRvIGNhcGl0YWxpc2F0aW9uXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoLyAkLywgJycpOyAvLyByZW1vdmUgdGhlIHNwYWNlIHdlIGFkZGVkXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoLyhbdGhdKSQvLCAnJDEuJyk7IC8vIGFkZCBmdWxsLXN0b3AgaWYgdGhlcmUgaXMgYW55dGhpbmcgdGhlcmVcblxuICByZXR1cm4gZGl0ZGFoO1xufVxuLyoqXHJcbiAqIENhbm9uaWNhbGlzZSBtb3JzZSB0ZXh0LlxyXG4gKiBDYW5vbmljYWwgZm9ybSBtYXRjaGVzIFsuLS8gXSosIGhhcyBzaW5nbGUgc3BhY2VzIGJldHdlZW4gY2hhcmFjdGVycywgaGFzIHdvcmRzIHNlcGFyYXRlZCBieSAnIC8gJywgYW5kIGhhcyBubyBzcGFjZXMgYXQgdGhlIHN0YXJ0IG9yIGVuZC5cclxuICogQSBzaW5nbGUgJy8nIG1heSBiZSByZXR1cm5lZCBieSB0aGlzIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbW9yc2UgLSBNb3JzZSBjb2RlIG1hdGNoaW5nIFsuLV8vfCBdKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9IE1vcnNlIGNvZGUgaW4gY2Fub25pY2FsIGZvcm0gbWF0Y2hpbmcgWy4tLyBdKlxyXG4gKi9cblxuXG52YXIgdGlkeU1vcnNlID0gZnVuY3Rpb24gdGlkeU1vcnNlKG1vcnNlKSB7XG4gIG1vcnNlID0gbW9yc2UucmVwbGFjZSgvXFx8L2csIFwiL1wiKTsgLy8gdW5pZnkgdGhlIHdvcmQgc2VwYXJhdG9yXG5cbiAgbW9yc2UgPSBtb3JzZS5yZXBsYWNlKC9cXC8vZywgXCIgLyBcIik7IC8vIG1ha2Ugc3VyZSB3b3JkIHNlcGFyYXRvcnMgYXJlIHNwYWNlZCBvdXRcblxuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoL1xccysvZywgXCIgXCIpOyAvLyBzcXVhc2ggbXVsdGlwbGUgc3BhY2VzIGludG8gc2luZ2xlIHNwYWNlc1xuXG4gIG1vcnNlID0gbW9yc2UucmVwbGFjZSgvKFxcLyApK1xcLy9nLCBcIi9cIik7IC8vIHNxdWFzaCBtdWx0aXBsZSB3b3JkIHNlcGFyYXRvcnNcblxuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoL18vZywgXCItXCIpOyAvLyB1bmlmeSB0aGUgZGFzaCBjaGFyYWN0ZXJcblxuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoL15cXHMrLywgXCJcIik7IC8vIHJlbW92ZSBpbml0aWFsIHdoaXRlc3BhY2VcblxuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoL1xccyskLywgXCJcIik7IC8vIHJlbW92ZSB0cmFpbGluZyB3aGl0ZXNwYWNlXG5cbiAgcmV0dXJuIG1vcnNlO1xufTtcbi8qKlxyXG4gKiBUcmFuc2xhdGUgbW9yc2UgdG8gdGV4dC4gQ2Fub25pY2FsaXNlIHRoZSBtb3JzZSBmaXJzdC5cclxuICogSWYgc29tZXRoaW5nIGluIHRoZSBtb3JzZSBpcyB1bnRyYW5zbGF0YWJsZSB0aGVuIGl0IGlzIHN1cnJvdW5kZWQgYnkgaGFzaC1zaWducyAoJyMnKSBhbmQgYSBoYXNoIGlzIHBsYWNlZCBpbiB0aGUgdGV4dC5cclxuICogQHBhcmFtIHtzdHJpbmd9IG1vcnNlIC0gbW9yc2UgbWVzc2FnZSB1c2luZyBbLi1fL3wgXSBjaGFyYWN0ZXJzXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlUHJvc2lnbnMgLSB0cnVlIGlmIHByb3NpZ25zIGFyZSB0byBiZSB1c2VkIChkZWZhdWx0IGlzIHRydWUpXHJcbiAqIEByZXR1cm4ge3ttZXNzYWdlOiBzdHJpbmcsIG1vcnNlOiBzdHJpbmcsIGhhc0Vycm9yOiBib29sZWFufX1cclxuICovXG5cblxuZnVuY3Rpb24gbW9yc2UydGV4dChtb3JzZSkge1xuICB2YXIgdXNlUHJvc2lnbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRydWU7XG4gIG1vcnNlID0gdGlkeU1vcnNlKG1vcnNlKTtcbiAgdmFyIHJldCA9IHtcbiAgICBtb3JzZTogXCJcIixcbiAgICBtZXNzYWdlOiBcIlwiLFxuICAgIGhhc0Vycm9yOiBmYWxzZVxuICB9O1xuXG4gIGlmIChtb3JzZSA9PT0gXCJcIikge1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICB2YXIgdG9rZW5zID0gbW9yc2Uuc3BsaXQoXCIgXCIpO1xuICB2YXIgZGljdDtcblxuICBpZiAodXNlUHJvc2lnbnMpIHtcbiAgICBkaWN0ID0gbW9yc2Vwcm8ydGV4dEg7XG4gIH0gZWxzZSB7XG4gICAgZGljdCA9IG1vcnNlMnRleHRIO1xuICB9XG5cbiAgdmFyIGMsIHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB0ID0gdG9rZW5zW2ldO1xuICAgIGMgPSBkaWN0W3RdO1xuXG4gICAgaWYgKGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0Lm1vcnNlICs9IFwiI1wiICsgdCArIFwiIyBcIjtcbiAgICAgIHJldC5tZXNzYWdlICs9IFwiI1wiO1xuICAgICAgcmV0Lmhhc0Vycm9yID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0Lm1vcnNlICs9IHQgKyBcIiBcIjtcbiAgICAgIHJldC5tZXNzYWdlICs9IGM7XG4gICAgfVxuICB9XG5cbiAgcmV0Lm1vcnNlID0gcmV0Lm1vcnNlLnNsaWNlKDAsIHJldC5tb3JzZS5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHJldDtcbn1cbi8qKlxyXG4gKiBEZXRlcm1pbmUgd2hldGhlciBhIHN0cmluZyBpcyBtb3N0IGxpa2VseSBtb3JzZSBjb2RlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgLSB0aGUgdGV4dFxyXG4gKiBAcmV0dXJuIHtib29sZWFufSAtIHRydWUgaWYgdGhlIHN0cmluZyBvbmx5IGhhcyBNb3JzZSBjaGFyYWN0ZXJzIGluIGFmdGVyIGV4ZWN1dGluZyB0aWR5TW9yc2VcclxuICovXG5cblxuZnVuY3Rpb24gbG9va3NMaWtlTW9yc2UoaW5wdXQpIHtcbiAgaW5wdXQgPSB0aWR5TW9yc2UoaW5wdXQpO1xuICByZXR1cm4gaW5wdXQubWF0Y2goL15bLy4tXVsgLy4tXSokLykgIT09IG51bGw7XG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGF0ID0gcmVxdWlyZSgnLi9fc3RyaW5nLWF0JykodHJ1ZSk7XG5cbiAvLyBgQWR2YW5jZVN0cmluZ0luZGV4YCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFkdmFuY2VzdHJpbmdpbmRleFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoUywgaW5kZXgsIHVuaWNvZGUpIHtcbiAgcmV0dXJuIGluZGV4ICsgKHVuaWNvZGUgPyBhdChTLCBpbmRleCkubGVuZ3RoIDogMSk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNi4xJyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcbiIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgY3R4ID0gcmVxdWlyZSgnLi9fY3R4Jyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciB0YXJnZXQgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV07XG4gIHZhciBleHBvcnRzID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIHZhciBleHBQcm90byA9IGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pO1xuICB2YXIga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZiAoSVNfR0xPQkFMKSBzb3VyY2UgPSBuYW1lO1xuICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZiAodGFyZ2V0KSByZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZiAoZXhwb3J0c1trZXldICE9IG91dCkgaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYgKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KSBleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xucmVxdWlyZSgnLi9lczYucmVnZXhwLmV4ZWMnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbnZhciB3a3MgPSByZXF1aXJlKCcuL193a3MnKTtcbnZhciByZWdleHBFeGVjID0gcmVxdWlyZSgnLi9fcmVnZXhwLWV4ZWMnKTtcblxudmFyIFNQRUNJRVMgPSB3a3MoJ3NwZWNpZXMnKTtcblxudmFyIFJFUExBQ0VfU1VQUE9SVFNfTkFNRURfR1JPVVBTID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gI3JlcGxhY2UgbmVlZHMgYnVpbHQtaW4gc3VwcG9ydCBmb3IgbmFtZWQgZ3JvdXBzLlxuICAvLyAjbWF0Y2ggd29ya3MgZmluZSBiZWNhdXNlIGl0IGp1c3QgcmV0dXJuIHRoZSBleGVjIHJlc3VsdHMsIGV2ZW4gaWYgaXQgaGFzXG4gIC8vIGEgXCJncm9wc1wiIHByb3BlcnR5LlxuICB2YXIgcmUgPSAvLi87XG4gIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHJlc3VsdC5ncm91cHMgPSB7IGE6ICc3JyB9O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHJldHVybiAnJy5yZXBsYWNlKHJlLCAnJDxhPicpICE9PSAnNyc7XG59KTtcblxudmFyIFNQTElUX1dPUktTX1dJVEhfT1ZFUldSSVRURU5fRVhFQyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIENocm9tZSA1MSBoYXMgYSBidWdneSBcInNwbGl0XCIgaW1wbGVtZW50YXRpb24gd2hlbiBSZWdFeHAjZXhlYyAhPT0gbmF0aXZlRXhlY1xuICB2YXIgcmUgPSAvKD86KS87XG4gIHZhciBvcmlnaW5hbEV4ZWMgPSByZS5leGVjO1xuICByZS5leGVjID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gb3JpZ2luYWxFeGVjLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gIHZhciByZXN1bHQgPSAnYWInLnNwbGl0KHJlKTtcbiAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPT09IDIgJiYgcmVzdWx0WzBdID09PSAnYScgJiYgcmVzdWx0WzFdID09PSAnYic7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChLRVksIGxlbmd0aCwgZXhlYykge1xuICB2YXIgU1lNQk9MID0gd2tzKEtFWSk7XG5cbiAgdmFyIERFTEVHQVRFU19UT19TWU1CT0wgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIFN0cmluZyBtZXRob2RzIGNhbGwgc3ltYm9sLW5hbWVkIFJlZ0VwIG1ldGhvZHNcbiAgICB2YXIgTyA9IHt9O1xuICAgIE9bU1lNQk9MXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH07XG4gICAgcmV0dXJuICcnW0tFWV0oTykgIT0gNztcbiAgfSk7XG5cbiAgdmFyIERFTEVHQVRFU19UT19FWEVDID0gREVMRUdBVEVTX1RPX1NZTUJPTCA/ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gU3ltYm9sLW5hbWVkIFJlZ0V4cCBtZXRob2RzIGNhbGwgLmV4ZWNcbiAgICB2YXIgZXhlY0NhbGxlZCA9IGZhbHNlO1xuICAgIHZhciByZSA9IC9hLztcbiAgICByZS5leGVjID0gZnVuY3Rpb24gKCkgeyBleGVjQ2FsbGVkID0gdHJ1ZTsgcmV0dXJuIG51bGw7IH07XG4gICAgaWYgKEtFWSA9PT0gJ3NwbGl0Jykge1xuICAgICAgLy8gUmVnRXhwW0BAc3BsaXRdIGRvZXNuJ3QgY2FsbCB0aGUgcmVnZXgncyBleGVjIG1ldGhvZCwgYnV0IGZpcnN0IGNyZWF0ZXNcbiAgICAgIC8vIGEgbmV3IG9uZS4gV2UgbmVlZCB0byByZXR1cm4gdGhlIHBhdGNoZWQgcmVnZXggd2hlbiBjcmVhdGluZyB0aGUgbmV3IG9uZS5cbiAgICAgIHJlLmNvbnN0cnVjdG9yID0ge307XG4gICAgICByZS5jb25zdHJ1Y3RvcltTUEVDSUVTXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlOyB9O1xuICAgIH1cbiAgICByZVtTWU1CT0xdKCcnKTtcbiAgICByZXR1cm4gIWV4ZWNDYWxsZWQ7XG4gIH0pIDogdW5kZWZpbmVkO1xuXG4gIGlmIChcbiAgICAhREVMRUdBVEVTX1RPX1NZTUJPTCB8fFxuICAgICFERUxFR0FURVNfVE9fRVhFQyB8fFxuICAgIChLRVkgPT09ICdyZXBsYWNlJyAmJiAhUkVQTEFDRV9TVVBQT1JUU19OQU1FRF9HUk9VUFMpIHx8XG4gICAgKEtFWSA9PT0gJ3NwbGl0JyAmJiAhU1BMSVRfV09SS1NfV0lUSF9PVkVSV1JJVFRFTl9FWEVDKVxuICApIHtcbiAgICB2YXIgbmF0aXZlUmVnRXhwTWV0aG9kID0gLy4vW1NZTUJPTF07XG4gICAgdmFyIGZucyA9IGV4ZWMoXG4gICAgICBkZWZpbmVkLFxuICAgICAgU1lNQk9MLFxuICAgICAgJydbS0VZXSxcbiAgICAgIGZ1bmN0aW9uIG1heWJlQ2FsbE5hdGl2ZShuYXRpdmVNZXRob2QsIHJlZ2V4cCwgc3RyLCBhcmcyLCBmb3JjZVN0cmluZ01ldGhvZCkge1xuICAgICAgICBpZiAocmVnZXhwLmV4ZWMgPT09IHJlZ2V4cEV4ZWMpIHtcbiAgICAgICAgICBpZiAoREVMRUdBVEVTX1RPX1NZTUJPTCAmJiAhZm9yY2VTdHJpbmdNZXRob2QpIHtcbiAgICAgICAgICAgIC8vIFRoZSBuYXRpdmUgU3RyaW5nIG1ldGhvZCBhbHJlYWR5IGRlbGVnYXRlcyB0byBAQG1ldGhvZCAodGhpc1xuICAgICAgICAgICAgLy8gcG9seWZpbGxlZCBmdW5jdGlvbiksIGxlYXNpbmcgdG8gaW5maW5pdGUgcmVjdXJzaW9uLlxuICAgICAgICAgICAgLy8gV2UgYXZvaWQgaXQgYnkgZGlyZWN0bHkgY2FsbGluZyB0aGUgbmF0aXZlIEBAbWV0aG9kIG1ldGhvZC5cbiAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBuYXRpdmVSZWdFeHBNZXRob2QuY2FsbChyZWdleHAsIHN0ciwgYXJnMikgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5hdGl2ZU1ldGhvZC5jYWxsKHN0ciwgcmVnZXhwLCBhcmcyKSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlIH07XG4gICAgICB9XG4gICAgKTtcbiAgICB2YXIgc3RyZm4gPSBmbnNbMF07XG4gICAgdmFyIHJ4Zm4gPSBmbnNbMV07XG5cbiAgICByZWRlZmluZShTdHJpbmcucHJvdG90eXBlLCBLRVksIHN0cmZuKTtcbiAgICBoaWRlKFJlZ0V4cC5wcm90b3R5cGUsIFNZTUJPTCwgbGVuZ3RoID09IDJcbiAgICAgIC8vIDIxLjIuNS44IFJlZ0V4cC5wcm90b3R5cGVbQEByZXBsYWNlXShzdHJpbmcsIHJlcGxhY2VWYWx1ZSlcbiAgICAgIC8vIDIxLjIuNS4xMSBSZWdFeHAucHJvdG90eXBlW0BAc3BsaXRdKHN0cmluZywgbGltaXQpXG4gICAgICA/IGZ1bmN0aW9uIChzdHJpbmcsIGFyZykgeyByZXR1cm4gcnhmbi5jYWxsKHN0cmluZywgdGhpcywgYXJnKTsgfVxuICAgICAgLy8gMjEuMi41LjYgUmVnRXhwLnByb3RvdHlwZVtAQG1hdGNoXShzdHJpbmcpXG4gICAgICAvLyAyMS4yLjUuOSBSZWdFeHAucHJvdG90eXBlW0BAc2VhcmNoXShzdHJpbmcpXG4gICAgICA6IGZ1bmN0aW9uIChzdHJpbmcpIHsgcmV0dXJuIHJ4Zm4uY2FsbChzdHJpbmcsIHRoaXMpOyB9XG4gICAgKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGhhdCA9IGFuT2JqZWN0KHRoaXMpO1xuICB2YXIgcmVzdWx0ID0gJyc7XG4gIGlmICh0aGF0Lmdsb2JhbCkgcmVzdWx0ICs9ICdnJztcbiAgaWYgKHRoYXQuaWdub3JlQ2FzZSkgcmVzdWx0ICs9ICdpJztcbiAgaWYgKHRoYXQubXVsdGlsaW5lKSByZXN1bHQgKz0gJ20nO1xuICBpZiAodGhhdC51bmljb2RlKSByZXN1bHQgKz0gJ3UnO1xuICBpZiAodGhhdC5zdGlja3kpIHJlc3VsdCArPSAneSc7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYgKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpIF9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcbiIsInZhciBkUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTtcbiIsIi8vIDcuMi44IElzUmVnRXhwKGFyZ3VtZW50KVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgTUFUQ0ggPSByZXF1aXJlKCcuL193a3MnKSgnbWF0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBpc1JlZ0V4cDtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiAoKGlzUmVnRXhwID0gaXRbTUFUQ0hdKSAhPT0gdW5kZWZpbmVkID8gISFpc1JlZ0V4cCA6IGNvZihpdCkgPT0gJ1JlZ0V4cCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFNSQyA9IHJlcXVpcmUoJy4vX3VpZCcpKCdzcmMnKTtcbnZhciBUT19TVFJJTkcgPSAndG9TdHJpbmcnO1xudmFyICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR107XG52YXIgVFBMID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5yZXF1aXJlKCcuL19jb3JlJykuaW5zcGVjdFNvdXJjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsLCBzYWZlKSB7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgJ25hbWUnKSB8fCBoaWRlKHZhbCwgJ25hbWUnLCBrZXkpO1xuICBpZiAoT1trZXldID09PSB2YWwpIHJldHVybjtcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2UgaWYgKCFzYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfSBlbHNlIGlmIChPW2tleV0pIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzW1NSQ10gfHwgJHRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgYnVpbHRpbkV4ZWMgPSBSZWdFeHAucHJvdG90eXBlLmV4ZWM7XG5cbiAvLyBgUmVnRXhwRXhlY2AgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1yZWdleHBleGVjXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChSLCBTKSB7XG4gIHZhciBleGVjID0gUi5leGVjO1xuICBpZiAodHlwZW9mIGV4ZWMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgcmVzdWx0ID0gZXhlYy5jYWxsKFIsIFMpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVnRXhwIGV4ZWMgbWV0aG9kIHJldHVybmVkIHNvbWV0aGluZyBvdGhlciB0aGFuIGFuIE9iamVjdCBvciBudWxsJyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgaWYgKGNsYXNzb2YoUikgIT09ICdSZWdFeHAnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVnRXhwI2V4ZWMgY2FsbGVkIG9uIGluY29tcGF0aWJsZSByZWNlaXZlcicpO1xuICB9XG4gIHJldHVybiBidWlsdGluRXhlYy5jYWxsKFIsIFMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlZ2V4cEZsYWdzID0gcmVxdWlyZSgnLi9fZmxhZ3MnKTtcblxudmFyIG5hdGl2ZUV4ZWMgPSBSZWdFeHAucHJvdG90eXBlLmV4ZWM7XG4vLyBUaGlzIGFsd2F5cyByZWZlcnMgdG8gdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiwgYmVjYXVzZSB0aGVcbi8vIFN0cmluZyNyZXBsYWNlIHBvbHlmaWxsIHVzZXMgLi9maXgtcmVnZXhwLXdlbGwta25vd24tc3ltYm9sLWxvZ2ljLmpzLFxuLy8gd2hpY2ggbG9hZHMgdGhpcyBmaWxlIGJlZm9yZSBwYXRjaGluZyB0aGUgbWV0aG9kLlxudmFyIG5hdGl2ZVJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XG5cbnZhciBwYXRjaGVkRXhlYyA9IG5hdGl2ZUV4ZWM7XG5cbnZhciBMQVNUX0lOREVYID0gJ2xhc3RJbmRleCc7XG5cbnZhciBVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcmUxID0gL2EvLFxuICAgICAgcmUyID0gL2IqL2c7XG4gIG5hdGl2ZUV4ZWMuY2FsbChyZTEsICdhJyk7XG4gIG5hdGl2ZUV4ZWMuY2FsbChyZTIsICdhJyk7XG4gIHJldHVybiByZTFbTEFTVF9JTkRFWF0gIT09IDAgfHwgcmUyW0xBU1RfSU5ERVhdICE9PSAwO1xufSkoKTtcblxuLy8gbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXAsIGNvcGllZCBmcm9tIGVzNS1zaGltJ3MgU3RyaW5nI3NwbGl0IHBhdGNoLlxudmFyIE5QQ0dfSU5DTFVERUQgPSAvKCk/Py8uZXhlYygnJylbMV0gIT09IHVuZGVmaW5lZDtcblxudmFyIFBBVENIID0gVVBEQVRFU19MQVNUX0lOREVYX1dST05HIHx8IE5QQ0dfSU5DTFVERUQ7XG5cbmlmIChQQVRDSCkge1xuICBwYXRjaGVkRXhlYyA9IGZ1bmN0aW9uIGV4ZWMoc3RyKSB7XG4gICAgdmFyIHJlID0gdGhpcztcbiAgICB2YXIgbGFzdEluZGV4LCByZUNvcHksIG1hdGNoLCBpO1xuXG4gICAgaWYgKE5QQ0dfSU5DTFVERUQpIHtcbiAgICAgIHJlQ29weSA9IG5ldyBSZWdFeHAoJ14nICsgcmUuc291cmNlICsgJyQoPyFcXFxccyknLCByZWdleHBGbGFncy5jYWxsKHJlKSk7XG4gICAgfVxuICAgIGlmIChVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcpIGxhc3RJbmRleCA9IHJlW0xBU1RfSU5ERVhdO1xuXG4gICAgbWF0Y2ggPSBuYXRpdmVFeGVjLmNhbGwocmUsIHN0cik7XG5cbiAgICBpZiAoVVBEQVRFU19MQVNUX0lOREVYX1dST05HICYmIG1hdGNoKSB7XG4gICAgICByZVtMQVNUX0lOREVYXSA9IHJlLmdsb2JhbCA/IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoIDogbGFzdEluZGV4O1xuICAgIH1cbiAgICBpZiAoTlBDR19JTkNMVURFRCAmJiBtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYFxuICAgICAgLy8gZm9yIE5QQ0csIGxpa2UgSUU4LiBOT1RFOiBUaGlzIGRvZXNuJyB3b3JrIGZvciAvKC4/KT8vXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbG9vcC1mdW5jXG4gICAgICBuYXRpdmVSZXBsYWNlLmNhbGwobWF0Y2hbMF0sIHJlQ29weSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0gPT09IHVuZGVmaW5lZCkgbWF0Y2hbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaGVkRXhlYztcbiIsInZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHt9KTtcbn0pKCd2ZXJzaW9ucycsIFtdKS5wdXNoKHtcbiAgdmVyc2lvbjogY29yZS52ZXJzaW9uLFxuICBtb2RlOiByZXF1aXJlKCcuL19saWJyYXJ5JykgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOCBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuIiwiLy8gNy4zLjIwIFNwZWNpZXNDb25zdHJ1Y3RvcihPLCBkZWZhdWx0Q29uc3RydWN0b3IpXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBEKSB7XG4gIHZhciBDID0gYW5PYmplY3QoTykuY29uc3RydWN0b3I7XG4gIHZhciBTO1xuICByZXR1cm4gQyA9PT0gdW5kZWZpbmVkIHx8IChTID0gYW5PYmplY3QoQylbU1BFQ0lFU10pID09IHVuZGVmaW5lZCA/IEQgOiBhRnVuY3Rpb24oUyk7XG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRPX1NUUklORykge1xuICByZXR1cm4gZnVuY3Rpb24gKHRoYXQsIHBvcykge1xuICAgIHZhciBzID0gU3RyaW5nKGRlZmluZWQodGhhdCkpO1xuICAgIHZhciBpID0gdG9JbnRlZ2VyKHBvcyk7XG4gICAgdmFyIGwgPSBzLmxlbmd0aDtcbiAgICB2YXIgYSwgYjtcbiAgICBpZiAoaSA8IDAgfHwgaSA+PSBsKSByZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcbiIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgPSBNYXRoLmNlaWw7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG4iLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcbiIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcbiIsInZhciBpZCA9IDA7XG52YXIgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59O1xuIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlZ2V4cEV4ZWMgPSByZXF1aXJlKCcuL19yZWdleHAtZXhlYycpO1xucmVxdWlyZSgnLi9fZXhwb3J0Jykoe1xuICB0YXJnZXQ6ICdSZWdFeHAnLFxuICBwcm90bzogdHJ1ZSxcbiAgZm9yY2VkOiByZWdleHBFeGVjICE9PSAvLi8uZXhlY1xufSwge1xuICBleGVjOiByZWdleHBFeGVjXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciBhZHZhbmNlU3RyaW5nSW5kZXggPSByZXF1aXJlKCcuL19hZHZhbmNlLXN0cmluZy1pbmRleCcpO1xudmFyIHJlZ0V4cEV4ZWMgPSByZXF1aXJlKCcuL19yZWdleHAtZXhlYy1hYnN0cmFjdCcpO1xuXG4vLyBAQG1hdGNoIGxvZ2ljXG5yZXF1aXJlKCcuL19maXgtcmUtd2tzJykoJ21hdGNoJywgMSwgZnVuY3Rpb24gKGRlZmluZWQsIE1BVENILCAkbWF0Y2gsIG1heWJlQ2FsbE5hdGl2ZSkge1xuICByZXR1cm4gW1xuICAgIC8vIGBTdHJpbmcucHJvdG90eXBlLm1hdGNoYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLm1hdGNoXG4gICAgZnVuY3Rpb24gbWF0Y2gocmVnZXhwKSB7XG4gICAgICB2YXIgTyA9IGRlZmluZWQodGhpcyk7XG4gICAgICB2YXIgZm4gPSByZWdleHAgPT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogcmVnZXhwW01BVENIXTtcbiAgICAgIHJldHVybiBmbiAhPT0gdW5kZWZpbmVkID8gZm4uY2FsbChyZWdleHAsIE8pIDogbmV3IFJlZ0V4cChyZWdleHApW01BVENIXShTdHJpbmcoTykpO1xuICAgIH0sXG4gICAgLy8gYFJlZ0V4cC5wcm90b3R5cGVbQEBtYXRjaF1gIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cC5wcm90b3R5cGUtQEBtYXRjaFxuICAgIGZ1bmN0aW9uIChyZWdleHApIHtcbiAgICAgIHZhciByZXMgPSBtYXliZUNhbGxOYXRpdmUoJG1hdGNoLCByZWdleHAsIHRoaXMpO1xuICAgICAgaWYgKHJlcy5kb25lKSByZXR1cm4gcmVzLnZhbHVlO1xuICAgICAgdmFyIHJ4ID0gYW5PYmplY3QocmVnZXhwKTtcbiAgICAgIHZhciBTID0gU3RyaW5nKHRoaXMpO1xuICAgICAgaWYgKCFyeC5nbG9iYWwpIHJldHVybiByZWdFeHBFeGVjKHJ4LCBTKTtcbiAgICAgIHZhciBmdWxsVW5pY29kZSA9IHJ4LnVuaWNvZGU7XG4gICAgICByeC5sYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIEEgPSBbXTtcbiAgICAgIHZhciBuID0gMDtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICB3aGlsZSAoKHJlc3VsdCA9IHJlZ0V4cEV4ZWMocngsIFMpKSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgbWF0Y2hTdHIgPSBTdHJpbmcocmVzdWx0WzBdKTtcbiAgICAgICAgQVtuXSA9IG1hdGNoU3RyO1xuICAgICAgICBpZiAobWF0Y2hTdHIgPT09ICcnKSByeC5sYXN0SW5kZXggPSBhZHZhbmNlU3RyaW5nSW5kZXgoUywgdG9MZW5ndGgocngubGFzdEluZGV4KSwgZnVsbFVuaWNvZGUpO1xuICAgICAgICBuKys7XG4gICAgICB9XG4gICAgICByZXR1cm4gbiA9PT0gMCA/IG51bGwgOiBBO1xuICAgIH1cbiAgXTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIGFkdmFuY2VTdHJpbmdJbmRleCA9IHJlcXVpcmUoJy4vX2FkdmFuY2Utc3RyaW5nLWluZGV4Jyk7XG52YXIgcmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjLWFic3RyYWN0Jyk7XG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIFNVQlNUSVRVVElPTl9TWU1CT0xTID0gL1xcJChbJCZgJ118XFxkXFxkP3w8W14+XSo+KS9nO1xudmFyIFNVQlNUSVRVVElPTl9TWU1CT0xTX05PX05BTUVEID0gL1xcJChbJCZgJ118XFxkXFxkPykvZztcblxudmFyIG1heWJlVG9TdHJpbmcgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyBpdCA6IFN0cmluZyhpdCk7XG59O1xuXG4vLyBAQHJlcGxhY2UgbG9naWNcbnJlcXVpcmUoJy4vX2ZpeC1yZS13a3MnKSgncmVwbGFjZScsIDIsIGZ1bmN0aW9uIChkZWZpbmVkLCBSRVBMQUNFLCAkcmVwbGFjZSwgbWF5YmVDYWxsTmF0aXZlKSB7XG4gIHJldHVybiBbXG4gICAgLy8gYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlXG4gICAgZnVuY3Rpb24gcmVwbGFjZShzZWFyY2hWYWx1ZSwgcmVwbGFjZVZhbHVlKSB7XG4gICAgICB2YXIgTyA9IGRlZmluZWQodGhpcyk7XG4gICAgICB2YXIgZm4gPSBzZWFyY2hWYWx1ZSA9PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzZWFyY2hWYWx1ZVtSRVBMQUNFXTtcbiAgICAgIHJldHVybiBmbiAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gZm4uY2FsbChzZWFyY2hWYWx1ZSwgTywgcmVwbGFjZVZhbHVlKVxuICAgICAgICA6ICRyZXBsYWNlLmNhbGwoU3RyaW5nKE8pLCBzZWFyY2hWYWx1ZSwgcmVwbGFjZVZhbHVlKTtcbiAgICB9LFxuICAgIC8vIGBSZWdFeHAucHJvdG90eXBlW0BAcmVwbGFjZV1gIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cC5wcm90b3R5cGUtQEByZXBsYWNlXG4gICAgZnVuY3Rpb24gKHJlZ2V4cCwgcmVwbGFjZVZhbHVlKSB7XG4gICAgICB2YXIgcmVzID0gbWF5YmVDYWxsTmF0aXZlKCRyZXBsYWNlLCByZWdleHAsIHRoaXMsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICBpZiAocmVzLmRvbmUpIHJldHVybiByZXMudmFsdWU7XG5cbiAgICAgIHZhciByeCA9IGFuT2JqZWN0KHJlZ2V4cCk7XG4gICAgICB2YXIgUyA9IFN0cmluZyh0aGlzKTtcbiAgICAgIHZhciBmdW5jdGlvbmFsUmVwbGFjZSA9IHR5cGVvZiByZXBsYWNlVmFsdWUgPT09ICdmdW5jdGlvbic7XG4gICAgICBpZiAoIWZ1bmN0aW9uYWxSZXBsYWNlKSByZXBsYWNlVmFsdWUgPSBTdHJpbmcocmVwbGFjZVZhbHVlKTtcbiAgICAgIHZhciBnbG9iYWwgPSByeC5nbG9iYWw7XG4gICAgICBpZiAoZ2xvYmFsKSB7XG4gICAgICAgIHZhciBmdWxsVW5pY29kZSA9IHJ4LnVuaWNvZGU7XG4gICAgICAgIHJ4Lmxhc3RJbmRleCA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlZ0V4cEV4ZWMocngsIFMpO1xuICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKSBicmVhaztcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAgIGlmICghZ2xvYmFsKSBicmVhaztcbiAgICAgICAgdmFyIG1hdGNoU3RyID0gU3RyaW5nKHJlc3VsdFswXSk7XG4gICAgICAgIGlmIChtYXRjaFN0ciA9PT0gJycpIHJ4Lmxhc3RJbmRleCA9IGFkdmFuY2VTdHJpbmdJbmRleChTLCB0b0xlbmd0aChyeC5sYXN0SW5kZXgpLCBmdWxsVW5pY29kZSk7XG4gICAgICB9XG4gICAgICB2YXIgYWNjdW11bGF0ZWRSZXN1bHQgPSAnJztcbiAgICAgIHZhciBuZXh0U291cmNlUG9zaXRpb24gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgICAgIHZhciBtYXRjaGVkID0gU3RyaW5nKHJlc3VsdFswXSk7XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IG1heChtaW4odG9JbnRlZ2VyKHJlc3VsdC5pbmRleCksIFMubGVuZ3RoKSwgMCk7XG4gICAgICAgIHZhciBjYXB0dXJlcyA9IFtdO1xuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIGVxdWl2YWxlbnQgdG9cbiAgICAgICAgLy8gICBjYXB0dXJlcyA9IHJlc3VsdC5zbGljZSgxKS5tYXAobWF5YmVUb1N0cmluZylcbiAgICAgICAgLy8gYnV0IGZvciBzb21lIHJlYXNvbiBgbmF0aXZlU2xpY2UuY2FsbChyZXN1bHQsIDEsIHJlc3VsdC5sZW5ndGgpYCAoY2FsbGVkIGluXG4gICAgICAgIC8vIHRoZSBzbGljZSBwb2x5ZmlsbCB3aGVuIHNsaWNpbmcgbmF0aXZlIGFycmF5cykgXCJkb2Vzbid0IHdvcmtcIiBpbiBzYWZhcmkgOSBhbmRcbiAgICAgICAgLy8gY2F1c2VzIGEgY3Jhc2ggKGh0dHBzOi8vcGFzdGViaW4uY29tL04yMVF6ZVFBKSB3aGVuIHRyeWluZyB0byBkZWJ1ZyBpdC5cbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCByZXN1bHQubGVuZ3RoOyBqKyspIGNhcHR1cmVzLnB1c2gobWF5YmVUb1N0cmluZyhyZXN1bHRbal0pKTtcbiAgICAgICAgdmFyIG5hbWVkQ2FwdHVyZXMgPSByZXN1bHQuZ3JvdXBzO1xuICAgICAgICBpZiAoZnVuY3Rpb25hbFJlcGxhY2UpIHtcbiAgICAgICAgICB2YXIgcmVwbGFjZXJBcmdzID0gW21hdGNoZWRdLmNvbmNhdChjYXB0dXJlcywgcG9zaXRpb24sIFMpO1xuICAgICAgICAgIGlmIChuYW1lZENhcHR1cmVzICE9PSB1bmRlZmluZWQpIHJlcGxhY2VyQXJncy5wdXNoKG5hbWVkQ2FwdHVyZXMpO1xuICAgICAgICAgIHZhciByZXBsYWNlbWVudCA9IFN0cmluZyhyZXBsYWNlVmFsdWUuYXBwbHkodW5kZWZpbmVkLCByZXBsYWNlckFyZ3MpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXBsYWNlbWVudCA9IGdldFN1YnN0aXR1dGlvbihtYXRjaGVkLCBTLCBwb3NpdGlvbiwgY2FwdHVyZXMsIG5hbWVkQ2FwdHVyZXMsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvc2l0aW9uID49IG5leHRTb3VyY2VQb3NpdGlvbikge1xuICAgICAgICAgIGFjY3VtdWxhdGVkUmVzdWx0ICs9IFMuc2xpY2UobmV4dFNvdXJjZVBvc2l0aW9uLCBwb3NpdGlvbikgKyByZXBsYWNlbWVudDtcbiAgICAgICAgICBuZXh0U291cmNlUG9zaXRpb24gPSBwb3NpdGlvbiArIG1hdGNoZWQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjdW11bGF0ZWRSZXN1bHQgKyBTLnNsaWNlKG5leHRTb3VyY2VQb3NpdGlvbik7XG4gICAgfVxuICBdO1xuXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtZ2V0c3Vic3RpdHV0aW9uXG4gIGZ1bmN0aW9uIGdldFN1YnN0aXR1dGlvbihtYXRjaGVkLCBzdHIsIHBvc2l0aW9uLCBjYXB0dXJlcywgbmFtZWRDYXB0dXJlcywgcmVwbGFjZW1lbnQpIHtcbiAgICB2YXIgdGFpbFBvcyA9IHBvc2l0aW9uICsgbWF0Y2hlZC5sZW5ndGg7XG4gICAgdmFyIG0gPSBjYXB0dXJlcy5sZW5ndGg7XG4gICAgdmFyIHN5bWJvbHMgPSBTVUJTVElUVVRJT05fU1lNQk9MU19OT19OQU1FRDtcbiAgICBpZiAobmFtZWRDYXB0dXJlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBuYW1lZENhcHR1cmVzID0gdG9PYmplY3QobmFtZWRDYXB0dXJlcyk7XG4gICAgICBzeW1ib2xzID0gU1VCU1RJVFVUSU9OX1NZTUJPTFM7XG4gICAgfVxuICAgIHJldHVybiAkcmVwbGFjZS5jYWxsKHJlcGxhY2VtZW50LCBzeW1ib2xzLCBmdW5jdGlvbiAobWF0Y2gsIGNoKSB7XG4gICAgICB2YXIgY2FwdHVyZTtcbiAgICAgIHN3aXRjaCAoY2guY2hhckF0KDApKSB7XG4gICAgICAgIGNhc2UgJyQnOiByZXR1cm4gJyQnO1xuICAgICAgICBjYXNlICcmJzogcmV0dXJuIG1hdGNoZWQ7XG4gICAgICAgIGNhc2UgJ2AnOiByZXR1cm4gc3RyLnNsaWNlKDAsIHBvc2l0aW9uKTtcbiAgICAgICAgY2FzZSBcIidcIjogcmV0dXJuIHN0ci5zbGljZSh0YWlsUG9zKTtcbiAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgY2FwdHVyZSA9IG5hbWVkQ2FwdHVyZXNbY2guc2xpY2UoMSwgLTEpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDogLy8gXFxkXFxkP1xuICAgICAgICAgIHZhciBuID0gK2NoO1xuICAgICAgICAgIGlmIChuID09PSAwKSByZXR1cm4gY2g7XG4gICAgICAgICAgaWYgKG4gPiBtKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGZsb29yKG4gLyAxMCk7XG4gICAgICAgICAgICBpZiAoZiA9PT0gMCkgcmV0dXJuIGNoO1xuICAgICAgICAgICAgaWYgKGYgPD0gbSkgcmV0dXJuIGNhcHR1cmVzW2YgLSAxXSA9PT0gdW5kZWZpbmVkID8gY2guY2hhckF0KDEpIDogY2FwdHVyZXNbZiAtIDFdICsgY2guY2hhckF0KDEpO1xuICAgICAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXB0dXJlID0gY2FwdHVyZXNbbiAtIDFdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhcHR1cmUgPT09IHVuZGVmaW5lZCA/ICcnIDogY2FwdHVyZTtcbiAgICB9KTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc1JlZ0V4cCA9IHJlcXVpcmUoJy4vX2lzLXJlZ2V4cCcpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fc3BlY2llcy1jb25zdHJ1Y3RvcicpO1xudmFyIGFkdmFuY2VTdHJpbmdJbmRleCA9IHJlcXVpcmUoJy4vX2FkdmFuY2Utc3RyaW5nLWluZGV4Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciBjYWxsUmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjLWFic3RyYWN0Jyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjJyk7XG52YXIgJG1pbiA9IE1hdGgubWluO1xudmFyICRwdXNoID0gW10ucHVzaDtcbnZhciAkU1BMSVQgPSAnc3BsaXQnO1xudmFyIExFTkdUSCA9ICdsZW5ndGgnO1xudmFyIExBU1RfSU5ERVggPSAnbGFzdEluZGV4JztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVtcHR5XG52YXIgU1VQUE9SVFNfWSA9ICEhKGZ1bmN0aW9uICgpIHsgdHJ5IHsgcmV0dXJuIG5ldyBSZWdFeHAoJ3gnLCAneScpOyB9IGNhdGNoIChlKSB7fSB9KSgpO1xuXG4vLyBAQHNwbGl0IGxvZ2ljXG5yZXF1aXJlKCcuL19maXgtcmUtd2tzJykoJ3NwbGl0JywgMiwgZnVuY3Rpb24gKGRlZmluZWQsIFNQTElULCAkc3BsaXQsIG1heWJlQ2FsbE5hdGl2ZSkge1xuICB2YXIgaW50ZXJuYWxTcGxpdDtcbiAgaWYgKFxuICAgICdhYmJjJ1skU1BMSVRdKC8oYikqLylbMV0gPT0gJ2MnIHx8XG4gICAgJ3Rlc3QnWyRTUExJVF0oLyg/OikvLCAtMSlbTEVOR1RIXSAhPSA0IHx8XG4gICAgJ2FiJ1skU1BMSVRdKC8oPzphYikqLylbTEVOR1RIXSAhPSAyIHx8XG4gICAgJy4nWyRTUExJVF0oLyguPykoLj8pLylbTEVOR1RIXSAhPSA0IHx8XG4gICAgJy4nWyRTUExJVF0oLygpKCkvKVtMRU5HVEhdID4gMSB8fFxuICAgICcnWyRTUExJVF0oLy4/LylbTEVOR1RIXVxuICApIHtcbiAgICAvLyBiYXNlZCBvbiBlczUtc2hpbSBpbXBsZW1lbnRhdGlvbiwgbmVlZCB0byByZXdvcmsgaXRcbiAgICBpbnRlcm5hbFNwbGl0ID0gZnVuY3Rpb24gKHNlcGFyYXRvciwgbGltaXQpIHtcbiAgICAgIHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG4gICAgICBpZiAoc2VwYXJhdG9yID09PSB1bmRlZmluZWQgJiYgbGltaXQgPT09IDApIHJldHVybiBbXTtcbiAgICAgIC8vIElmIGBzZXBhcmF0b3JgIGlzIG5vdCBhIHJlZ2V4LCB1c2UgbmF0aXZlIHNwbGl0XG4gICAgICBpZiAoIWlzUmVnRXhwKHNlcGFyYXRvcikpIHJldHVybiAkc3BsaXQuY2FsbChzdHJpbmcsIHNlcGFyYXRvciwgbGltaXQpO1xuICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgdmFyIGZsYWdzID0gKHNlcGFyYXRvci5pZ25vcmVDYXNlID8gJ2knIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChzZXBhcmF0b3IubXVsdGlsaW5lID8gJ20nIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChzZXBhcmF0b3IudW5pY29kZSA/ICd1JyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAoc2VwYXJhdG9yLnN0aWNreSA/ICd5JyA6ICcnKTtcbiAgICAgIHZhciBsYXN0TGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBzcGxpdExpbWl0ID0gbGltaXQgPT09IHVuZGVmaW5lZCA/IDQyOTQ5NjcyOTUgOiBsaW1pdCA+Pj4gMDtcbiAgICAgIC8vIE1ha2UgYGdsb2JhbGAgYW5kIGF2b2lkIGBsYXN0SW5kZXhgIGlzc3VlcyBieSB3b3JraW5nIHdpdGggYSBjb3B5XG4gICAgICB2YXIgc2VwYXJhdG9yQ29weSA9IG5ldyBSZWdFeHAoc2VwYXJhdG9yLnNvdXJjZSwgZmxhZ3MgKyAnZycpO1xuICAgICAgdmFyIG1hdGNoLCBsYXN0SW5kZXgsIGxhc3RMZW5ndGg7XG4gICAgICB3aGlsZSAobWF0Y2ggPSByZWdleHBFeGVjLmNhbGwoc2VwYXJhdG9yQ29weSwgc3RyaW5nKSkge1xuICAgICAgICBsYXN0SW5kZXggPSBzZXBhcmF0b3JDb3B5W0xBU1RfSU5ERVhdO1xuICAgICAgICBpZiAobGFzdEluZGV4ID4gbGFzdExhc3RJbmRleCkge1xuICAgICAgICAgIG91dHB1dC5wdXNoKHN0cmluZy5zbGljZShsYXN0TGFzdEluZGV4LCBtYXRjaC5pbmRleCkpO1xuICAgICAgICAgIGlmIChtYXRjaFtMRU5HVEhdID4gMSAmJiBtYXRjaC5pbmRleCA8IHN0cmluZ1tMRU5HVEhdKSAkcHVzaC5hcHBseShvdXRwdXQsIG1hdGNoLnNsaWNlKDEpKTtcbiAgICAgICAgICBsYXN0TGVuZ3RoID0gbWF0Y2hbMF1bTEVOR1RIXTtcbiAgICAgICAgICBsYXN0TGFzdEluZGV4ID0gbGFzdEluZGV4O1xuICAgICAgICAgIGlmIChvdXRwdXRbTEVOR1RIXSA+PSBzcGxpdExpbWl0KSBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VwYXJhdG9yQ29weVtMQVNUX0lOREVYXSA9PT0gbWF0Y2guaW5kZXgpIHNlcGFyYXRvckNvcHlbTEFTVF9JTkRFWF0rKzsgLy8gQXZvaWQgYW4gaW5maW5pdGUgbG9vcFxuICAgICAgfVxuICAgICAgaWYgKGxhc3RMYXN0SW5kZXggPT09IHN0cmluZ1tMRU5HVEhdKSB7XG4gICAgICAgIGlmIChsYXN0TGVuZ3RoIHx8ICFzZXBhcmF0b3JDb3B5LnRlc3QoJycpKSBvdXRwdXQucHVzaCgnJyk7XG4gICAgICB9IGVsc2Ugb3V0cHV0LnB1c2goc3RyaW5nLnNsaWNlKGxhc3RMYXN0SW5kZXgpKTtcbiAgICAgIHJldHVybiBvdXRwdXRbTEVOR1RIXSA+IHNwbGl0TGltaXQgPyBvdXRwdXQuc2xpY2UoMCwgc3BsaXRMaW1pdCkgOiBvdXRwdXQ7XG4gICAgfTtcbiAgLy8gQ2hha3JhLCBWOFxuICB9IGVsc2UgaWYgKCcwJ1skU1BMSVRdKHVuZGVmaW5lZCwgMClbTEVOR1RIXSkge1xuICAgIGludGVybmFsU3BsaXQgPSBmdW5jdGlvbiAoc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgICAgcmV0dXJuIHNlcGFyYXRvciA9PT0gdW5kZWZpbmVkICYmIGxpbWl0ID09PSAwID8gW10gOiAkc3BsaXQuY2FsbCh0aGlzLCBzZXBhcmF0b3IsIGxpbWl0KTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGludGVybmFsU3BsaXQgPSAkc3BsaXQ7XG4gIH1cblxuICByZXR1cm4gW1xuICAgIC8vIGBTdHJpbmcucHJvdG90eXBlLnNwbGl0YCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnNwbGl0XG4gICAgZnVuY3Rpb24gc3BsaXQoc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgICAgdmFyIE8gPSBkZWZpbmVkKHRoaXMpO1xuICAgICAgdmFyIHNwbGl0dGVyID0gc2VwYXJhdG9yID09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNlcGFyYXRvcltTUExJVF07XG4gICAgICByZXR1cm4gc3BsaXR0ZXIgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IHNwbGl0dGVyLmNhbGwoc2VwYXJhdG9yLCBPLCBsaW1pdClcbiAgICAgICAgOiBpbnRlcm5hbFNwbGl0LmNhbGwoU3RyaW5nKE8pLCBzZXBhcmF0b3IsIGxpbWl0KTtcbiAgICB9LFxuICAgIC8vIGBSZWdFeHAucHJvdG90eXBlW0BAc3BsaXRdYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1yZWdleHAucHJvdG90eXBlLUBAc3BsaXRcbiAgICAvL1xuICAgIC8vIE5PVEU6IFRoaXMgY2Fubm90IGJlIHByb3Blcmx5IHBvbHlmaWxsZWQgaW4gZW5naW5lcyB0aGF0IGRvbid0IHN1cHBvcnRcbiAgICAvLyB0aGUgJ3knIGZsYWcuXG4gICAgZnVuY3Rpb24gKHJlZ2V4cCwgbGltaXQpIHtcbiAgICAgIHZhciByZXMgPSBtYXliZUNhbGxOYXRpdmUoaW50ZXJuYWxTcGxpdCwgcmVnZXhwLCB0aGlzLCBsaW1pdCwgaW50ZXJuYWxTcGxpdCAhPT0gJHNwbGl0KTtcbiAgICAgIGlmIChyZXMuZG9uZSkgcmV0dXJuIHJlcy52YWx1ZTtcblxuICAgICAgdmFyIHJ4ID0gYW5PYmplY3QocmVnZXhwKTtcbiAgICAgIHZhciBTID0gU3RyaW5nKHRoaXMpO1xuICAgICAgdmFyIEMgPSBzcGVjaWVzQ29uc3RydWN0b3IocngsIFJlZ0V4cCk7XG5cbiAgICAgIHZhciB1bmljb2RlTWF0Y2hpbmcgPSByeC51bmljb2RlO1xuICAgICAgdmFyIGZsYWdzID0gKHJ4Lmlnbm9yZUNhc2UgPyAnaScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocngubXVsdGlsaW5lID8gJ20nIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJ4LnVuaWNvZGUgPyAndScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAoU1VQUE9SVFNfWSA/ICd5JyA6ICdnJyk7XG5cbiAgICAgIC8vIF4oPyArIHJ4ICsgKSBpcyBuZWVkZWQsIGluIGNvbWJpbmF0aW9uIHdpdGggc29tZSBTIHNsaWNpbmcsIHRvXG4gICAgICAvLyBzaW11bGF0ZSB0aGUgJ3knIGZsYWcuXG4gICAgICB2YXIgc3BsaXR0ZXIgPSBuZXcgQyhTVVBQT1JUU19ZID8gcnggOiAnXig/OicgKyByeC5zb3VyY2UgKyAnKScsIGZsYWdzKTtcbiAgICAgIHZhciBsaW0gPSBsaW1pdCA9PT0gdW5kZWZpbmVkID8gMHhmZmZmZmZmZiA6IGxpbWl0ID4+PiAwO1xuICAgICAgaWYgKGxpbSA9PT0gMCkgcmV0dXJuIFtdO1xuICAgICAgaWYgKFMubGVuZ3RoID09PSAwKSByZXR1cm4gY2FsbFJlZ0V4cEV4ZWMoc3BsaXR0ZXIsIFMpID09PSBudWxsID8gW1NdIDogW107XG4gICAgICB2YXIgcCA9IDA7XG4gICAgICB2YXIgcSA9IDA7XG4gICAgICB2YXIgQSA9IFtdO1xuICAgICAgd2hpbGUgKHEgPCBTLmxlbmd0aCkge1xuICAgICAgICBzcGxpdHRlci5sYXN0SW5kZXggPSBTVVBQT1JUU19ZID8gcSA6IDA7XG4gICAgICAgIHZhciB6ID0gY2FsbFJlZ0V4cEV4ZWMoc3BsaXR0ZXIsIFNVUFBPUlRTX1kgPyBTIDogUy5zbGljZShxKSk7XG4gICAgICAgIHZhciBlO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgeiA9PT0gbnVsbCB8fFxuICAgICAgICAgIChlID0gJG1pbih0b0xlbmd0aChzcGxpdHRlci5sYXN0SW5kZXggKyAoU1VQUE9SVFNfWSA/IDAgOiBxKSksIFMubGVuZ3RoKSkgPT09IHBcbiAgICAgICAgKSB7XG4gICAgICAgICAgcSA9IGFkdmFuY2VTdHJpbmdJbmRleChTLCBxLCB1bmljb2RlTWF0Y2hpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEEucHVzaChTLnNsaWNlKHAsIHEpKTtcbiAgICAgICAgICBpZiAoQS5sZW5ndGggPT09IGxpbSkgcmV0dXJuIEE7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gei5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIEEucHVzaCh6W2ldKTtcbiAgICAgICAgICAgIGlmIChBLmxlbmd0aCA9PT0gbGltKSByZXR1cm4gQTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcSA9IHAgPSBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBBLnB1c2goUy5zbGljZShwKSk7XG4gICAgICByZXR1cm4gQTtcbiAgICB9XG4gIF07XG59KTtcbiIsIndpbmRvdy5Nb3JzZUNXV2F2ZSA9cmVxdWlyZSggJy4vbGliMi9tb3JzZS1wcm8tY3ctd2F2ZScpLmRlZmF1bHQ7XHJcbndpbmRvdy5Nb3JzZVBsYXllcldBQSA9IHJlcXVpcmUoICcuL2xpYjIvbW9yc2UtcHJvLXBsYXllci13YWEnKS5kZWZhdWx0O1xyXG53aW5kb3cuTW9yc2VMaXN0ZW5lciA9IHJlcXVpcmUgKCcuL2xpYjIvbW9yc2UtcHJvLWxpc3RlbmVyJykuZGVmYXVsdDtcclxud2luZG93Lk1vcnNlQWRhcHRpdmVMaXN0ZW5lciA9IHJlcXVpcmUgKCcuL2xpYjIvbW9yc2UtcHJvLWxpc3RlbmVyLWFkYXB0aXZlJykuZGVmYXVsdDtcclxud2luZG93Lk1vcnNlQWRhcHRpdmVEZWNvZGVyID0gcmVxdWlyZSAoJy4vbGliMi9tb3JzZS1wcm8tZGVjb2Rlci1hZGFwdGl2ZScpLmRlZmF1bHQ7XHJcbndpbmRvdy5Nb3JzZURlY29kZXIgPSByZXF1aXJlKCcuL2xpYjIvbW9yc2UtcHJvLWRlY29kZXInKS5kZWZhdWx0O1xyXG5cclxud2luZG93Lk1vcnNlQ1cgPSByZXF1aXJlKCcuL2xpYjIvbW9yc2UtcHJvLWN3JykuZGVmYXVsdDsiXX0=
