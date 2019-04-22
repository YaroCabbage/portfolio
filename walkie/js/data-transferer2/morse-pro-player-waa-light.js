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
 * Extends MorsePlayerWAA to provide callbacks when the sound goes on or off.
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
   * @param {function()} sequenceStartCallback - function to call each time the sequence starts.
   * @param {function()} sequenceEndingCallback - function to call when the sequence is nearing the end.
   * @param {function()} soundStoppedCallback - function to call when the sequence stops.
   * @param {function()} soundOnCallback - function to call wth the note number as the argument when a beep starts.
   * @param {function()} soundOffCallback - function to call with the note number as the argument when a beep stops.
   */


  function MorsePlayerWAALight(sequenceStartCallback, sequenceEndingCallback, soundStoppedCallback, soundOnCallback, soundOffCallback) {
    _classCallCheck(this, MorsePlayerWAALight);

    var _this = _possibleConstructorReturn(this, (MorsePlayerWAALight.__proto__ || Object.getPrototypeOf(MorsePlayerWAALight)).call(this, sequenceStartCallback, sequenceEndingCallback, soundStoppedCallback));

    if (soundOnCallback !== undefined) _this.soundOnCallback = soundOnCallback;
    if (soundOffCallback !== undefined) _this.soundOffCallback = soundOffCallback;
    _this._wasOn = false;
    _this._count = 0;
    return _this;
  }
  /**
   * Set up the audio graph, connecting the splitter node to a JSNode in order to analyse the waveform
   * @access: private
   * @override
   */


  _createClass(MorsePlayerWAALight, [{
    key: '_initialiseAudioNodes',
    value: function _initialiseAudioNodes() {
      _get(MorsePlayerWAALight.prototype.__proto__ || Object.getPrototypeOf(MorsePlayerWAALight.prototype), '_initialiseAudioNodes', this).call(this);

      this.jsNode = this.audioContext.createScriptProcessor(256, 1, 1);
      this.jsNode.connect(this.audioContext.destination); // otherwise Chrome ignores it

      this.jsNode.onaudioprocess = this._processSound.bind(this);
      this.splitterNode.connect(this.jsNode);
    }
    /**
     * @override
     */

  }, {
    key: 'load',
    value: function load(timings) {
      this._timings = timings;

      _get(MorsePlayerWAALight.prototype.__proto__ || Object.getPrototypeOf(MorsePlayerWAALight.prototype), 'load', this).call(this, timings);
    }
    /**
     * @access: private
     */

  }, {
    key: '_processSound',
    value: function _processSound(event) {
      var input = event.inputBuffer.getChannelData(0);
      var sum = 0;

      for (var i = 0; i < input.length; i++) {
        sum += Math.abs(input[i]) > 0;
      }

      var on = sum > 128; // is more than half the buffer non-zero?

      if (on && !this._wasOn) {
        this._on();
      } else if (!on && this._wasOn) {
        this._off();
      }

      this._wasOn = on;
    }
    /**
     * @access: private
     * @override
     */

  }, {
    key: '_on',
    value: function _on() {
      this.soundOnCallback(this._timings[this._count]);
      this._count = (this._count + 1) % this._timings.length;
    }
    /**
     * @access: private
     * @override
     */

  }, {
    key: '_off',
    value: function _off() {
      this.soundOffCallback(this._timings[this._count]);
      this._count = (this._count + 1) % this._timings.length;
    }
    /**
     * @returns {number} representing this audio player type: 5
     * @override
     */

  }, {
    key: 'soundOnCallback',
    // empty callbacks in case user does not define any
    value: function soundOnCallback(noteNumber) {}
  }, {
    key: 'soundOffCallback',
    value: function soundOffCallback(noteNumber) {}
  }, {
    key: 'audioType',
    get: function get() {
      return 5; // 5: Web Audio API using oscillators and light control
      // 4: Web Audio API using oscillators
      // 3: Audio element using media stream worker (using PCM audio data)
      // 2: Flash (using PCM audio data)
      // 1: Web Audio API with webkit and native support (using PCM audio data)
      // 0: Audio element using Mozilla Audio Data API (https://wiki.mozilla.org/Audio_Data_API) (using PCM audio data)
      // -1: no audio support
    }
  }]);

  return MorsePlayerWAALight;
}(_morseProPlayerWaa2.default);

exports.default = MorsePlayerWAALight;