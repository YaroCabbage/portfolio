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
    },{"./morse-pro-message":5,"./morse-pro-wpm":7,"core-js/modules/es6.regexp.replace":46}],3:[function(require,module,exports){
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
        This code is © Copyright Stephen C. Phillips, 2017.
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
             * @param {number} [messageCallback] - Callback executed when decoder buffer is flushed (every character). Returns dictionary with keys 'timings', 'morse' and 'message'
             * @param {number} [speedCallback] - Callback executed if the wpm or fwpm speed changes. The speed in this class doesn't change by itself, but e.g. the fwpm can change if wpm is changed. Returned dictionary has keys 'fwpm' and 'wpm'.
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
                    //console.log("Received: " + duration);
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

                    this.unusedTimes.push(duration);

                    if (-duration >= this._ditDahThreshold) {
                        // if we have just received a character space or longer
                        this.flush();
                    }
                }
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
                value: function messageCallback() {}
            }, {
                key: 'speedCallback',
                value: function speedCallback() {}
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
    },{"./morse-pro":8,"./morse-pro-wpm":7}],4:[function(require,module,exports){
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
             Returns a dictionary:
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
             Returns a dictionary:
             {
                                           min: lowest frequency in Hz
                                           max: highest frequency in Hz
                                       }
             The frequencies may well be different to that which is set as they are quantised.
             * @param {function()} volumeFilterCallback - Called when the volume filter parameters change.
             Returns a dictionary:
             {
                                           min: low volume (in dB)
                                           max: high volume (in dB)
                                       }
             If the set volumes are not numeric or out of range then the callback will return in range numbers.
             * @param {function()} volumeThresholdCallback - Called when the volume filter threshold changes. Returns a single number.
             * @param {function()} micSuccessCallback - Called when the microphone has successfully been connected.
             * @param {function()} micErrorCallback - Called (with the error as an argument) if there is an error connecting to the microphone.
             * @param {function()} fileLoadCallback - Called when a file has successfully been loaded (and decoded). Returns the audioBuffer object.
             * @param {function()} fileErrorCallback - Called (with the error as an argument) if there is an error in decoding a file.
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
                value: function spectrogramCallback() {}
            }, {
                key: "frequencyFilterCallback",
                value: function frequencyFilterCallback() {}
            }, {
                key: "volumeFilterCallback",
                value: function volumeFilterCallback() {}
            }, {
                key: "volumeThresholdCallback",
                value: function volumeThresholdCallback() {}
            }, {
                key: "micSuccessCallback",
                value: function micSuccessCallback() {}
            }, {
                key: "micErrorCallback",
                value: function micErrorCallback() {}
            }, {
                key: "fileLoadCallback",
                value: function fileLoadCallback() {}
            }, {
                key: "fileErrorCallback",
                value: function fileErrorCallback() {}
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
            }, {
                key: "frequencyFilter",
                set: function set(f) {
                    // use to target a specific frequency
                    this.frequencyFilterMin = f;
                    this.frequencyFilterMax = f;
                }
            }, {
                key: "volumeThreshold",
                set: function set(v) {
                    // threshold used to determine if an anlysed region has sufficient sound to be "on"
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
    },{}],5:[function(require,module,exports){
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
        /*
        This code is © Copyright Stephen C. Phillips, 2017.
        Email: steve@scphillips.com

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
    },{"./morse-pro":8,"core-js/modules/es6.regexp.replace":46}],6:[function(require,module,exports){
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
            function MorsePlayerWAA() {
                _classCallCheck(this, MorsePlayerWAA);

                console.log("Trying Web Audio API (Oscillators)");
                this.audioContextClass = window.AudioContext || window.webkitAudioContext;

                if (this.audioContextClass === undefined) {
                    this.noAudio = true;
                    throw new Error("No AudioContext class defined");
                }

                this.isPlayingB = false;
                this.noAudio = false;
                this._volume = 1;
                this.timings = undefined;
                this.frequency = undefined;
            }
            /**
             * @access: private
             */


            _createClass(MorsePlayerWAA, [{
                key: "initialiseAudioNodes",
                value: function initialiseAudioNodes() {
                    this.audioContext = new this.audioContextClass();
                    this.splitterNode = this.audioContext.createGain(); // this is here to attach other nodes to in subclass

                    this.gainNode = this.audioContext.createGain(); // this is actually used for volume

                    this.splitterNode.connect(this.gainNode);
                    this.gainNode.connect(this.audioContext.destination);
                    this.gainNode.gain.value = this._volume;
                }
            }, {
                key: "stop",
                value: function stop() {
                    if (this.isPlayingB) {
                        this.isPlayingB = false;
                        this.audioContext.close();
                    }
                }
                /**
                 * Convenience method to help playing directly from a MorseCWWave instance.
                 * @param {Object} cwWave - a MorseCWWave instance
                 */

            }, {
                key: "loadCWWave",
                value: function loadCWWave(cwWave) {
                    this.load(cwWave.getTimings(), cwWave.frequency);
                }
            }, {
                key: "load",
                value: function load(timings, frequency) {
                    this.timings = timings;
                    this.frequency = frequency;
                }
            }, {
                key: "playFromStart",
                value: function playFromStart() {
                    if (this.noAudio) {
                        return;
                    }

                    this.stop();

                    if (this.timings.length === 0) {
                        return [];
                    }

                    this.initialiseAudioNodes();
                    this.isPlayingB = true;
                    var cumT = this.audioContext.currentTime;

                    for (var t = 0; t < this.timings.length; t += 1) {
                        var duration = this.timings[t] / 1000;

                        if (duration > 0) {
                            var oscillator = this.audioContext.createOscillator();
                            oscillator.type = 'sine';
                            oscillator.frequency.value = this.frequency;
                            oscillator.connect(this.splitterNode);
                            oscillator.start(cumT);
                            oscillator.stop(cumT + duration);
                            cumT += duration;
                        } else {
                            cumT += -duration;
                        }
                    }
                }
            }, {
                key: "hasError",
                value: function hasError() {
                    return this.noAudio;
                }
            }, {
                key: "isPlaying",
                value: function isPlaying() {
                    return this.isPlayingB;
                }
            }, {
                key: "getAudioType",
                value: function getAudioType() {
                    return 4; // 4: Web Audio API using oscillators
                    // 3: Audio element using media stream worker (using PCM audio data)
                    // 2: Flash (using PCM audio data)
                    // 1: Web Audio API with webkit and native support (using PCM audio data)
                    // 0: Audio element using Mozilla Audio Data API (https://wiki.mozilla.org/Audio_Data_API) (using PCM audio data)
                    // -1: no audio support
                }
            }, {
                key: "volume",
                set: function set(v) {
                    this._volume = v;
                    this.gainNode.gain.value = v;
                },
                get: function get() {
                    return this._volume;
                }
            }]);

            return MorsePlayerWAA;
        }();

        exports.default = MorsePlayerWAA;
    },{}],7:[function(require,module,exports){
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.ditLength = ditLength;
        exports.wpm = wpm;
        exports.fditLength = fditLength;
        exports.ratio = ratio;
        exports.fwpm = fwpm;
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
         * Useful constants and functions for computing the speed of Morse code.
         */

        var DITS_PER_WORD = 50;
        /** dits in "PARIS " */

        var SPACES_IN_PARIS = 19;
        /** 5x 3-dit inter-character spaces + 1x 7-dit space */

        var MS_IN_MINUTE = 60000;
        /** number of milliseconds in 1 minute */

        /** Get the dit length in ms for a given WPM */

        function ditLength(wpm) {
            return MS_IN_MINUTE / DITS_PER_WORD / wpm;
        }
        /** Get the WPM for a given dit length in ms */


        function wpm(ditLen) {
            return MS_IN_MINUTE / DITS_PER_WORD / ditLen;
        }
        /** Get the Farnsworth dit length in ms for a given WPM and Farnsworth WPM */


        function fditLength(wpm, fwpm) {
            return ditLength(wpm) * ratio(wpm, fwpm);
        }
        /** Get the dit length ratio for a given WPM and Farnsworth WPM */


        function ratio(wpm, fwpm) {
            // "PARIS " is 31 units for the characters and 19 units for the inter-character spaces and inter-word space
            // One unit takes 1 * 60 / (50 * wpm)
            // The 31 units should take 31 * 60 / (50 * wpm)  seconds at wpm
            // PARIS should take 50 * 60 / (50 * fpm) to transmit at fpm, or 60 / fwpm  seconds at fwpm
            // Keeping the time for the characters constant,
            // The spaces need to take: (60 / fwpm) - [31 * 60 / (50 * wpm)] seconds in total
            // The spaces are 4 inter-character spaces of 3 units and 1 inter-word space of 7 units. Their ratio must be maintained.
            // A space unit is: [(60 / fwpm) - [31 * 60 / (50 * wpm)]] / 19 seconds
            // Comparing that to  60 / (50 * wpm)  gives a ratio of (50.wpm - 31.fwpm) / 19.fwpm
            return (DITS_PER_WORD * wpm - (DITS_PER_WORD - SPACES_IN_PARIS) * fwpm) / (SPACES_IN_PARIS * fwpm);
        }
        /** Get the Farnsworth WPM for a given WPM and ratio */


        function fwpm(wpm, r) {
            return DITS_PER_WORD * wpm / (SPACES_IN_PARIS * r + (DITS_PER_WORD - SPACES_IN_PARIS));
        }
    },{}],8:[function(require,module,exports){
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
            '(': "-.--.-",
            ')': "-.--.-",
            '"': ".-..-.",
            '@': ".--.-.",
            '=': "-...-",
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
         * @param {Boolean} useProsigns - true if prosigns are to be used (default is true)
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
         * Translate text to morse in 'Di-di-dah dah.' form.
         * @param {string} text - alphanumeric message
         * @param {Boolean} useProsigns - true if prosigns are to be used (default is true)
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

        var tidyMorse = function tidyMorse(morse) {
            morse = morse.trim();
            morse = morse.replace(/\|/g, "/"); // unify the word separator

            morse = morse.replace(/\//g, " / "); // make sure word separators are spaced out

            morse = morse.replace(/\s+/g, " "); // squash multiple spaces into single spaces

            morse = morse.replace(/(\/ )+\//g, "/"); // squash multiple word separators
            //morse = morse.replace(/^ \/ /, "");  // remove initial word separators
            //morse = morse.replace(/ \/ $/, "");  // remove trailing word separators

            morse = morse.replace(/^\s+/, "");
            morse = morse.replace(/\s+$/, "");
            morse = morse.replace(/_/g, "-"); // unify the dash character

            return morse;
        };
        /**
         * Translate morse to text.
         * If something in the morse is untranslatable then it is surrounded by hash-signs ('#') and a hash is placed in the text.
         * @param {string} morse - morse message using [.-_/|] characters
         * @param {Boolean} useProsigns - true if prosigns are to be used (default is true)
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
         * @return {boolean} - true if the string only contains [.-_|/]
         */


        function looksLikeMorse(input) {
            input = tidyMorse(input);

            if (input.match(/^[ /.-]*$/)) {
                return true;
            } else {
                return false;
            }
        }
    },{"core-js/modules/es6.regexp.match":45,"core-js/modules/es6.regexp.replace":46,"core-js/modules/es6.regexp.split":47}],9:[function(require,module,exports){
        module.exports = function (it) {
            if (typeof it != 'function') throw TypeError(it + ' is not a function!');
            return it;
        };

    },{}],10:[function(require,module,exports){
        'use strict';
        var at = require('./_string-at')(true);

        // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
        module.exports = function (S, index, unicode) {
            return index + (unicode ? at(S, index).length : 1);
        };

    },{"./_string-at":37}],11:[function(require,module,exports){
        var isObject = require('./_is-object');
        module.exports = function (it) {
            if (!isObject(it)) throw TypeError(it + ' is not an object!');
            return it;
        };

    },{"./_is-object":27}],12:[function(require,module,exports){
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

    },{"./_cof":13,"./_wks":43}],13:[function(require,module,exports){
        var toString = {}.toString;

        module.exports = function (it) {
            return toString.call(it).slice(8, -1);
        };

    },{}],14:[function(require,module,exports){
        var core = module.exports = { version: '2.6.1' };
        if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

    },{}],15:[function(require,module,exports){
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

    },{"./_a-function":9}],16:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
        module.exports = function (it) {
            if (it == undefined) throw TypeError("Can't call method on  " + it);
            return it;
        };

    },{}],17:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
        module.exports = !require('./_fails')(function () {
            return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
        });

    },{"./_fails":20}],18:[function(require,module,exports){
        var isObject = require('./_is-object');
        var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
        var is = isObject(document) && isObject(document.createElement);
        module.exports = function (it) {
            return is ? document.createElement(it) : {};
        };

    },{"./_global":23,"./_is-object":27}],19:[function(require,module,exports){
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

    },{"./_core":14,"./_ctx":15,"./_global":23,"./_hide":25,"./_redefine":32}],20:[function(require,module,exports){
        module.exports = function (exec) {
            try {
                return !!exec();
            } catch (e) {
                return true;
            }
        };

    },{}],21:[function(require,module,exports){
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

    },{"./_defined":16,"./_fails":20,"./_hide":25,"./_redefine":32,"./_regexp-exec":34,"./_wks":43,"./es6.regexp.exec":44}],22:[function(require,module,exports){
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

    },{"./_an-object":11}],23:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
        var global = module.exports = typeof window != 'undefined' && window.Math == Math
            ? window : typeof self != 'undefined' && self.Math == Math ? self
                // eslint-disable-next-line no-new-func
                : Function('return this')();
        if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

    },{}],24:[function(require,module,exports){
        var hasOwnProperty = {}.hasOwnProperty;
        module.exports = function (it, key) {
            return hasOwnProperty.call(it, key);
        };

    },{}],25:[function(require,module,exports){
        var dP = require('./_object-dp');
        var createDesc = require('./_property-desc');
        module.exports = require('./_descriptors') ? function (object, key, value) {
            return dP.f(object, key, createDesc(1, value));
        } : function (object, key, value) {
            object[key] = value;
            return object;
        };

    },{"./_descriptors":17,"./_object-dp":30,"./_property-desc":31}],26:[function(require,module,exports){
        module.exports = !require('./_descriptors') && !require('./_fails')(function () {
            return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
        });

    },{"./_descriptors":17,"./_dom-create":18,"./_fails":20}],27:[function(require,module,exports){
        module.exports = function (it) {
            return typeof it === 'object' ? it !== null : typeof it === 'function';
        };

    },{}],28:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
        var isObject = require('./_is-object');
        var cof = require('./_cof');
        var MATCH = require('./_wks')('match');
        module.exports = function (it) {
            var isRegExp;
            return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
        };

    },{"./_cof":13,"./_is-object":27,"./_wks":43}],29:[function(require,module,exports){
        module.exports = false;

    },{}],30:[function(require,module,exports){
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

    },{"./_an-object":11,"./_descriptors":17,"./_ie8-dom-define":26,"./_to-primitive":41}],31:[function(require,module,exports){
        module.exports = function (bitmap, value) {
            return {
                enumerable: !(bitmap & 1),
                configurable: !(bitmap & 2),
                writable: !(bitmap & 4),
                value: value
            };
        };

    },{}],32:[function(require,module,exports){
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

    },{"./_core":14,"./_global":23,"./_has":24,"./_hide":25,"./_uid":42}],33:[function(require,module,exports){
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

    },{"./_classof":12}],34:[function(require,module,exports){
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

    },{"./_flags":22}],35:[function(require,module,exports){
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

    },{"./_core":14,"./_global":23,"./_library":29}],36:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
        var anObject = require('./_an-object');
        var aFunction = require('./_a-function');
        var SPECIES = require('./_wks')('species');
        module.exports = function (O, D) {
            var C = anObject(O).constructor;
            var S;
            return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
        };

    },{"./_a-function":9,"./_an-object":11,"./_wks":43}],37:[function(require,module,exports){
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

    },{"./_defined":16,"./_to-integer":38}],38:[function(require,module,exports){
// 7.1.4 ToInteger
        var ceil = Math.ceil;
        var floor = Math.floor;
        module.exports = function (it) {
            return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
        };

    },{}],39:[function(require,module,exports){
// 7.1.15 ToLength
        var toInteger = require('./_to-integer');
        var min = Math.min;
        module.exports = function (it) {
            return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
        };

    },{"./_to-integer":38}],40:[function(require,module,exports){
// 7.1.13 ToObject(argument)
        var defined = require('./_defined');
        module.exports = function (it) {
            return Object(defined(it));
        };

    },{"./_defined":16}],41:[function(require,module,exports){
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

    },{"./_is-object":27}],42:[function(require,module,exports){
        var id = 0;
        var px = Math.random();
        module.exports = function (key) {
            return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
        };

    },{}],43:[function(require,module,exports){
        var store = require('./_shared')('wks');
        var uid = require('./_uid');
        var Symbol = require('./_global').Symbol;
        var USE_SYMBOL = typeof Symbol == 'function';

        var $exports = module.exports = function (name) {
            return store[name] || (store[name] =
                USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
        };

        $exports.store = store;

    },{"./_global":23,"./_shared":35,"./_uid":42}],44:[function(require,module,exports){
        'use strict';
        var regexpExec = require('./_regexp-exec');
        require('./_export')({
            target: 'RegExp',
            proto: true,
            forced: regexpExec !== /./.exec
        }, {
            exec: regexpExec
        });

    },{"./_export":19,"./_regexp-exec":34}],45:[function(require,module,exports){
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

    },{"./_advance-string-index":10,"./_an-object":11,"./_fix-re-wks":21,"./_regexp-exec-abstract":33,"./_to-length":39}],46:[function(require,module,exports){
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

    },{"./_advance-string-index":10,"./_an-object":11,"./_fix-re-wks":21,"./_regexp-exec-abstract":33,"./_to-integer":38,"./_to-length":39,"./_to-object":40}],47:[function(require,module,exports){
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

    },{"./_advance-string-index":10,"./_an-object":11,"./_fix-re-wks":21,"./_is-regexp":28,"./_regexp-exec":34,"./_regexp-exec-abstract":33,"./_species-constructor":36,"./_to-length":39}],48:[function(require,module,exports){
        window.MorseCWWave =require( './morse-pro-cw-wave').default;
        window.MorsePlayerWAA = require( './morse-pro-player-waa').default;
        window.MorseListener = require ('./morse-pro-listener').default;
        window.MorseDecoder = require('./morse-pro-decoder').default;

        window.MorseCW = require('./morse-pro-cw').default;
    },{"./morse-pro-cw":2,"./morse-pro-cw-wave":1,"./morse-pro-decoder":3,"./morse-pro-listener":4,"./morse-pro-player-waa":6}]},{},[48])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL0FldnVtL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9tb3JzZS1wcm8tY3ctd2F2ZS5qcyIsImxpYi9tb3JzZS1wcm8tY3cuanMiLCJsaWIvbW9yc2UtcHJvLWRlY29kZXIuanMiLCJsaWIvbW9yc2UtcHJvLWxpc3RlbmVyLmpzIiwibGliL21vcnNlLXByby1tZXNzYWdlLmpzIiwibGliL21vcnNlLXByby1wbGF5ZXItd2FhLmpzIiwibGliL21vcnNlLXByby13cG0uanMiLCJsaWIvbW9yc2UtcHJvLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FkdmFuY2Utc3RyaW5nLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19maXgtcmUtd2tzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmxhZ3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1yZWdleHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVnZXhwLWV4ZWMtYWJzdHJhY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWdleHAtZXhlYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NwZWNpZXMtY29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLmV4ZWMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAubWF0Y2guanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAucmVwbGFjZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5zcGxpdC5qcyIsInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2phQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxudmFyIF9tb3JzZVByb0N3ID0gcmVxdWlyZShcIi4vbW9yc2UtcHJvLWN3XCIpO1xuXG52YXIgX21vcnNlUHJvQ3cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9yc2VQcm9Ddyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgZGVmYXVsdDogb2JqXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn1cbi8qXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxNy5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogQ2xhc3MgdG8gY3JlYXRlIHNpbmUtd2F2ZSBzYW1wbGVzIG9mIHN0YW5kYXJkIENXIE1vcnNlLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBpbXBvcnQgTW9yc2VDV1dhdmUgZnJvbSAnbW9yc2UtcHJvLWN3LXdhdmUnO1xyXG4gKiB2YXIgbW9yc2VDV1dhdmUgPSBuZXcgTW9yc2VDV1dhdmUoKTtcclxuICogbW9yc2VDV1dhdmUudHJhbnNsYXRlKFwiYWJjXCIpO1xyXG4gKiB2YXIgc2FtcGxlID0gbW9yc2VDV1dhdmUuZ2V0U2FtcGxlKCk7XHJcbiAqL1xuXG5cbnZhciBNb3JzZUNXV2F2ZSA9IGZ1bmN0aW9uIChfTW9yc2VDVykge1xuICBfaW5oZXJpdHMoTW9yc2VDV1dhdmUsIF9Nb3JzZUNXKTtcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtmcmVxdWVuY3k9NTUwXSAtIGZyZXF1ZW5jeSBvZiB3YXZlIGluIEh6XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzYW1wbGVSYXRlPTgwMDBdIC0gc2FtcGxlIHJhdGUgZm9yIHRoZSB3YXZlZm9ybSBpbiBIelxyXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gTW9yc2VDV1dhdmUodXNlUHJvc2lnbnMsIHdwbSwgZndwbSkge1xuICAgIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDU1MDtcbiAgICB2YXIgc2FtcGxlUmF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogODAwMDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb3JzZUNXV2F2ZSk7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChNb3JzZUNXV2F2ZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKE1vcnNlQ1dXYXZlKSkuY2FsbCh0aGlzLCB1c2VQcm9zaWducywgd3BtLCBmd3BtKSk7XG5cbiAgICBfdGhpcy5mcmVxdWVuY3kgPSBmcmVxdWVuY3k7IC8vIGZyZXF1ZW5jeSBvZiB3YXZlIGluIEh6XG5cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cblxuICAgIF90aGlzLnNhbXBsZVJhdGUgPSBzYW1wbGVSYXRlOyAvLyBzYW1wbGUgcmF0ZSBmb3IgdGhlIHdhdmVmb3JtIGluIEh6XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgLyoqXHJcbiAgICogQHJldHVybiB7bnVtYmVyW119IGFuIGFycmF5IG9mIGZsb2F0cyBpbiByYW5nZSBpcyBbLTEsIDFdIHJlcHJlc2VudGluZyB0aGUgd2F2ZS1mb3JtLCBzdWl0YWJsZSBmb3IgWEF1ZGlvSlMuXHJcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTW9yc2VDV1dhdmUsIFt7XG4gICAga2V5OiBcImdldFNhbXBsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRTYW1wbGUoKSB7XG4gICAgICB2YXIgc2FtcGxlID0gW107XG4gICAgICB2YXIgdGltaW5ncyA9IHRoaXMuZ2V0VGltaW5ncygpO1xuXG4gICAgICBpZiAodGltaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICB2YXIgY291bnRlckluY3JlbWVudEFtb3VudCA9IE1hdGguUEkgKiAyICogdGhpcy5mcmVxdWVuY3kgLyB0aGlzLnNhbXBsZVJhdGU7XG4gICAgICB2YXIgb24gPSB0aW1pbmdzWzBdID4gMCA/IDEgOiAwO1xuXG4gICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRpbWluZ3MubGVuZ3RoOyB0ICs9IDEpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gdGhpcy5zYW1wbGVSYXRlICogTWF0aC5hYnModGltaW5nc1t0XSkgLyAxMDAwO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHVyYXRpb247IGkgKz0gMSkge1xuICAgICAgICAgIHNhbXBsZS5wdXNoKG9uICogTWF0aC5zaW4oaSAqIGNvdW50ZXJJbmNyZW1lbnRBbW91bnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uID0gMSAtIG9uO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhcIlNhbXBsZSBsZW5ndGg6IFwiICsgc2FtcGxlLmxlbmd0aCk7XG4gICAgICByZXR1cm4gc2FtcGxlO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEByZXR1cm4ge251bWJlcltdfSBhbiBhcnJheSBvZiBpbnRlZ2VycyBpbiByYW5nZSBbMCwgMjU2XSByZXByZXNlbnRpbmcgdGhlIHdhdmUtZm9ybS4gOC1iaXQgdW5zaWduZWQgUENNIGZvcm1hdC5cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0UENNU2FtcGxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBDTVNhbXBsZSgpIHtcbiAgICAgIHZhciBwY21TYW1wbGUgPSBbXTtcbiAgICAgIHZhciBzYW1wbGUgPSB0aGlzLmdldFNhbXBsZSgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNhbXBsZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBwY21TYW1wbGUucHVzaCgxMjggKyBNYXRoLnJvdW5kKDEyNyAqIHNhbXBsZVtpXSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGNtU2FtcGxlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNb3JzZUNXV2F2ZTtcbn0oX21vcnNlUHJvQ3cyLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNb3JzZUNXV2F2ZTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5yZXBsYWNlXCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpO1xuXG52YXIgX21vcnNlUHJvV3BtID0gcmVxdWlyZSgnLi9tb3JzZS1wcm8td3BtJyk7XG5cbnZhciBXUE0gPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbW9yc2VQcm9XcG0pO1xuXG52YXIgX21vcnNlUHJvTWVzc2FnZSA9IHJlcXVpcmUoJy4vbW9yc2UtcHJvLW1lc3NhZ2UnKTtcblxudmFyIF9tb3JzZVByb01lc3NhZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9yc2VQcm9NZXNzYWdlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBkZWZhdWx0OiBvYmpcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHZhciBuZXdPYmogPSB7fTtcblxuICAgIGlmIChvYmogIT0gbnVsbCkge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBuZXdPYmouZGVmYXVsdCA9IG9iajtcbiAgICByZXR1cm4gbmV3T2JqO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn1cbi8qXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxNy5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogQ2xhc3MgdG8gY3JlYXRlIHRoZSBvbi9vZmYgdGltaW5ncyBuZWVkZWQgYnkgZS5nLiBzb3VuZCBnZW5lcmF0b3JzLiBUaW1pbmdzIGFyZSBpbiBtaWxsaXNlY29uZHM7IFwib2ZmXCIgdGltaW5ncyBhcmUgbmVnYXRpdmUuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGltcG9ydCBNb3JzZUNXIGZyb20gJ21vcnNlLXByby1jdyc7XHJcbiAqIHZhciBtb3JzZUNXID0gbmV3IE1vcnNlQ1coKTtcclxuICogbW9yc2VDVy50cmFuc2xhdGUoXCJhYmNcIik7XHJcbiAqIHZhciB0aW1pbmdzID0gbW9yc2VDVy5nZXRUaW1pbmdzKCk7XHJcbiAqL1xuXG5cbnZhciBNb3JzZUNXID0gZnVuY3Rpb24gKF9Nb3JzZU1lc3NhZ2UpIHtcbiAgX2luaGVyaXRzKE1vcnNlQ1csIF9Nb3JzZU1lc3NhZ2UpO1xuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd3BtIC0gdGhlIHNwZWVkIGluIHdvcmRzIHBlciBtaW51dGUgdXNpbmcgUEFSSVMgYXMgdGhlIHN0YW5kYXJkIHdvcmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZndwbSAtIHRoZSBGYXJuc3dvcnRoIHNwZWVkIGluIHdvcmRzIHBlciBtaW51dGUgKGRlZmF1bHRzIHRvIHdwbSlcclxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIE1vcnNlQ1codXNlUHJvc2lnbnMpIHtcbiAgICB2YXIgd3BtID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAyMDtcbiAgICB2YXIgZndwbSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogd3BtO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1vcnNlQ1cpO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoTW9yc2VDVy5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKE1vcnNlQ1cpKS5jYWxsKHRoaXMsIHVzZVByb3NpZ25zKSk7XG5cbiAgICBfdGhpcy53cG0gPSB3cG07XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cbiAgICBfdGhpcy5md3BtID0gZndwbTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTW9yc2VDVywgW3tcbiAgICBrZXk6ICdnZXRUaW1pbmdzJyxcblxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBhIG1vcnNlIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIG1pbGxpc2Vjb25kIHRpbWluZ3MuXHJcbiAgICAgKiBXaXRoIHRoZSBGYXJuc3dvcnRoIG1ldGhvZCwgdGhlIG1vcnNlIGNoYXJhY3RlcnMgYXJlIHBsYXllZCBhdCBvbmVcclxuICAgICAqIHNwZWVkIGFuZCB0aGUgc3BhY2VzIGJldHdlZW4gY2hhcmFjdGVycyBhdCBhIHNsb3dlciBzcGVlZC5cclxuICAgICAqIEByZXR1cm4ge251bWJlcltdfVxyXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFRpbWluZ3MoKSB7XG4gICAgICB2YXIgZGl0ID0gV1BNLmRpdExlbmd0aCh0aGlzLl93cG0pO1xuICAgICAgdmFyIHIgPSBXUE0ucmF0aW8odGhpcy5fd3BtLCB0aGlzLl9md3BtKTsgLy8gc2xvdyBkb3duIHRoZSBzcGFjZXMgYnkgdGhpcyByYXRpb1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRUaW1pbmdzR2VuZXJhbChkaXQsIDMgKiBkaXQsIGRpdCwgMyAqIGRpdCAqIHIsIDcgKiBkaXQgKiByKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGEgbW9yc2Ugc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgbWlsbGlzZWNvbmQgdGltaW5ncy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaXQgLSB0aGUgbGVuZ3RoIG9mIGEgZGl0IGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhaCAtIHRoZSBsZW5ndGggb2YgYSBkYWggaW4gbWlsbGlzZWNvbmRzIChub3JtYWxseSAzICogZGl0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRpdFNwYWNlIC0gdGhlIGxlbmd0aCBvZiBhbiBpbnRyYS1jaGFyYWN0ZXIgc3BhY2UgaW4gbWlsbGlzZWNvbmRzICgxICogZGl0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYXJTcGFjZSAtIHRoZSBsZW5ndGggb2YgYW4gaW50ZXItY2hhcmFjdGVyIHNwYWNlIGluIG1pbGxpc2Vjb25kcyAobm9ybWFsbHkgMyAqIGRpdClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3b3JkU3BhY2UgLSB0aGUgbGVuZ3RoIG9mIGFuIGludGVyLXdvcmQgc3BhY2UgaW4gbWlsbGlzZWNvbmRzIChub3JtYWxseSA3ICogZGl0KVxyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKiBAVE9ETyBtYWtlIGEgY2xhc3MgbWV0aG9kP1xyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2dldFRpbWluZ3NHZW5lcmFsJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VGltaW5nc0dlbmVyYWwoZGl0LCBkYWgsIGRpdFNwYWNlLCBjaGFyU3BhY2UsIHdvcmRTcGFjZSkge1xuICAgICAgLy9jb25zb2xlLmxvZyhcIk1vcnNlOiBcIiArIHRoaXMubW9yc2UpO1xuICAgICAgaWYgKHRoaXMuaGFzRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBtZXNzYWdlLCBjYW5ub3QgY29tcHV0ZSB0aW1pbmdzOiBcIiArIHRoaXMubW9yc2UpO1xuICAgICAgICByZXR1cm4gW107IC8vIFRPRE86IG9yIHRocm93IGV4Y2VwdGlvbj9cbiAgICAgIH1cblxuICAgICAgdmFyIG1vcnNlID0gdGhpcy5tb3JzZS5yZXBsYWNlKC8gXFwvIC9nLCAnLycpOyAvLyB0aGlzIG1lYW5zIHRoYXQgYSBzcGFjZSBpcyBvbmx5IHVzZWQgZm9yIGludGVyLWNoYXJhY3RlclxuXG4gICAgICB2YXIgdGltZXMgPSBbXTtcbiAgICAgIHZhciBjO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vcnNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGMgPSBtb3JzZVtpXTtcblxuICAgICAgICBpZiAoYyA9PSBcIi5cIiB8fCBjID09ICctJykge1xuICAgICAgICAgIGlmIChjID09ICcuJykge1xuICAgICAgICAgICAgdGltZXMucHVzaChkaXQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lcy5wdXNoKGRhaCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGltZXMucHVzaCgtZGl0U3BhY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT0gXCIgXCIpIHtcbiAgICAgICAgICB0aW1lcy5wb3AoKTtcbiAgICAgICAgICB0aW1lcy5wdXNoKC1jaGFyU3BhY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT0gXCIvXCIpIHtcbiAgICAgICAgICB0aW1lcy5wb3AoKTtcbiAgICAgICAgICB0aW1lcy5wdXNoKC13b3JkU3BhY2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lc1t0aW1lcy5sZW5ndGggLSAxXSA9PSAtZGl0U3BhY2UpIHtcbiAgICAgICAgdGltZXMucG9wKCk7IC8vIHRha2Ugb2ZmIHRoZSBsYXN0IGRpdFNwYWNlXG4gICAgICB9IC8vY29uc29sZS5sb2coXCJUaW1pbmdzOiBcIiArIHRpbWVzKTtcblxuXG4gICAgICByZXR1cm4gdGltZXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSB0b3RhbCBkdXJhdGlvbiBvZiB0aGUgbWVzc2FnZSBpbiBtc1xyXG4gICAgIDggQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2dldER1cmF0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RHVyYXRpb24oKSB7XG4gICAgICB2YXIgdGltZXMgPSB0aGlzLmdldFRpbWluZ3MoKTtcbiAgICAgIHZhciB0ID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ICs9IE1hdGguYWJzKHRpbWVzW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnd3BtJyxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh3cG0pIHtcbiAgICAgIHRoaXMuX3dwbSA9IHdwbTtcblxuICAgICAgaWYgKHdwbSA8IHRoaXMuX2Z3cG0pIHtcbiAgICAgICAgdGhpcy5fZndwbSA9IHdwbTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3dwbTtcbiAgICB9XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cbiAgfSwge1xuICAgIGtleTogJ2Z3cG0nLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGZ3cG0pIHtcbiAgICAgIHRoaXMuX2Z3cG0gPSBmd3BtO1xuXG4gICAgICBpZiAoZndwbSA+IHRoaXMuX3dwbSkge1xuICAgICAgICB0aGlzLl93cG0gPSBmd3BtO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZndwbTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTW9yc2VDVztcbn0oX21vcnNlUHJvTWVzc2FnZTIuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE1vcnNlQ1c7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpO1xuLypcclxuVGhpcyBjb2RlIGlzIMKpIENvcHlyaWdodCBTdGVwaGVuIEMuIFBoaWxsaXBzLCAyMDE3LlxyXG5FbWFpbDogc3RldmVAc2NwaGlsbGlwcy5jb21cclxuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBFVVBMLCBWZXJzaW9uIDEuMiBvciDigJMgYXMgc29vbiB0aGV5IHdpbGwgYmUgYXBwcm92ZWQgYnkgdGhlIEV1cm9wZWFuIENvbW1pc3Npb24gLSBzdWJzZXF1ZW50IHZlcnNpb25zIG9mIHRoZSBFVVBMICh0aGUgXCJMaWNlbmNlXCIpO1xyXG5Zb3UgbWF5IG5vdCB1c2UgdGhpcyB3b3JrIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2VuY2UuXHJcbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5jZSBhdDogaHR0cHM6Ly9qb2ludXAuZWMuZXVyb3BhLmV1L2NvbW11bml0eS9ldXBsL1xyXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbmNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcblNlZSB0aGUgTGljZW5jZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2VuY2UuXHJcbiovXG5cblxudmFyIF9tb3JzZVBybyA9IHJlcXVpcmUoJy4vbW9yc2UtcHJvJyk7XG5cbnZhciBNb3JzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9tb3JzZVBybyk7XG5cbnZhciBfbW9yc2VQcm9XcG0gPSByZXF1aXJlKCcuL21vcnNlLXByby13cG0nKTtcblxudmFyIFdQTSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9tb3JzZVByb1dwbSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikge1xuICBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbmV3T2JqID0ge307XG5cbiAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV3T2JqLmRlZmF1bHQgPSBvYmo7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuLyoqXHJcbiAqIENsYXNzIHRvIGNvbnZlcnQgZnJvbSB0aW1pbmdzIHRvIE1vcnNlIGNvZGUuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIC8vIFRoZSBtZXNzYWdlQ2FsbGJhY2sgaXMgY2FsbGVkIHdoZW4gYSBjaGFyYWN0ZXIgb3IgbW9yZSBpcyBkZWNvZGVkXHJcbiAqIC8vIEl0IHJlY2VpdmVzIGEgZGljdGlvbmFyeSBvZiB0aGUgdGltaW5ncywgbW9yc2UsIGFuZCB0aGUgbWVzc2FnZVxyXG4gKiB2YXIgbWVzc2FnZUNhbGxiYWNrID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gKiAgICAgY29uc29sZS5sb2coXCJEZWNvZGVkOiB7XFxuICB0aW1pbmdzOiBcIiArIGRhdGEudGltaW5ncyArIFwiXFxuICBtb3JzZTogXCIgKyBkYXRhLm1vcnNlICsgXCJcXG4gIG1lc3NhZ2U6IFwiICsgZGF0YS5tZXNzYWdlICsgXCJcXG59XCIpO1xyXG4gKiB9XHJcbiAqIHZhciBkZWNvZGVyID0gbmV3IE1vcnNlRGVjb2RlcigxMCk7XHJcbiAqIGRlY29kZXIubWVzc2FnZUNhbGxiYWNrID0gbWVzc2FnZUNhbGxiYWNrO1xyXG4gKiB2YXIgdDtcclxuICogd2hpbGUgKGRlY29kZXJfaXNfb3BlcmF0aW5nKSB7XHJcbiAqICAgICAvLyBnZXQgc29tZSB0aW1pbmcgXCJ0XCIgZnJvbSBhIHNlbnNvciwgbWFrZSBpdCArdmUgZm9yIG5vaXNlIGFuZCAtdmUgZm9yIHNpbGVuY2VcclxuICogICAgIGRlY29kZXIuYWRkVGltaW5nKHQpO1xyXG4gKiB9XHJcbiAqIGRlY29kZXIuZmx1c2goKTsgIC8vIG1ha2Ugc3VyZSBhbGwgdGhlIGRhdGEgaXMgcHVzaGVkIHRocm91Z2ggdGhlIGRlY29kZXJcclxuICovXG5cblxudmFyIE1vcnNlRGVjb2RlciA9IGZ1bmN0aW9uICgpIHtcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt3cG09MjBdIC0gVGhlIHNwZWVkIG9mIHRoZSBNb3JzZSBpbiB3b3JkcyBwZXIgbWludXRlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZndwbT13cG1dIC0gVGhlIEZhcm5zd29ydGggc3BlZWQgb2YgdGhlIE1vcnNlIGluIHdvcmRzIHBlciBtaW51dGUuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFttZXNzYWdlQ2FsbGJhY2tdIC0gQ2FsbGJhY2sgZXhlY3V0ZWQgd2hlbiBkZWNvZGVyIGJ1ZmZlciBpcyBmbHVzaGVkIChldmVyeSBjaGFyYWN0ZXIpLiBSZXR1cm5zIGRpY3Rpb25hcnkgd2l0aCBrZXlzICd0aW1pbmdzJywgJ21vcnNlJyBhbmQgJ21lc3NhZ2UnXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzcGVlZENhbGxiYWNrXSAtIENhbGxiYWNrIGV4ZWN1dGVkIGlmIHRoZSB3cG0gb3IgZndwbSBzcGVlZCBjaGFuZ2VzLiBUaGUgc3BlZWQgaW4gdGhpcyBjbGFzcyBkb2Vzbid0IGNoYW5nZSBieSBpdHNlbGYsIGJ1dCBlLmcuIHRoZSBmd3BtIGNhbiBjaGFuZ2UgaWYgd3BtIGlzIGNoYW5nZWQuIFJldHVybmVkIGRpY3Rpb25hcnkgaGFzIGtleXMgJ2Z3cG0nIGFuZCAnd3BtJy5cclxuICAqL1xuICBmdW5jdGlvbiBNb3JzZURlY29kZXIoKSB7XG4gICAgdmFyIHdwbSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMjA7XG4gICAgdmFyIGZ3cG0gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHdwbTtcbiAgICB2YXIgbWVzc2FnZUNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG4gICAgdmFyIHNwZWVkQ2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IHVuZGVmaW5lZDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb3JzZURlY29kZXIpO1xuXG4gICAgdGhpcy5fd3BtID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2Z3cG0gPSB1bmRlZmluZWQ7IC8vIGZhcm5zd29ydGggc3BlZWRcblxuICAgIHRoaXMuX2RpdExlbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9mZGl0TGVuID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICB3cG06IDIwLFxuICAgICAgZndwbTogMjBcbiAgICB9O1xuICAgIHRoaXMud3BtID0gd3BtO1xuICAgIHRoaXMuZndwbSA9IGZ3cG07XG4gICAgaWYgKG1lc3NhZ2VDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLm1lc3NhZ2VDYWxsYmFjayA9IG1lc3NhZ2VDYWxsYmFjaztcbiAgICBpZiAoc3BlZWRDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLnNwZWVkQ2FsbGJhY2sgPSBzcGVlZENhbGxiYWNrOyAvLyBmdW5jdGlvbiByZWNlaXZlcyBkaWN0aW9uYXJ5IHdpdGggd3BtIGFuZCBmd3BtIHNldCB3aGVuIHRoZSBzcGVlZCBjaGFuZ2VzXG5cbiAgICB0aGlzLnRpbWluZ3MgPSBbXTsgLy8gYWxsIHRoZSBtcyB0aW1pbmdzIHJlY2VpdmVkLCBhbGwgK3ZlXG5cbiAgICB0aGlzLmNoYXJhY3RlcnMgPSBbXTsgLy8gYWxsIHRoZSBkZWNvZGVkIGNoYXJhY3RlcnMgKCcuJywgJy0nLCBldGMpXG5cbiAgICB0aGlzLnVudXNlZFRpbWVzID0gW107XG4gICAgdGhpcy5ub2lzZVRocmVzaG9sZCA9IDE7IC8vIGEgZHVyYXRpb24gPD0gbm9pc2VUaHJlc2hvbGQgaXMgYXNzdW1lZCB0byBiZSBhbiBlcnJvclxuXG4gICAgdGhpcy5tb3JzZSA9IFwiXCI7IC8vIHN0cmluZyBvZiBtb3JzZVxuXG4gICAgdGhpcy5tZXNzYWdlID0gXCJcIjsgLy8gc3RyaW5nIG9mIGRlY29kZWQgbWVzc2FnZVxuICB9XG4gIC8qKlxyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1vcnNlRGVjb2RlciwgW3tcbiAgICBrZXk6ICd1cGRhdGVUaHJlc2hvbGRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlVGhyZXNob2xkcygpIHtcbiAgICAgIHRoaXMuX2RpdERhaFRocmVzaG9sZCA9ICgxICogdGhpcy5fZGl0TGVuICsgMyAqIHRoaXMuX2RpdExlbikgLyAyO1xuICAgICAgdGhpcy5fZGFoU3BhY2VUaHJlc2hvbGQgPSAoMyAqIHRoaXMuX2ZkaXRMZW4gKyA3ICogdGhpcy5fZmRpdExlbikgLyAyO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZFRpbWluZycsXG5cbiAgICAvKipcclxuICAgICAqIEFkZCBhIHRpbWluZyBpbiBtcyB0byB0aGUgbGlzdCBvZiByZWNvcmRlZCB0aW1pbmdzLlxyXG4gICAgICogVGhlIGR1cmF0aW9uIHNob3VsZCBiZSBwb3NpdGl2ZSBmb3IgYSBkaXQgb3IgZGFoIGFuZCBuZWdhdGl2ZSBmb3IgYSBzcGFjZS5cclxuICAgICAqIElmIHRoZSBkdXJhdGlvbiBpcyA8PSBub2lzZVRocmVzaG9sZCBpdCBpcyBhc3N1bWVkIHRvIGJlIG5vaXNlIGFuZCBpcyBhZGRlZCB0byB0aGUgcHJldmlvdXMgZHVyYXRpb24uXHJcbiAgICAgKiBJZiBhIGR1cmF0aW9uIGlzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIHByZXZpb3VzIG9uZSB0aGVuIHRoZXkgYXJlIGNvbWJpbmVkLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIC0gbWlsbGlzZWNvbmQgZHVyYXRpb24gdG8gYWRkLCBwb3NpdGl2ZSBmb3IgYSBkaXQgb3IgZGFoLCBuZWdhdGl2ZSBmb3IgYSBzcGFjZVxyXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRpbWluZyhkdXJhdGlvbikge1xuICAgICAgLy9jb25zb2xlLmxvZyhcIlJlY2VpdmVkOiBcIiArIGR1cmF0aW9uKTtcbiAgICAgIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnVudXNlZFRpbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGxhc3QgPSB0aGlzLnVudXNlZFRpbWVzW3RoaXMudW51c2VkVGltZXMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uICogbGFzdCA+IDApIHtcbiAgICAgICAgICAvLyBpZiB0aGUgc2lnbiBvZiB0aGUgZHVyYXRpb24gaXMgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIG9uZSB0aGVuIGFkZCBpdCBvblxuICAgICAgICAgIHRoaXMudW51c2VkVGltZXMucG9wKCk7XG4gICAgICAgICAgZHVyYXRpb24gPSBsYXN0ICsgZHVyYXRpb247XG4gICAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoZHVyYXRpb24pIDw9IHRoaXMubm9pc2VUaHJlc2hvbGQpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgZHVyYXRpb24gaXMgdmVyeSBzaG9ydCwgYXNzdW1lIGl0IGlzIGEgbWlzdGFrZSBhbmQgYWRkIGl0IHRvIHRoZSBwcmV2aW91cyBvbmVcbiAgICAgICAgICB0aGlzLnVudXNlZFRpbWVzLnBvcCgpO1xuICAgICAgICAgIGR1cmF0aW9uID0gbGFzdCAtIGR1cmF0aW9uOyAvLyB0YWtlIGNhcmUgb2YgdGhlIHNpZ24gY2hhbmdlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy51bnVzZWRUaW1lcy5wdXNoKGR1cmF0aW9uKTtcblxuICAgICAgaWYgKC1kdXJhdGlvbiA+PSB0aGlzLl9kaXREYWhUaHJlc2hvbGQpIHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBqdXN0IHJlY2VpdmVkIGEgY2hhcmFjdGVyIHNwYWNlIG9yIGxvbmdlclxuICAgICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZmx1c2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAgIC8vIFRoZW4gd2UndmUgcmVhY2hlZCB0aGUgZW5kIG9mIGEgY2hhcmFjdGVyIG9yIHdvcmQgb3IgYSBmbHVzaCBoYXMgYmVlbiBmb3JjZWRcbiAgICAgIC8vIElmIHRoZSBsYXN0IGNoYXJhY3RlciBkZWNvZGVkIHdhcyBhIHNwYWNlIHRoZW4ganVzdCBpZ25vcmUgYWRkaXRpb25hbCBxdWlldFxuICAgICAgaWYgKHRoaXMubWVzc2FnZVt0aGlzLm1lc3NhZ2UubGVuZ3RoIC0gMV0gPT09ICcgJykge1xuICAgICAgICBpZiAodGhpcy51bnVzZWRUaW1lc1swXSA8IDApIHtcbiAgICAgICAgICB0aGlzLnVudXNlZFRpbWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gTWFrZSBzdXJlIHRoZXJlIGlzIChzdGlsbCkgc29tZXRoaW5nIHRvIGRlY29kZVxuXG5cbiAgICAgIGlmICh0aGlzLnVudXNlZFRpbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIElmIGxhc3QgZWxlbWVudCBpcyBxdWlldCBidXQgaXQgaXMgbm90IGVub3VnaCBmb3IgYSBzcGFjZSBjaGFyYWN0ZXIgdGhlbiBwb3AgaXQgb2ZmIGFuZCByZXBsYWNlIGFmdGVyd2FyZHNcblxuXG4gICAgICB2YXIgbGFzdCA9IHRoaXMudW51c2VkVGltZXNbdGhpcy51bnVzZWRUaW1lcy5sZW5ndGggLSAxXTtcblxuICAgICAgaWYgKGxhc3QgPCAwICYmIC1sYXN0IDwgdGhpcy5fZGFoU3BhY2VUaHJlc2hvbGQpIHtcbiAgICAgICAgdGhpcy51bnVzZWRUaW1lcy5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHUgPSB0aGlzLnVudXNlZFRpbWVzO1xuICAgICAgdmFyIG0gPSB0aGlzLnRpbWluZ3MybW9yc2UodGhpcy51bnVzZWRUaW1lcyk7XG4gICAgICB2YXIgdCA9IE1vcnNlLm1vcnNlMnRleHQobSkubWVzc2FnZTsgLy8gd2lsbCBiZSAnIycgaWYgdGhlcmUncyBhbiBlcnJvclxuXG4gICAgICB0aGlzLm1vcnNlICs9IG07XG4gICAgICB0aGlzLm1lc3NhZ2UgKz0gdDtcblxuICAgICAgaWYgKGxhc3QgPCAwKSB7XG4gICAgICAgIHRoaXMudW51c2VkVGltZXMgPSBbbGFzdF07IC8vIHB1dCB0aGUgc3BhY2UgYmFjayBvbiB0aGUgZW5kIGluIGNhc2UgdGhlcmUgaXMgbW9yZSBxdWlldCB0byBjb21lXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVudXNlZFRpbWVzID0gW107XG4gICAgICB9XG5cbiAgICAgIHRoaXMubWVzc2FnZUNhbGxiYWNrKHtcbiAgICAgICAgdGltaW5nczogdSxcbiAgICAgICAgbW9yc2U6IG0sXG4gICAgICAgIG1lc3NhZ2U6IHRcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3RpbWluZ3MybW9yc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0aW1pbmdzMm1vcnNlKHRpbWVzKSB7XG4gICAgICB2YXIgZGl0ZGFoID0gXCJcIjtcbiAgICAgIHZhciBjO1xuICAgICAgdmFyIGQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGltZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZCA9IHRpbWVzW2ldO1xuXG4gICAgICAgIGlmIChkID4gMCkge1xuICAgICAgICAgIGlmIChkIDwgdGhpcy5fZGl0RGFoVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBjID0gXCIuXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMgPSBcIi1cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZCA9IC1kO1xuXG4gICAgICAgICAgaWYgKGQgPCB0aGlzLl9kaXREYWhUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGMgPSBcIlwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZCA8IHRoaXMuX2RhaFNwYWNlVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBjID0gXCIgXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMgPSBcIi9cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZERlY29kZShkLCBjKTtcbiAgICAgICAgZGl0ZGFoID0gZGl0ZGFoICsgYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRpdGRhaDtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdhZGREZWNvZGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGREZWNvZGUoZHVyYXRpb24sIGNoYXJhY3Rlcikge1xuICAgICAgdGhpcy50aW1pbmdzLnB1c2goZHVyYXRpb24pO1xuICAgICAgdGhpcy5jaGFyYWN0ZXJzLnB1c2goY2hhcmFjdGVyKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdnZXRUaW1pbmdzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VGltaW5ncyhjaGFyYWN0ZXIpIHtcbiAgICAgIHZhciByZXQgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRpbWluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhcmFjdGVyc1tpXSA9PT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgcmV0LnB1c2godGhpcy50aW1pbmdzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbWlsbGlzZWNvbmQgdGltaW5ncyBvZiBhbGwgZHVyYXRpb25zIGRldGVybWluZWQgdG8gYmUgZGl0c1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnbWVzc2FnZUNhbGxiYWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWVzc2FnZUNhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogJ3NwZWVkQ2FsbGJhY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzcGVlZENhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogJ3dwbScsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQod3BtKSB7XG4gICAgICBpZiAoaXNOYU4od3BtKSkgd3BtID0gdGhpcy5kZWZhdWx0cy53cG07XG4gICAgICB3cG0gPSBNYXRoLm1heCh3cG0sIDEpO1xuICAgICAgdGhpcy5fd3BtID0gd3BtO1xuXG4gICAgICBpZiAodGhpcy5fZndwbSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuX2Z3cG0gPiB3cG0pIHtcbiAgICAgICAgdGhpcy5fZndwbSA9IHRoaXMuX3dwbTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGl0TGVuID0gV1BNLmRpdExlbmd0aCh0aGlzLl93cG0pO1xuICAgICAgdGhpcy5fZmRpdExlbiA9IFdQTS5mZGl0TGVuZ3RoKHRoaXMuX3dwbSwgdGhpcy5fZndwbSk7XG4gICAgICB0aGlzLnVwZGF0ZVRocmVzaG9sZHMoKTtcbiAgICAgIHRoaXMuc3BlZWRDYWxsYmFjayh7XG4gICAgICAgIHdwbTogdGhpcy53cG0sXG4gICAgICAgIGZ3cG06IHRoaXMuZndwbVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl93cG07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZndwbScsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoZndwbSkge1xuICAgICAgaWYgKGlzTmFOKGZ3cG0pKSBmd3BtID0gdGhpcy5kZWZhdWx0cy5md3BtO1xuICAgICAgZndwbSA9IE1hdGgubWF4KGZ3cG0sIDEpO1xuICAgICAgdGhpcy5fZndwbSA9IGZ3cG07XG5cbiAgICAgIGlmICh0aGlzLl93cG0gPT09IHVuZGVmaW5lZCB8fCB0aGlzLl93cG0gPCBmd3BtKSB7XG4gICAgICAgIHRoaXMud3BtID0gZndwbTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGl0TGVuID0gV1BNLmRpdExlbmd0aCh0aGlzLl93cG0pO1xuICAgICAgdGhpcy5fZmRpdExlbiA9IFdQTS5mZGl0TGVuZ3RoKHRoaXMuX3dwbSwgdGhpcy5fZndwbSk7XG4gICAgICB0aGlzLnVwZGF0ZVRocmVzaG9sZHMoKTtcbiAgICAgIHRoaXMuc3BlZWRDYWxsYmFjayh7XG4gICAgICAgIHdwbTogdGhpcy53cG0sXG4gICAgICAgIGZ3cG06IHRoaXMuZndwbVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9md3BtO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2RpdExlbicsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoZGl0KSB7XG4gICAgICB0aGlzLl9kaXRMZW4gPSBkaXQ7XG5cbiAgICAgIGlmICh0aGlzLl9mZGl0TGVuID09PSB1bmRlZmluZWQgfHwgdGhpcy5fZmRpdExlbiA8IHRoaXMuX2RpdExlbikge1xuICAgICAgICB0aGlzLl9mZGl0TGVuID0gdGhpcy5fZGl0TGVuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl93cG0gPSBXUE0ud3BtKHRoaXMuX2RpdExlbik7XG4gICAgICB0aGlzLl9md3BtID0gV1BNLmZ3cG0odGhpcy5fd3BtLCB0aGlzLl9mZGl0TGVuIC8gdGhpcy5fZGl0TGVuKTtcbiAgICAgIHRoaXMudXBkYXRlVGhyZXNob2xkcygpO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGl0TGVuO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2ZkaXRMZW4nLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGZkaXQpIHtcbiAgICAgIHRoaXMuX2ZkaXRMZW4gPSBmZGl0O1xuXG4gICAgICBpZiAodGhpcy5fZGl0TGVuID09PSB1bmRlZmluZWQgfHwgdGhpcy5fZGl0TGVuID4gdGhpcy5fZmRpdExlbikge1xuICAgICAgICB0aGlzLl9kaXRMZW4gPSB0aGlzLl9mZGl0TGVuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl93cG0gPSBXUE0ud3BtKHRoaXMuX2RpdExlbik7XG4gICAgICB0aGlzLl9md3BtID0gV1BNLmZ3cG0odGhpcy5fd3BtLCB0aGlzLl9mZGl0TGVuIC8gdGhpcy5fZGl0TGVuKTtcbiAgICAgIHRoaXMudXBkYXRlVGhyZXNob2xkcygpO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmRpdExlbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXRzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJy4nKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIG1pbGxpc2Vjb25kIHRpbWluZ3Mgb2YgYWxsIGR1cmF0aW9ucyBkZXRlcm1pbmVkIHRvIGJlIGRhaHNcclxuICAgICAqIEByZXR1cm4ge251bWJlcltdfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2RhaHMnLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGltaW5ncygnLScpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbWlsbGlzZWNvbmQgdGltaW5ncyBvZiBhbGwgZHVyYXRpb25zIGRldGVybWluZWQgdG8gYmUgZGl0LXNwYWNlc1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZGl0U3BhY2VzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJycpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbWlsbGlzZWNvbmQgdGltaW5ncyBvZiBhbGwgZHVyYXRpb25zIGRldGVybWluZWQgdG8gYmUgZGFoLXNwYWNlc1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZGFoU3BhY2VzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJyAnKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIG1pbGxpc2Vjb25kIHRpbWluZ3Mgb2YgYWxsIGR1cmF0aW9ucyBkZXRlcm1pbmVkIHRvIGJlIHNwYWNlc1xyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc3BhY2VzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpbWluZ3MoJy8nKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTW9yc2VEZWNvZGVyO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNb3JzZURlY29kZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG4vKlxyXG5UaGlzIGNvZGUgaXMgwqkgQ29weXJpZ2h0IFN0ZXBoZW4gQy4gUGhpbGxpcHMsIDIwMTcuXHJcbkVtYWlsOiBzdGV2ZUBzY3BoaWxsaXBzLmNvbVxyXG5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEVVUEwsIFZlcnNpb24gMS4yIG9yIOKAkyBhcyBzb29uIHRoZXkgd2lsbCBiZSBhcHByb3ZlZCBieSB0aGUgRXVyb3BlYW4gQ29tbWlzc2lvbiAtIHN1YnNlcXVlbnQgdmVyc2lvbnMgb2YgdGhlIEVVUEwgKHRoZSBcIkxpY2VuY2VcIik7XHJcbllvdSBtYXkgbm90IHVzZSB0aGlzIHdvcmsgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5jZS5cclxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbmNlIGF0OiBodHRwczovL2pvaW51cC5lYy5ldXJvcGEuZXUvY29tbXVuaXR5L2V1cGwvXHJcblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2VuY2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuU2VlIHRoZSBMaWNlbmNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5jZS5cclxuKi9cblxuLyoqXHJcbiAqIEEgY2xhc3MgdG8gJ2xpc3RlbicgZm9yIE1vcnNlIGNvZGUgZnJvbSB0aGUgbWljcm9waG9uZSBvciBhbiBhdWRpbyBmaWxlLCBmaWx0ZXIgdGhlIHNvdW5kIGFuZCBwYXNzIHRpbWluZ3MgdG8gYSBkZWNvZGVyIHRvIGNvbnZlcnQgdG8gdGV4dC5cclxuICovXG5cblxudmFyIE1vcnNlTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmZnRTaXplIC0gU2l6ZSBvZiB0aGUgZGlzY3JldGUgRm91cmllciB0cmFuc2Zvcm0gdG8gdXNlLiBNdXN0IGJlIGEgcG93ZXIgb2YgMiA+PSAyNTYgKGRlZmF1bHRzIHRvIDI1NikuIEEgc21hbGxlciBmZnRTaXplIGdpdmVzIGJldHRlciB0aW1lIHJlc29sdXRpb24gYnV0IHdvcnNlIGZyZXF1ZW5jeSByZXNvbHV0aW9uLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdm9sdW1lRmlsdGVyTWluPS02MF0gLSBTb3VuZCBsZXNzIHRoYW4gdGhpcyB2b2x1bWUgKGluIGRCKSBpcyBpZ25vcmVkLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdm9sdW1lRmlsdGVyTWF4PS0zMF0gLSBTb3VuZCBncmVhdGVyIHRoYW4gdGhpcyB2b2x1bWUgKGluIGRCKSBpcyBpZ25vcmVkLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJlcXVlbmN5RmlsdGVyTWluPTU1MF0gLSBTb3VuZCBsZXNzIHRoYW4gdGhpcyBmcmVxdWVuY3kgKGluIEh6KSBpcyBpZ25vcmVkLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJlcXVlbmN5RmlsdGVyTWF4PTU1MF0gLSBTb3VuZCBncmVhdGVyIHRoYW4gdGhpcyBmcmVxdWVuY3kgKGluIEh6KSBpcyBpZ25vcmVkLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdm9sdW1lVGhyZXNob2xkPTIyMF0gLSBJZiB0aGUgdm9sdW1lIGlzIGdyZWF0ZXIgdGhhbiB0aGlzIHRoZW4gdGhlIHNpZ25hbCBpcyB0YWtlbiBhcyBcIm9uXCIgKHBhcnQgb2YgYSBkaXQgb3IgZGFoKSAocmFuZ2UgMC0yNTUpLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkZWNvZGVyIC0gQW4gaW5zdGFuY2Ugb2YgYSBjb25maWd1cmVkIGRlY29kZXIgY2xhc3MuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBzcGVjdHJvZ3JhbUNhbGxiYWNrIC0gQ2FsbGVkIGV2ZXJ5IHRpbWUgZmZ0U2l6ZSBzYW1wbGVzIGFyZSByZWFkLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldHVybnMgYSBkaWN0aW9uYXJ5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmVxdWVuY3lEYXRhOiBvdXRwdXQgb2YgdGhlIERGVCAodGhlIHJlYWwgdmFsdWVzIGluY2x1ZGluZyBEQyBjb21wb25lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmVxdWVuY3lTdGVwOiBmcmVxdWVuY3kgcmVzb2x1dGlvbiBpbiBIelxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZVN0ZXA6IHRpbWUgcmVzb2x1dGlvbiBpbiBIelxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQmluTG93OiBpbmRleCBvZiB0aGUgbG93ZXN0IGZyZXF1ZW5jeSBiaW4gYmVpbmcgYW5hbHlzZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckJpbkhpZ2g6IGluZGV4IG9mIHRoZSBoaWdoZXN0IGZyZXF1ZW5jeSBiaW4gYmVpbmcgYW5hbHlzZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclJlZ2lvblZvbHVtZTogdm9sdW1lIGluIHRoZSBhbmFseXNlZCByZWdpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT246IHdoZXRoZXIgdGhlIGFuYWx5c2lzIGRldGVjdGVkIGEgc2lnbmFsIG9yIG5vdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBmcmVxdWVuY3lGaWx0ZXJDYWxsYmFjayAtIENhbGxlZCB3aGVuIHRoZSBmcmVxdWVuY3kgZmlsdGVyIHBhcmFtZXRlcnMgY2hhbmdlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldHVybnMgYSBkaWN0aW9uYXJ5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW46IGxvd2VzdCBmcmVxdWVuY3kgaW4gSHpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heDogaGlnaGVzdCBmcmVxdWVuY3kgaW4gSHpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaGUgZnJlcXVlbmNpZXMgbWF5IHdlbGwgYmUgZGlmZmVyZW50IHRvIHRoYXQgd2hpY2ggaXMgc2V0IGFzIHRoZXkgYXJlIHF1YW50aXNlZC5cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IHZvbHVtZUZpbHRlckNhbGxiYWNrIC0gQ2FsbGVkIHdoZW4gdGhlIHZvbHVtZSBmaWx0ZXIgcGFyYW1ldGVycyBjaGFuZ2UuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV0dXJucyBhIGRpY3Rpb25hcnk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogbG93IHZvbHVtZSAoaW4gZEIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXg6IGhpZ2ggdm9sdW1lIChpbiBkQilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiB0aGUgc2V0IHZvbHVtZXMgYXJlIG5vdCBudW1lcmljIG9yIG91dCBvZiByYW5nZSB0aGVuIHRoZSBjYWxsYmFjayB3aWxsIHJldHVybiBpbiByYW5nZSBudW1iZXJzLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gdm9sdW1lVGhyZXNob2xkQ2FsbGJhY2sgLSBDYWxsZWQgd2hlbiB0aGUgdm9sdW1lIGZpbHRlciB0aHJlc2hvbGQgY2hhbmdlcy4gUmV0dXJucyBhIHNpbmdsZSBudW1iZXIuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBtaWNTdWNjZXNzQ2FsbGJhY2sgLSBDYWxsZWQgd2hlbiB0aGUgbWljcm9waG9uZSBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gY29ubmVjdGVkLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbWljRXJyb3JDYWxsYmFjayAtIENhbGxlZCAod2l0aCB0aGUgZXJyb3IgYXMgYW4gYXJndW1lbnQpIGlmIHRoZXJlIGlzIGFuIGVycm9yIGNvbm5lY3RpbmcgdG8gdGhlIG1pY3JvcGhvbmUuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBmaWxlTG9hZENhbGxiYWNrIC0gQ2FsbGVkIHdoZW4gYSBmaWxlIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBsb2FkZWQgKGFuZCBkZWNvZGVkKS4gUmV0dXJucyB0aGUgYXVkaW9CdWZmZXIgb2JqZWN0LlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gZmlsZUVycm9yQ2FsbGJhY2sgLSBDYWxsZWQgKHdpdGggdGhlIGVycm9yIGFzIGFuIGFyZ3VtZW50KSBpZiB0aGVyZSBpcyBhbiBlcnJvciBpbiBkZWNvZGluZyBhIGZpbGUuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBFT0ZDYWxsYmFjayAtIENhbGxlZCB3aGVuIHRoZSBwbGF5YmFjayBvZiBhIGZpbGUgZW5kcy5cclxuICAgKi9cbiAgZnVuY3Rpb24gTW9yc2VMaXN0ZW5lcihmZnRTaXplLCB2b2x1bWVGaWx0ZXJNaW4sIHZvbHVtZUZpbHRlck1heCwgZnJlcXVlbmN5RmlsdGVyTWluLCBmcmVxdWVuY3lGaWx0ZXJNYXgsIHZvbHVtZVRocmVzaG9sZCwgZGVjb2Rlciwgc3BlY3Ryb2dyYW1DYWxsYmFjaywgZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2ssIHZvbHVtZUZpbHRlckNhbGxiYWNrLCB2b2x1bWVUaHJlc2hvbGRDYWxsYmFjaywgbWljU3VjY2Vzc0NhbGxiYWNrLCBtaWNFcnJvckNhbGxiYWNrLCBmaWxlTG9hZENhbGxiYWNrLCBmaWxlRXJyb3JDYWxsYmFjaywgRU9GQ2FsbGJhY2spIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTW9yc2VMaXN0ZW5lcik7IC8vIGF1ZGlvIGlucHV0IGFuZCBvdXRwdXRcblxuXG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCkgfHwgbmV3IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQoKTtcbiAgICBpZiAoc3BlY3Ryb2dyYW1DYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLnNwZWN0cm9ncmFtQ2FsbGJhY2sgPSBzcGVjdHJvZ3JhbUNhbGxiYWNrO1xuICAgIGlmIChmcmVxdWVuY3lGaWx0ZXJDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLmZyZXF1ZW5jeUZpbHRlckNhbGxiYWNrID0gZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2s7XG4gICAgaWYgKHZvbHVtZUZpbHRlckNhbGxiYWNrICE9PSB1bmRlZmluZWQpIHRoaXMudm9sdW1lRmlsdGVyQ2FsbGJhY2sgPSB2b2x1bWVGaWx0ZXJDYWxsYmFjaztcbiAgICBpZiAodm9sdW1lVGhyZXNob2xkQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy52b2x1bWVUaHJlc2hvbGRDYWxsYmFjayA9IHZvbHVtZVRocmVzaG9sZENhbGxiYWNrO1xuICAgIGlmIChtaWNTdWNjZXNzQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5taWNTdWNjZXNzQ2FsbGJhY2sgPSBtaWNTdWNjZXNzQ2FsbGJhY2s7XG4gICAgaWYgKG1pY0Vycm9yQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgdGhpcy5taWNFcnJvckNhbGxiYWNrID0gbWljRXJyb3JDYWxsYmFjaztcbiAgICBpZiAoZmlsZUxvYWRDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLmZpbGVMb2FkQ2FsbGJhY2sgPSBmaWxlTG9hZENhbGxiYWNrO1xuICAgIGlmIChmaWxlRXJyb3JDYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB0aGlzLmZpbGVFcnJvckNhbGxiYWNrID0gZmlsZUVycm9yQ2FsbGJhY2s7XG4gICAgaWYgKEVPRkNhbGxiYWNrICE9PSB1bmRlZmluZWQpIHRoaXMuRU9GQ2FsbGJhY2sgPSBFT0ZDYWxsYmFjaztcbiAgICB0aGlzLmZmdFNpemUgPSBmZnRTaXplOyAvLyBiYXNpYyBwYXJhbWV0ZXJzIGZyb20gdGhlIHNhbXBsZSByYXRlXG5cbiAgICB0aGlzLnNhbXBsZVJhdGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlOyAvLyBpbiBIeiwgNDgwMDAgb24gQ2hyb21lXG5cbiAgICB0aGlzLm1heEZyZXEgPSB0aGlzLnNhbXBsZVJhdGUgLyAyOyAvLyBpbiBIejsgTnlxdWlzdCB0aGVvcmVtXG5cbiAgICB0aGlzLmZyZXFCaW5zID0gdGhpcy5mZnRTaXplIC8gMjtcbiAgICB0aGlzLnRpbWVTdGVwID0gMTAwMCAvICh0aGlzLnNhbXBsZVJhdGUgLyB0aGlzLmZmdFNpemUpOyAvLyBpbiBtc1xuXG4gICAgdGhpcy5mcmVxU3RlcCA9IHRoaXMubWF4RnJlcSAvIHRoaXMuZnJlcUJpbnM7XG4gICAgdGhpcy5pbml0aWFsaXNlQXVkaW9Ob2RlcygpO1xuICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICBmZnRTaXplOiAyNTYsXG4gICAgICB2b2x1bWVGaWx0ZXJNaW46IC02MCxcbiAgICAgIHZvbHVtZUZpbHRlck1heDogLTMwLFxuICAgICAgZnJlcXVlbmN5RmlsdGVyTWluOiA1NTAsXG4gICAgICBmcmVxdWVuY3lGaWx0ZXJNYXg6IDU1MCxcbiAgICAgIHZvbHVtZVRocmVzaG9sZDogMjAwXG4gICAgfTtcbiAgICB0aGlzLnZvbHVtZUZpbHRlck1pbiA9IHZvbHVtZUZpbHRlck1pbjsgLy8gaW4gZEJcblxuICAgIHRoaXMudm9sdW1lRmlsdGVyTWF4ID0gdm9sdW1lRmlsdGVyTWF4O1xuICAgIHRoaXMuZnJlcXVlbmN5RmlsdGVyTWluID0gZnJlcXVlbmN5RmlsdGVyTWluOyAvLyBpbiBIelxuXG4gICAgdGhpcy5mcmVxdWVuY3lGaWx0ZXJNYXggPSBmcmVxdWVuY3lGaWx0ZXJNYXg7XG4gICAgdGhpcy52b2x1bWVUaHJlc2hvbGQgPSB2b2x1bWVUaHJlc2hvbGQ7IC8vIGluIHJhbmdlIFswLTI1NV1cblxuICAgIHRoaXMuZGVjb2RlciA9IGRlY29kZXI7XG4gICAgdGhpcy5ub3RTdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLmZsdXNoVGltZSA9IDUwMDsgLy8gaG93IGxvbmcgdG8gd2FpdCBiZWZvcmUgcHVzaGluZyBkYXRhIHRvIHRoZSBkZWNvZGVyIGlmIGUuZy4geW91IGhhdmUgYSB2ZXJ5IGxvbmcgcGF1c2VcblxuICAgIHRoaXMuaW5wdXQgPSB1bmRlZmluZWQ7IC8vIGN1cnJlbnQgc3RhdGU6IHVuZGVmaW5lZCwgXCJtaWNcIiwgXCJmaWxlXCJcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNb3JzZUxpc3RlbmVyLCBbe1xuICAgIGtleTogXCJpbml0aWFsaXNlQXVkaW9Ob2Rlc1wiLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAYWNjZXNzOiBwcml2YXRlXHJcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdGlhbGlzZUF1ZGlvTm9kZXMoKSB7XG4gICAgICAvLyBzZXQgdXAgYSBqYXZhc2NyaXB0IG5vZGUgKEJVRkZFUl9TSVpFLCBOVU1fSU5QVVRTLCBOVU1fT1VUUFVUUylcbiAgICAgIHRoaXMuanNOb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKHRoaXMuZmZ0U2l6ZSwgMSwgMSk7IC8vIGJ1ZmZlciBzaXplIGNhbiBiZSAyNTYsIDUxMiwgMTAyNCwgMjA0OCwgNDA5NiwgODE5MiBvciAxNjM4NFxuICAgICAgLy8gc2V0IHRoZSBldmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSBidWZmZXIgaXMgZnVsbFxuXG4gICAgICB0aGlzLmpzTm9kZS5vbmF1ZGlvcHJvY2VzcyA9IHRoaXMucHJvY2Vzc1NvdW5kLmJpbmQodGhpcyk7IC8vIHNldCB1cCBhbiBhbmFseXNlck5vZGVcblxuICAgICAgdGhpcy5hbmFseXNlck5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuICAgICAgdGhpcy5hbmFseXNlck5vZGUuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gMDsgLy8gbm8gbWl4aW5nIHdpdGggdGhlIHByZXZpb3VzIGZyYW1lXG5cbiAgICAgIHRoaXMuYW5hbHlzZXJOb2RlLmZmdFNpemUgPSB0aGlzLmZmdFNpemU7IC8vIGNhbiBiZSAzMiB0byAyMDQ4IGluIHdlYmtpdFxuXG4gICAgICB0aGlzLmZyZXF1ZW5jeURhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLmZyZXFCaW5zKTsgLy8gY3JlYXRlIGFuIGFycnJheSBvZiB0aGUgcmlnaHQgc2l6ZSBmb3IgdGhlIGZyZXF1ZW5jeSBkYXRhXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInN0YXJ0TGlzdGVuaW5nXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0TGlzdGVuaW5nKCkge1xuICAgICAgdGhpcy5zdG9wKCk7IC8vIFRPRE86IHJlcGxhY2UgdGhpcyB3aXRoIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKCkgaW5zdGVhZCBhbmQgc2hpbSBmb3IgbGVnYWN5IGJyb3dzZXJzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTWVkaWFEZXZpY2VzL2dldFVzZXJNZWRpYSlcblxuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7XG4gICAgICAgIGF1ZGlvOiB0cnVlLFxuICAgICAgICB2aWRlbzogZmFsc2VcbiAgICAgIH0sIGZ1bmN0aW9uIChzdHJlYW0pIHtcbiAgICAgICAgLy8gY3JlYXRlIGFuIGF1ZGlvIG5vZGUgZnJvbSB0aGUgc3RyZWFtXG4gICAgICAgIHRoaXMuc291cmNlTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlKHN0cmVhbSk7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBcIm1pY1wiOyAvLyBjb25uZWN0IG5vZGVzIGJ1dCBkb24ndCBjb25uZWN0IG1pYyB0byBhdWRpbyBvdXRwdXQgdG8gYXZvaWQgZmVlZGJhY2tcblxuICAgICAgICB0aGlzLnNvdXJjZU5vZGUuY29ubmVjdCh0aGlzLmFuYWx5c2VyTm9kZSk7XG4gICAgICAgIHRoaXMuanNOb2RlLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICB0aGlzLm1pY1N1Y2Nlc3NDYWxsYmFjaygpO1xuICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5taWNFcnJvckNhbGxiYWNrKGVycm9yKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImxvYWRBcnJheUJ1ZmZlclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQXJyYXlCdWZmZXIoYXJyYXlCdWZmZXIpIHtcbiAgICAgIC8vIGJ5IHNlcGFyYXRpbmcgbG9hZGluZyAoZGVjb2RpbmcpIGFuZCBwbGF5aW5nLCB0aGUgcGxheWluZyBjYW4gYmUgZG9uZSBtdWx0aXBsZSB0aW1lc1xuICAgICAgdGhpcy5hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGFycmF5QnVmZmVyLCBmdW5jdGlvbiAoYXVkaW9CdWZmZXIpIHtcbiAgICAgICAgdGhpcy5maWxlQXVkaW9CdWZmZXIgPSBhdWRpb0J1ZmZlcjtcbiAgICAgICAgdGhpcy5maWxlTG9hZENhbGxiYWNrKGF1ZGlvQnVmZmVyKTtcbiAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHRoaXMuZmlsZUF1ZGlvQnVmZmVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmZpbGVFcnJvckNhbGxiYWNrKGVycm9yKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInBsYXlBcnJheUJ1ZmZlclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5QXJyYXlCdWZmZXIoKSB7XG4gICAgICB0aGlzLnN0b3AoKTsgLy8gbWFrZSBCdWZmZXJTb3VyY2Ugbm9kZVxuXG4gICAgICB0aGlzLnNvdXJjZU5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHRoaXMuc291cmNlTm9kZS5idWZmZXIgPSB0aGlzLmZpbGVBdWRpb0J1ZmZlcjtcblxuICAgICAgdGhpcy5zb3VyY2VOb2RlLm9uZW5kZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICB0aGlzLkVPRkNhbGxiYWNrKCk7XG4gICAgICB9LmJpbmQodGhpcyk7IC8vIGNvbm5lY3Qgbm9kZXNcblxuXG4gICAgICB0aGlzLmpzTm9kZS5jb25uZWN0KHRoaXMuYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIHRoaXMuc291cmNlTm9kZS5jb25uZWN0KHRoaXMuYW5hbHlzZXJOb2RlKTtcbiAgICAgIHRoaXMuc291cmNlTm9kZS5jb25uZWN0KHRoaXMuYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIHRoaXMuaW5wdXQgPSBcImZpbGVcIjsgLy8gcGxheVxuXG4gICAgICB0aGlzLnNvdXJjZU5vZGUuc3RhcnQoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic3RvcFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgaWYgKHRoaXMuaW5wdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlucHV0ID09PSBcImZpbGVcIikge1xuICAgICAgICB0aGlzLnNvdXJjZU5vZGUuc3RvcCgpO1xuICAgICAgICB0aGlzLnNvdXJjZU5vZGUuZGlzY29ubmVjdCh0aGlzLmF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc291cmNlTm9kZS5kaXNjb25uZWN0KHRoaXMuYW5hbHlzZXJOb2RlKTtcbiAgICAgIHRoaXMuanNOb2RlLmRpc2Nvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgdGhpcy5kZWNvZGVyLmZsdXNoKCk7XG4gICAgICB0aGlzLmlucHV0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFRoaXMgU2NyaXB0UHJvY2Vzc29yTm9kZSBpcyBjYWxsZWQgd2hlbiBpdCBpcyBmdWxsLCB3ZSB0aGVuIGFjdHVhbGx5IGxvb2sgYXQgdGhlIGRhdGEgaW4gdGhlIGFuYWx5c2VyTm9kZSBub2RlIHRvIG1lYXN1cmUgdGhlIHZvbHVtZSBpbiB0aGUgZnJlcXVlbmN5IGJhbmQgb2YgaW50ZXJlc3QuIFdlIGRvbid0IGFjdHVhbGx5IHVzZSB0aGUgaW5wdXQgb3Igb3V0cHV0IG9mIHRoZSBTY3JpcHRQcm9jZXNvck5vZGUuXHJcbiAgICAgKiBAYWNjZXNzOiBwcml2YXRlXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInByb2Nlc3NTb3VuZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzU291bmQoKSB7XG4gICAgICAvLyBnZXQgdGhlIGRhdGEgZnJvbSB0aGUgYW5hbHlzZXJOb2RlIG5vZGUgYW5kIHB1dCBpbnRvIGZyZXF1ZW5jeURhdGFcbiAgICAgIHRoaXMuYW5hbHlzZXJOb2RlLmdldEJ5dGVGcmVxdWVuY3lEYXRhKHRoaXMuZnJlcXVlbmN5RGF0YSk7IC8vIGZpbmQgdGhlIGF2ZXJhZ2Ugdm9sdW1lIGluIHRoZSBmaWx0ZXIgcmVnaW9uXG5cbiAgICAgIHZhciBmaWx0ZXJSZWdpb25Wb2x1bWUgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy5fZmlsdGVyQmluTG93OyBpIDw9IHRoaXMuX2ZpbHRlckJpbkhpZ2g7IGkrKykge1xuICAgICAgICBmaWx0ZXJSZWdpb25Wb2x1bWUgKz0gdGhpcy5mcmVxdWVuY3lEYXRhW2ldO1xuICAgICAgfVxuXG4gICAgICBmaWx0ZXJSZWdpb25Wb2x1bWUgLz0gMS4wICogKHRoaXMuX2ZpbHRlckJpbkhpZ2ggLSB0aGlzLl9maWx0ZXJCaW5Mb3cgKyAxKTsgLy8gcmVjb3JkIHRoZSBkYXRhXG5cbiAgICAgIHZhciBpc09uID0gZmlsdGVyUmVnaW9uVm9sdW1lID49IHRoaXMuX3ZvbHVtZVRocmVzaG9sZDtcbiAgICAgIHRoaXMucmVjb3JkT25Pck9mZihpc09uKTtcbiAgICAgIHRoaXMuc3BlY3Ryb2dyYW1DYWxsYmFjayh7XG4gICAgICAgIGZyZXF1ZW5jeURhdGE6IHRoaXMuZnJlcXVlbmN5RGF0YSxcbiAgICAgICAgZnJlcXVlbmN5U3RlcDogdGhpcy5mcmVxU3RlcCxcbiAgICAgICAgdGltZVN0ZXA6IHRoaXMudGltZVN0ZXAsXG4gICAgICAgIGZpbHRlckJpbkxvdzogdGhpcy5fZmlsdGVyQmluTG93LFxuICAgICAgICBmaWx0ZXJCaW5IaWdoOiB0aGlzLl9maWx0ZXJCaW5IaWdoLFxuICAgICAgICBmaWx0ZXJSZWdpb25Wb2x1bWU6IGZpbHRlclJlZ2lvblZvbHVtZSxcbiAgICAgICAgaXNPbjogaXNPblxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIGVhY2ggdGljayB3aXRoIHdoZXRoZXIgdGhlIHNvdW5kIGlzIGp1ZGdlZCB0byBiZSBvbiBvciBvZmYuIElmIGEgY2hhbmdlIGZyb20gb24gdG8gb2ZmIG9yIG9mZiB0byBvbiBpcyBkZXRlY3RlZCB0aGVuIHRoZSBudW1iZXIgb2YgdGlja3Mgb2YgdGhlIHNlZ21lbnQgaXMgcGFzc2VkIHRvIHRoZSBkZWNvZGVyLlxyXG4gICAgICogQGFjY2VzczogcHJpdmF0ZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJyZWNvcmRPbk9yT2ZmXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlY29yZE9uT3JPZmYoc291bmRJc09uKSB7XG4gICAgICBpZiAodGhpcy5ub3RTdGFydGVkKSB7XG4gICAgICAgIGlmICghc291bmRJc09uKSB7XG4gICAgICAgICAgLy8gd2FpdCB1bnRpbCB3ZSBoZWFyIHNvbWV0aGluZ1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm5vdFN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmxhc3RTb3VuZFdhc09uID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnRpY2tzID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5sYXN0U291bmRXYXNPbiA9PT0gc291bmRJc09uKSB7XG4gICAgICAgIC8vIGFjY3VtdWxhdGluZyBhbiBvbiBvciBhbiBvZmZcbiAgICAgICAgdGhpcy50aWNrcysrO1xuXG4gICAgICAgIGlmICh0aGlzLnRpY2tzICogdGhpcy50aW1lU3RlcCA+IHRoaXMuZmx1c2hUaW1lKSB7XG4gICAgICAgICAgLy8gdGhlbiBpdCdzIGUuZy4gYSB2ZXJ5IGxvbmcgcGF1c2UsIHNvIGZsdXNoIGl0IHRocm91Z2ggdG8gZGVjb2RlciBhbmQga2VlcCBjb3VudGluZ1xuICAgICAgICAgIHRoaXMuZmx1c2goc291bmRJc09uKTtcbiAgICAgICAgICB0aGlzLnRpY2tzID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UndmUganVzdCBjaGFuZ2VkIGZyb20gb24gdG8gb2ZmIG9yIHZpY2UgdmVyc2FcbiAgICAgICAgdGhpcy5mbHVzaCghc291bmRJc09uKTsgLy8gZmx1c2ggdGhlIHByZXZpb3VzIHNlZ21lbnRcblxuICAgICAgICB0aGlzLmxhc3RTb3VuZFdhc09uID0gc291bmRJc09uO1xuICAgICAgICB0aGlzLnRpY2tzID0gMTsgLy8gYXQgdGhpcyBtb21lbnQgd2UganVzdCBzYXcgdGhlIGZpcnN0IHRpY2sgb2YgdGhlIG5ldyBzZWdtZW50XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogRmx1c2ggdGhlIGN1cnJlbnQgdGlja3MgdG8gdGhlIGRlY29kZXIuIFBhcmFtZXRlciBpcyB3aGV0aGVyIHRoZSB0aWNrcyByZXByZXNlbnQgc291bmQgKG9uKSBvciBub3QuXHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImZsdXNoXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgdmFyIG9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB0aGlzLmxhc3RTb3VuZFdhc09uO1xuICAgICAgdGhpcy5kZWNvZGVyLmFkZFRpbWluZygob24gPyAxIDogLTEpICogdGhpcy50aWNrcyAqIHRoaXMudGltZVN0ZXApO1xuICAgIH0gLy8gZW1wdHkgY2FsbGJhY2tzIHRvIGF2b2lkIGVycm9yc1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic3BlY3Ryb2dyYW1DYWxsYmFja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzcGVjdHJvZ3JhbUNhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogXCJmcmVxdWVuY3lGaWx0ZXJDYWxsYmFja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmcmVxdWVuY3lGaWx0ZXJDYWxsYmFjaygpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwidm9sdW1lRmlsdGVyQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdm9sdW1lRmlsdGVyQ2FsbGJhY2soKSB7fVxuICB9LCB7XG4gICAga2V5OiBcInZvbHVtZVRocmVzaG9sZENhbGxiYWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHZvbHVtZVRocmVzaG9sZENhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogXCJtaWNTdWNjZXNzQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWljU3VjY2Vzc0NhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogXCJtaWNFcnJvckNhbGxiYWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1pY0Vycm9yQ2FsbGJhY2soKSB7fVxuICB9LCB7XG4gICAga2V5OiBcImZpbGVMb2FkQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZmlsZUxvYWRDYWxsYmFjaygpIHt9XG4gIH0sIHtcbiAgICBrZXk6IFwiZmlsZUVycm9yQ2FsbGJhY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZmlsZUVycm9yQ2FsbGJhY2soKSB7fVxuICB9LCB7XG4gICAga2V5OiBcIkVPRkNhbGxiYWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIEVPRkNhbGxiYWNrKCkge31cbiAgfSwge1xuICAgIGtleTogXCJ2b2x1bWVGaWx0ZXJNaW5cIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAoaXNOYU4odikpIHYgPSB0aGlzLmRlZmF1bHRzLnZvbHVtZUZpbHRlck1pbjsgLy8gdiBpcyBpbiBkQiBhbmQgdGhlcmVmb3JlIC12ZVxuXG4gICAgICB2ID0gTWF0aC5taW4oMCwgdik7XG4gICAgICB0aGlzLmFuYWx5c2VyTm9kZS5taW5EZWNpYmVscyA9IHY7XG4gICAgICB0aGlzLmFuYWx5c2VyTm9kZS5tYXhEZWNpYmVscyA9IE1hdGgubWF4KHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzLCB2KTtcbiAgICAgIHRoaXMudm9sdW1lRmlsdGVyQ2FsbGJhY2soe1xuICAgICAgICBtaW46IHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzLFxuICAgICAgICBtYXg6IHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ2b2x1bWVGaWx0ZXJNYXhcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAoaXNOYU4odikpIHYgPSB0aGlzLmRlZmF1bHRzLnZvbHVtZUZpbHRlck1heDsgLy8gdiBpcyBpbiBkQiBhbmQgdGhlcmVmb3JlIC12ZVxuXG4gICAgICB2ID0gTWF0aC5taW4oMCwgdik7XG4gICAgICB0aGlzLmFuYWx5c2VyTm9kZS5tYXhEZWNpYmVscyA9IHY7XG4gICAgICB0aGlzLmFuYWx5c2VyTm9kZS5taW5EZWNpYmVscyA9IE1hdGgubWluKHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzLCB2KTtcbiAgICAgIHRoaXMudm9sdW1lRmlsdGVyQ2FsbGJhY2soe1xuICAgICAgICBtaW46IHRoaXMuYW5hbHlzZXJOb2RlLm1pbkRlY2liZWxzLFxuICAgICAgICBtYXg6IHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5hbHlzZXJOb2RlLm1heERlY2liZWxzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJmcmVxdWVuY3lGaWx0ZXJNaW5cIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChmKSB7XG4gICAgICBpZiAoaXNOYU4oZikpIGYgPSB0aGlzLmRlZmF1bHRzLmZyZXF1ZW5jeUZpbHRlck1pbjtcbiAgICAgIGYgPSBNYXRoLm1pbihNYXRoLm1heChmLCAwKSwgdGhpcy5tYXhGcmVxKTtcbiAgICAgIHRoaXMuX2ZpbHRlckJpbkxvdyA9IE1hdGgubWluKE1hdGgubWF4KE1hdGgucm91bmQoZiAvIHRoaXMuZnJlcVN0ZXApLCAxKSwgdGhpcy5mcmVxQmlucyk7IC8vIGF0IGxlYXN0IDEgdG8gYXZvaWQgREMgY29tcG9uZW50XG5cbiAgICAgIHRoaXMuX2ZpbHRlckJpbkhpZ2ggPSBNYXRoLm1heCh0aGlzLl9maWx0ZXJCaW5Mb3csIHRoaXMuX2ZpbHRlckJpbkhpZ2gpOyAvLyBoaWdoIG11c3QgYmUgYXQgbGVhc3QgbG93XG5cbiAgICAgIHRoaXMuZnJlcXVlbmN5RmlsdGVyQ2FsbGJhY2soe1xuICAgICAgICBtaW46IHRoaXMuZnJlcXVlbmN5RmlsdGVyTWluLFxuICAgICAgICBtYXg6IHRoaXMuZnJlcXVlbmN5RmlsdGVyTWF4XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMuX2ZpbHRlckJpbkxvdyAqIHRoaXMuZnJlcVN0ZXAsIDApO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJmcmVxdWVuY3lGaWx0ZXJNYXhcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChmKSB7XG4gICAgICBpZiAoaXNOYU4oZikpIGYgPSB0aGlzLmRlZmF1bHRzLmZyZXF1ZW5jeUZpbHRlck1pbjtcbiAgICAgIGYgPSBNYXRoLm1pbihNYXRoLm1heChmLCAwKSwgdGhpcy5tYXhGcmVxKTtcbiAgICAgIHRoaXMuX2ZpbHRlckJpbkhpZ2ggPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnJvdW5kKGYgLyB0aGlzLmZyZXFTdGVwKSwgMSksIHRoaXMuZnJlcUJpbnMpOyAvLyBhdCBsZWFzdCAxIHRvIGF2b2lkIERDIGNvbXBvbmVudFxuXG4gICAgICB0aGlzLl9maWx0ZXJCaW5Mb3cgPSBNYXRoLm1pbih0aGlzLl9maWx0ZXJCaW5IaWdoLCB0aGlzLl9maWx0ZXJCaW5Mb3cpOyAvLyBsb3cgbXVzdCBiZSBhdCBtb3N0IGhpZ2hcblxuICAgICAgdGhpcy5mcmVxdWVuY3lGaWx0ZXJDYWxsYmFjayh7XG4gICAgICAgIG1pbjogdGhpcy5mcmVxdWVuY3lGaWx0ZXJNaW4sXG4gICAgICAgIG1heDogdGhpcy5mcmVxdWVuY3lGaWx0ZXJNYXhcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4odGhpcy5fZmlsdGVyQmluSGlnaCAqIHRoaXMuZnJlcVN0ZXAsIHRoaXMubWF4RnJlcSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImZyZXF1ZW5jeUZpbHRlclwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGYpIHtcbiAgICAgIC8vIHVzZSB0byB0YXJnZXQgYSBzcGVjaWZpYyBmcmVxdWVuY3lcbiAgICAgIHRoaXMuZnJlcXVlbmN5RmlsdGVyTWluID0gZjtcbiAgICAgIHRoaXMuZnJlcXVlbmN5RmlsdGVyTWF4ID0gZjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidm9sdW1lVGhyZXNob2xkXCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgLy8gdGhyZXNob2xkIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIGFuIGFubHlzZWQgcmVnaW9uIGhhcyBzdWZmaWNpZW50IHNvdW5kIHRvIGJlIFwib25cIlxuICAgICAgaWYgKGlzTmFOKHYpKSB2ID0gdGhpcy5kZWZhdWx0cy52b2x1bWVUaHJlc2hvbGQ7XG4gICAgICB0aGlzLl92b2x1bWVUaHJlc2hvbGQgPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnJvdW5kKHYpLCAwKSwgMjU1KTtcbiAgICAgIHRoaXMudm9sdW1lVGhyZXNob2xkQ2FsbGJhY2sodGhpcy5fdm9sdW1lVGhyZXNob2xkKTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZvbHVtZVRocmVzaG9sZDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTW9yc2VMaXN0ZW5lcjtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTW9yc2VMaXN0ZW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZShcImNvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLnJlcGxhY2VcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG4vKlxyXG5UaGlzIGNvZGUgaXMgwqkgQ29weXJpZ2h0IFN0ZXBoZW4gQy4gUGhpbGxpcHMsIDIwMTcuXHJcbkVtYWlsOiBzdGV2ZUBzY3BoaWxsaXBzLmNvbVxyXG5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEVVUEwsIFZlcnNpb24gMS4yIG9yIOKAkyBhcyBzb29uIHRoZXkgd2lsbCBiZSBhcHByb3ZlZCBieSB0aGUgRXVyb3BlYW4gQ29tbWlzc2lvbiAtIHN1YnNlcXVlbnQgdmVyc2lvbnMgb2YgdGhlIEVVUEwgKHRoZSBcIkxpY2VuY2VcIik7XHJcbllvdSBtYXkgbm90IHVzZSB0aGlzIHdvcmsgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5jZS5cclxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbmNlIGF0OiBodHRwczovL2pvaW51cC5lYy5ldXJvcGEuZXUvY29tbXVuaXR5L2V1cGwvXHJcblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2VuY2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuU2VlIHRoZSBMaWNlbmNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5jZS5cclxuKi9cblxuXG52YXIgX21vcnNlUHJvID0gcmVxdWlyZShcIi4vbW9yc2UtcHJvXCIpO1xuXG52YXIgTW9yc2UgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbW9yc2VQcm8pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cbi8qKlxyXG4gKiBDbGFzcyBmb3IgY29udmVuaWVudGx5IHRyYW5zbGF0aW5nIHRvIGFuZCBmcm9tIE1vcnNlIGNvZGUuXHJcbiAqIERlYWxzIHdpdGggZXJyb3IgaGFuZGxpbmcuXHJcbiAqIFdvcmtzIG91dCBpZiB0aGUgaW5wdXQgaXMgTW9yc2UgY29kZSBvciBub3QuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGltcG9ydCBNb3JzZU1lc3NhZ2UgZnJvbSAnbW9yc2UtcHJvLW1lc3NhZ2UnO1xyXG4gKiB2YXIgbW9yc2VNZXNzYWdlID0gbmV3IE1vcnNlTWVzc2FnZSgpO1xyXG4gKiB2YXIgaW5wdXQ7XHJcbiAqIHZhciBvdXRwdXQ7XHJcbiAqIHRyeSB7XHJcbiAqICAgICBvdXRwdXQgPSBtb3JzZU1lc3NhZ2UudHJhbnNsYXRlKFwiYWJjXCIpO1xyXG4gKiBjYXRjaCAoZXgpIHtcclxuICogICAgIC8vIGlucHV0IHdpbGwgaGF2ZSBlcnJvcnMgc3Vycm91bmRlZCBieSBwYWlyZWQgJyMnIHNpZ25zXHJcbiAqICAgICAvLyBvdXRwdXQgd2lsbCBiZSBiZXN0IGF0dGVtcHQgYXQgdHJhbnNsYXRpb24sIHdpdGggdW50cmFuc2xhdGFibGVzIHJlcGxhY2VkIHdpdGggJyMnXHJcbiAqICAgICBtb3JzZU1lc3NhZ2UuY2xlYXJFcnJvcigpOyAgLy8gcmVtb3ZlIGFsbCB0aGUgJyMnXHJcbiAqIH1cclxuICogaWYgKG1vcnNlTWVzc2FnZS5pbnB1dFdhc01vcnNlKSB7XHJcbiAqICAgICAvLyBkbyBzb21ldGhpbmdcclxuICogfVxyXG4gKi9cblxuXG52YXIgTW9yc2VNZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAvKipcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtwcm9zaWducz10cnVlXSAtIHdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgcHJvc2lnbnMgaW4gdGhlIHRyYW5zbGF0aW9uc1xyXG4gICAqL1xuICBmdW5jdGlvbiBNb3JzZU1lc3NhZ2UoKSB7XG4gICAgdmFyIHVzZVByb3NpZ25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB0cnVlO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1vcnNlTWVzc2FnZSk7XG5cbiAgICB0aGlzLnVzZVByb3NpZ25zID0gdXNlUHJvc2lnbnM7XG4gICAgdGhpcy5pbnB1dCA9IFwiXCI7XG4gICAgdGhpcy5vdXRwdXQgPSBcIlwiO1xuICAgIHRoaXMubW9yc2UgPSBcIlwiO1xuICAgIHRoaXMubWVzc2FnZSA9IFwiXCI7XG4gICAgdGhpcy5pbnB1dFdhc01vcnNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaGFzRXJyb3IgPSB1bmRlZmluZWQ7XG4gIH1cbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IC0gYWxwaGFudW1lcmljIHRleHQgb3IgbW9yc2UgY29kZSB0byB0cmFuc2xhdGVcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTW9yc2UgLSB3aGV0aGVyIHRoZSBpbnB1dCBpcyBNb3JzZSBjb2RlIG9yIG5vdCAoaWYgbm90IHNldCB0aGVuIHRoZSBsb29rc0xpa2VNb3JzZSBtZXRob2Qgd2lsbCBiZSB1c2VkKVxyXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1vcnNlTWVzc2FnZSwgW3tcbiAgICBrZXk6IFwidHJhbnNsYXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zbGF0ZShpbnB1dCwgaXNNb3JzZSkge1xuICAgICAgdmFyIHRyYW5zbGF0aW9uO1xuXG4gICAgICBpZiAodHlwZW9mIGlzTW9yc2UgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gbWFrZSBhIGd1ZXNzOiBjb3VsZCBiZSB3cm9uZyBpZiBzb21lb25lIHdhbnRzIHRvIHRyYW5zbGF0ZSBcIi5cIiBpbnRvIE1vcnNlIGZvciBpbnN0YW5jZVxuICAgICAgICBpc01vcnNlID0gTW9yc2UubG9va3NMaWtlTW9yc2UoaW5wdXQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNNb3JzZSkge1xuICAgICAgICB0aGlzLmlucHV0V2FzTW9yc2UgPSB0cnVlO1xuICAgICAgICB0cmFuc2xhdGlvbiA9IE1vcnNlLm1vcnNlMnRleHQoaW5wdXQsIHRoaXMudXNlUHJvc2lnbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dFdhc01vcnNlID0gZmFsc2U7XG4gICAgICAgIHRyYW5zbGF0aW9uID0gTW9yc2UudGV4dDJtb3JzZShpbnB1dCwgdGhpcy51c2VQcm9zaWducyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW9yc2UgPSB0cmFuc2xhdGlvbi5tb3JzZTtcbiAgICAgIHRoaXMubWVzc2FnZSA9IHRyYW5zbGF0aW9uLm1lc3NhZ2U7XG5cbiAgICAgIGlmICh0aGlzLmlucHV0V2FzTW9yc2UpIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IHRoaXMubW9yc2U7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5tZXNzYWdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IHRoaXMubWVzc2FnZTtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLm1vcnNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhhc0Vycm9yID0gdHJhbnNsYXRpb24uaGFzRXJyb3I7XG5cbiAgICAgIGlmICh0aGlzLmhhc0Vycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGluIGlucHV0XCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQ7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ2xlYXIgYWxsIHRoZSBlcnJvcnMgZnJvbSB0aGUgbW9yc2UgYW5kIG1lc3NhZ2UuIFVzZWZ1bCBpZiB5b3Ugd2FudCB0byBwbGF5IHRoZSBzb3VuZCBldmVuIHRob3VnaCBpdCBkaWRuJ3QgdHJhbnNsYXRlLlxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjbGVhckVycm9yXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyRXJyb3IoKSB7XG4gICAgICBpZiAodGhpcy5pbnB1dFdhc01vcnNlKSB7XG4gICAgICAgIHRoaXMubW9yc2UgPSB0aGlzLm1vcnNlLnJlcGxhY2UoLyMvZywgXCJcIik7IC8vIGxlYXZlIGluIHRoZSBiYWQgTW9yc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IHRoaXMubWVzc2FnZS5yZXBsYWNlKC8jW14jXSo/Iy9nLCBcIlwiKTtcbiAgICAgICAgdGhpcy5tb3JzZSA9IHRoaXMubW9yc2UucmVwbGFjZSgvIy9nLCBcIlwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5oYXNFcnJvciA9IGZhbHNlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNb3JzZU1lc3NhZ2U7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE1vcnNlTWVzc2FnZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cbi8qXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxNy5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogV2ViIGJyb3dzZXIgc291bmQgcGxheWVyIHVzaW5nIFdlYiBBdWRpbyBBUEkuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGltcG9ydCBNb3JzZUNXV2F2ZSBmcm9tICdtb3JzZS1wcm8tY3ctd2F2ZSc7XHJcbiAqIGltcG9ydCBNb3JzZVBsYXllcldBQSBmcm9tICdtb3JzZS1wcm8tcGxheWVyLXdhYSc7XHJcbiAqIHZhciBtb3JzZUNXV2F2ZSA9IG5ldyBNb3JzZUNXV2F2ZSgpO1xyXG4gKiBtb3JzZUNXV2F2ZS50cmFuc2xhdGUoXCJhYmNcIik7XHJcbiAqIHZhciBtb3JzZVBsYXllcldBQSA9IG5ldyBNb3JzZVBsYXllcldBQSgpO1xyXG4gKiBtb3JzZVBsYXllcldBQS5sb2FkQ1dXYXZlKG1vcnNlQ1dXYXZlKTtcclxuICogbW9yc2VQbGF5ZXJXQUEucGxheUZyb21TdGFydCgpO1xyXG4gKi9cblxuXG52YXIgTW9yc2VQbGF5ZXJXQUEgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1vcnNlUGxheWVyV0FBKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb3JzZVBsYXllcldBQSk7XG5cbiAgICBjb25zb2xlLmxvZyhcIlRyeWluZyBXZWIgQXVkaW8gQVBJIChPc2NpbGxhdG9ycylcIik7XG4gICAgdGhpcy5hdWRpb0NvbnRleHRDbGFzcyA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmF1ZGlvQ29udGV4dENsYXNzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubm9BdWRpbyA9IHRydWU7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBBdWRpb0NvbnRleHQgY2xhc3MgZGVmaW5lZFwiKTtcbiAgICB9XG5cbiAgICB0aGlzLmlzUGxheWluZ0IgPSBmYWxzZTtcbiAgICB0aGlzLm5vQXVkaW8gPSBmYWxzZTtcbiAgICB0aGlzLl92b2x1bWUgPSAxO1xuICAgIHRoaXMudGltaW5ncyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IHVuZGVmaW5lZDtcbiAgfVxuICAvKipcclxuICAgKiBAYWNjZXNzOiBwcml2YXRlXHJcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTW9yc2VQbGF5ZXJXQUEsIFt7XG4gICAga2V5OiBcImluaXRpYWxpc2VBdWRpb05vZGVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXRpYWxpc2VBdWRpb05vZGVzKCkge1xuICAgICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgdGhpcy5hdWRpb0NvbnRleHRDbGFzcygpO1xuICAgICAgdGhpcy5zcGxpdHRlck5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7IC8vIHRoaXMgaXMgaGVyZSB0byBhdHRhY2ggb3RoZXIgbm9kZXMgdG8gaW4gc3ViY2xhc3NcblxuICAgICAgdGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTsgLy8gdGhpcyBpcyBhY3R1YWxseSB1c2VkIGZvciB2b2x1bWVcblxuICAgICAgdGhpcy5zcGxpdHRlck5vZGUuY29ubmVjdCh0aGlzLmdhaW5Ob2RlKTtcbiAgICAgIHRoaXMuZ2Fpbk5vZGUuY29ubmVjdCh0aGlzLmF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSB0aGlzLl92b2x1bWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInN0b3BcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIGlmICh0aGlzLmlzUGxheWluZ0IpIHtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmdCID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXVkaW9Db250ZXh0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIGhlbHAgcGxheWluZyBkaXJlY3RseSBmcm9tIGEgTW9yc2VDV1dhdmUgaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY3dXYXZlIC0gYSBNb3JzZUNXV2F2ZSBpbnN0YW5jZVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJsb2FkQ1dXYXZlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRDV1dhdmUoY3dXYXZlKSB7XG4gICAgICB0aGlzLmxvYWQoY3dXYXZlLmdldFRpbWluZ3MoKSwgY3dXYXZlLmZyZXF1ZW5jeSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImxvYWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZCh0aW1pbmdzLCBmcmVxdWVuY3kpIHtcbiAgICAgIHRoaXMudGltaW5ncyA9IHRpbWluZ3M7XG4gICAgICB0aGlzLmZyZXF1ZW5jeSA9IGZyZXF1ZW5jeTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicGxheUZyb21TdGFydFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5RnJvbVN0YXJ0KCkge1xuICAgICAgaWYgKHRoaXMubm9BdWRpbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgICBpZiAodGhpcy50aW1pbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5pdGlhbGlzZUF1ZGlvTm9kZXMoKTtcbiAgICAgIHRoaXMuaXNQbGF5aW5nQiA9IHRydWU7XG4gICAgICB2YXIgY3VtVCA9IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRoaXMudGltaW5ncy5sZW5ndGg7IHQgKz0gMSkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSB0aGlzLnRpbWluZ3NbdF0gLyAxMDAwO1xuXG4gICAgICAgIGlmIChkdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICB2YXIgb3NjaWxsYXRvciA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICAgICAgICBvc2NpbGxhdG9yLnR5cGUgPSAnc2luZSc7XG4gICAgICAgICAgb3NjaWxsYXRvci5mcmVxdWVuY3kudmFsdWUgPSB0aGlzLmZyZXF1ZW5jeTtcbiAgICAgICAgICBvc2NpbGxhdG9yLmNvbm5lY3QodGhpcy5zcGxpdHRlck5vZGUpO1xuICAgICAgICAgIG9zY2lsbGF0b3Iuc3RhcnQoY3VtVCk7XG4gICAgICAgICAgb3NjaWxsYXRvci5zdG9wKGN1bVQgKyBkdXJhdGlvbik7XG4gICAgICAgICAgY3VtVCArPSBkdXJhdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdW1UICs9IC1kdXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYXNFcnJvclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNFcnJvcigpIHtcbiAgICAgIHJldHVybiB0aGlzLm5vQXVkaW87XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImlzUGxheWluZ1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpc1BsYXlpbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc1BsYXlpbmdCO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRBdWRpb1R5cGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0QXVkaW9UeXBlKCkge1xuICAgICAgcmV0dXJuIDQ7IC8vIDQ6IFdlYiBBdWRpbyBBUEkgdXNpbmcgb3NjaWxsYXRvcnNcbiAgICAgIC8vIDM6IEF1ZGlvIGVsZW1lbnQgdXNpbmcgbWVkaWEgc3RyZWFtIHdvcmtlciAodXNpbmcgUENNIGF1ZGlvIGRhdGEpXG4gICAgICAvLyAyOiBGbGFzaCAodXNpbmcgUENNIGF1ZGlvIGRhdGEpXG4gICAgICAvLyAxOiBXZWIgQXVkaW8gQVBJIHdpdGggd2Via2l0IGFuZCBuYXRpdmUgc3VwcG9ydCAodXNpbmcgUENNIGF1ZGlvIGRhdGEpXG4gICAgICAvLyAwOiBBdWRpbyBlbGVtZW50IHVzaW5nIE1vemlsbGEgQXVkaW8gRGF0YSBBUEkgKGh0dHBzOi8vd2lraS5tb3ppbGxhLm9yZy9BdWRpb19EYXRhX0FQSSkgKHVzaW5nIFBDTSBhdWRpbyBkYXRhKVxuICAgICAgLy8gLTE6IG5vIGF1ZGlvIHN1cHBvcnRcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidm9sdW1lXCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgdGhpcy5fdm9sdW1lID0gdjtcbiAgICAgIHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHY7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl92b2x1bWU7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1vcnNlUGxheWVyV0FBO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNb3JzZVBsYXllcldBQTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGl0TGVuZ3RoID0gZGl0TGVuZ3RoO1xuZXhwb3J0cy53cG0gPSB3cG07XG5leHBvcnRzLmZkaXRMZW5ndGggPSBmZGl0TGVuZ3RoO1xuZXhwb3J0cy5yYXRpbyA9IHJhdGlvO1xuZXhwb3J0cy5md3BtID0gZndwbTtcbi8qXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxNy5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogVXNlZnVsIGNvbnN0YW50cyBhbmQgZnVuY3Rpb25zIGZvciBjb21wdXRpbmcgdGhlIHNwZWVkIG9mIE1vcnNlIGNvZGUuXHJcbiAqL1xuXG52YXIgRElUU19QRVJfV09SRCA9IDUwO1xuLyoqIGRpdHMgaW4gXCJQQVJJUyBcIiAqL1xuXG52YXIgU1BBQ0VTX0lOX1BBUklTID0gMTk7XG4vKiogNXggMy1kaXQgaW50ZXItY2hhcmFjdGVyIHNwYWNlcyArIDF4IDctZGl0IHNwYWNlICovXG5cbnZhciBNU19JTl9NSU5VVEUgPSA2MDAwMDtcbi8qKiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGluIDEgbWludXRlICovXG5cbi8qKiBHZXQgdGhlIGRpdCBsZW5ndGggaW4gbXMgZm9yIGEgZ2l2ZW4gV1BNICovXG5cbmZ1bmN0aW9uIGRpdExlbmd0aCh3cG0pIHtcbiAgcmV0dXJuIE1TX0lOX01JTlVURSAvIERJVFNfUEVSX1dPUkQgLyB3cG07XG59XG4vKiogR2V0IHRoZSBXUE0gZm9yIGEgZ2l2ZW4gZGl0IGxlbmd0aCBpbiBtcyAqL1xuXG5cbmZ1bmN0aW9uIHdwbShkaXRMZW4pIHtcbiAgcmV0dXJuIE1TX0lOX01JTlVURSAvIERJVFNfUEVSX1dPUkQgLyBkaXRMZW47XG59XG4vKiogR2V0IHRoZSBGYXJuc3dvcnRoIGRpdCBsZW5ndGggaW4gbXMgZm9yIGEgZ2l2ZW4gV1BNIGFuZCBGYXJuc3dvcnRoIFdQTSAqL1xuXG5cbmZ1bmN0aW9uIGZkaXRMZW5ndGgod3BtLCBmd3BtKSB7XG4gIHJldHVybiBkaXRMZW5ndGgod3BtKSAqIHJhdGlvKHdwbSwgZndwbSk7XG59XG4vKiogR2V0IHRoZSBkaXQgbGVuZ3RoIHJhdGlvIGZvciBhIGdpdmVuIFdQTSBhbmQgRmFybnN3b3J0aCBXUE0gKi9cblxuXG5mdW5jdGlvbiByYXRpbyh3cG0sIGZ3cG0pIHtcbiAgLy8gXCJQQVJJUyBcIiBpcyAzMSB1bml0cyBmb3IgdGhlIGNoYXJhY3RlcnMgYW5kIDE5IHVuaXRzIGZvciB0aGUgaW50ZXItY2hhcmFjdGVyIHNwYWNlcyBhbmQgaW50ZXItd29yZCBzcGFjZVxuICAvLyBPbmUgdW5pdCB0YWtlcyAxICogNjAgLyAoNTAgKiB3cG0pXG4gIC8vIFRoZSAzMSB1bml0cyBzaG91bGQgdGFrZSAzMSAqIDYwIC8gKDUwICogd3BtKSAgc2Vjb25kcyBhdCB3cG1cbiAgLy8gUEFSSVMgc2hvdWxkIHRha2UgNTAgKiA2MCAvICg1MCAqIGZwbSkgdG8gdHJhbnNtaXQgYXQgZnBtLCBvciA2MCAvIGZ3cG0gIHNlY29uZHMgYXQgZndwbVxuICAvLyBLZWVwaW5nIHRoZSB0aW1lIGZvciB0aGUgY2hhcmFjdGVycyBjb25zdGFudCxcbiAgLy8gVGhlIHNwYWNlcyBuZWVkIHRvIHRha2U6ICg2MCAvIGZ3cG0pIC0gWzMxICogNjAgLyAoNTAgKiB3cG0pXSBzZWNvbmRzIGluIHRvdGFsXG4gIC8vIFRoZSBzcGFjZXMgYXJlIDQgaW50ZXItY2hhcmFjdGVyIHNwYWNlcyBvZiAzIHVuaXRzIGFuZCAxIGludGVyLXdvcmQgc3BhY2Ugb2YgNyB1bml0cy4gVGhlaXIgcmF0aW8gbXVzdCBiZSBtYWludGFpbmVkLlxuICAvLyBBIHNwYWNlIHVuaXQgaXM6IFsoNjAgLyBmd3BtKSAtIFszMSAqIDYwIC8gKDUwICogd3BtKV1dIC8gMTkgc2Vjb25kc1xuICAvLyBDb21wYXJpbmcgdGhhdCB0byAgNjAgLyAoNTAgKiB3cG0pICBnaXZlcyBhIHJhdGlvIG9mICg1MC53cG0gLSAzMS5md3BtKSAvIDE5LmZ3cG1cbiAgcmV0dXJuIChESVRTX1BFUl9XT1JEICogd3BtIC0gKERJVFNfUEVSX1dPUkQgLSBTUEFDRVNfSU5fUEFSSVMpICogZndwbSkgLyAoU1BBQ0VTX0lOX1BBUklTICogZndwbSk7XG59XG4vKiogR2V0IHRoZSBGYXJuc3dvcnRoIFdQTSBmb3IgYSBnaXZlbiBXUE0gYW5kIHJhdGlvICovXG5cblxuZnVuY3Rpb24gZndwbSh3cG0sIHIpIHtcbiAgcmV0dXJuIERJVFNfUEVSX1dPUkQgKiB3cG0gLyAoU1BBQ0VTX0lOX1BBUklTICogciArIChESVRTX1BFUl9XT1JEIC0gU1BBQ0VTX0lOX1BBUklTKSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAuc3BsaXRcIik7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5tYXRjaFwiKTtcblxucmVxdWlyZShcImNvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLnJlcGxhY2VcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnRleHQybW9yc2UgPSB0ZXh0Mm1vcnNlO1xuZXhwb3J0cy50ZXh0MmRpdGRhaCA9IHRleHQyZGl0ZGFoO1xuZXhwb3J0cy5tb3JzZTJ0ZXh0ID0gbW9yc2UydGV4dDtcbmV4cG9ydHMubG9va3NMaWtlTW9yc2UgPSBsb29rc0xpa2VNb3JzZTtcbi8qXHJcblRoaXMgY29kZSBpcyDCqSBDb3B5cmlnaHQgU3RlcGhlbiBDLiBQaGlsbGlwcywgMjAxNy5cclxuRW1haWw6IHN0ZXZlQHNjcGhpbGxpcHMuY29tXHJcblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgRVVQTCwgVmVyc2lvbiAxLjIgb3Ig4oCTIGFzIHNvb24gdGhleSB3aWxsIGJlIGFwcHJvdmVkIGJ5IHRoZSBFdXJvcGVhbiBDb21taXNzaW9uIC0gc3Vic2VxdWVudCB2ZXJzaW9ucyBvZiB0aGUgRVVQTCAodGhlIFwiTGljZW5jZVwiKTtcclxuWW91IG1heSBub3QgdXNlIHRoaXMgd29yayBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbmNlLlxyXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2VuY2UgYXQ6IGh0dHBzOi8vam9pbnVwLmVjLmV1cm9wYS5ldS9jb21tdW5pdHkvZXVwbC9cclxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5jZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG5TZWUgdGhlIExpY2VuY2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbmNlLlxyXG4qL1xuXG4vKipcclxuICogQmFzaWMgbWV0aG9kcyB0byB0cmFuc2xhdGUgTW9yc2UgY29kZS5cclxuICovXG5cbmlmICh0eXBlb2YgU3RyaW5nLnByb3RvdHlwZS50cmltID09PSBcInVuZGVmaW5lZFwiKSB7XG4gIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gU3RyaW5nKHRoaXMpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgfTtcbn1cblxudmFyIHRleHQybW9yc2VIID0ge1xuICAnQSc6IFwiLi1cIixcbiAgJ0InOiBcIi0uLi5cIixcbiAgJ0MnOiBcIi0uLS5cIixcbiAgJ0QnOiBcIi0uLlwiLFxuICAnRSc6IFwiLlwiLFxuICAnRic6IFwiLi4tLlwiLFxuICAnRyc6IFwiLS0uXCIsXG4gICdIJzogXCIuLi4uXCIsXG4gICdJJzogXCIuLlwiLFxuICAnSic6IFwiLi0tLVwiLFxuICAnSyc6IFwiLS4tXCIsXG4gICdMJzogXCIuLS4uXCIsXG4gICdNJzogXCItLVwiLFxuICAnTic6IFwiLS5cIixcbiAgJ08nOiBcIi0tLVwiLFxuICAnUCc6IFwiLi0tLlwiLFxuICAnUSc6IFwiLS0uLVwiLFxuICAnUic6IFwiLi0uXCIsXG4gICdTJzogXCIuLi5cIixcbiAgJ1QnOiBcIi1cIixcbiAgJ1UnOiBcIi4uLVwiLFxuICAnVic6IFwiLi4uLVwiLFxuICAnVyc6IFwiLi0tXCIsXG4gICdYJzogXCItLi4tXCIsXG4gICdZJzogXCItLi0tXCIsXG4gICdaJzogXCItLS4uXCIsXG4gICcxJzogXCIuLS0tLVwiLFxuICAnMic6IFwiLi4tLS1cIixcbiAgJzMnOiBcIi4uLi0tXCIsXG4gICc0JzogXCIuLi4uLVwiLFxuICAnNSc6IFwiLi4uLi5cIixcbiAgJzYnOiBcIi0uLi4uXCIsXG4gICc3JzogXCItLS4uLlwiLFxuICAnOCc6IFwiLS0tLi5cIixcbiAgJzknOiBcIi0tLS0uXCIsXG4gICcwJzogXCItLS0tLVwiLFxuICAnLic6IFwiLi0uLS4tXCIsXG4gICcsJzogXCItLS4uLS1cIixcbiAgJzonOiBcIi0tLS4uLlwiLFxuICAnPyc6IFwiLi4tLS4uXCIsXG4gICdcXCcnOiBcIi4tLS0tLlwiLFxuICAnLSc6IFwiLS4uLi4tXCIsXG4gICcvJzogXCItLi4tLlwiLFxuICAnKCc6IFwiLS4tLS4tXCIsXG4gICcpJzogXCItLi0tLi1cIixcbiAgJ1wiJzogXCIuLS4uLS5cIixcbiAgJ0AnOiBcIi4tLS4tLlwiLFxuICAnPSc6IFwiLS4uLi1cIixcbiAgJyAnOiBcIi9cIiAvL05vdCBtb3JzZSBidXQgaGVscHMgdHJhbnNsYXRpb25cblxufTtcbnZhciBtb3JzZTJ0ZXh0SCA9IHt9O1xudmFyIHByb3NpZ24ybW9yc2VIID0ge1xuICAnPEFBPic6ICcuLS4tJyxcbiAgJzxBUj4nOiAnLi0uLS4nLFxuICAnPEFTPic6ICcuLS4uLicsXG4gICc8Qks+JzogJy0uLi4tLi0nLFxuICAnPEJUPic6ICctLi4uLScsXG4gIC8vIGFsc28gPFRWPlxuICAnPENMPic6ICctLi0uLi0uLicsXG4gICc8Q1Q+JzogJy0uLS4tJyxcbiAgJzxETz4nOiAnLS4uLS0tJyxcbiAgJzxLTj4nOiAnLS4tLS4nLFxuICAnPFNLPic6ICcuLi4tLi0nLFxuICAvLyBhbHNvIDxWQT5cbiAgJzxWQT4nOiAnLi4uLS4tJyxcbiAgJzxTTj4nOiAnLi4uLS4nLFxuICAvLyBhbHNvIDxWRT5cbiAgJzxWRT4nOiAnLi4uLS4nLFxuICAnPFNPUz4nOiAnLi4uLS0tLi4uJ1xufTtcbnZhciBtb3JzZXBybzJ0ZXh0SCA9IHt9O1xudmFyIHRleHQybW9yc2Vwcm9IID0ge307XG5cbmZvciAodmFyIHRleHQgaW4gdGV4dDJtb3JzZUgpIHtcbiAgdGV4dDJtb3JzZXByb0hbdGV4dF0gPSB0ZXh0Mm1vcnNlSFt0ZXh0XTtcbiAgbW9yc2UydGV4dEhbdGV4dDJtb3JzZUhbdGV4dF1dID0gdGV4dDtcbiAgbW9yc2Vwcm8ydGV4dEhbdGV4dDJtb3JzZUhbdGV4dF1dID0gdGV4dDtcbn1cblxuZm9yICh2YXIgc2lnbiBpbiBwcm9zaWduMm1vcnNlSCkge1xuICB0ZXh0Mm1vcnNlcHJvSFtzaWduXSA9IHByb3NpZ24ybW9yc2VIW3NpZ25dO1xuICBtb3JzZXBybzJ0ZXh0SFtwcm9zaWduMm1vcnNlSFtzaWduXV0gPSBzaWduO1xufVxuXG52YXIgdGlkeVRleHQgPSBmdW5jdGlvbiB0aWR5VGV4dCh0ZXh0KSB7XG4gIHRleHQgPSB0ZXh0LnRvVXBwZXJDYXNlKCk7XG4gIHRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICByZXR1cm4gdGV4dDtcbn07XG4vKipcclxuICogVHJhbnNsYXRlIHRleHQgdG8gbW9yc2UgaW4gJy4uLSAuLiAvIC0tJyBmb3JtLlxyXG4gKiBJZiBzb21ldGhpbmcgaW4gdGhlIHRleHQgaXMgdW50cmFuc2xhdGFibGUgdGhlbiBpdCBpcyBzdXJyb3VuZGVkIGJ5IGhhc2gtc2lnbnMgKCcjJykgYW5kIGEgaGFzaCBpcyBwbGFjZWQgaW4gdGhlIG1vcnNlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIGFscGhhbnVtZXJpYyBtZXNzYWdlXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlUHJvc2lnbnMgLSB0cnVlIGlmIHByb3NpZ25zIGFyZSB0byBiZSB1c2VkIChkZWZhdWx0IGlzIHRydWUpXHJcbiAqIEByZXR1cm4ge3ttZXNzYWdlOiBzdHJpbmcsIG1vcnNlOiBzdHJpbmcsIGhhc0Vycm9yOiBib29sZWFufX1cclxuICovXG5cblxuZnVuY3Rpb24gdGV4dDJtb3JzZSh0ZXh0KSB7XG4gIHZhciB1c2VQcm9zaWducyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdHJ1ZTtcbiAgdGV4dCA9IHRpZHlUZXh0KHRleHQpO1xuICB2YXIgcmV0ID0ge1xuICAgIG1vcnNlOiBcIlwiLFxuICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgaGFzRXJyb3I6IGZhbHNlXG4gIH07XG5cbiAgaWYgKHRleHQgPT09IFwiXCIpIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgdmFyIHRva2VucyA9IFtdO1xuICB2YXIgcHJvc2lnbjtcbiAgdmFyIHRva2VuX2xlbmd0aDtcblxuICB3aGlsZSAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgdG9rZW5fbGVuZ3RoID0gMTtcblxuICAgIGlmICh1c2VQcm9zaWducykge1xuICAgICAgcHJvc2lnbiA9IHRleHQubWF0Y2goL148Li4uPz4vKTsgLy8gYXJyYXkgb2YgbWF0Y2hlc1xuXG4gICAgICBpZiAocHJvc2lnbikge1xuICAgICAgICB0b2tlbl9sZW5ndGggPSBwcm9zaWduWzBdLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0b2tlbnMucHVzaCh0ZXh0LnNsaWNlKDAsIHRva2VuX2xlbmd0aCkpO1xuICAgIHRleHQgPSB0ZXh0LnNsaWNlKHRva2VuX2xlbmd0aCwgdGV4dC5sZW5ndGgpO1xuICB9XG5cbiAgdmFyIGRpY3Q7XG5cbiAgaWYgKHVzZVByb3NpZ25zKSB7XG4gICAgZGljdCA9IHRleHQybW9yc2Vwcm9IO1xuICB9IGVsc2Uge1xuICAgIGRpY3QgPSB0ZXh0Mm1vcnNlSDtcbiAgfVxuXG4gIHZhciBpLCBjLCB0O1xuXG4gIGZvciAoaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB0ID0gdG9rZW5zW2ldO1xuICAgIGMgPSBkaWN0W3RdO1xuXG4gICAgaWYgKGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0Lm1lc3NhZ2UgKz0gXCIjXCIgKyB0ICsgXCIjXCI7XG4gICAgICByZXQubW9yc2UgKz0gXCIjIFwiO1xuICAgICAgcmV0Lmhhc0Vycm9yID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0Lm1lc3NhZ2UgKz0gdDtcbiAgICAgIHJldC5tb3JzZSArPSBjICsgXCIgXCI7XG4gICAgfVxuICB9XG5cbiAgcmV0Lm1vcnNlID0gcmV0Lm1vcnNlLnNsaWNlKDAsIHJldC5tb3JzZS5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHJldDtcbn1cbi8qKlxyXG4gKiBUcmFuc2xhdGUgdGV4dCB0byBtb3JzZSBpbiAnRGktZGktZGFoIGRhaC4nIGZvcm0uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gYWxwaGFudW1lcmljIG1lc3NhZ2VcclxuICogQHBhcmFtIHtCb29sZWFufSB1c2VQcm9zaWducyAtIHRydWUgaWYgcHJvc2lnbnMgYXJlIHRvIGJlIHVzZWQgKGRlZmF1bHQgaXMgdHJ1ZSlcclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cblxuXG5mdW5jdGlvbiB0ZXh0MmRpdGRhaCh0ZXh0LCB1c2VQcm9zaWducykge1xuICAvLyBUT0RPOiBkZWFsIHdpdGggZXJyb3JzIGluIHRoZSB0cmFuc2xhdGlvblxuICB2YXIgZGl0ZGFoID0gdGV4dDJtb3JzZSh0ZXh0LCB1c2VQcm9zaWducykubW9yc2UgKyAnICc7IC8vIGdldCB0aGUgZG90cyBhbmQgZGFzaGVzXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoL1xcLi9nLCAnZGl+JykucmVwbGFjZSgvXFwtL2csICdkYWh+Jyk7IC8vIGRvIHRoZSBiYXNpYyBqb2JcblxuICBkaXRkYWggPSBkaXRkYWgucmVwbGFjZSgvfi9nLCAnLScpOyAvLyByZXBsYWNlIHBsYWNlaG9sZGVyIHdpdGggZGFzaFxuXG4gIGRpdGRhaCA9IGRpdGRhaC5yZXBsYWNlKC9cXC0gL2csICcgJyk7IC8vIHJlbW92ZSB0cmFpbGluZyBkYXNoZXNcblxuICBkaXRkYWggPSBkaXRkYWgucmVwbGFjZSgvZGkgL2csICdkaXQgJyk7IC8vIHVzZSAnZGl0JyBhdCBlbmQgb2YgbGV0dGVyXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoLyBcXC8gL2csICcsICcpOyAvLyBkbyBwdW5jdHVhdGlvblxuXG4gIGRpdGRhaCA9IGRpdGRhaC5yZXBsYWNlKC9eZC8sICdEJyk7IC8vIGRvIGNhcGl0YWxpc2F0aW9uXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoLyAkLywgJycpOyAvLyByZW1vdmUgdGhlIHNwYWNlIHdlIGFkZGVkXG5cbiAgZGl0ZGFoID0gZGl0ZGFoLnJlcGxhY2UoLyhbdGhdKSQvLCAnJDEuJyk7IC8vIGFkZCBmdWxsLXN0b3AgaWYgdGhlcmUgaXMgYW55dGhpbmcgdGhlcmVcblxuICByZXR1cm4gZGl0ZGFoO1xufVxuXG52YXIgdGlkeU1vcnNlID0gZnVuY3Rpb24gdGlkeU1vcnNlKG1vcnNlKSB7XG4gIG1vcnNlID0gbW9yc2UudHJpbSgpO1xuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoL1xcfC9nLCBcIi9cIik7IC8vIHVuaWZ5IHRoZSB3b3JkIHNlcGFyYXRvclxuXG4gIG1vcnNlID0gbW9yc2UucmVwbGFjZSgvXFwvL2csIFwiIC8gXCIpOyAvLyBtYWtlIHN1cmUgd29yZCBzZXBhcmF0b3JzIGFyZSBzcGFjZWQgb3V0XG5cbiAgbW9yc2UgPSBtb3JzZS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKTsgLy8gc3F1YXNoIG11bHRpcGxlIHNwYWNlcyBpbnRvIHNpbmdsZSBzcGFjZXNcblxuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoLyhcXC8gKStcXC8vZywgXCIvXCIpOyAvLyBzcXVhc2ggbXVsdGlwbGUgd29yZCBzZXBhcmF0b3JzXG4gIC8vbW9yc2UgPSBtb3JzZS5yZXBsYWNlKC9eIFxcLyAvLCBcIlwiKTsgIC8vIHJlbW92ZSBpbml0aWFsIHdvcmQgc2VwYXJhdG9yc1xuICAvL21vcnNlID0gbW9yc2UucmVwbGFjZSgvIFxcLyAkLywgXCJcIik7ICAvLyByZW1vdmUgdHJhaWxpbmcgd29yZCBzZXBhcmF0b3JzXG5cbiAgbW9yc2UgPSBtb3JzZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpO1xuICBtb3JzZSA9IG1vcnNlLnJlcGxhY2UoL1xccyskLywgXCJcIik7XG4gIG1vcnNlID0gbW9yc2UucmVwbGFjZSgvXy9nLCBcIi1cIik7IC8vIHVuaWZ5IHRoZSBkYXNoIGNoYXJhY3RlclxuXG4gIHJldHVybiBtb3JzZTtcbn07XG4vKipcclxuICogVHJhbnNsYXRlIG1vcnNlIHRvIHRleHQuXHJcbiAqIElmIHNvbWV0aGluZyBpbiB0aGUgbW9yc2UgaXMgdW50cmFuc2xhdGFibGUgdGhlbiBpdCBpcyBzdXJyb3VuZGVkIGJ5IGhhc2gtc2lnbnMgKCcjJykgYW5kIGEgaGFzaCBpcyBwbGFjZWQgaW4gdGhlIHRleHQuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb3JzZSAtIG1vcnNlIG1lc3NhZ2UgdXNpbmcgWy4tXy98XSBjaGFyYWN0ZXJzXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlUHJvc2lnbnMgLSB0cnVlIGlmIHByb3NpZ25zIGFyZSB0byBiZSB1c2VkIChkZWZhdWx0IGlzIHRydWUpXHJcbiAqIEByZXR1cm4ge3ttZXNzYWdlOiBzdHJpbmcsIG1vcnNlOiBzdHJpbmcsIGhhc0Vycm9yOiBib29sZWFufX1cclxuICovXG5cblxuZnVuY3Rpb24gbW9yc2UydGV4dChtb3JzZSkge1xuICB2YXIgdXNlUHJvc2lnbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRydWU7XG4gIG1vcnNlID0gdGlkeU1vcnNlKG1vcnNlKTtcbiAgdmFyIHJldCA9IHtcbiAgICBtb3JzZTogXCJcIixcbiAgICBtZXNzYWdlOiBcIlwiLFxuICAgIGhhc0Vycm9yOiBmYWxzZVxuICB9O1xuXG4gIGlmIChtb3JzZSA9PT0gXCJcIikge1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICB2YXIgdG9rZW5zID0gbW9yc2Uuc3BsaXQoXCIgXCIpO1xuICB2YXIgZGljdDtcblxuICBpZiAodXNlUHJvc2lnbnMpIHtcbiAgICBkaWN0ID0gbW9yc2Vwcm8ydGV4dEg7XG4gIH0gZWxzZSB7XG4gICAgZGljdCA9IG1vcnNlMnRleHRIO1xuICB9XG5cbiAgdmFyIGMsIHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB0ID0gdG9rZW5zW2ldO1xuICAgIGMgPSBkaWN0W3RdO1xuXG4gICAgaWYgKGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0Lm1vcnNlICs9IFwiI1wiICsgdCArIFwiIyBcIjtcbiAgICAgIHJldC5tZXNzYWdlICs9IFwiI1wiO1xuICAgICAgcmV0Lmhhc0Vycm9yID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0Lm1vcnNlICs9IHQgKyBcIiBcIjtcbiAgICAgIHJldC5tZXNzYWdlICs9IGM7XG4gICAgfVxuICB9XG5cbiAgcmV0Lm1vcnNlID0gcmV0Lm1vcnNlLnNsaWNlKDAsIHJldC5tb3JzZS5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHJldDtcbn1cbi8qKlxyXG4gKiBEZXRlcm1pbmUgd2hldGhlciBhIHN0cmluZyBpcyBtb3N0IGxpa2VseSBtb3JzZSBjb2RlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgLSB0aGUgdGV4dFxyXG4gKiBAcmV0dXJuIHtib29sZWFufSAtIHRydWUgaWYgdGhlIHN0cmluZyBvbmx5IGNvbnRhaW5zIFsuLV98L11cclxuICovXG5cblxuZnVuY3Rpb24gbG9va3NMaWtlTW9yc2UoaW5wdXQpIHtcbiAgaW5wdXQgPSB0aWR5TW9yc2UoaW5wdXQpO1xuXG4gIGlmIChpbnB1dC5tYXRjaCgvXlsgLy4tXSokLykpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYXQgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuIC8vIGBBZHZhbmNlU3RyaW5nSW5kZXhgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYWR2YW5jZXN0cmluZ2luZGV4XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChTLCBpbmRleCwgdW5pY29kZSkge1xuICByZXR1cm4gaW5kZXggKyAodW5pY29kZSA/IGF0KFMsIGluZGV4KS5sZW5ndGggOiAxKTtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuLy8gRVMzIHdyb25nIGhlcmVcbnZhciBBUkcgPSBjb2YoZnVuY3Rpb24gKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG4vLyBmYWxsYmFjayBmb3IgSUUxMSBTY3JpcHQgQWNjZXNzIERlbmllZCBlcnJvclxudmFyIHRyeUdldCA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gdHJ5R2V0KE8gPSBPYmplY3QoaXQpLCBUQUcpKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG4iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi42LjEnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbi8vIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnIGluIG9sZCBJRVxudmFyIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbiAodHlwZSwgbmFtZSwgc291cmNlKSB7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GO1xuICB2YXIgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuRztcbiAgdmFyIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlM7XG4gIHZhciBJU19QUk9UTyA9IHR5cGUgJiAkZXhwb3J0LlA7XG4gIHZhciBJU19CSU5EID0gdHlwZSAmICRleHBvcnQuQjtcbiAgdmFyIHRhcmdldCA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSk7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHA7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmICh0YXJnZXQpIHJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQsIHR5cGUgJiAkZXhwb3J0LlUpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmIChleHBvcnRzW2tleV0gIT0gb3V0KSBoaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZiAoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpIGV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5yZXF1aXJlKCcuL2VzNi5yZWdleHAuZXhlYycpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xudmFyIHdrcyA9IHJlcXVpcmUoJy4vX3drcycpO1xudmFyIHJlZ2V4cEV4ZWMgPSByZXF1aXJlKCcuL19yZWdleHAtZXhlYycpO1xuXG52YXIgU1BFQ0lFUyA9IHdrcygnc3BlY2llcycpO1xuXG52YXIgUkVQTEFDRV9TVVBQT1JUU19OQU1FRF9HUk9VUFMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyAjcmVwbGFjZSBuZWVkcyBidWlsdC1pbiBzdXBwb3J0IGZvciBuYW1lZCBncm91cHMuXG4gIC8vICNtYXRjaCB3b3JrcyBmaW5lIGJlY2F1c2UgaXQganVzdCByZXR1cm4gdGhlIGV4ZWMgcmVzdWx0cywgZXZlbiBpZiBpdCBoYXNcbiAgLy8gYSBcImdyb3BzXCIgcHJvcGVydHkuXG4gIHZhciByZSA9IC8uLztcbiAgcmUuZXhlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgcmVzdWx0Lmdyb3VwcyA9IHsgYTogJzcnIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcmV0dXJuICcnLnJlcGxhY2UocmUsICckPGE+JykgIT09ICc3Jztcbn0pO1xuXG52YXIgU1BMSVRfV09SS1NfV0lUSF9PVkVSV1JJVFRFTl9FWEVDID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gQ2hyb21lIDUxIGhhcyBhIGJ1Z2d5IFwic3BsaXRcIiBpbXBsZW1lbnRhdGlvbiB3aGVuIFJlZ0V4cCNleGVjICE9PSBuYXRpdmVFeGVjXG4gIHZhciByZSA9IC8oPzopLztcbiAgdmFyIG9yaWdpbmFsRXhlYyA9IHJlLmV4ZWM7XG4gIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBvcmlnaW5hbEV4ZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgdmFyIHJlc3VsdCA9ICdhYicuc3BsaXQocmUpO1xuICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA9PT0gMiAmJiByZXN1bHRbMF0gPT09ICdhJyAmJiByZXN1bHRbMV0gPT09ICdiJztcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSwgbGVuZ3RoLCBleGVjKSB7XG4gIHZhciBTWU1CT0wgPSB3a3MoS0VZKTtcblxuICB2YXIgREVMRUdBVEVTX1RPX1NZTUJPTCA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gU3RyaW5nIG1ldGhvZHMgY2FsbCBzeW1ib2wtbmFtZWQgUmVnRXAgbWV0aG9kc1xuICAgIHZhciBPID0ge307XG4gICAgT1tTWU1CT0xdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfTtcbiAgICByZXR1cm4gJydbS0VZXShPKSAhPSA3O1xuICB9KTtcblxuICB2YXIgREVMRUdBVEVTX1RPX0VYRUMgPSBERUxFR0FURVNfVE9fU1lNQk9MID8gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTeW1ib2wtbmFtZWQgUmVnRXhwIG1ldGhvZHMgY2FsbCAuZXhlY1xuICAgIHZhciBleGVjQ2FsbGVkID0gZmFsc2U7XG4gICAgdmFyIHJlID0gL2EvO1xuICAgIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDYWxsZWQgPSB0cnVlOyByZXR1cm4gbnVsbDsgfTtcbiAgICBpZiAoS0VZID09PSAnc3BsaXQnKSB7XG4gICAgICAvLyBSZWdFeHBbQEBzcGxpdF0gZG9lc24ndCBjYWxsIHRoZSByZWdleCdzIGV4ZWMgbWV0aG9kLCBidXQgZmlyc3QgY3JlYXRlc1xuICAgICAgLy8gYSBuZXcgb25lLiBXZSBuZWVkIHRvIHJldHVybiB0aGUgcGF0Y2hlZCByZWdleCB3aGVuIGNyZWF0aW5nIHRoZSBuZXcgb25lLlxuICAgICAgcmUuY29uc3RydWN0b3IgPSB7fTtcbiAgICAgIHJlLmNvbnN0cnVjdG9yW1NQRUNJRVNdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcmU7IH07XG4gICAgfVxuICAgIHJlW1NZTUJPTF0oJycpO1xuICAgIHJldHVybiAhZXhlY0NhbGxlZDtcbiAgfSkgOiB1bmRlZmluZWQ7XG5cbiAgaWYgKFxuICAgICFERUxFR0FURVNfVE9fU1lNQk9MIHx8XG4gICAgIURFTEVHQVRFU19UT19FWEVDIHx8XG4gICAgKEtFWSA9PT0gJ3JlcGxhY2UnICYmICFSRVBMQUNFX1NVUFBPUlRTX05BTUVEX0dST1VQUykgfHxcbiAgICAoS0VZID09PSAnc3BsaXQnICYmICFTUExJVF9XT1JLU19XSVRIX09WRVJXUklUVEVOX0VYRUMpXG4gICkge1xuICAgIHZhciBuYXRpdmVSZWdFeHBNZXRob2QgPSAvLi9bU1lNQk9MXTtcbiAgICB2YXIgZm5zID0gZXhlYyhcbiAgICAgIGRlZmluZWQsXG4gICAgICBTWU1CT0wsXG4gICAgICAnJ1tLRVldLFxuICAgICAgZnVuY3Rpb24gbWF5YmVDYWxsTmF0aXZlKG5hdGl2ZU1ldGhvZCwgcmVnZXhwLCBzdHIsIGFyZzIsIGZvcmNlU3RyaW5nTWV0aG9kKSB7XG4gICAgICAgIGlmIChyZWdleHAuZXhlYyA9PT0gcmVnZXhwRXhlYykge1xuICAgICAgICAgIGlmIChERUxFR0FURVNfVE9fU1lNQk9MICYmICFmb3JjZVN0cmluZ01ldGhvZCkge1xuICAgICAgICAgICAgLy8gVGhlIG5hdGl2ZSBTdHJpbmcgbWV0aG9kIGFscmVhZHkgZGVsZWdhdGVzIHRvIEBAbWV0aG9kICh0aGlzXG4gICAgICAgICAgICAvLyBwb2x5ZmlsbGVkIGZ1bmN0aW9uKSwgbGVhc2luZyB0byBpbmZpbml0ZSByZWN1cnNpb24uXG4gICAgICAgICAgICAvLyBXZSBhdm9pZCBpdCBieSBkaXJlY3RseSBjYWxsaW5nIHRoZSBuYXRpdmUgQEBtZXRob2QgbWV0aG9kLlxuICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5hdGl2ZVJlZ0V4cE1ldGhvZC5jYWxsKHJlZ2V4cCwgc3RyLCBhcmcyKSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbmF0aXZlTWV0aG9kLmNhbGwoc3RyLCByZWdleHAsIGFyZzIpIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UgfTtcbiAgICAgIH1cbiAgICApO1xuICAgIHZhciBzdHJmbiA9IGZuc1swXTtcbiAgICB2YXIgcnhmbiA9IGZuc1sxXTtcblxuICAgIHJlZGVmaW5lKFN0cmluZy5wcm90b3R5cGUsIEtFWSwgc3RyZm4pO1xuICAgIGhpZGUoUmVnRXhwLnByb3RvdHlwZSwgU1lNQk9MLCBsZW5ndGggPT0gMlxuICAgICAgLy8gMjEuMi41LjggUmVnRXhwLnByb3RvdHlwZVtAQHJlcGxhY2VdKHN0cmluZywgcmVwbGFjZVZhbHVlKVxuICAgICAgLy8gMjEuMi41LjExIFJlZ0V4cC5wcm90b3R5cGVbQEBzcGxpdF0oc3RyaW5nLCBsaW1pdClcbiAgICAgID8gZnVuY3Rpb24gKHN0cmluZywgYXJnKSB7IHJldHVybiByeGZuLmNhbGwoc3RyaW5nLCB0aGlzLCBhcmcpOyB9XG4gICAgICAvLyAyMS4yLjUuNiBSZWdFeHAucHJvdG90eXBlW0BAbWF0Y2hdKHN0cmluZylcbiAgICAgIC8vIDIxLjIuNS45IFJlZ0V4cC5wcm90b3R5cGVbQEBzZWFyY2hdKHN0cmluZylcbiAgICAgIDogZnVuY3Rpb24gKHN0cmluZykgeyByZXR1cm4gcnhmbi5jYWxsKHN0cmluZywgdGhpcyk7IH1cbiAgICApO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMjEuMi41LjMgZ2V0IFJlZ0V4cC5wcm90b3R5cGUuZmxhZ3NcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0aGF0ID0gYW5PYmplY3QodGhpcyk7XG4gIHZhciByZXN1bHQgPSAnJztcbiAgaWYgKHRoYXQuZ2xvYmFsKSByZXN1bHQgKz0gJ2cnO1xuICBpZiAodGhhdC5pZ25vcmVDYXNlKSByZXN1bHQgKz0gJ2knO1xuICBpZiAodGhhdC5tdWx0aWxpbmUpIHJlc3VsdCArPSAnbSc7XG4gIGlmICh0aGF0LnVuaWNvZGUpIHJlc3VsdCArPSAndSc7XG4gIGlmICh0aGF0LnN0aWNreSkgcmVzdWx0ICs9ICd5JztcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZiAodHlwZW9mIF9fZyA9PSAnbnVtYmVyJykgX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwiLy8gNy4yLjggSXNSZWdFeHAoYXJndW1lbnQpXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBNQVRDSCA9IHJlcXVpcmUoJy4vX3drcycpKCdtYXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIGlzUmVnRXhwO1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmICgoaXNSZWdFeHAgPSBpdFtNQVRDSF0pICE9PSB1bmRlZmluZWQgPyAhIWlzUmVnRXhwIDogY29mKGl0KSA9PSAnUmVnRXhwJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmYWxzZTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgU1JDID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpO1xudmFyIFRPX1NUUklORyA9ICd0b1N0cmluZyc7XG52YXIgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXTtcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWwsIHNhZmUpIHtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmIChPW2tleV0gPT09IHZhbCkgcmV0dXJuO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoIXNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9IGVsc2UgaWYgKE9ba2V5XSkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciBidWlsdGluRXhlYyA9IFJlZ0V4cC5wcm90b3R5cGUuZXhlYztcblxuIC8vIGBSZWdFeHBFeGVjYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cGV4ZWNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFIsIFMpIHtcbiAgdmFyIGV4ZWMgPSBSLmV4ZWM7XG4gIGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciByZXN1bHQgPSBleGVjLmNhbGwoUiwgUyk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWdFeHAgZXhlYyBtZXRob2QgcmV0dXJuZWQgc29tZXRoaW5nIG90aGVyIHRoYW4gYW4gT2JqZWN0IG9yIG51bGwnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBpZiAoY2xhc3NvZihSKSAhPT0gJ1JlZ0V4cCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWdFeHAjZXhlYyBjYWxsZWQgb24gaW5jb21wYXRpYmxlIHJlY2VpdmVyJyk7XG4gIH1cbiAgcmV0dXJuIGJ1aWx0aW5FeGVjLmNhbGwoUiwgUyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVnZXhwRmxhZ3MgPSByZXF1aXJlKCcuL19mbGFncycpO1xuXG52YXIgbmF0aXZlRXhlYyA9IFJlZ0V4cC5wcm90b3R5cGUuZXhlYztcbi8vIFRoaXMgYWx3YXlzIHJlZmVycyB0byB0aGUgbmF0aXZlIGltcGxlbWVudGF0aW9uLCBiZWNhdXNlIHRoZVxuLy8gU3RyaW5nI3JlcGxhY2UgcG9seWZpbGwgdXNlcyAuL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMuanMsXG4vLyB3aGljaCBsb2FkcyB0aGlzIGZpbGUgYmVmb3JlIHBhdGNoaW5nIHRoZSBtZXRob2QuXG52YXIgbmF0aXZlUmVwbGFjZSA9IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZTtcblxudmFyIHBhdGNoZWRFeGVjID0gbmF0aXZlRXhlYztcblxudmFyIExBU1RfSU5ERVggPSAnbGFzdEluZGV4JztcblxudmFyIFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORyA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciByZTEgPSAvYS8sXG4gICAgICByZTIgPSAvYiovZztcbiAgbmF0aXZlRXhlYy5jYWxsKHJlMSwgJ2EnKTtcbiAgbmF0aXZlRXhlYy5jYWxsKHJlMiwgJ2EnKTtcbiAgcmV0dXJuIHJlMVtMQVNUX0lOREVYXSAhPT0gMCB8fCByZTJbTEFTVF9JTkRFWF0gIT09IDA7XG59KSgpO1xuXG4vLyBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cCwgY29waWVkIGZyb20gZXM1LXNoaW0ncyBTdHJpbmcjc3BsaXQgcGF0Y2guXG52YXIgTlBDR19JTkNMVURFRCA9IC8oKT8/Ly5leGVjKCcnKVsxXSAhPT0gdW5kZWZpbmVkO1xuXG52YXIgUEFUQ0ggPSBVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgfHwgTlBDR19JTkNMVURFRDtcblxuaWYgKFBBVENIKSB7XG4gIHBhdGNoZWRFeGVjID0gZnVuY3Rpb24gZXhlYyhzdHIpIHtcbiAgICB2YXIgcmUgPSB0aGlzO1xuICAgIHZhciBsYXN0SW5kZXgsIHJlQ29weSwgbWF0Y2gsIGk7XG5cbiAgICBpZiAoTlBDR19JTkNMVURFRCkge1xuICAgICAgcmVDb3B5ID0gbmV3IFJlZ0V4cCgnXicgKyByZS5zb3VyY2UgKyAnJCg/IVxcXFxzKScsIHJlZ2V4cEZsYWdzLmNhbGwocmUpKTtcbiAgICB9XG4gICAgaWYgKFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORykgbGFzdEluZGV4ID0gcmVbTEFTVF9JTkRFWF07XG5cbiAgICBtYXRjaCA9IG5hdGl2ZUV4ZWMuY2FsbChyZSwgc3RyKTtcblxuICAgIGlmIChVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgJiYgbWF0Y2gpIHtcbiAgICAgIHJlW0xBU1RfSU5ERVhdID0gcmUuZ2xvYmFsID8gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggOiBsYXN0SW5kZXg7XG4gICAgfVxuICAgIGlmIChOUENHX0lOQ0xVREVEICYmIG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIEZpeCBicm93c2VycyB3aG9zZSBgZXhlY2AgbWV0aG9kcyBkb24ndCBjb25zaXN0ZW50bHkgcmV0dXJuIGB1bmRlZmluZWRgXG4gICAgICAvLyBmb3IgTlBDRywgbGlrZSBJRTguIE5PVEU6IFRoaXMgZG9lc24nIHdvcmsgZm9yIC8oLj8pPy9cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1sb29wLWZ1bmNcbiAgICAgIG5hdGl2ZVJlcGxhY2UuY2FsbChtYXRjaFswXSwgcmVDb3B5LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSA9PT0gdW5kZWZpbmVkKSBtYXRjaFtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGNoZWRFeGVjO1xuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE4IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCIvLyA3LjMuMjAgU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3RvcilcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBTUEVDSUVTID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIEQpIHtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvcjtcbiAgdmFyIFM7XG4gIHJldHVybiBDID09PSB1bmRlZmluZWQgfHwgKFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXSkgPT0gdW5kZWZpbmVkID8gRCA6IGFGdW5jdGlvbihTKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGhhdCwgcG9zKSB7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSk7XG4gICAgdmFyIGkgPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgbCA9IHMubGVuZ3RoO1xuICAgIHZhciBhLCBiO1xuICAgIGlmIChpIDwgMCB8fCBpID49IGwpIHJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG4iLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcbiIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuIiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFMpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG4iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sO1xudmFyIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjJyk7XG5yZXF1aXJlKCcuL19leHBvcnQnKSh7XG4gIHRhcmdldDogJ1JlZ0V4cCcsXG4gIHByb3RvOiB0cnVlLFxuICBmb3JjZWQ6IHJlZ2V4cEV4ZWMgIT09IC8uLy5leGVjXG59LCB7XG4gIGV4ZWM6IHJlZ2V4cEV4ZWNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGFkdmFuY2VTdHJpbmdJbmRleCA9IHJlcXVpcmUoJy4vX2FkdmFuY2Utc3RyaW5nLWluZGV4Jyk7XG52YXIgcmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4vX3JlZ2V4cC1leGVjLWFic3RyYWN0Jyk7XG5cbi8vIEBAbWF0Y2ggbG9naWNcbnJlcXVpcmUoJy4vX2ZpeC1yZS13a3MnKSgnbWF0Y2gnLCAxLCBmdW5jdGlvbiAoZGVmaW5lZCwgTUFUQ0gsICRtYXRjaCwgbWF5YmVDYWxsTmF0aXZlKSB7XG4gIHJldHVybiBbXG4gICAgLy8gYFN0cmluZy5wcm90b3R5cGUubWF0Y2hgIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUubWF0Y2hcbiAgICBmdW5jdGlvbiBtYXRjaChyZWdleHApIHtcbiAgICAgIHZhciBPID0gZGVmaW5lZCh0aGlzKTtcbiAgICAgIHZhciBmbiA9IHJlZ2V4cCA9PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiByZWdleHBbTUFUQ0hdO1xuICAgICAgcmV0dXJuIGZuICE9PSB1bmRlZmluZWQgPyBmbi5jYWxsKHJlZ2V4cCwgTykgOiBuZXcgUmVnRXhwKHJlZ2V4cClbTUFUQ0hdKFN0cmluZyhPKSk7XG4gICAgfSxcbiAgICAvLyBgUmVnRXhwLnByb3RvdHlwZVtAQG1hdGNoXWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwLnByb3RvdHlwZS1AQG1hdGNoXG4gICAgZnVuY3Rpb24gKHJlZ2V4cCkge1xuICAgICAgdmFyIHJlcyA9IG1heWJlQ2FsbE5hdGl2ZSgkbWF0Y2gsIHJlZ2V4cCwgdGhpcyk7XG4gICAgICBpZiAocmVzLmRvbmUpIHJldHVybiByZXMudmFsdWU7XG4gICAgICB2YXIgcnggPSBhbk9iamVjdChyZWdleHApO1xuICAgICAgdmFyIFMgPSBTdHJpbmcodGhpcyk7XG4gICAgICBpZiAoIXJ4Lmdsb2JhbCkgcmV0dXJuIHJlZ0V4cEV4ZWMocngsIFMpO1xuICAgICAgdmFyIGZ1bGxVbmljb2RlID0gcngudW5pY29kZTtcbiAgICAgIHJ4Lmxhc3RJbmRleCA9IDA7XG4gICAgICB2YXIgQSA9IFtdO1xuICAgICAgdmFyIG4gPSAwO1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIHdoaWxlICgocmVzdWx0ID0gcmVnRXhwRXhlYyhyeCwgUykpICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBtYXRjaFN0ciA9IFN0cmluZyhyZXN1bHRbMF0pO1xuICAgICAgICBBW25dID0gbWF0Y2hTdHI7XG4gICAgICAgIGlmIChtYXRjaFN0ciA9PT0gJycpIHJ4Lmxhc3RJbmRleCA9IGFkdmFuY2VTdHJpbmdJbmRleChTLCB0b0xlbmd0aChyeC5sYXN0SW5kZXgpLCBmdWxsVW5pY29kZSk7XG4gICAgICAgIG4rKztcbiAgICAgIH1cbiAgICAgIHJldHVybiBuID09PSAwID8gbnVsbCA6IEE7XG4gICAgfVxuICBdO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgYWR2YW5jZVN0cmluZ0luZGV4ID0gcmVxdWlyZSgnLi9fYWR2YW5jZS1zdHJpbmctaW5kZXgnKTtcbnZhciByZWdFeHBFeGVjID0gcmVxdWlyZSgnLi9fcmVnZXhwLWV4ZWMtYWJzdHJhY3QnKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG52YXIgU1VCU1RJVFVUSU9OX1NZTUJPTFMgPSAvXFwkKFskJmAnXXxcXGRcXGQ/fDxbXj5dKj4pL2c7XG52YXIgU1VCU1RJVFVUSU9OX1NZTUJPTFNfTk9fTkFNRUQgPSAvXFwkKFskJmAnXXxcXGRcXGQ/KS9nO1xuXG52YXIgbWF5YmVUb1N0cmluZyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/IGl0IDogU3RyaW5nKGl0KTtcbn07XG5cbi8vIEBAcmVwbGFjZSBsb2dpY1xucmVxdWlyZSgnLi9fZml4LXJlLXdrcycpKCdyZXBsYWNlJywgMiwgZnVuY3Rpb24gKGRlZmluZWQsIFJFUExBQ0UsICRyZXBsYWNlLCBtYXliZUNhbGxOYXRpdmUpIHtcbiAgcmV0dXJuIFtcbiAgICAvLyBgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnJlcGxhY2VcbiAgICBmdW5jdGlvbiByZXBsYWNlKHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpIHtcbiAgICAgIHZhciBPID0gZGVmaW5lZCh0aGlzKTtcbiAgICAgIHZhciBmbiA9IHNlYXJjaFZhbHVlID09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNlYXJjaFZhbHVlW1JFUExBQ0VdO1xuICAgICAgcmV0dXJuIGZuICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBmbi5jYWxsKHNlYXJjaFZhbHVlLCBPLCByZXBsYWNlVmFsdWUpXG4gICAgICAgIDogJHJlcGxhY2UuY2FsbChTdHJpbmcoTyksIHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpO1xuICAgIH0sXG4gICAgLy8gYFJlZ0V4cC5wcm90b3R5cGVbQEByZXBsYWNlXWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwLnByb3RvdHlwZS1AQHJlcGxhY2VcbiAgICBmdW5jdGlvbiAocmVnZXhwLCByZXBsYWNlVmFsdWUpIHtcbiAgICAgIHZhciByZXMgPSBtYXliZUNhbGxOYXRpdmUoJHJlcGxhY2UsIHJlZ2V4cCwgdGhpcywgcmVwbGFjZVZhbHVlKTtcbiAgICAgIGlmIChyZXMuZG9uZSkgcmV0dXJuIHJlcy52YWx1ZTtcblxuICAgICAgdmFyIHJ4ID0gYW5PYmplY3QocmVnZXhwKTtcbiAgICAgIHZhciBTID0gU3RyaW5nKHRoaXMpO1xuICAgICAgdmFyIGZ1bmN0aW9uYWxSZXBsYWNlID0gdHlwZW9mIHJlcGxhY2VWYWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgIGlmICghZnVuY3Rpb25hbFJlcGxhY2UpIHJlcGxhY2VWYWx1ZSA9IFN0cmluZyhyZXBsYWNlVmFsdWUpO1xuICAgICAgdmFyIGdsb2JhbCA9IHJ4Lmdsb2JhbDtcbiAgICAgIGlmIChnbG9iYWwpIHtcbiAgICAgICAgdmFyIGZ1bGxVbmljb2RlID0gcngudW5pY29kZTtcbiAgICAgICAgcngubGFzdEluZGV4ID0gMDtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVnRXhwRXhlYyhyeCwgUyk7XG4gICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIGJyZWFrO1xuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgaWYgKCFnbG9iYWwpIGJyZWFrO1xuICAgICAgICB2YXIgbWF0Y2hTdHIgPSBTdHJpbmcocmVzdWx0WzBdKTtcbiAgICAgICAgaWYgKG1hdGNoU3RyID09PSAnJykgcngubGFzdEluZGV4ID0gYWR2YW5jZVN0cmluZ0luZGV4KFMsIHRvTGVuZ3RoKHJ4Lmxhc3RJbmRleCksIGZ1bGxVbmljb2RlKTtcbiAgICAgIH1cbiAgICAgIHZhciBhY2N1bXVsYXRlZFJlc3VsdCA9ICcnO1xuICAgICAgdmFyIG5leHRTb3VyY2VQb3NpdGlvbiA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgICAgdmFyIG1hdGNoZWQgPSBTdHJpbmcocmVzdWx0WzBdKTtcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gbWF4KG1pbih0b0ludGVnZXIocmVzdWx0LmluZGV4KSwgUy5sZW5ndGgpLCAwKTtcbiAgICAgICAgdmFyIGNhcHR1cmVzID0gW107XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgZXF1aXZhbGVudCB0b1xuICAgICAgICAvLyAgIGNhcHR1cmVzID0gcmVzdWx0LnNsaWNlKDEpLm1hcChtYXliZVRvU3RyaW5nKVxuICAgICAgICAvLyBidXQgZm9yIHNvbWUgcmVhc29uIGBuYXRpdmVTbGljZS5jYWxsKHJlc3VsdCwgMSwgcmVzdWx0Lmxlbmd0aClgIChjYWxsZWQgaW5cbiAgICAgICAgLy8gdGhlIHNsaWNlIHBvbHlmaWxsIHdoZW4gc2xpY2luZyBuYXRpdmUgYXJyYXlzKSBcImRvZXNuJ3Qgd29ya1wiIGluIHNhZmFyaSA5IGFuZFxuICAgICAgICAvLyBjYXVzZXMgYSBjcmFzaCAoaHR0cHM6Ly9wYXN0ZWJpbi5jb20vTjIxUXplUUEpIHdoZW4gdHJ5aW5nIHRvIGRlYnVnIGl0LlxuICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHJlc3VsdC5sZW5ndGg7IGorKykgY2FwdHVyZXMucHVzaChtYXliZVRvU3RyaW5nKHJlc3VsdFtqXSkpO1xuICAgICAgICB2YXIgbmFtZWRDYXB0dXJlcyA9IHJlc3VsdC5ncm91cHM7XG4gICAgICAgIGlmIChmdW5jdGlvbmFsUmVwbGFjZSkge1xuICAgICAgICAgIHZhciByZXBsYWNlckFyZ3MgPSBbbWF0Y2hlZF0uY29uY2F0KGNhcHR1cmVzLCBwb3NpdGlvbiwgUyk7XG4gICAgICAgICAgaWYgKG5hbWVkQ2FwdHVyZXMgIT09IHVuZGVmaW5lZCkgcmVwbGFjZXJBcmdzLnB1c2gobmFtZWRDYXB0dXJlcyk7XG4gICAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gU3RyaW5nKHJlcGxhY2VWYWx1ZS5hcHBseSh1bmRlZmluZWQsIHJlcGxhY2VyQXJncykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gZ2V0U3Vic3RpdHV0aW9uKG1hdGNoZWQsIFMsIHBvc2l0aW9uLCBjYXB0dXJlcywgbmFtZWRDYXB0dXJlcywgcmVwbGFjZVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zaXRpb24gPj0gbmV4dFNvdXJjZVBvc2l0aW9uKSB7XG4gICAgICAgICAgYWNjdW11bGF0ZWRSZXN1bHQgKz0gUy5zbGljZShuZXh0U291cmNlUG9zaXRpb24sIHBvc2l0aW9uKSArIHJlcGxhY2VtZW50O1xuICAgICAgICAgIG5leHRTb3VyY2VQb3NpdGlvbiA9IHBvc2l0aW9uICsgbWF0Y2hlZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2N1bXVsYXRlZFJlc3VsdCArIFMuc2xpY2UobmV4dFNvdXJjZVBvc2l0aW9uKTtcbiAgICB9XG4gIF07XG5cbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1nZXRzdWJzdGl0dXRpb25cbiAgZnVuY3Rpb24gZ2V0U3Vic3RpdHV0aW9uKG1hdGNoZWQsIHN0ciwgcG9zaXRpb24sIGNhcHR1cmVzLCBuYW1lZENhcHR1cmVzLCByZXBsYWNlbWVudCkge1xuICAgIHZhciB0YWlsUG9zID0gcG9zaXRpb24gKyBtYXRjaGVkLmxlbmd0aDtcbiAgICB2YXIgbSA9IGNhcHR1cmVzLmxlbmd0aDtcbiAgICB2YXIgc3ltYm9scyA9IFNVQlNUSVRVVElPTl9TWU1CT0xTX05PX05BTUVEO1xuICAgIGlmIChuYW1lZENhcHR1cmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG5hbWVkQ2FwdHVyZXMgPSB0b09iamVjdChuYW1lZENhcHR1cmVzKTtcbiAgICAgIHN5bWJvbHMgPSBTVUJTVElUVVRJT05fU1lNQk9MUztcbiAgICB9XG4gICAgcmV0dXJuICRyZXBsYWNlLmNhbGwocmVwbGFjZW1lbnQsIHN5bWJvbHMsIGZ1bmN0aW9uIChtYXRjaCwgY2gpIHtcbiAgICAgIHZhciBjYXB0dXJlO1xuICAgICAgc3dpdGNoIChjaC5jaGFyQXQoMCkpIHtcbiAgICAgICAgY2FzZSAnJCc6IHJldHVybiAnJCc7XG4gICAgICAgIGNhc2UgJyYnOiByZXR1cm4gbWF0Y2hlZDtcbiAgICAgICAgY2FzZSAnYCc6IHJldHVybiBzdHIuc2xpY2UoMCwgcG9zaXRpb24pO1xuICAgICAgICBjYXNlIFwiJ1wiOiByZXR1cm4gc3RyLnNsaWNlKHRhaWxQb3MpO1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICBjYXB0dXJlID0gbmFtZWRDYXB0dXJlc1tjaC5zbGljZSgxLCAtMSldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBcXGRcXGQ/XG4gICAgICAgICAgdmFyIG4gPSArY2g7XG4gICAgICAgICAgaWYgKG4gPT09IDApIHJldHVybiBjaDtcbiAgICAgICAgICBpZiAobiA+IG0pIHtcbiAgICAgICAgICAgIHZhciBmID0gZmxvb3IobiAvIDEwKTtcbiAgICAgICAgICAgIGlmIChmID09PSAwKSByZXR1cm4gY2g7XG4gICAgICAgICAgICBpZiAoZiA8PSBtKSByZXR1cm4gY2FwdHVyZXNbZiAtIDFdID09PSB1bmRlZmluZWQgPyBjaC5jaGFyQXQoMSkgOiBjYXB0dXJlc1tmIC0gMV0gKyBjaC5jaGFyQXQoMSk7XG4gICAgICAgICAgICByZXR1cm4gY2g7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhcHR1cmUgPSBjYXB0dXJlc1tuIC0gMV07XG4gICAgICB9XG4gICAgICByZXR1cm4gY2FwdHVyZSA9PT0gdW5kZWZpbmVkID8gJycgOiBjYXB0dXJlO1xuICAgIH0pO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzUmVnRXhwID0gcmVxdWlyZSgnLi9faXMtcmVnZXhwJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBzcGVjaWVzQ29uc3RydWN0b3IgPSByZXF1aXJlKCcuL19zcGVjaWVzLWNvbnN0cnVjdG9yJyk7XG52YXIgYWR2YW5jZVN0cmluZ0luZGV4ID0gcmVxdWlyZSgnLi9fYWR2YW5jZS1zdHJpbmctaW5kZXgnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGNhbGxSZWdFeHBFeGVjID0gcmVxdWlyZSgnLi9fcmVnZXhwLWV4ZWMtYWJzdHJhY3QnKTtcbnZhciByZWdleHBFeGVjID0gcmVxdWlyZSgnLi9fcmVnZXhwLWV4ZWMnKTtcbnZhciAkbWluID0gTWF0aC5taW47XG52YXIgJHB1c2ggPSBbXS5wdXNoO1xudmFyICRTUExJVCA9ICdzcGxpdCc7XG52YXIgTEVOR1RIID0gJ2xlbmd0aCc7XG52YXIgTEFTVF9JTkRFWCA9ICdsYXN0SW5kZXgnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHlcbnZhciBTVVBQT1JUU19ZID0gISEoZnVuY3Rpb24gKCkgeyB0cnkgeyByZXR1cm4gbmV3IFJlZ0V4cCgneCcsICd5Jyk7IH0gY2F0Y2ggKGUpIHt9IH0pKCk7XG5cbi8vIEBAc3BsaXQgbG9naWNcbnJlcXVpcmUoJy4vX2ZpeC1yZS13a3MnKSgnc3BsaXQnLCAyLCBmdW5jdGlvbiAoZGVmaW5lZCwgU1BMSVQsICRzcGxpdCwgbWF5YmVDYWxsTmF0aXZlKSB7XG4gIHZhciBpbnRlcm5hbFNwbGl0O1xuICBpZiAoXG4gICAgJ2FiYmMnWyRTUExJVF0oLyhiKSovKVsxXSA9PSAnYycgfHxcbiAgICAndGVzdCdbJFNQTElUXSgvKD86KS8sIC0xKVtMRU5HVEhdICE9IDQgfHxcbiAgICAnYWInWyRTUExJVF0oLyg/OmFiKSovKVtMRU5HVEhdICE9IDIgfHxcbiAgICAnLidbJFNQTElUXSgvKC4/KSguPykvKVtMRU5HVEhdICE9IDQgfHxcbiAgICAnLidbJFNQTElUXSgvKCkoKS8pW0xFTkdUSF0gPiAxIHx8XG4gICAgJydbJFNQTElUXSgvLj8vKVtMRU5HVEhdXG4gICkge1xuICAgIC8vIGJhc2VkIG9uIGVzNS1zaGltIGltcGxlbWVudGF0aW9uLCBuZWVkIHRvIHJld29yayBpdFxuICAgIGludGVybmFsU3BsaXQgPSBmdW5jdGlvbiAoc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICAgIGlmIChzZXBhcmF0b3IgPT09IHVuZGVmaW5lZCAmJiBsaW1pdCA9PT0gMCkgcmV0dXJuIFtdO1xuICAgICAgLy8gSWYgYHNlcGFyYXRvcmAgaXMgbm90IGEgcmVnZXgsIHVzZSBuYXRpdmUgc3BsaXRcbiAgICAgIGlmICghaXNSZWdFeHAoc2VwYXJhdG9yKSkgcmV0dXJuICRzcGxpdC5jYWxsKHN0cmluZywgc2VwYXJhdG9yLCBsaW1pdCk7XG4gICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICB2YXIgZmxhZ3MgPSAoc2VwYXJhdG9yLmlnbm9yZUNhc2UgPyAnaScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHNlcGFyYXRvci5tdWx0aWxpbmUgPyAnbScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHNlcGFyYXRvci51bmljb2RlID8gJ3UnIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChzZXBhcmF0b3Iuc3RpY2t5ID8gJ3knIDogJycpO1xuICAgICAgdmFyIGxhc3RMYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIHNwbGl0TGltaXQgPSBsaW1pdCA9PT0gdW5kZWZpbmVkID8gNDI5NDk2NzI5NSA6IGxpbWl0ID4+PiAwO1xuICAgICAgLy8gTWFrZSBgZ2xvYmFsYCBhbmQgYXZvaWQgYGxhc3RJbmRleGAgaXNzdWVzIGJ5IHdvcmtpbmcgd2l0aCBhIGNvcHlcbiAgICAgIHZhciBzZXBhcmF0b3JDb3B5ID0gbmV3IFJlZ0V4cChzZXBhcmF0b3Iuc291cmNlLCBmbGFncyArICdnJyk7XG4gICAgICB2YXIgbWF0Y2gsIGxhc3RJbmRleCwgbGFzdExlbmd0aDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IHJlZ2V4cEV4ZWMuY2FsbChzZXBhcmF0b3JDb3B5LCBzdHJpbmcpKSB7XG4gICAgICAgIGxhc3RJbmRleCA9IHNlcGFyYXRvckNvcHlbTEFTVF9JTkRFWF07XG4gICAgICAgIGlmIChsYXN0SW5kZXggPiBsYXN0TGFzdEluZGV4KSB7XG4gICAgICAgICAgb3V0cHV0LnB1c2goc3RyaW5nLnNsaWNlKGxhc3RMYXN0SW5kZXgsIG1hdGNoLmluZGV4KSk7XG4gICAgICAgICAgaWYgKG1hdGNoW0xFTkdUSF0gPiAxICYmIG1hdGNoLmluZGV4IDwgc3RyaW5nW0xFTkdUSF0pICRwdXNoLmFwcGx5KG91dHB1dCwgbWF0Y2guc2xpY2UoMSkpO1xuICAgICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXVtMRU5HVEhdO1xuICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgICAgICAgaWYgKG91dHB1dFtMRU5HVEhdID49IHNwbGl0TGltaXQpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZXBhcmF0b3JDb3B5W0xBU1RfSU5ERVhdID09PSBtYXRjaC5pbmRleCkgc2VwYXJhdG9yQ29weVtMQVNUX0lOREVYXSsrOyAvLyBBdm9pZCBhbiBpbmZpbml0ZSBsb29wXG4gICAgICB9XG4gICAgICBpZiAobGFzdExhc3RJbmRleCA9PT0gc3RyaW5nW0xFTkdUSF0pIHtcbiAgICAgICAgaWYgKGxhc3RMZW5ndGggfHwgIXNlcGFyYXRvckNvcHkudGVzdCgnJykpIG91dHB1dC5wdXNoKCcnKTtcbiAgICAgIH0gZWxzZSBvdXRwdXQucHVzaChzdHJpbmcuc2xpY2UobGFzdExhc3RJbmRleCkpO1xuICAgICAgcmV0dXJuIG91dHB1dFtMRU5HVEhdID4gc3BsaXRMaW1pdCA/IG91dHB1dC5zbGljZSgwLCBzcGxpdExpbWl0KSA6IG91dHB1dDtcbiAgICB9O1xuICAvLyBDaGFrcmEsIFY4XG4gIH0gZWxzZSBpZiAoJzAnWyRTUExJVF0odW5kZWZpbmVkLCAwKVtMRU5HVEhdKSB7XG4gICAgaW50ZXJuYWxTcGxpdCA9IGZ1bmN0aW9uIChzZXBhcmF0b3IsIGxpbWl0KSB7XG4gICAgICByZXR1cm4gc2VwYXJhdG9yID09PSB1bmRlZmluZWQgJiYgbGltaXQgPT09IDAgPyBbXSA6ICRzcGxpdC5jYWxsKHRoaXMsIHNlcGFyYXRvciwgbGltaXQpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgaW50ZXJuYWxTcGxpdCA9ICRzcGxpdDtcbiAgfVxuXG4gIHJldHVybiBbXG4gICAgLy8gYFN0cmluZy5wcm90b3R5cGUuc3BsaXRgIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUuc3BsaXRcbiAgICBmdW5jdGlvbiBzcGxpdChzZXBhcmF0b3IsIGxpbWl0KSB7XG4gICAgICB2YXIgTyA9IGRlZmluZWQodGhpcyk7XG4gICAgICB2YXIgc3BsaXR0ZXIgPSBzZXBhcmF0b3IgPT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogc2VwYXJhdG9yW1NQTElUXTtcbiAgICAgIHJldHVybiBzcGxpdHRlciAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gc3BsaXR0ZXIuY2FsbChzZXBhcmF0b3IsIE8sIGxpbWl0KVxuICAgICAgICA6IGludGVybmFsU3BsaXQuY2FsbChTdHJpbmcoTyksIHNlcGFyYXRvciwgbGltaXQpO1xuICAgIH0sXG4gICAgLy8gYFJlZ0V4cC5wcm90b3R5cGVbQEBzcGxpdF1gIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cC5wcm90b3R5cGUtQEBzcGxpdFxuICAgIC8vXG4gICAgLy8gTk9URTogVGhpcyBjYW5ub3QgYmUgcHJvcGVybHkgcG9seWZpbGxlZCBpbiBlbmdpbmVzIHRoYXQgZG9uJ3Qgc3VwcG9ydFxuICAgIC8vIHRoZSAneScgZmxhZy5cbiAgICBmdW5jdGlvbiAocmVnZXhwLCBsaW1pdCkge1xuICAgICAgdmFyIHJlcyA9IG1heWJlQ2FsbE5hdGl2ZShpbnRlcm5hbFNwbGl0LCByZWdleHAsIHRoaXMsIGxpbWl0LCBpbnRlcm5hbFNwbGl0ICE9PSAkc3BsaXQpO1xuICAgICAgaWYgKHJlcy5kb25lKSByZXR1cm4gcmVzLnZhbHVlO1xuXG4gICAgICB2YXIgcnggPSBhbk9iamVjdChyZWdleHApO1xuICAgICAgdmFyIFMgPSBTdHJpbmcodGhpcyk7XG4gICAgICB2YXIgQyA9IHNwZWNpZXNDb25zdHJ1Y3RvcihyeCwgUmVnRXhwKTtcblxuICAgICAgdmFyIHVuaWNvZGVNYXRjaGluZyA9IHJ4LnVuaWNvZGU7XG4gICAgICB2YXIgZmxhZ3MgPSAocnguaWdub3JlQ2FzZSA/ICdpJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyeC5tdWx0aWxpbmUgPyAnbScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocngudW5pY29kZSA/ICd1JyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChTVVBQT1JUU19ZID8gJ3knIDogJ2cnKTtcblxuICAgICAgLy8gXig/ICsgcnggKyApIGlzIG5lZWRlZCwgaW4gY29tYmluYXRpb24gd2l0aCBzb21lIFMgc2xpY2luZywgdG9cbiAgICAgIC8vIHNpbXVsYXRlIHRoZSAneScgZmxhZy5cbiAgICAgIHZhciBzcGxpdHRlciA9IG5ldyBDKFNVUFBPUlRTX1kgPyByeCA6ICdeKD86JyArIHJ4LnNvdXJjZSArICcpJywgZmxhZ3MpO1xuICAgICAgdmFyIGxpbSA9IGxpbWl0ID09PSB1bmRlZmluZWQgPyAweGZmZmZmZmZmIDogbGltaXQgPj4+IDA7XG4gICAgICBpZiAobGltID09PSAwKSByZXR1cm4gW107XG4gICAgICBpZiAoUy5sZW5ndGggPT09IDApIHJldHVybiBjYWxsUmVnRXhwRXhlYyhzcGxpdHRlciwgUykgPT09IG51bGwgPyBbU10gOiBbXTtcbiAgICAgIHZhciBwID0gMDtcbiAgICAgIHZhciBxID0gMDtcbiAgICAgIHZhciBBID0gW107XG4gICAgICB3aGlsZSAocSA8IFMubGVuZ3RoKSB7XG4gICAgICAgIHNwbGl0dGVyLmxhc3RJbmRleCA9IFNVUFBPUlRTX1kgPyBxIDogMDtcbiAgICAgICAgdmFyIHogPSBjYWxsUmVnRXhwRXhlYyhzcGxpdHRlciwgU1VQUE9SVFNfWSA/IFMgOiBTLnNsaWNlKHEpKTtcbiAgICAgICAgdmFyIGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB6ID09PSBudWxsIHx8XG4gICAgICAgICAgKGUgPSAkbWluKHRvTGVuZ3RoKHNwbGl0dGVyLmxhc3RJbmRleCArIChTVVBQT1JUU19ZID8gMCA6IHEpKSwgUy5sZW5ndGgpKSA9PT0gcFxuICAgICAgICApIHtcbiAgICAgICAgICBxID0gYWR2YW5jZVN0cmluZ0luZGV4KFMsIHEsIHVuaWNvZGVNYXRjaGluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgQS5wdXNoKFMuc2xpY2UocCwgcSkpO1xuICAgICAgICAgIGlmIChBLmxlbmd0aCA9PT0gbGltKSByZXR1cm4gQTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSB6Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgQS5wdXNoKHpbaV0pO1xuICAgICAgICAgICAgaWYgKEEubGVuZ3RoID09PSBsaW0pIHJldHVybiBBO1xuICAgICAgICAgIH1cbiAgICAgICAgICBxID0gcCA9IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIEEucHVzaChTLnNsaWNlKHApKTtcbiAgICAgIHJldHVybiBBO1xuICAgIH1cbiAgXTtcbn0pO1xuIiwid2luZG93Lk1vcnNlQ1dXYXZlID1yZXF1aXJlKCAnLi9saWIvbW9yc2UtcHJvLWN3LXdhdmUnKS5kZWZhdWx0O1xyXG53aW5kb3cuTW9yc2VQbGF5ZXJXQUEgPSByZXF1aXJlKCAnLi9saWIvbW9yc2UtcHJvLXBsYXllci13YWEnKS5kZWZhdWx0O1xyXG53aW5kb3cuTW9yc2VMaXN0ZW5lciA9IHJlcXVpcmUgKCcuL2xpYi9tb3JzZS1wcm8tbGlzdGVuZXInKS5kZWZhdWx0O1xyXG53aW5kb3cuTW9yc2VEZWNvZGVyID0gcmVxdWlyZSgnLi9saWIvbW9yc2UtcHJvLWRlY29kZXInKS5kZWZhdWx0O1xyXG5cclxud2luZG93Lk1vcnNlQ1cgPSByZXF1aXJlKCcuL2xpYi9tb3JzZS1wcm8tY3cnKS5kZWZhdWx0OyJdfQ==
