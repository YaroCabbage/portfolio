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