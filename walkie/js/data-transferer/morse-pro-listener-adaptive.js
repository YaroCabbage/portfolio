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
 * Extension of the MorseListener class which automatically adapts to the dominant frequency.
 */


var MorseAdaptiveListener = function (_MorseListener) {
  _inherits(MorseAdaptiveListener, _MorseListener);
  /**
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