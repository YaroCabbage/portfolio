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