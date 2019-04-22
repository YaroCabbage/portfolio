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
/*
This code is © Copyright Stephen C. Phillips, 2017.
Email: steve@scphillips.com

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
   * @return {number[]} an array of floats in range is [-1, 1] representing the wave-form, suitable for XAudioJS.
   */


  _createClass(MorseCWWave, [{
    key: "getSample",
    value: function getSample() {
      var sample = [];
      var timings = this.getTimings();

      if (timings.length === 0) {
        return [];
      }

      var counterIncrementAmount = Math.PI * 2 * this.frequency / this.sampleRate;
      var on = timings[0] > 0 ? 1 : 0;

      for (var t = 0; t < timings.length; t += 1) {
        var duration = this.sampleRate * Math.abs(timings[t]) / 1000;

        for (var i = 0; i < duration; i += 1) {
          sample.push(on * Math.sin(i * counterIncrementAmount));
        }

        on = 1 - on;
      }

      console.log("Sample length: " + sample.length);
      return sample;
    }
    /**
     * @return {number[]} an array of integers in range [0, 256] representing the wave-form. 8-bit unsigned PCM format.
     */

  }, {
    key: "getPCMSample",
    value: function getPCMSample() {
      var pcmSample = [];
      var sample = this.getSample();

      for (var i = 0; i < sample.length; i += 1) {
        pcmSample.push(128 + Math.round(127 * sample[i]));
      }

      return pcmSample;
    }
  }]);

  return MorseCWWave;
}(_morseProCw2.default);

exports.default = MorseCWWave;