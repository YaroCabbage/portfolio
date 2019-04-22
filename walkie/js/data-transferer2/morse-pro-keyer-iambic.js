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

var _morseProKeyer = require('./morse-pro-keyer');

var _morseProKeyer2 = _interopRequireDefault(_morseProKeyer);

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

/*
    The Morse iambic keyer tests for input on a timer, plays the appropriate tone and passes the data to a decoder.
    If both keys are detected at once then this class alternates between dit and dah.
    If iambic B mode is selected then if both keys were pressed and are then release, an additional dit or dah is sent.
    Set 'ditGoesFirst' to define whether to play dit or dah first.
    Arguments: see MorseKeyer
*/


var MorseIambicKeyer = function (_MorseKeyer) {
  _inherits(MorseIambicKeyer, _MorseKeyer);
  /**
   * @param {function(): number} keyCallback - A function which should return 0, 1, 2, or 3 from the vitual "paddle" depending if nothing, a dit, a dah or both is detected. This implementation will play dits if both keys are detected.
   * @param {number} [wpm=20] - Speed of the keyer (words per minute).
   * @param {number} [fwpm=20] - Farnsworth speed of the keyer.
   * @param {number} [frequency=550] - The frequency in Hz for the sidetone.
   * @param {Boolean} iambicA - if true then use iambic A mode, otherwise use iambic B mode (which sends an additional dit or dah when squeeze is released).
   * @param {function()} messageCallback - A function called with {message: string, timings: number[], morse: string} for each decoded part (see MorseDecoder). Its use here will result in a single character being returned each time.
   */


  function MorseIambicKeyer(keyCallback, wpm, fwpm, frequency) {
    var iambicA = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var messageCallback = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    _classCallCheck(this, MorseIambicKeyer);

    var _this = _possibleConstructorReturn(this, (MorseIambicKeyer.__proto__ || Object.getPrototypeOf(MorseIambicKeyer)).call(this, keyCallback, wpm, fwpm, frequency, messageCallback));

    _this.ditGoesFirst = true; // if the initial signal is 3 then alternate but play a dit first

    _this.iambicA = iambicA;
    return _this;
  }
  /**
   * @override
   * @access private
   */


  _createClass(MorseIambicKeyer, [{
    key: '_ditOrDah',
    value: function _ditOrDah(input) {
      var ditOrDah = undefined;

      switch (input) {
        case 0:
          if (!this.iambicA) {
            // iambic B mode
            if (this._lastInput === 3) {
              // gone from both to nothing
              // once paddles are released, send one more dit or dah
              ditOrDah = !this._lastDitOrDah;
            }
          }

          break;

        case 1:
          ditOrDah = true;
          break;

        case 2:
          ditOrDah = false;
          break;

        case 3:
          if (this._lastDitOrDah === undefined) {
            ditOrDah = this.ditGoesFirst;
          } else {
            ditOrDah = !this._lastDitOrDah;
          }

      }

      this._lastDitOrDah = ditOrDah;
      this._lastInput = input;
      return ditOrDah;
    }
  }]);

  return MorseIambicKeyer;
}(_morseProKeyer2.default);

exports.default = MorseIambicKeyer;