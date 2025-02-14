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

var _morseProPlayerWaa = require('./morse-pro-player-waa');

var _morseProPlayerWaa2 = _interopRequireDefault(_morseProPlayerWaa);

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
 * Web browser sound player using Web Audio API.
 * Extends MorsePlayerWAA to provide callbacks when the sound goes on or off and when the sound ends.
 * Can be used to turn a light on or off in time with the Morse sound.
 * The callbacks have an error of +/- 2.6ms
 *
 * @example
 * import MorseCWWave from 'morse-pro-cw-wave';
 * import MorsePlayerWAALight from 'morse-pro-player-waa-light';
 * var morseCWWave = new MorseCWWave();
 * morseCWWave.translate("abc");
 * var morsePlayerWAALight = new MorsePlayerWAALight();
 * morsePlayerWAALight.soundOnCallback = lightOn;
 * morsePlayerWAALight.soundOffCallback = lightOff;
 * morsePlayerWAALight.soundStoppedCallback = soundStopped;
 * morsePlayerWAALight.volume = 0;
 * morsePlayerWAALight.loadCWWave(morseCWWave);
 * morsePlayerWAA.playFromStart();
 */


var MorsePlayerWAALight = function (_MorsePlayerWAA) {
  _inherits(MorsePlayerWAALight, _MorsePlayerWAA);
  /**
   * @param {function()} soundOnCallback - function to call when a beep starts.
   * @param {function()} soundOffCallback - function to call when a beep stops.
   * @param {function()} soundStoppedCallback - function to call when the sequence stops.
   */


  function MorsePlayerWAALight(soundOnCallback, soundOffCallback, soundStoppedCallback) {
    _classCallCheck(this, MorsePlayerWAALight);

    var _this = _possibleConstructorReturn(this, (MorsePlayerWAALight.__proto__ || Object.getPrototypeOf(MorsePlayerWAALight)).call(this));

    if (soundOnCallback !== undefined) _this.soundOnCallback = soundOnCallback;
    if (soundOffCallback !== undefined) _this.soundOffCallback = soundOffCallback;
    if (soundStoppedCallback !== undefined) _this.soundStoppedCallback = soundStoppedCallback;
    _this.wasOn = false;
    _this.offCount = 0;
    return _this;
  }
  /**
   * @access: private
   * @override
   */


  _createClass(MorsePlayerWAALight, [{
    key: 'initialiseAudioNodes',
    value: function initialiseAudioNodes() {
      _get(MorsePlayerWAALight.prototype.__proto__ || Object.getPrototypeOf(MorsePlayerWAALight.prototype), 'initialiseAudioNodes', this).call(this);

      this.jsNode = this.audioContext.createScriptProcessor(256, 1, 1);
      this.jsNode.connect(this.audioContext.destination); // otherwise Chrome ignores it

      this.jsNode.onaudioprocess = this.processSound.bind(this);
      this.splitterNode.connect(this.jsNode);
    }
    /**
     * @override
     */

  }, {
    key: 'playFromStart',
    value: function playFromStart() {
      this.offCount = 0;

      _get(MorsePlayerWAALight.prototype.__proto__ || Object.getPrototypeOf(MorsePlayerWAALight.prototype), 'playFromStart', this).call(this);
    }
    /**
     * @access: private
     */

  }, {
    key: 'processSound',
    value: function processSound(event) {
      var input = event.inputBuffer.getChannelData(0);
      var sum = 0;

      for (var i = 0; i < input.length; i++) {
        sum += Math.abs(input[i]) > 0;
      }

      var on = sum > 128; // is more than half the buffer non-zero?

      if (on && !this.wasOn) {
        this.soundOnCallback();
      } else if (!on && this.wasOn) {
        this.off();
      }

      this.wasOn = on;
    }
    /**
     * @access: private
     * @override
     */

  }, {
    key: 'off',
    value: function off() {
      this.offCount++;
      this.soundOffCallback();

      if (this.offCount * 2 === this.timings.length + 1) {
        this.soundStoppedCallback();
      }
    } // empty callbacks in case user does not define any

  }, {
    key: 'soundOnCallback',
    value: function soundOnCallback() {}
  }, {
    key: 'soundOffCallback',
    value: function soundOffCallback() {}
  }, {
    key: 'soundStoppedCallback',
    value: function soundStoppedCallback() {}
  }]);

  return MorsePlayerWAALight;
}(_morseProPlayerWaa2.default);

exports.default = MorsePlayerWAALight;