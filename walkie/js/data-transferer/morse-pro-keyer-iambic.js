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

var _morseProKeyer = require('./morse-pro-keyer');

var _morseProKeyer2 = _interopRequireDefault(_morseProKeyer);

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

/*
    The Morse iambic keyer tests for input on a timer, plays the appropriate tone and passes the data to a decoder.
    If both keys are detected at once then this class alternates between dit and dah.
    Set 'ditGoesFirst' to define whether to play dit or dah first.
    Arguments: see MorseKeyer
*/


var MorseIambicKeyer = function (_MorseKeyer) {
  _inherits(MorseIambicKeyer, _MorseKeyer);

  function MorseIambicKeyer(keyCallback, wpm, frequency, messageCallback) {
    _classCallCheck(this, MorseIambicKeyer);

    var _this = _possibleConstructorReturn(this, (MorseIambicKeyer.__proto__ || Object.getPrototypeOf(MorseIambicKeyer)).call(this, keyCallback, wpm, frequency, messageCallback));

    _this.ditGoesFirst = true; // if the initial signal is 3 then alternate but play a dit first

    return _this;
  }
  /**
   * @override
   * @access private
   */


  _createClass(MorseIambicKeyer, [{
    key: 'check',
    value: function check() {
      var input = _get(MorseIambicKeyer.prototype.__proto__ || Object.getPrototypeOf(MorseIambicKeyer.prototype), 'check', this).call(this);

      if (input === 0) {
        this.lastWasDit = undefined;
      }
    }
    /**
     * @access private
     */

  }, {
    key: 'ditOrDah',
    value: function ditOrDah(input) {
      var dit;

      if (input === 1) {
        dit = true;
      } else if (input === 2) {
        dit = false;
      } else if (input === 3) {
        if (this.lastWasDit === true) {
          dit = false;
        } else if (this.lastWasDit === false) {
          dit = true;
        } else {
          dit = this.ditGoesFirst;
        }
      }

      this.lastWasDit = dit;
      return dit;
    }
    /**
     * Call this method when a key-press (or equivalent) is detected
     */

  }, {
    key: 'start',
    value: function start() {
      if (!this.playing) {
        this.lastWasDit = undefined;
      }

      _get(MorseIambicKeyer.prototype.__proto__ || Object.getPrototypeOf(MorseIambicKeyer.prototype), 'start', this).call(this);
    }
  }]);

  return MorseIambicKeyer;
}(_morseProKeyer2.default);

exports.default = MorseIambicKeyer;