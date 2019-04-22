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
   * @param {number} wpm - the speed in words per minute using PARIS as the standard word
   * @param {number} fwpm - the Farnsworth speed in words per minute (defaults to wpm)
   */


  function MorseCW(useProsigns) {
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
  /** @type {number} */


  _createClass(MorseCW, [{
    key: 'getTimings',

    /**
     * Convert a morse string into an array of millisecond timings.
     * With the Farnsworth method, the morse characters are played at one
     * speed and the spaces between characters at a slower speed.
     * @return {number[]}
     */
    value: function getTimings() {
      var dit = WPM.ditLength(this._wpm);
      var r = WPM.ratio(this._wpm, this._fwpm); // slow down the spaces by this ratio

      return this.getTimingsGeneral(dit, 3 * dit, dit, 3 * dit * r, 7 * dit * r);
    }
    /**
     * Convert a morse string into an array of millisecond timings.
     * @param {number} dit - the length of a dit in milliseconds
     * @param {number} dah - the length of a dah in milliseconds (normally 3 * dit)
     * @param {number} ditSpace - the length of an intra-character space in milliseconds (1 * dit)
     * @param {number} charSpace - the length of an inter-character space in milliseconds (normally 3 * dit)
     * @param {number} wordSpace - the length of an inter-word space in milliseconds (normally 7 * dit)
     * @return {number[]}
     * @TODO make a class method?
     */

  }, {
    key: 'getTimingsGeneral',
    value: function getTimingsGeneral(dit, dah, ditSpace, charSpace, wordSpace) {
      //console.log("Morse: " + this.morse);
      if (this.hasError) {
        console.log("Error in message, cannot compute timings: " + this.morse);
        return []; // TODO: or throw exception?
      }

      var morse = this.morse.replace(/ \/ /g, '/'); // this means that a space is only used for inter-character

      var times = [];
      var c;

      for (var i = 0; i < morse.length; i++) {
        c = morse[i];

        if (c == "." || c == '-') {
          if (c == '.') {
            times.push(dit);
          } else {
            times.push(dah);
          }

          times.push(-ditSpace);
        } else if (c == " ") {
          times.pop();
          times.push(-charSpace);
        } else if (c == "/") {
          times.pop();
          times.push(-wordSpace);
        }
      }

      if (times[times.length - 1] == -ditSpace) {
        times.pop(); // take off the last ditSpace
      } //console.log("Timings: " + times);


      return times;
    }
    /**
     * Get the total duration of the message in ms
     8 @return {number}
     */

  }, {
    key: 'getDuration',
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
    /** @type {number} */

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
  }]);

  return MorseCW;
}(_morseProMessage2.default);

exports.default = MorseCW;