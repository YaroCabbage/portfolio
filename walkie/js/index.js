(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":3}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the AND operation, expects two arrays of the same size and returns a new one.
 *
 * @example
 * and([1,0,0,0,1,1,0,1], [0,1,1,0,0,1,0,0]) => [0,0,0,0,0,1,0,0]
 *
 * @param {Array} bits1 input data
 * @param {Array} bits2 input data
 * @return {Array} [bits1 AND bits2]
 */
exports.default = (function (bits1, bits2) {
    var result = [];
    for (var i = 0; i < bits1.length; i++)
        result[i] = (bits1[i] & bits2[i]);
    return result;
});

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var and_1 = require("./and");
exports.and = and_1.default;
var nand_1 = require("./nand");
exports.nand = nand_1.default;
var nor_1 = require("./nor");
exports.nor = nor_1.default;
var not_1 = require("./not");
exports.not = not_1.default;
var or_1 = require("./or");
exports.or = or_1.default;
var reduce_and_1 = require("./reduce-and");
exports.reduceAnd = reduce_and_1.default;
var reduce_nand_1 = require("./reduce-nand");
exports.reduceNand = reduce_nand_1.default;
var reduce_nor_1 = require("./reduce-nor");
exports.reduceNor = reduce_nor_1.default;
var reduce_or_1 = require("./reduce-or");
exports.reduceOr = reduce_or_1.default;
var reduce_xnor_1 = require("./reduce-xnor");
exports.reduceXnor = reduce_xnor_1.default;
var reduce_xor_1 = require("./reduce-xor");
exports.reduceXor = reduce_xor_1.default;
var to_boolean_1 = require("./to-boolean");
exports.toBoolean = to_boolean_1.default;
var to_string_1 = require("./to-string");
exports.toString = to_string_1.default;
var xnor_1 = require("./xnor");
exports.xnor = xnor_1.default;
var xor_1 = require("./xor");
exports.xor = xor_1.default;
exports.default = {
    and: and_1.default,
    nand: nand_1.default,
    nor: nor_1.default,
    not: not_1.default,
    or: or_1.default,
    reduceAnd: reduce_and_1.default,
    reduceNand: reduce_nand_1.default,
    reduceNor: reduce_nor_1.default,
    reduceOr: reduce_or_1.default,
    reduceXnor: reduce_xnor_1.default,
    reduceXor: reduce_xor_1.default,
    toBoolean: to_boolean_1.default,
    toString: to_string_1.default,
    xnor: xnor_1.default,
    xor: xor_1.default,
};

},{"./and":4,"./nand":6,"./nor":7,"./not":8,"./or":9,"./reduce-and":10,"./reduce-nand":11,"./reduce-nor":12,"./reduce-or":13,"./reduce-xnor":14,"./reduce-xor":15,"./to-boolean":16,"./to-string":17,"./xnor":18,"./xor":19}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the NAND operation, expects two arrays of the same size and returns a new one.
 *
 * @example
 * nand([1,0,0,0,1,1,0,1], [0,1,1,0,0,1,0,0]) => [1,1,1,1,1,0,1,1]
 *
 * @param {Array} bits1 input data
 * @param {Array} bits2 input data
 * @return {Array} [bits1 NAND bits2]
 */
exports.default = (function (bits1, bits2) {
    var result = [];
    for (var i = 0; i < bits1.length; i++)
        result[i] = ((bits1[i] & bits2[i]) ^ 1);
    return result;
});

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the NOR operation, expects two arrays of the same size and returns a new one.
 *
 * @example
 * nor([1,0,0,0,1,1,0,1], [0,1,1,0,0,1,0,0]) => [0,0,0,1,0,0,1,0]
 *
 * @param {Array} bits1 input data
 * @param {Array} bits2 input data
 * @return {Array} [bits1 NOR bits2]
 */
exports.default = (function (bits1, bits2) {
    var result = [];
    for (var i = 0; i < bits1.length; i++)
        result[i] = ((bits1[i] | bits2[i]) ^ 1);
    return result;
});

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Flips all given bits and returns the flipped bits.
 *
 * @example
 * not([1,0,1,1,0,1]) => [0,1,0,0,1,0]
 *
 * @param {Array} bits input data
 * @return {Array} [NOT bits]
 */
exports.default = (function (bits) {
    var result = [];
    for (var i = 0; i < bits.length; i++)
        result[i] = (bits[i] ^ 1);
    return result;
});

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the OR operation, expects two arrays of the same size and returns a new one.
 *
 * @example
 * or([1,0,0,0,1,1,0,1], [0,1,1,0,0,1,0,0]) => [1,1,1,0,1,1,0,1]
 *
 * @param {Array} bits1 input data
 * @param {Array} bits2 input data
 * @return {Array} [bits1 OR bits2]
 */
exports.default = (function (bits1, bits2) {
    var result = [];
    for (var i = 0; i < bits1.length; i++)
        result[i] = (bits1[i] | bits2[i]);
    return result;
});

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the AND operation on the given bits. Returns one bit.
 * Throws if less than 2 bits are given.
 *
 * @example
 * reduceAnd([1, 0, 0, 0, 1, 1, 0, 1]) => 0
 *
 * @param {Array} bits input data
 * @return {Integer} AND bits
 */
exports.default = (function (bits) {
    if (bits.length < 2)
        throw new RangeError('Not enough bits.');
    var result = bits[0];
    for (var i = 1; i < bits.length; i++)
        result &= bits[i];
    return result;
});

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the NAND operation on the given bits. Returns one bit.
 * Throws if less than 2 bits are given.
 *
 * @example
 * reduceNand([1, 0, 0, 0, 1, 1, 0, 1]) => 0
 *
 * @param {Array} bits input data
 * @return {Integer} NAND bits
 */
exports.default = (function (bits) {
    if (bits.length < 2)
        throw new RangeError('Not enough bits.');
    var result = bits[0];
    for (var i = 1; i < bits.length; i++)
        result = ((result & bits[i]) ^ 1);
    return result;
});

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the NOR operation on the given bits. Returns one bit.
 * Throws if less than 2 bits are given.
 *
 * @example
 * reduceNor([1, 0, 0, 0, 1, 1, 0, 1]) => 0
 *
 * @param {Array} bits input data
 * @return {Integer} NOR bits
 */
exports.default = (function (bits) {
    if (bits.length < 2)
        throw new RangeError('Not enough bits.');
    var result = bits[0];
    for (var i = 1; i < bits.length; i++)
        result = ((result | bits[i]) ^ 1);
    return result;
});

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the OR operation on the given bits. Returns one bit.
 * Throws if less than 2 bits are given.
 *
 * @example
 * reduceOr([1, 0, 0, 0, 1, 1, 0, 1]) => 1
 *
 * @param {Array} bits input data
 * @return {Integer} OR bits
 */
exports.default = (function (bits) {
    if (bits.length < 2)
        throw new RangeError('Not enough bits.');
    var result = bits[0];
    for (var i = 1; i < bits.length; i++)
        result |= bits[i];
    return result;
});

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the XNOR operation on the given bits. Returns one bit.
 * Throws if less than 2 bits are given.
 *
 * @example
 * reduceXnor([1, 0, 0, 0, 1, 1, 0, 1]) => 1
 *
 * @param {Array} bits input data
 * @return {Integer} XNOR bits
 */
exports.default = (function (bits) {
    if (bits.length < 2)
        throw new RangeError('Not enough bits.');
    var result = bits[0];
    for (var i = 1; i < bits.length; i++)
        result ^= bits[i] ^ 1;
    return result;
});

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the XOR operation on the given bits. Returns one bit.
 * Throws if less than 2 bits are given.
 *
 * @example
 * reduceXor([1, 0, 0, 0, 1, 1, 0, 1]) => 0
 *
 * @param {Array} bits input data
 * @return {Integer} XOR bits
 */
exports.default = (function (bits) {
    if (bits.length < 2)
        throw new RangeError('Not enough bits.');
    var result = bits[0];
    for (var i = 1; i < bits.length; i++)
        result ^= bits[i];
    return result;
});

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts a bit array to a boolean array.
 *
 * @example toBoolean([0, 1]) => [false, true]
 * @param {Array} bits input data
 * @returns {Array} boolean bits
 */
exports.default = (function (bits) {
    var result = [];
    for (var i = 0; i < bits.length; i++)
        result[i] = bits[i] === 1;
    return result;
});

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts a bit array to a string. If defined, inserts spacer every spacing characters, but never inserts it as the last substring.
 *
 * @example
 * toString([1,0,1,0,1,0], 2, '_') => '10_10_10'
 *
 * @param {Array} bits the bits to convert
 * @param {Number} spacing where to place the spacers
 * @param {Number} spacer the string used as a spacer
 * @return {String}
 */
exports.default = (function (bits, spacing, spacer) {
    if (spacing === void 0) { spacing = 0; }
    if (spacer === void 0) { spacer = ' '; }
    if (!spacing)
        return bits.join('');
    var result = '';
    for (var i = 0; i < bits.length; i++) {
        result += "" + bits[i];
        if (i % spacing === spacing - 1 && i !== bits.length - 1)
            result += spacer;
    }
    return result;
});

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the exclusive NOR operation, expects two arrays of the same size and returns a new one.
 *
 * @example
 * xnor([1,0,0,0,1,1,0,1], [0,1,1,0,0,1,0,0]) => [0,0,0,1,0,1,1,0]
 *
 * @param {Array} bits1 input data
 * @param {Array} bits2 input data
 * @return {Array} [bits1 XNOR bits2]
 */
exports.default = (function (bits1, bits2) {
    var result = [];
    for (var i = 0; i < bits1.length; i++)
        result[i] = (bits1[i] ^ bits2[i] ^ 1);
    return result;
});

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies the exclusive or operation, expects two arrays of the same size and returns a new one.
 *
 * @example
 * xor([1,0,0,0,1,1,0,1], [0,1,1,0,0,1,0,0]) => [1,1,1,0,1,0,0,1]
 *
 * @param {Array} bits1 input data
 * @param {Array} bits2 input data
 * @return {Array} [bits1 XOR bits2]
 */
exports.default = (function (bits1, bits2) {
    var result = [];
    for (var i = 0; i < bits1.length; i++)
        result[i] = (bits1[i] ^ bits2[i]);
    return result;
});

},{}],20:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise AND to the contents of two buffers. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.and(buffer1, buffer2, false) => Buffer(buffer1 AND buffer2)
 *
 * @param {Buffer} buffer1 first buffer
 * @param {Buffer} buffer2 second buffer
 * @param {Boolean} isLooping loop through first buffer
 * @return {Buffer} buffer1 AND buffer2
 */
exports.default = (function (buffer1, buffer2, isLooping) {
    if (isLooping === void 0) { isLooping = false; }
    var length = isLooping ? buffer2.length : buffer1.length;
    var result = Buffer.alloc(length);
    for (var i = 0; i < length; i++) {
        var j = isLooping ? i % buffer1.length : i;
        result[i] = buffer1[j] & buffer2[i];
    }
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],21:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var write_1 = require("../byte/write");
/**
 * Creates a new buffer and writes the given bits.
 *
 * @example
 * createBuffer([1,1,1,1, 0,0,0,1, 1,0,1,0]) => buffer with data 1111 0001 1010 0000
 *
 * @param {Array} bits an array containing the bits to insert
 * @returns {Buffer}
 */
exports.default = (function (bits) {
    var data = [0, 0, 0, 0, 0, 0, 0, 0];
    var buffer = Buffer.alloc(Math.ceil(bits.length / 8));
    for (var i = 0; i < buffer.length; i++) {
        for (var j = 0; j < 8; j++) {
            if (bits[i * 8 + j])
                data[j] = bits[i * 8 + j];
            else
                data[j] = 0;
        }
        buffer[i] = write_1.default(data);
    }
    return buffer;
});

}).call(this,require("buffer").Buffer)

},{"../byte/write":35,"buffer":2}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var and_1 = require("./and");
exports.and = and_1.default;
var create_1 = require("./create");
exports.create = create_1.default;
var modify_1 = require("./modify");
exports.modify = modify_1.default;
var nand_1 = require("./nand");
exports.nand = nand_1.default;
var nor_1 = require("./nor");
exports.nor = nor_1.default;
var not_1 = require("./not");
exports.not = not_1.default;
var or_1 = require("./or");
exports.or = or_1.default;
var read_1 = require("./read");
exports.read = read_1.default;
var read_int_1 = require("./read-int");
exports.readInt = read_int_1.default;
var read_u_int_1 = require("./read-u-int");
exports.readUInt = read_u_int_1.default;
var xnor_1 = require("./xnor");
exports.xnor = xnor_1.default;
var xor_1 = require("./xor");
exports.xor = xor_1.default;
exports.default = {
    and: and_1.default,
    create: create_1.default,
    modify: modify_1.default,
    nand: nand_1.default,
    nor: nor_1.default,
    not: not_1.default,
    or: or_1.default,
    read: read_1.default,
    readInt: read_int_1.default,
    readUInt: read_u_int_1.default,
    xnor: xnor_1.default,
    xor: xor_1.default,
};

},{"./and":20,"./create":21,"./modify":23,"./nand":24,"./nor":25,"./not":26,"./or":27,"./read":30,"./read-int":28,"./read-u-int":29,"./xnor":31,"./xor":32}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var write_1 = require("../byte/write");
var read_1 = require("./read");
/**
 * Modifies the buffer's bits to equal newBits starting at bitOffset.
 *
 * @example
 * modifyBuffer(buffer, [0,0,1,0], 0) => buffer was modified
 *
 * @param {Buffer} buffer the buffer to modify
 * @param {Array} bits the bits to insert
 * @param {Number} offset where to start (in bits)
 * @returns {undefined}
 */
exports.default = (function (buffer, bits, offset) {
    if (offset === void 0) { offset = 0; }
    var start = Math.floor(offset / 8);
    var end = Math.ceil((offset + bits.length) / 8);
    var subBuffer = buffer.slice(start, end);
    var byteData = read_1.default(subBuffer);
    var subOffset = offset % 8;
    for (var i = 0; i < bits.length; i++)
        byteData[subOffset++] = bits[i];
    var length = end - start;
    for (var i_1 = 0; i_1 < length; i_1++)
        subBuffer[i_1] = write_1.default(byteData.slice(i_1 * 8, (i_1 + 1) * 8));
});

},{"../byte/write":35,"./read":30}],24:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise NAND to the contents of two buffers. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.nand(buffer1, buffer2, false) => Buffer(buffer1 NAND buffer2)
 *
 * @param {Buffer} buffer1 first buffer
 * @param {Buffer} buffer2 second buffer
 * @param {Boolean} isLooping loop through first buffer
 * @return {Buffer} buffer1 NAND buffer2
 */
exports.default = (function (buffer1, buffer2, isLooping) {
    if (isLooping === void 0) { isLooping = false; }
    var length = isLooping ? buffer2.length : buffer1.length;
    var result = Buffer.alloc(length);
    for (var i = 0; i < length; i++) {
        var j = isLooping ? i % buffer1.length : i;
        result[i] = ~(buffer1[j] & buffer2[i]);
    }
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],25:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise NOR to the contents of two buffers. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.nor(buffer1, buffer2, false) => Buffer(buffer1 NOR buffer2)
 *
 * @param {Buffer} buffer1 first buffer
 * @param {Buffer} buffer2 second buffer
 * @param {Boolean} isLooping loop through first buffer
 * @return {Buffer} buffer1 NOR buffer2
 */
exports.default = (function (buffer1, buffer2, isLooping) {
    if (isLooping === void 0) { isLooping = false; }
    var length = isLooping ? buffer2.length : buffer1.length;
    var result = Buffer.alloc(length);
    for (var i = 0; i < length; i++) {
        var j = isLooping ? i % buffer1.length : i;
        result[i] = ~(buffer1[j] | buffer2[i]);
    }
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],26:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise NOT to the contents of a buffer. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.not(buffer) => Buffer(NOT buffer)
 *
 * @param {Buffer} buffer input data
 * @return {Buffer} Buffer(NOT buffer)
 */
exports.default = (function (buffer) {
    var result = Buffer.alloc(buffer.length);
    for (var i = 0; i < buffer.length; i++)
        result[i] = ~buffer[i];
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],27:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise OR to the contents of two buffers. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.or(buffer1, buffer2, false) => Buffer(buffer1 OR buffer2)
 *
 * @param {Buffer} buffer1 first buffer
 * @param {Buffer} buffer2 second buffer
 * @param {Boolean} isLooping loop through first buffer
 * @return {Buffer} buffer1 OR buffer2
 */
exports.default = (function (buffer1, buffer2, isLooping) {
    if (isLooping === void 0) { isLooping = false; }
    var length = isLooping ? buffer2.length : buffer1.length;
    var result = Buffer.alloc(length);
    for (var i = 0; i < length; i++) {
        var j = isLooping ? i % buffer1.length : i;
        result[i] = buffer1[j] | buffer2[i];
    }
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var not_1 = require("../bits/not");
var read_1 = require("./read");
// 32-bit powers of two wouldn't be possible with <<
var p2 = [];
for (var i = 0; i < 32; i++)
    p2[i] = Math.pow(2, i);
/**
 * Converts a section of a buffer to a signed integer.
 *
 * @example
 * // buffer 11110110
 * readUInt(buffer, 3, 5) => -10
 *
 * @param {Buffer} buffer the buffer to extract information from
 * @param {Number} length the length of the signed integer (in bits)
 * @param {Number} offset where to start (in bits)
 * @return {Number}
 */
exports.default = (function (buffer, offset, length) {
    if (offset === void 0) { offset = 0; }
    if (length === void 0) { length = 8; }
    var bits = read_1.default(buffer, offset, length);
    if (bits[0] === 0) {
        var result = 0;
        for (var i = 0; i < length; i++)
            if (bits[i])
                result += p2[length - i - 1];
        return result;
    }
    else {
        var result = -1;
        var inverted = not_1.default(bits);
        for (var i = 0; i < length; i++)
            if (inverted[i])
                result -= p2[length - i - 1];
        return result;
    }
});

},{"../bits/not":8,"./read":30}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var read_1 = require("./read");
// 32-bit powers of two wouldn't be possible with <<
var p2 = [];
for (var i = 0; i < 32; i++)
    p2[i] = Math.pow(2, i);
/**
 * Converts a section of a buffer to an unsigned integer.
 *
 * @example
 * // buffer 11110110
 * readUInt(buffer, 3, 5) => 22
 *
 * @param {Buffer} buffer the buffer to extract information from
 * @param {Number} length the length of the unsigned integer (in bits)
 * @param {Number} offset where to start (in bits)
 * @returns {Number}
 */
exports.default = (function (buffer, offset, length) {
    if (offset === void 0) { offset = 0; }
    if (length === void 0) { length = 8; }
    var arr = read_1.default(buffer, offset, length);
    var result = 0;
    for (var i = 0; i < length; i++)
        result += arr[i] * p2[length - i - 1];
    return result;
});

},{"./read":30}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var read_1 = require("../byte/read");
/**
 * Returns an Array containing bitLength bits starting at bitOffset.
 *
 * @example
 * readBuffer(buffer, 2, 4) => [0,0,1,0]
 *
 * @param {Buffer} buffer the buffer to read
 * @param {Number} offset where to start (in bits)
 * @param {Number} length how many bits to read
 * @returns {Array}
 */
exports.default = (function (buffer, offset, length) {
    if (offset === void 0) { offset = 0; }
    if (!length)
        length = buffer.length * 8 - offset;
    var start = Math.floor(offset / 8);
    var bytesToRead = Math.floor(length / 8) + 2;
    var arr = [];
    arr.length = bytesToRead * 8;
    for (var i = 0; i < bytesToRead; i++) {
        var toRead = buffer[start + i];
        if (toRead === undefined)
            continue;
        var bits = read_1.default(buffer[start + i]);
        arr[i * 8] = bits[0];
        arr[i * 8 + 1] = bits[1];
        arr[i * 8 + 2] = bits[2];
        arr[i * 8 + 3] = bits[3];
        arr[i * 8 + 4] = bits[4];
        arr[i * 8 + 5] = bits[5];
        arr[i * 8 + 6] = bits[6];
        arr[i * 8 + 7] = bits[7];
    }
    var subOffset = offset % 8;
    return arr.slice(subOffset, subOffset + length);
});

},{"../byte/read":34}],31:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise XNOR to the contents of two buffers. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.xnor(buffer1, buffer2, false) => Buffer(buffer1 XNOR buffer2)
 *
 * @param {Buffer} buffer1 first buffer
 * @param {Buffer} buffer2 second buffer
 * @param {Boolean} isLooping loop through first buffer
 * @return {Buffer} buffer1 XNOR buffer2
 */
exports.default = (function (buffer1, buffer2, isLooping) {
    if (isLooping === void 0) { isLooping = false; }
    var length = isLooping ? buffer2.length : buffer1.length;
    var result = Buffer.alloc(length);
    for (var i = 0; i < length; i++) {
        var j = isLooping ? i % buffer1.length : i;
        result[i] = ~(buffer1[j] ^ buffer2[i]);
    }
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],32:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Applies a bitwise XOR to the contents of two buffers. Returns a new buffer.
 *
 * @example
 * bitwise.buffer.xor(buffer1, buffer2, false) => Buffer(buffer1 XOR buffer2)
 *
 * @param {Buffer} buffer1 first buffer
 * @param {Buffer} buffer2 second buffer
 * @param {Boolean} isLooping loop through first buffer
 * @return {Buffer} buffer1 XOR buffer2
 */
exports.default = (function (buffer1, buffer2, isLooping) {
    if (isLooping === void 0) { isLooping = false; }
    var length = isLooping ? buffer2.length : buffer1.length;
    var result = Buffer.alloc(length);
    for (var i = 0; i < length; i++) {
        var j = isLooping ? i % buffer1.length : i;
        result[i] = buffer1[j] ^ buffer2[i];
    }
    return result;
});

}).call(this,require("buffer").Buffer)

},{"buffer":2}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var read_1 = require("./read");
exports.read = read_1.default;
var write_1 = require("./write");
exports.write = write_1.default;
exports.default = { read: read_1.default, write: write_1.default };

},{"./read":34,"./write":35}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns an Array of length 8 containing the read bits.
 *
 * @example
 * byte.read(42) => [0,0,1,0,1,0,1,0]
 *
 * @param {Number} byte one byte
 * @return {Array}
 */
exports.default = (function (byte) {
    if (byte > 255 || byte < 0 || ~~byte !== byte)
        throw new RangeError('invalid byte');
    var result = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 8; i++)
        result[7 - i] = ((byte >> i) & 1);
    return result;
});

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a UInt8 (0-255) which equals the given bits.
 *
 * @example
 * byte.write([0,0,1,0,1,0,1,0]) => 42
 *
 * @param {Array} bits 8-bit unsigned integer
 * @return {Number}
 */
exports.default = (function (byte) {
    if (!Array.isArray(byte) || byte.length !== 8)
        throw new RangeError('invalid array length');
    var data = 0;
    for (var i = 0; i < 8; i++)
        if (byte[7 - i])
            data |= 1 << i;
    return data;
});

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bits_1 = require("./bits");
exports.bits = bits_1.default;
var buffer_1 = require("./buffer");
exports.buffer = buffer_1.default;
var byte_1 = require("./byte");
exports.byte = byte_1.default;
var integer_1 = require("./integer");
exports.integer = integer_1.default;
var nibble_1 = require("./nibble");
exports.nibble = nibble_1.default;
var string_1 = require("./string");
exports.string = string_1.default;
exports.default = { bits: bits_1.default, buffer: buffer_1.default, byte: byte_1.default, integer: integer_1.default, nibble: nibble_1.default, string: string_1.default };

},{"./bits":5,"./buffer":22,"./byte":33,"./integer":38,"./nibble":41,"./string":44}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Gets the value of a specific bit.
 * @example bitwise.integer.getBit(128, 7) => 1
 * @param {Integer} int32 input number
 * @param {Integer} position bit's position
 * @returns {Integer} bit's value
 */
exports.default = (function (int32, position) {
    return ((int32 >> position) & 1);
});

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var get_bit_1 = require("./get-bit");
exports.getBit = get_bit_1.default;
var set_bit_1 = require("./set-bit");
exports.setBit = set_bit_1.default;
var toggle_bit_1 = require("./toggle-bit");
exports.toggleBit = toggle_bit_1.default;
exports.default = { getBit: get_bit_1.default, setBit: set_bit_1.default, toggleBit: toggle_bit_1.default };

},{"./get-bit":37,"./set-bit":39,"./toggle-bit":40}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sets the value of a specific bit.
 * @example bitwise.integer.set(128, 7, 0) => 0
 * @param {Integer} int32 input number
 * @param {Integer} position bit’s position
 * @param {Integer} value bit’s new value
 * @returns {Integer} resulting number
 */
exports.default = (function (int32, position, value) {
    return (value === 1 ? int32 | (1 << position) : int32 & ~(1 << position));
});

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Toggles a specific bit.
 * @example bitwise.integer.getBit(128, 7) => 0
 * @param {Integer} int32 input number
 * @param {Integer} position bit’s position
 * @returns {Integer} updated number
 */
exports.default = (function (int32, position) { return int32 ^ (1 << position); });

},{}],41:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"./read":42,"./write":43,"dup":33}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns an Array of length 8 containing the read bits.
 *
 * @example
 * nibble.read(15) => [1,1,1,1]
 *
 * @param {Number} nibble one nibble
 * @return {Array}
 */
exports.default = (function (nibble) {
    if (nibble < 16 && nibble >= 0 && Math.floor(nibble) === nibble) {
        var result = [0, 0, 0, 0];
        for (var i = 0; i < 4; i++)
            result[3 - i] = ((nibble >> i) & 1);
        return result;
    }
    else
        throw new RangeError('invalid array length');
});

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a Nibble (0-15) which equals the given bits.
 *
 * @example
 * byte.write([1,0,1,0]) => 10
 *
 * @param {Array} nibble 4-bit unsigned integer
 * @return {Number}
 */
exports.default = (function (nibble) {
    if (!Array.isArray(nibble) || nibble.length !== 4)
        throw new RangeError('invalid array length');
    var result = 0;
    for (var i = 0; i < 4; i++)
        if (nibble[3 - i])
            result |= 1 << i;
    return result;
});

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var to_bits_1 = require("./to-bits");
exports.toBits = to_bits_1.default;
exports.default = { toBits: to_bits_1.default };

},{"./to-bits":45}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts a string into an array of bits. Ignores all characters except 1 and 0.
 *
 * @example
 * toBits('10 10 12$%_.0') => [1,0,1,0,1,0]
 *
 * @param {String} string the string to convert
 * @returns {Array} resulting array of bits
 */
exports.default = (function (string) {
    var result = [];
    for (var i = 0; i < string.length; i++) {
        if (string[i] === '1')
            result.push(1);
        else if (string[i] === '0')
            result.push(0);
    }
    return result;
});

},{}],46:[function(require,module,exports){
module.exports = function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
            var cn = str.charCodeAt(i + 1);
            if (cn >= 0xdc00 && cn <= 0xdfff) {
                var pt = (c - 0xd800) * 0x400 + cn - 0xdc00 + 0x10000;
                
                bytes.push(
                    0xf0 + Math.floor(pt / 64 / 64 / 64),
                    0x80 + Math.floor(pt / 64 / 64) % 64,
                    0x80 + Math.floor(pt / 64) % 64,
                    0x80 + pt % 64
                );
                i += 1;
                continue;
            }
        }
        if (c >= 2048) {
            bytes.push(
                0xe0 + Math.floor(c / 64 / 64),
                0x80 + Math.floor(c / 64) % 64,
                0x80 + c % 64
            );
        }
        else if (c >= 128) {
            bytes.push(0xc0 + Math.floor(c / 64), 0x80 + c % 64);
        }
        else bytes.push(c);
    }
    return bytes;
};

},{}],47:[function(require,module,exports){
$(document).ready(function () {
    var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
    $(window).resize(function () {

        $('#messages_list').css('bottom', $('#message_body').height() + 16);
        $('#messages_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
        $('#rooms_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
        console.log($('.mdc-toolbar').outerHeight());
    });

    if ($(document.body).width() > 500) {
        $('.body_').css('width', $(document.body).width() * 0.7);
        $('.body_').css('border', '1px dashed rgba(0,0,0,.54)');
        $('.body_').css('border-radius', '12px');
        $('.body_').css('bottom', '2px');
        console.log('jo')
    }
    $('#messages_list').css('bottom', $('#message_body').height() + 16);
    $('#messages_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
    $('#rooms_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
    mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field'));
    [].forEach.call(document.querySelectorAll('.mdc-tab-bar'), function (el) {
        mdc.tabBar.MDCTabBar.attachTo(el);
    });


    var selector = '.mdc-button, .mdc-icon-button, .mdc-card__primary-action';
    [].map.call(document.querySelectorAll(selector), function (el) {
        mdc.ripple.MDCRipple.attachTo(el);
    });

    [].forEach.call(document.querySelectorAll('.mdc-linear-progress'), function (el) {
        mdc.linearProgress.MDCLinearProgress.attachTo(el);
    });
    mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field'));

    $("#demo01").animatedModal({color: '#fff', animatedIn: 'fadeIn', animationDuration: '.6s'});
    $('#demo01').click(function () {
        $('#messages_chat_room').addClass('mess_chat_room_show');
        console.log('kuku')
    });
    $('.close-animatedModal').click(function () {
        $('#messages_chat_room').removeClass('mess_chat_room_show');
    });

    /**
     * Инициализация слушателя
     */





    window.app_power = false;
    $('#app_power').click(function () {
        if (window.app_power) {
            window.app_power = false;
            $('#app_power_icon').removeClass('icon-animated-form');
            window.morseListner.stop();
        } else {
            window.app_power = true;
            $('#app_power_icon').addClass('icon-animated-form');
            var typingListner = null;
            window.another_user_message_string = '';
            var messageCallback = function (data) {
                window.another_user_message_string += data.message;
                if (typingListner) {
                    clearTimeout(typingListner);
                } else {
                    $('.typing-indicator').css('opacity',1);
                }
                typingListner = setTimeout(function () {
                    $('.typing-indicator').css('opacity',0);
                    $('#messages_list').append(`<div class="mdc-card-object">
                    <div class="mdc-card line-another-user">
                        <div class="mdc-card-content mdc-typography--body2">${window.another_user_message_string}</div>
                    </div>
                    <div class="mdc-card-spacer"></div>


                </div>`);
                    window.another_user_message_string = '';
                }, 1000);

                console.log('work');
                console.log("Decoded: {\n  timings: " + data.timings + "\n  morse: " + data.morse + "\n  message: " + data.message + "\n}");
            }
            var decoder = new MorseDecoder(45, 40);
            decoder.speedCallback = function () {
                console.log('time to tell speed');
            };

            //осле последнего колбека считаем сообщение завершенным если не будет какого-то спама через 500 милисекунд
            decoder.speedCallbackRateLimiter = 1;
            decoder.lockSpeed = true;
            decoder.messageCallback = messageCallback;
            console.log(decoder.fwpm);
            window.morseListner = new MorseListener(256,-60,-30,530,580,200);

            window.morseListner.decoder = decoder;
            window.morseListner.micSuccessCallback = function () {
                console.log('connected mic');
            };

            window.morseListner.startListening();
            window.morseListner.processSound();
        }
    });


    //три режима. 1 - обычный наиболее медленный, надеждный. (просто передача текста через строку) 2 - этот метод передаёт слова, как цифры. 3 - этот метод исопльзует буквы ? 4 - спец метод шиврования ??? черезз циырф 5 - метод через музыку ? 6. акцент не на биты а на цифры и качество сигнала 7.Транслировать оригинал.

//трансляция оригинала и команд, в формате текста. русский буквы - декодировать в английские.

    //через стак меыыфпу и пустату.


    /**
     * Инициализация преобразователя
     *
     * */



    var bitwise = require('bitwise');
    var bytes = require('utf8-bytes');


    window.messages = 0;
    $('#message_send').click(function () {
        sendMessage();
    });
    function sendMessage(){
        console.log($('#tf-outlined-message-input').val());
        if ($('#tf-outlined-message-input').val()) {
            var object = {};
            object.m = $('#tf-outlined-message-input').val();
            var data_b = bytes(JSON.stringify(object));
            var data_s = [];

            for (var i = 0; i < data_b.length; i++) {

                data_s = data_s.concat(bitwise.byte.read(data_b[i]));
                //data_s.push(-1)
            }
            console.log(object);
            console.log(JSON.stringify(object));
            console.log(data_b);
            console.log(data_s);
            var end_ = object.m;


            /*
            console.log($('#tf-outlined-message-input').val());
            var object = {};
            object.m = $('#tf-outlined-message-input').val();
            var data_b = bytes(JSON.stringify(object));
            var data_s = [];

            for(var i = 0 ; i < data_b.length; i++){

                data_s = data_s.concat(bitwise.byte.read(data_b[i]));
                //data_s.push(-1)
            }
            console.log(object);
            console.log(JSON.stringify(object));
            console.log(data_b);
            console.log(data_s);
            var end_ = data_s.join('');
            end_ = end_.replace(/0/g, "e");
            end_ = end_.replace(/1/g, "t");
            console.log(end_);
*/

            /*
            console.log($('#tf-outlined-message-input').val());
            var object = {};
            object.m = $('#tf-outlined-message-input').val();
            var data_b = bytes(JSON.stringify(object));
            var data_s = [];

            for(var i = 0 ; i < data_b.length; i++){

                data_s = data_s.concat(bitwise.byte.read(data_b[i]));
                //data_s.push(-1)
            }
            console.log(object);
            console.log(JSON.stringify(object));
            console.log(data_b);
            var specl = data_s.join('');
            specl =specl.replace(/0/g, "e");
            specl = specl.replace(/1/g, "t");
            console.log(specl);
            var end_ = data_b.join();
            //ожно попробовать заменить на ускореный режим.
            end_ = end_.replace(/0/g, "e");
            end_ = end_.replace(/8/g, "t");
            end_ = end_.replace(/3/g, "n");
            console.log(end_);
*/

            //var MorseCWWave =require( './data-transferer/morse-pro-cw-wave').default;
            //var MorsePlayerWAA = require( './data-transferer/morse-pro-player-waa').default;
            //var MorseListener = require ('./data-transferer/morse-pro-listener').default;
            //var MorseDecoder = require('./data-transferer/morse-pro-decoder').default;

            //var MorseCW = require('./data-transferer/morse-pro-cw').default;


            $('#messages_list').append(`<div  class="mdc-card-object">
                    <div class="mdc-card-spacer"></div>
                    <div class="mdc-card line-current-user ">
                        <div class="mdc-card-content mdc-typography--body2">${object.m}


                            </div>
                        <div id="${"specM" + window.messages}" role="progressbar" class=" mdc-linear-progress-trans mdc-linear-progress mdc-linear-progress--indeterminate">
                            <div class="mdc-linear-progress__buffering-dots"></div>
                            <div class="mdc-linear-progress__buffer"></div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                                <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                                <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                        </div>
                    </div>
                </div>`);

//С новым годом!

            var morseCW = new MorseCW(true, 45, 50);
            morseCW.translate(end_);
            var timings = morseCW.getDuration();
            //console.log(timings);
            var morseCWWave = new MorseCWWave(true, 45, 40);

            morseCWWave.translate(end_);
            console.log(morseCWWave.timings);
            var morsePlayerWAA = new MorsePlayerWAA();
            //

            morsePlayerWAA.loadCWWave(morseCWWave);
            morsePlayerWAA.playFromStart();
            //console.log('work');
            $('#message_body').addClass('mdc-text-field--disabled');
            $('#tf-outlined-message-input').val('');
            $('#tf-outlined-message-input').blur();

            setTimeout(function () {
                $('#specM' + window.messages).css('height', '0px');
                setTimeout(function () {
                    $('#specM' + window.messages).remove();
                    window.messages += 1;
                    $('#message_body').removeClass('mdc-text-field--disabled');
                    //clearInterval(endListner);
                }, 500);
            }, timings + 500);

        }
        }
    $('#tf-outlined-message-input').keypress(function (e) {
        if (e.keyCode === 13) {



            sendMessage();
        }

    });

});
},{"bitwise":36,"utf8-bytes":46}]},{},[47])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL0FldnVtL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkM6L1VzZXJzL0FldnVtL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qcyIsIkM6L1VzZXJzL0FldnVtL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIkM6L1VzZXJzL0FldnVtL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL2FuZC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL25hbmQuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL25vci5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMvbm90LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYml0cy9vci5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMvcmVkdWNlLWFuZC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMvcmVkdWNlLW5hbmQuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL3JlZHVjZS1ub3IuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL3JlZHVjZS1vci5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMvcmVkdWNlLXhub3IuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL3JlZHVjZS14b3IuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL3RvLWJvb2xlYW4uanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9iaXRzL3RvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMveG5vci5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2JpdHMveG9yLmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYnVmZmVyL2FuZC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2J1ZmZlci9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9idWZmZXIvbW9kaWZ5LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYnVmZmVyL25hbmQuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9idWZmZXIvbm9yLmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYnVmZmVyL25vdC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2J1ZmZlci9vci5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2J1ZmZlci9yZWFkLWludC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2J1ZmZlci9yZWFkLXUtaW50LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYnVmZmVyL3JlYWQuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9idWZmZXIveG5vci5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2J1ZmZlci94b3IuanMiLCJub2RlX21vZHVsZXMvYml0d2lzZS9ieXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYnl0ZS9yZWFkLmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvYnl0ZS93cml0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvaW50ZWdlci9nZXQtYml0LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvaW50ZWdlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2ludGVnZXIvc2V0LWJpdC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL2ludGVnZXIvdG9nZ2xlLWJpdC5qcyIsIm5vZGVfbW9kdWxlcy9iaXR3aXNlL25pYmJsZS9yZWFkLmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2UvbmliYmxlL3dyaXRlLmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2Uvc3RyaW5nL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JpdHdpc2Uvc3RyaW5nL3RvLWJpdHMuanMiLCJub2RlX21vZHVsZXMvdXRmOC1ieXRlcy9pbmRleC5qcyIsIndhbGtpZS9qcy9pbmRleF9kZXYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxuLy8gU3VwcG9ydCBkZWNvZGluZyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5ncywgYXMgTm9kZS5qcyBkb2VzLlxuLy8gU2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjQjVVJMX2FwcGxpY2F0aW9uc1xucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gZ2V0TGVucyAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIFRyaW0gb2ZmIGV4dHJhIGJ5dGVzIGFmdGVyIHBsYWNlaG9sZGVyIGJ5dGVzIGFyZSBmb3VuZFxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9iZWF0Z2FtbWl0L2Jhc2U2NC1qcy9pc3N1ZXMvNDJcbiAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoJz0nKVxuICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlblxuXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuXG4gICAgPyAwXG4gICAgOiA0IC0gKHZhbGlkTGVuICUgNClcblxuICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dXG59XG5cbi8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpXG4gIHZhciB2YWxpZExlbiA9IGxlbnNbMF1cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV1cbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIF9ieXRlTGVuZ3RoIChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pIHtcbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG5cbiAgdmFyIGFyciA9IG5ldyBBcnIoX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSlcblxuICB2YXIgY3VyQnl0ZSA9IDBcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIHZhciBsZW4gPSBwbGFjZUhvbGRlcnNMZW4gPiAwXG4gICAgPyB2YWxpZExlbiAtIDRcbiAgICA6IHZhbGlkTGVuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayhcbiAgICAgIHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aClcbiAgICApKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgcGFydHMucHVzaChcbiAgICAgIGxvb2t1cFt0bXAgPj4gMl0gK1xuICAgICAgbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXSArXG4gICAgICAnPT0nXG4gICAgKVxuICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcbiAgICB0bXAgPSAodWludDhbbGVuIC0gMl0gPDwgOCkgKyB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDEwXSArXG4gICAgICBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl0gK1xuICAgICAgJz0nXG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxodHRwczovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxudmFyIEtfTUFYX0xFTkdUSCA9IDB4N2ZmZmZmZmZcbmV4cG9ydHMua01heExlbmd0aCA9IEtfTUFYX0xFTkdUSFxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBQcmludCB3YXJuaW5nIGFuZCByZWNvbW1lbmQgdXNpbmcgYGJ1ZmZlcmAgdjQueCB3aGljaCBoYXMgYW4gT2JqZWN0XG4gKiAgICAgICAgICAgICAgIGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBXZSByZXBvcnQgdGhhdCB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBpZiB0aGUgYXJlIG5vdCBzdWJjbGFzc2FibGVcbiAqIHVzaW5nIF9fcHJvdG9fXy4gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWBcbiAqIChTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOCkuIElFIDEwIGxhY2tzIHN1cHBvcnRcbiAqIGZvciBfX3Byb3RvX18gYW5kIGhhcyBhIGJ1Z2d5IHR5cGVkIGFycmF5IGltcGxlbWVudGF0aW9uLlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICBjb25zb2xlLmVycm9yKFxuICAgICdUaGlzIGJyb3dzZXIgbGFja3MgdHlwZWQgYXJyYXkgKFVpbnQ4QXJyYXkpIHN1cHBvcnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgJyArXG4gICAgJ2BidWZmZXJgIHY1LnguIFVzZSBgYnVmZmVyYCB2NC54IGlmIHlvdSByZXF1aXJlIG9sZCBicm93c2VyIHN1cHBvcnQuJ1xuICApXG59XG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgLy8gQ2FuIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkP1xuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5fX3Byb3RvX18gPSB7IF9fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfSB9XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAncGFyZW50Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclxuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ29mZnNldCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5ieXRlT2Zmc2V0XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAobGVuZ3RoKSB7XG4gIGlmIChsZW5ndGggPiBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIGxlbmd0aCArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIHZhciBidWYgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuLyoqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGhhdmUgdGhlaXJcbiAqIHByb3RvdHlwZSBjaGFuZ2VkIHRvIGBCdWZmZXIucHJvdG90eXBlYC4gRnVydGhlcm1vcmUsIGBCdWZmZXJgIGlzIGEgc3ViY2xhc3Mgb2ZcbiAqIGBVaW50OEFycmF5YCwgc28gdGhlIHJldHVybmVkIGluc3RhbmNlcyB3aWxsIGhhdmUgYWxsIHRoZSBub2RlIGBCdWZmZXJgIG1ldGhvZHNcbiAqIGFuZCB0aGUgYFVpbnQ4QXJyYXlgIG1ldGhvZHMuIFNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0XG4gKiByZXR1cm5zIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIFRoZSBgVWludDhBcnJheWAgcHJvdG90eXBlIHJlbWFpbnMgdW5tb2RpZmllZC5cbiAqL1xuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAnVGhlIFwic3RyaW5nXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIHN0cmluZy4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBhbGxvY1Vuc2FmZShhcmcpXG4gIH1cbiAgcmV0dXJuIGZyb20oYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgIT0gbnVsbCAmJlxuICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLCBTeW1ib2wuc3BlY2llcywge1xuICAgIHZhbHVlOiBudWxsLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB3cml0YWJsZTogZmFsc2VcbiAgfSlcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbmZ1bmN0aW9uIGZyb20gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2UodmFsdWUpXG4gIH1cblxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHRocm93IFR5cGVFcnJvcihcbiAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCAnICtcbiAgICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgICApXG4gIH1cblxuICBpZiAoaXNJbnN0YW5jZSh2YWx1ZSwgQXJyYXlCdWZmZXIpIHx8XG4gICAgICAodmFsdWUgJiYgaXNJbnN0YW5jZSh2YWx1ZS5idWZmZXIsIEFycmF5QnVmZmVyKSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgKVxuICB9XG5cbiAgdmFyIHZhbHVlT2YgPSB2YWx1ZS52YWx1ZU9mICYmIHZhbHVlLnZhbHVlT2YoKVxuICBpZiAodmFsdWVPZiAhPSBudWxsICYmIHZhbHVlT2YgIT09IHZhbHVlKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlT2YsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIHZhciBiID0gZnJvbU9iamVjdCh2YWx1ZSlcbiAgaWYgKGIpIHJldHVybiBiXG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1ByaW1pdGl2ZSAhPSBudWxsICYmXG4gICAgICB0eXBlb2YgdmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbShcbiAgICAgIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0oJ3N0cmluZycpLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGhcbiAgICApXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICdUaGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCAnICtcbiAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gIClcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBOb3RlOiBDaGFuZ2UgcHJvdG90eXBlICphZnRlciogQnVmZmVyLmZyb20gaXMgZGVmaW5lZCB0byB3b3JrYXJvdW5kIENocm9tZSBidWc6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzE0OFxuQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIHNpemUgKyAnXCIgaXMgaW52YWxpZCBmb3Igb3B0aW9uIFwic2l6ZVwiJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGxvYyAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICBpZiAoc2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKVxuICB9XG4gIGlmIChmaWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gZW5jb2RpbmcgaWYgaXQncyBhIHN0cmluZy4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWxseSBzZW5kaW5nIGluIGEgbnVtYmVyIHRoYXQgd291bGRcbiAgICAvLyBiZSBpbnRlcnByZXR0ZWQgYXMgYSBzdGFydCBvZmZzZXQuXG4gICAgcmV0dXJuIHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgID8gY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbCwgZW5jb2RpbmcpXG4gICAgICA6IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqIGFsbG9jKHNpemVbLCBmaWxsWywgZW5jb2RpbmddXSlcbiAqKi9cbkJ1ZmZlci5hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICByZXR1cm4gYWxsb2Moc2l6ZSwgZmlsbCwgZW5jb2RpbmcpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlIChzaXplKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gYnVmLndyaXRlKHN0cmluZywgZW5jb2RpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICBidWYgPSBidWYuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlIChhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJvZmZzZXRcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcImxlbmd0aFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICB2YXIgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICB2YXIgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbilcblxuICAgIGlmIChidWYubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnVmXG4gICAgfVxuXG4gICAgb2JqLmNvcHkoYnVmLCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIGJ1ZlxuICB9XG5cbiAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYU4ob2JqLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICB9XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqKVxuICB9XG5cbiAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iai5kYXRhKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZSAmJlxuICAgIGIgIT09IEJ1ZmZlci5wcm90b3R5cGUgLy8gc28gQnVmZmVyLmlzQnVmZmVyKEJ1ZmZlci5wcm90b3R5cGUpIHdpbGwgYmUgZmFsc2Vcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmIChpc0luc3RhbmNlKGEsIFVpbnQ4QXJyYXkpKSBhID0gQnVmZmVyLmZyb20oYSwgYS5vZmZzZXQsIGEuYnl0ZUxlbmd0aClcbiAgaWYgKGlzSW5zdGFuY2UoYiwgVWludDhBcnJheSkpIGIgPSBCdWZmZXIuZnJvbShiLCBiLm9mZnNldCwgYi5ieXRlTGVuZ3RoKVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJidWYxXCIsIFwiYnVmMlwiIGFyZ3VtZW50cyBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5J1xuICAgIClcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKGxlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYnVmID0gbGlzdFtpXVxuICAgIGlmIChpc0luc3RhbmNlKGJ1ZiwgVWludDhBcnJheSkpIHtcbiAgICAgIGJ1ZiA9IEJ1ZmZlci5mcm9tKGJ1ZilcbiAgICB9XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgaXNJbnN0YW5jZShzdHJpbmcsIEFycmF5QnVmZmVyKSkge1xuICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwic3RyaW5nXCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgb3IgQXJyYXlCdWZmZXIuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBzdHJpbmdcbiAgICApXG4gIH1cblxuICB2YXIgbGVuID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbXVzdE1hdGNoID0gKGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSA9PT0gdHJ1ZSlcbiAgaWYgKCFtdXN0TWF0Y2ggJiYgbGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB7XG4gICAgICAgICAgcmV0dXJuIG11c3RNYXRjaCA/IC0xIDogdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgfVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJzaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCAoYW5kIHRoZSBgaXMtYnVmZmVyYCBucG0gcGFja2FnZSlcbi8vIHRvIGRldGVjdCBhIEJ1ZmZlciBpbnN0YW5jZS4gSXQncyBub3QgcG9zc2libGUgdG8gdXNlIGBpbnN0YW5jZW9mIEJ1ZmZlcmBcbi8vIHJlbGlhYmx5IGluIGEgYnJvd3NlcmlmeSBjb250ZXh0IGJlY2F1c2UgdGhlcmUgY291bGQgYmUgbXVsdGlwbGUgZGlmZmVyZW50XG4vLyBjb3BpZXMgb2YgdGhlICdidWZmZXInIHBhY2thZ2UgaW4gdXNlLiBUaGlzIG1ldGhvZCB3b3JrcyBldmVuIGZvciBCdWZmZXJcbi8vIGluc3RhbmNlcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIGFub3RoZXIgY29weSBvZiB0aGUgYGJ1ZmZlcmAgcGFja2FnZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE1NFxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgdmFyIGkgPSBiW25dXG4gIGJbbl0gPSBiW21dXG4gIGJbbV0gPSBpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDE2ID0gZnVuY3Rpb24gc3dhcDE2ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAzMiA9IGZ1bmN0aW9uIHN3YXAzMiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDY0LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDgpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyA3KVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyA2KVxuICAgIHN3YXAodGhpcywgaSArIDIsIGkgKyA1KVxuICAgIHN3YXAodGhpcywgaSArIDMsIGkgKyA0KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0xvY2FsZVN0cmluZyA9IEJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmdcblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICB2YXIgc3RyID0gJydcbiAgdmFyIG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKVxuICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmIChpc0luc3RhbmNlKHRhcmdldCwgVWludDhBcnJheSkpIHtcbiAgICB0YXJnZXQgPSBCdWZmZXIuZnJvbSh0YXJnZXQsIHRhcmdldC5vZmZzZXQsIHRhcmdldC5ieXRlTGVuZ3RoKVxuICB9XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInRhcmdldFwiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXkuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdGFyZ2V0KVxuICAgIClcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIHZhciB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICB2YXIgeSA9IGVuZCAtIHN0YXJ0XG4gIHZhciBsZW4gPSBNYXRoLm1pbih4LCB5KVxuXG4gIHZhciB0aGlzQ29weSA9IHRoaXMuc2xpY2UodGhpc1N0YXJ0LCB0aGlzRW5kKVxuICB2YXIgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKG51bWJlcklzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoID4+PiAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRikgPyAyXG4gICAgICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IHNob3VsZCBiZSBhIEJ1ZmZlcicpXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gVXNlIGJ1aWx0LWluIHdoZW4gYXZhaWxhYmxlLCBtaXNzaW5nIGZyb20gSUUxMVxuICAgIHRoaXMuY29weVdpdGhpbih0YXJnZXRTdGFydCwgc3RhcnQsIGVuZClcbiAgfSBlbHNlIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAodmFyIGkgPSBsZW4gLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbi8vIFVzYWdlOlxuLy8gICAgYnVmZmVyLmZpbGwobnVtYmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChidWZmZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKHN0cmluZ1ssIG9mZnNldFssIGVuZF1dWywgZW5jb2RpbmddKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kLCBlbmNvZGluZykge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBzdGFydFxuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5kXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmNvZGluZyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgIH1cbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFyIGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKChlbmNvZGluZyA9PT0gJ3V0ZjgnICYmIGNvZGUgPCAxMjgpIHx8XG4gICAgICAgICAgZW5jb2RpbmcgPT09ICdsYXRpbjEnKSB7XG4gICAgICAgIC8vIEZhc3QgcGF0aDogSWYgYHZhbGAgZml0cyBpbnRvIGEgc2luZ2xlIGJ5dGUsIHVzZSB0aGF0IG51bWVyaWMgdmFsdWUuXG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgdmFsdWUgXCInICsgdmFsICtcbiAgICAgICAgJ1wiIGlzIGludmFsaWQgZm9yIGFyZ3VtZW50IFwidmFsdWVcIicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teKy8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgdGFrZXMgZXF1YWwgc2lnbnMgYXMgZW5kIG9mIHRoZSBCYXNlNjQgZW5jb2RpbmdcbiAgc3RyID0gc3RyLnNwbGl0KCc9JylbMF1cbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0ci50cmltKCkucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG4vLyBBcnJheUJ1ZmZlciBvciBVaW50OEFycmF5IG9iamVjdHMgZnJvbSBvdGhlciBjb250ZXh0cyAoaS5lLiBpZnJhbWVzKSBkbyBub3QgcGFzc1xuLy8gdGhlIGBpbnN0YW5jZW9mYCBjaGVjayBidXQgdGhleSBzaG91bGQgYmUgdHJlYXRlZCBhcyBvZiB0aGF0IHR5cGUuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNjZcbmZ1bmN0aW9uIGlzSW5zdGFuY2UgKG9iaiwgdHlwZSkge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgdHlwZSB8fFxuICAgIChvYmogIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPSBudWxsICYmXG4gICAgICBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gdHlwZS5uYW1lKVxufVxuZnVuY3Rpb24gbnVtYmVySXNOYU4gKG9iaikge1xuICAvLyBGb3IgSUUxMSBzdXBwb3J0XG4gIHJldHVybiBvYmogIT09IG9iaiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSAoZSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSAobSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICgodmFsdWUgKiBjKSAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgdGhlIEFORCBvcGVyYXRpb24sIGV4cGVjdHMgdHdvIGFycmF5cyBvZiB0aGUgc2FtZSBzaXplIGFuZCByZXR1cm5zIGEgbmV3IG9uZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYW5kKFsxLDAsMCwwLDEsMSwwLDFdLCBbMCwxLDEsMCwwLDEsMCwwXSkgPT4gWzAsMCwwLDAsMCwxLDAsMF1cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzMSBpbnB1dCBkYXRhXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzMiBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gW2JpdHMxIEFORCBiaXRzMl1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzMSwgYml0czIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaXRzMS5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzdWx0W2ldID0gKGJpdHMxW2ldICYgYml0czJbaV0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGFuZF8xID0gcmVxdWlyZShcIi4vYW5kXCIpO1xuZXhwb3J0cy5hbmQgPSBhbmRfMS5kZWZhdWx0O1xudmFyIG5hbmRfMSA9IHJlcXVpcmUoXCIuL25hbmRcIik7XG5leHBvcnRzLm5hbmQgPSBuYW5kXzEuZGVmYXVsdDtcbnZhciBub3JfMSA9IHJlcXVpcmUoXCIuL25vclwiKTtcbmV4cG9ydHMubm9yID0gbm9yXzEuZGVmYXVsdDtcbnZhciBub3RfMSA9IHJlcXVpcmUoXCIuL25vdFwiKTtcbmV4cG9ydHMubm90ID0gbm90XzEuZGVmYXVsdDtcbnZhciBvcl8xID0gcmVxdWlyZShcIi4vb3JcIik7XG5leHBvcnRzLm9yID0gb3JfMS5kZWZhdWx0O1xudmFyIHJlZHVjZV9hbmRfMSA9IHJlcXVpcmUoXCIuL3JlZHVjZS1hbmRcIik7XG5leHBvcnRzLnJlZHVjZUFuZCA9IHJlZHVjZV9hbmRfMS5kZWZhdWx0O1xudmFyIHJlZHVjZV9uYW5kXzEgPSByZXF1aXJlKFwiLi9yZWR1Y2UtbmFuZFwiKTtcbmV4cG9ydHMucmVkdWNlTmFuZCA9IHJlZHVjZV9uYW5kXzEuZGVmYXVsdDtcbnZhciByZWR1Y2Vfbm9yXzEgPSByZXF1aXJlKFwiLi9yZWR1Y2Utbm9yXCIpO1xuZXhwb3J0cy5yZWR1Y2VOb3IgPSByZWR1Y2Vfbm9yXzEuZGVmYXVsdDtcbnZhciByZWR1Y2Vfb3JfMSA9IHJlcXVpcmUoXCIuL3JlZHVjZS1vclwiKTtcbmV4cG9ydHMucmVkdWNlT3IgPSByZWR1Y2Vfb3JfMS5kZWZhdWx0O1xudmFyIHJlZHVjZV94bm9yXzEgPSByZXF1aXJlKFwiLi9yZWR1Y2UteG5vclwiKTtcbmV4cG9ydHMucmVkdWNlWG5vciA9IHJlZHVjZV94bm9yXzEuZGVmYXVsdDtcbnZhciByZWR1Y2VfeG9yXzEgPSByZXF1aXJlKFwiLi9yZWR1Y2UteG9yXCIpO1xuZXhwb3J0cy5yZWR1Y2VYb3IgPSByZWR1Y2VfeG9yXzEuZGVmYXVsdDtcbnZhciB0b19ib29sZWFuXzEgPSByZXF1aXJlKFwiLi90by1ib29sZWFuXCIpO1xuZXhwb3J0cy50b0Jvb2xlYW4gPSB0b19ib29sZWFuXzEuZGVmYXVsdDtcbnZhciB0b19zdHJpbmdfMSA9IHJlcXVpcmUoXCIuL3RvLXN0cmluZ1wiKTtcbmV4cG9ydHMudG9TdHJpbmcgPSB0b19zdHJpbmdfMS5kZWZhdWx0O1xudmFyIHhub3JfMSA9IHJlcXVpcmUoXCIuL3hub3JcIik7XG5leHBvcnRzLnhub3IgPSB4bm9yXzEuZGVmYXVsdDtcbnZhciB4b3JfMSA9IHJlcXVpcmUoXCIuL3hvclwiKTtcbmV4cG9ydHMueG9yID0geG9yXzEuZGVmYXVsdDtcbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgICBhbmQ6IGFuZF8xLmRlZmF1bHQsXG4gICAgbmFuZDogbmFuZF8xLmRlZmF1bHQsXG4gICAgbm9yOiBub3JfMS5kZWZhdWx0LFxuICAgIG5vdDogbm90XzEuZGVmYXVsdCxcbiAgICBvcjogb3JfMS5kZWZhdWx0LFxuICAgIHJlZHVjZUFuZDogcmVkdWNlX2FuZF8xLmRlZmF1bHQsXG4gICAgcmVkdWNlTmFuZDogcmVkdWNlX25hbmRfMS5kZWZhdWx0LFxuICAgIHJlZHVjZU5vcjogcmVkdWNlX25vcl8xLmRlZmF1bHQsXG4gICAgcmVkdWNlT3I6IHJlZHVjZV9vcl8xLmRlZmF1bHQsXG4gICAgcmVkdWNlWG5vcjogcmVkdWNlX3hub3JfMS5kZWZhdWx0LFxuICAgIHJlZHVjZVhvcjogcmVkdWNlX3hvcl8xLmRlZmF1bHQsXG4gICAgdG9Cb29sZWFuOiB0b19ib29sZWFuXzEuZGVmYXVsdCxcbiAgICB0b1N0cmluZzogdG9fc3RyaW5nXzEuZGVmYXVsdCxcbiAgICB4bm9yOiB4bm9yXzEuZGVmYXVsdCxcbiAgICB4b3I6IHhvcl8xLmRlZmF1bHQsXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgdGhlIE5BTkQgb3BlcmF0aW9uLCBleHBlY3RzIHR3byBhcnJheXMgb2YgdGhlIHNhbWUgc2l6ZSBhbmQgcmV0dXJucyBhIG5ldyBvbmUuXG4gKlxuICogQGV4YW1wbGVcbiAqIG5hbmQoWzEsMCwwLDAsMSwxLDAsMV0sIFswLDEsMSwwLDAsMSwwLDBdKSA9PiBbMSwxLDEsMSwxLDAsMSwxXVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGJpdHMxIGlucHV0IGRhdGFcbiAqIEBwYXJhbSB7QXJyYXl9IGJpdHMyIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSBbYml0czEgTkFORCBiaXRzMl1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzMSwgYml0czIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaXRzMS5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzdWx0W2ldID0gKChiaXRzMVtpXSAmIGJpdHMyW2ldKSBeIDEpO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIHRoZSBOT1Igb3BlcmF0aW9uLCBleHBlY3RzIHR3byBhcnJheXMgb2YgdGhlIHNhbWUgc2l6ZSBhbmQgcmV0dXJucyBhIG5ldyBvbmUuXG4gKlxuICogQGV4YW1wbGVcbiAqIG5vcihbMSwwLDAsMCwxLDEsMCwxXSwgWzAsMSwxLDAsMCwxLDAsMF0pID0+IFswLDAsMCwxLDAsMCwxLDBdXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYml0czEgaW5wdXQgZGF0YVxuICogQHBhcmFtIHtBcnJheX0gYml0czIgaW5wdXQgZGF0YVxuICogQHJldHVybiB7QXJyYXl9IFtiaXRzMSBOT1IgYml0czJdXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0czEsIGJpdHMyKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYml0czEubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFtpXSA9ICgoYml0czFbaV0gfCBiaXRzMltpXSkgXiAxKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogRmxpcHMgYWxsIGdpdmVuIGJpdHMgYW5kIHJldHVybnMgdGhlIGZsaXBwZWQgYml0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogbm90KFsxLDAsMSwxLDAsMV0pID0+IFswLDEsMCwwLDEsMF1cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSBbTk9UIGJpdHNdXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0cykge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpdHMubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFtpXSA9IChiaXRzW2ldIF4gMSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgdGhlIE9SIG9wZXJhdGlvbiwgZXhwZWN0cyB0d28gYXJyYXlzIG9mIHRoZSBzYW1lIHNpemUgYW5kIHJldHVybnMgYSBuZXcgb25lLlxuICpcbiAqIEBleGFtcGxlXG4gKiBvcihbMSwwLDAsMCwxLDEsMCwxXSwgWzAsMSwxLDAsMCwxLDAsMF0pID0+IFsxLDEsMSwwLDEsMSwwLDFdXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYml0czEgaW5wdXQgZGF0YVxuICogQHBhcmFtIHtBcnJheX0gYml0czIgaW5wdXQgZGF0YVxuICogQHJldHVybiB7QXJyYXl9IFtiaXRzMSBPUiBiaXRzMl1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzMSwgYml0czIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaXRzMS5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzdWx0W2ldID0gKGJpdHMxW2ldIHwgYml0czJbaV0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIHRoZSBBTkQgb3BlcmF0aW9uIG9uIHRoZSBnaXZlbiBiaXRzLiBSZXR1cm5zIG9uZSBiaXQuXG4gKiBUaHJvd3MgaWYgbGVzcyB0aGFuIDIgYml0cyBhcmUgZ2l2ZW4uXG4gKlxuICogQGV4YW1wbGVcbiAqIHJlZHVjZUFuZChbMSwgMCwgMCwgMCwgMSwgMSwgMCwgMV0pID0+IDBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge0ludGVnZXJ9IEFORCBiaXRzXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0cykge1xuICAgIGlmIChiaXRzLmxlbmd0aCA8IDIpXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdOb3QgZW5vdWdoIGJpdHMuJyk7XG4gICAgdmFyIHJlc3VsdCA9IGJpdHNbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBiaXRzLmxlbmd0aDsgaSsrKVxuICAgICAgICByZXN1bHQgJj0gYml0c1tpXTtcbiAgICByZXR1cm4gcmVzdWx0O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogQXBwbGllcyB0aGUgTkFORCBvcGVyYXRpb24gb24gdGhlIGdpdmVuIGJpdHMuIFJldHVybnMgb25lIGJpdC5cbiAqIFRocm93cyBpZiBsZXNzIHRoYW4gMiBiaXRzIGFyZSBnaXZlbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogcmVkdWNlTmFuZChbMSwgMCwgMCwgMCwgMSwgMSwgMCwgMV0pID0+IDBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge0ludGVnZXJ9IE5BTkQgYml0c1xuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJpdHMpIHtcbiAgICBpZiAoYml0cy5sZW5ndGggPCAyKVxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignTm90IGVub3VnaCBiaXRzLicpO1xuICAgIHZhciByZXN1bHQgPSBiaXRzWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYml0cy5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzdWx0ID0gKChyZXN1bHQgJiBiaXRzW2ldKSBeIDEpO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIHRoZSBOT1Igb3BlcmF0aW9uIG9uIHRoZSBnaXZlbiBiaXRzLiBSZXR1cm5zIG9uZSBiaXQuXG4gKiBUaHJvd3MgaWYgbGVzcyB0aGFuIDIgYml0cyBhcmUgZ2l2ZW4uXG4gKlxuICogQGV4YW1wbGVcbiAqIHJlZHVjZU5vcihbMSwgMCwgMCwgMCwgMSwgMSwgMCwgMV0pID0+IDBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge0ludGVnZXJ9IE5PUiBiaXRzXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0cykge1xuICAgIGlmIChiaXRzLmxlbmd0aCA8IDIpXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdOb3QgZW5vdWdoIGJpdHMuJyk7XG4gICAgdmFyIHJlc3VsdCA9IGJpdHNbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBiaXRzLmxlbmd0aDsgaSsrKVxuICAgICAgICByZXN1bHQgPSAoKHJlc3VsdCB8IGJpdHNbaV0pIF4gMSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgdGhlIE9SIG9wZXJhdGlvbiBvbiB0aGUgZ2l2ZW4gYml0cy4gUmV0dXJucyBvbmUgYml0LlxuICogVGhyb3dzIGlmIGxlc3MgdGhhbiAyIGJpdHMgYXJlIGdpdmVuLlxuICpcbiAqIEBleGFtcGxlXG4gKiByZWR1Y2VPcihbMSwgMCwgMCwgMCwgMSwgMSwgMCwgMV0pID0+IDFcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge0ludGVnZXJ9IE9SIGJpdHNcbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzKSB7XG4gICAgaWYgKGJpdHMubGVuZ3RoIDwgMilcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ05vdCBlbm91Z2ggYml0cy4nKTtcbiAgICB2YXIgcmVzdWx0ID0gYml0c1swXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGJpdHMubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdCB8PSBiaXRzW2ldO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIHRoZSBYTk9SIG9wZXJhdGlvbiBvbiB0aGUgZ2l2ZW4gYml0cy4gUmV0dXJucyBvbmUgYml0LlxuICogVGhyb3dzIGlmIGxlc3MgdGhhbiAyIGJpdHMgYXJlIGdpdmVuLlxuICpcbiAqIEBleGFtcGxlXG4gKiByZWR1Y2VYbm9yKFsxLCAwLCAwLCAwLCAxLCAxLCAwLCAxXSkgPT4gMVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGJpdHMgaW5wdXQgZGF0YVxuICogQHJldHVybiB7SW50ZWdlcn0gWE5PUiBiaXRzXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0cykge1xuICAgIGlmIChiaXRzLmxlbmd0aCA8IDIpXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdOb3QgZW5vdWdoIGJpdHMuJyk7XG4gICAgdmFyIHJlc3VsdCA9IGJpdHNbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBiaXRzLmxlbmd0aDsgaSsrKVxuICAgICAgICByZXN1bHQgXj0gYml0c1tpXSBeIDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgdGhlIFhPUiBvcGVyYXRpb24gb24gdGhlIGdpdmVuIGJpdHMuIFJldHVybnMgb25lIGJpdC5cbiAqIFRocm93cyBpZiBsZXNzIHRoYW4gMiBiaXRzIGFyZSBnaXZlbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogcmVkdWNlWG9yKFsxLCAwLCAwLCAwLCAxLCAxLCAwLCAxXSkgPT4gMFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGJpdHMgaW5wdXQgZGF0YVxuICogQHJldHVybiB7SW50ZWdlcn0gWE9SIGJpdHNcbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzKSB7XG4gICAgaWYgKGJpdHMubGVuZ3RoIDwgMilcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ05vdCBlbm91Z2ggYml0cy4nKTtcbiAgICB2YXIgcmVzdWx0ID0gYml0c1swXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGJpdHMubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdCBePSBiaXRzW2ldO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBDb252ZXJ0cyBhIGJpdCBhcnJheSB0byBhIGJvb2xlYW4gYXJyYXkuXG4gKlxuICogQGV4YW1wbGUgdG9Cb29sZWFuKFswLCAxXSkgPT4gW2ZhbHNlLCB0cnVlXVxuICogQHBhcmFtIHtBcnJheX0gYml0cyBpbnB1dCBkYXRhXG4gKiBAcmV0dXJucyB7QXJyYXl9IGJvb2xlYW4gYml0c1xuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJpdHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaXRzLmxlbmd0aDsgaSsrKVxuICAgICAgICByZXN1bHRbaV0gPSBiaXRzW2ldID09PSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBDb252ZXJ0cyBhIGJpdCBhcnJheSB0byBhIHN0cmluZy4gSWYgZGVmaW5lZCwgaW5zZXJ0cyBzcGFjZXIgZXZlcnkgc3BhY2luZyBjaGFyYWN0ZXJzLCBidXQgbmV2ZXIgaW5zZXJ0cyBpdCBhcyB0aGUgbGFzdCBzdWJzdHJpbmcuXG4gKlxuICogQGV4YW1wbGVcbiAqIHRvU3RyaW5nKFsxLDAsMSwwLDEsMF0sIDIsICdfJykgPT4gJzEwXzEwXzEwJ1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGJpdHMgdGhlIGJpdHMgdG8gY29udmVydFxuICogQHBhcmFtIHtOdW1iZXJ9IHNwYWNpbmcgd2hlcmUgdG8gcGxhY2UgdGhlIHNwYWNlcnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBzcGFjZXIgdGhlIHN0cmluZyB1c2VkIGFzIGEgc3BhY2VyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0cywgc3BhY2luZywgc3BhY2VyKSB7XG4gICAgaWYgKHNwYWNpbmcgPT09IHZvaWQgMCkgeyBzcGFjaW5nID0gMDsgfVxuICAgIGlmIChzcGFjZXIgPT09IHZvaWQgMCkgeyBzcGFjZXIgPSAnICc7IH1cbiAgICBpZiAoIXNwYWNpbmcpXG4gICAgICAgIHJldHVybiBiaXRzLmpvaW4oJycpO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ICs9IFwiXCIgKyBiaXRzW2ldO1xuICAgICAgICBpZiAoaSAlIHNwYWNpbmcgPT09IHNwYWNpbmcgLSAxICYmIGkgIT09IGJpdHMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIHJlc3VsdCArPSBzcGFjZXI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIHRoZSBleGNsdXNpdmUgTk9SIG9wZXJhdGlvbiwgZXhwZWN0cyB0d28gYXJyYXlzIG9mIHRoZSBzYW1lIHNpemUgYW5kIHJldHVybnMgYSBuZXcgb25lLlxuICpcbiAqIEBleGFtcGxlXG4gKiB4bm9yKFsxLDAsMCwwLDEsMSwwLDFdLCBbMCwxLDEsMCwwLDEsMCwwXSkgPT4gWzAsMCwwLDEsMCwxLDEsMF1cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzMSBpbnB1dCBkYXRhXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzMiBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gW2JpdHMxIFhOT1IgYml0czJdXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYml0czEsIGJpdHMyKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYml0czEubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFtpXSA9IChiaXRzMVtpXSBeIGJpdHMyW2ldIF4gMSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgdGhlIGV4Y2x1c2l2ZSBvciBvcGVyYXRpb24sIGV4cGVjdHMgdHdvIGFycmF5cyBvZiB0aGUgc2FtZSBzaXplIGFuZCByZXR1cm5zIGEgbmV3IG9uZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogeG9yKFsxLDAsMCwwLDEsMSwwLDFdLCBbMCwxLDEsMCwwLDEsMCwwXSkgPT4gWzEsMSwxLDAsMSwwLDAsMV1cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzMSBpbnB1dCBkYXRhXG4gKiBAcGFyYW0ge0FycmF5fSBiaXRzMiBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gW2JpdHMxIFhPUiBiaXRzMl1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzMSwgYml0czIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaXRzMS5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzdWx0W2ldID0gKGJpdHMxW2ldIF4gYml0czJbaV0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIGEgYml0d2lzZSBBTkQgdG8gdGhlIGNvbnRlbnRzIG9mIHR3byBidWZmZXJzLiBSZXR1cm5zIGEgbmV3IGJ1ZmZlci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYml0d2lzZS5idWZmZXIuYW5kKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGZhbHNlKSA9PiBCdWZmZXIoYnVmZmVyMSBBTkQgYnVmZmVyMilcbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyMSBmaXJzdCBidWZmZXJcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIyIHNlY29uZCBidWZmZXJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNMb29waW5nIGxvb3AgdGhyb3VnaCBmaXJzdCBidWZmZXJcbiAqIEByZXR1cm4ge0J1ZmZlcn0gYnVmZmVyMSBBTkQgYnVmZmVyMlxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGlzTG9vcGluZykge1xuICAgIGlmIChpc0xvb3BpbmcgPT09IHZvaWQgMCkgeyBpc0xvb3BpbmcgPSBmYWxzZTsgfVxuICAgIHZhciBsZW5ndGggPSBpc0xvb3BpbmcgPyBidWZmZXIyLmxlbmd0aCA6IGJ1ZmZlcjEubGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSBCdWZmZXIuYWxsb2MobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBqID0gaXNMb29waW5nID8gaSAlIGJ1ZmZlcjEubGVuZ3RoIDogaTtcbiAgICAgICAgcmVzdWx0W2ldID0gYnVmZmVyMVtqXSAmIGJ1ZmZlcjJbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHdyaXRlXzEgPSByZXF1aXJlKFwiLi4vYnl0ZS93cml0ZVwiKTtcbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBidWZmZXIgYW5kIHdyaXRlcyB0aGUgZ2l2ZW4gYml0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogY3JlYXRlQnVmZmVyKFsxLDEsMSwxLCAwLDAsMCwxLCAxLDAsMSwwXSkgPT4gYnVmZmVyIHdpdGggZGF0YSAxMTExIDAwMDEgMTAxMCAwMDAwXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYml0cyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBiaXRzIHRvIGluc2VydFxuICogQHJldHVybnMge0J1ZmZlcn1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChiaXRzKSB7XG4gICAgdmFyIGRhdGEgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhNYXRoLmNlaWwoYml0cy5sZW5ndGggLyA4KSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgICAgICAgIGlmIChiaXRzW2kgKiA4ICsgal0pXG4gICAgICAgICAgICAgICAgZGF0YVtqXSA9IGJpdHNbaSAqIDggKyBqXTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkYXRhW2pdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBidWZmZXJbaV0gPSB3cml0ZV8xLmRlZmF1bHQoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBidWZmZXI7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGFuZF8xID0gcmVxdWlyZShcIi4vYW5kXCIpO1xuZXhwb3J0cy5hbmQgPSBhbmRfMS5kZWZhdWx0O1xudmFyIGNyZWF0ZV8xID0gcmVxdWlyZShcIi4vY3JlYXRlXCIpO1xuZXhwb3J0cy5jcmVhdGUgPSBjcmVhdGVfMS5kZWZhdWx0O1xudmFyIG1vZGlmeV8xID0gcmVxdWlyZShcIi4vbW9kaWZ5XCIpO1xuZXhwb3J0cy5tb2RpZnkgPSBtb2RpZnlfMS5kZWZhdWx0O1xudmFyIG5hbmRfMSA9IHJlcXVpcmUoXCIuL25hbmRcIik7XG5leHBvcnRzLm5hbmQgPSBuYW5kXzEuZGVmYXVsdDtcbnZhciBub3JfMSA9IHJlcXVpcmUoXCIuL25vclwiKTtcbmV4cG9ydHMubm9yID0gbm9yXzEuZGVmYXVsdDtcbnZhciBub3RfMSA9IHJlcXVpcmUoXCIuL25vdFwiKTtcbmV4cG9ydHMubm90ID0gbm90XzEuZGVmYXVsdDtcbnZhciBvcl8xID0gcmVxdWlyZShcIi4vb3JcIik7XG5leHBvcnRzLm9yID0gb3JfMS5kZWZhdWx0O1xudmFyIHJlYWRfMSA9IHJlcXVpcmUoXCIuL3JlYWRcIik7XG5leHBvcnRzLnJlYWQgPSByZWFkXzEuZGVmYXVsdDtcbnZhciByZWFkX2ludF8xID0gcmVxdWlyZShcIi4vcmVhZC1pbnRcIik7XG5leHBvcnRzLnJlYWRJbnQgPSByZWFkX2ludF8xLmRlZmF1bHQ7XG52YXIgcmVhZF91X2ludF8xID0gcmVxdWlyZShcIi4vcmVhZC11LWludFwiKTtcbmV4cG9ydHMucmVhZFVJbnQgPSByZWFkX3VfaW50XzEuZGVmYXVsdDtcbnZhciB4bm9yXzEgPSByZXF1aXJlKFwiLi94bm9yXCIpO1xuZXhwb3J0cy54bm9yID0geG5vcl8xLmRlZmF1bHQ7XG52YXIgeG9yXzEgPSByZXF1aXJlKFwiLi94b3JcIik7XG5leHBvcnRzLnhvciA9IHhvcl8xLmRlZmF1bHQ7XG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gICAgYW5kOiBhbmRfMS5kZWZhdWx0LFxuICAgIGNyZWF0ZTogY3JlYXRlXzEuZGVmYXVsdCxcbiAgICBtb2RpZnk6IG1vZGlmeV8xLmRlZmF1bHQsXG4gICAgbmFuZDogbmFuZF8xLmRlZmF1bHQsXG4gICAgbm9yOiBub3JfMS5kZWZhdWx0LFxuICAgIG5vdDogbm90XzEuZGVmYXVsdCxcbiAgICBvcjogb3JfMS5kZWZhdWx0LFxuICAgIHJlYWQ6IHJlYWRfMS5kZWZhdWx0LFxuICAgIHJlYWRJbnQ6IHJlYWRfaW50XzEuZGVmYXVsdCxcbiAgICByZWFkVUludDogcmVhZF91X2ludF8xLmRlZmF1bHQsXG4gICAgeG5vcjogeG5vcl8xLmRlZmF1bHQsXG4gICAgeG9yOiB4b3JfMS5kZWZhdWx0LFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHdyaXRlXzEgPSByZXF1aXJlKFwiLi4vYnl0ZS93cml0ZVwiKTtcbnZhciByZWFkXzEgPSByZXF1aXJlKFwiLi9yZWFkXCIpO1xuLyoqXG4gKiBNb2RpZmllcyB0aGUgYnVmZmVyJ3MgYml0cyB0byBlcXVhbCBuZXdCaXRzIHN0YXJ0aW5nIGF0IGJpdE9mZnNldC5cbiAqXG4gKiBAZXhhbXBsZVxuICogbW9kaWZ5QnVmZmVyKGJ1ZmZlciwgWzAsMCwxLDBdLCAwKSA9PiBidWZmZXIgd2FzIG1vZGlmaWVkXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciB0aGUgYnVmZmVyIHRvIG1vZGlmeVxuICogQHBhcmFtIHtBcnJheX0gYml0cyB0aGUgYml0cyB0byBpbnNlcnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgd2hlcmUgdG8gc3RhcnQgKGluIGJpdHMpXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ1ZmZlciwgYml0cywgb2Zmc2V0KSB7XG4gICAgaWYgKG9mZnNldCA9PT0gdm9pZCAwKSB7IG9mZnNldCA9IDA7IH1cbiAgICB2YXIgc3RhcnQgPSBNYXRoLmZsb29yKG9mZnNldCAvIDgpO1xuICAgIHZhciBlbmQgPSBNYXRoLmNlaWwoKG9mZnNldCArIGJpdHMubGVuZ3RoKSAvIDgpO1xuICAgIHZhciBzdWJCdWZmZXIgPSBidWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgdmFyIGJ5dGVEYXRhID0gcmVhZF8xLmRlZmF1bHQoc3ViQnVmZmVyKTtcbiAgICB2YXIgc3ViT2Zmc2V0ID0gb2Zmc2V0ICUgODtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpdHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGJ5dGVEYXRhW3N1Yk9mZnNldCsrXSA9IGJpdHNbaV07XG4gICAgdmFyIGxlbmd0aCA9IGVuZCAtIHN0YXJ0O1xuICAgIGZvciAodmFyIGlfMSA9IDA7IGlfMSA8IGxlbmd0aDsgaV8xKyspXG4gICAgICAgIHN1YkJ1ZmZlcltpXzFdID0gd3JpdGVfMS5kZWZhdWx0KGJ5dGVEYXRhLnNsaWNlKGlfMSAqIDgsIChpXzEgKyAxKSAqIDgpKTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgYSBiaXR3aXNlIE5BTkQgdG8gdGhlIGNvbnRlbnRzIG9mIHR3byBidWZmZXJzLiBSZXR1cm5zIGEgbmV3IGJ1ZmZlci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYml0d2lzZS5idWZmZXIubmFuZChidWZmZXIxLCBidWZmZXIyLCBmYWxzZSkgPT4gQnVmZmVyKGJ1ZmZlcjEgTkFORCBidWZmZXIyKVxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIxIGZpcnN0IGJ1ZmZlclxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlcjIgc2Vjb25kIGJ1ZmZlclxuICogQHBhcmFtIHtCb29sZWFufSBpc0xvb3BpbmcgbG9vcCB0aHJvdWdoIGZpcnN0IGJ1ZmZlclxuICogQHJldHVybiB7QnVmZmVyfSBidWZmZXIxIE5BTkQgYnVmZmVyMlxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGlzTG9vcGluZykge1xuICAgIGlmIChpc0xvb3BpbmcgPT09IHZvaWQgMCkgeyBpc0xvb3BpbmcgPSBmYWxzZTsgfVxuICAgIHZhciBsZW5ndGggPSBpc0xvb3BpbmcgPyBidWZmZXIyLmxlbmd0aCA6IGJ1ZmZlcjEubGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSBCdWZmZXIuYWxsb2MobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBqID0gaXNMb29waW5nID8gaSAlIGJ1ZmZlcjEubGVuZ3RoIDogaTtcbiAgICAgICAgcmVzdWx0W2ldID0gfihidWZmZXIxW2pdICYgYnVmZmVyMltpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIGEgYml0d2lzZSBOT1IgdG8gdGhlIGNvbnRlbnRzIG9mIHR3byBidWZmZXJzLiBSZXR1cm5zIGEgbmV3IGJ1ZmZlci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYml0d2lzZS5idWZmZXIubm9yKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGZhbHNlKSA9PiBCdWZmZXIoYnVmZmVyMSBOT1IgYnVmZmVyMilcbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyMSBmaXJzdCBidWZmZXJcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIyIHNlY29uZCBidWZmZXJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNMb29waW5nIGxvb3AgdGhyb3VnaCBmaXJzdCBidWZmZXJcbiAqIEByZXR1cm4ge0J1ZmZlcn0gYnVmZmVyMSBOT1IgYnVmZmVyMlxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGlzTG9vcGluZykge1xuICAgIGlmIChpc0xvb3BpbmcgPT09IHZvaWQgMCkgeyBpc0xvb3BpbmcgPSBmYWxzZTsgfVxuICAgIHZhciBsZW5ndGggPSBpc0xvb3BpbmcgPyBidWZmZXIyLmxlbmd0aCA6IGJ1ZmZlcjEubGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSBCdWZmZXIuYWxsb2MobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBqID0gaXNMb29waW5nID8gaSAlIGJ1ZmZlcjEubGVuZ3RoIDogaTtcbiAgICAgICAgcmVzdWx0W2ldID0gfihidWZmZXIxW2pdIHwgYnVmZmVyMltpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBBcHBsaWVzIGEgYml0d2lzZSBOT1QgdG8gdGhlIGNvbnRlbnRzIG9mIGEgYnVmZmVyLiBSZXR1cm5zIGEgbmV3IGJ1ZmZlci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYml0d2lzZS5idWZmZXIubm90KGJ1ZmZlcikgPT4gQnVmZmVyKE5PVCBidWZmZXIpXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtCdWZmZXJ9IEJ1ZmZlcihOT1QgYnVmZmVyKVxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ1ZmZlcikge1xuICAgIHZhciByZXN1bHQgPSBCdWZmZXIuYWxsb2MoYnVmZmVyLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFtpXSA9IH5idWZmZXJbaV07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgYSBiaXR3aXNlIE9SIHRvIHRoZSBjb250ZW50cyBvZiB0d28gYnVmZmVycy4gUmV0dXJucyBhIG5ldyBidWZmZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIGJpdHdpc2UuYnVmZmVyLm9yKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGZhbHNlKSA9PiBCdWZmZXIoYnVmZmVyMSBPUiBidWZmZXIyKVxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIxIGZpcnN0IGJ1ZmZlclxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlcjIgc2Vjb25kIGJ1ZmZlclxuICogQHBhcmFtIHtCb29sZWFufSBpc0xvb3BpbmcgbG9vcCB0aHJvdWdoIGZpcnN0IGJ1ZmZlclxuICogQHJldHVybiB7QnVmZmVyfSBidWZmZXIxIE9SIGJ1ZmZlcjJcbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChidWZmZXIxLCBidWZmZXIyLCBpc0xvb3BpbmcpIHtcbiAgICBpZiAoaXNMb29waW5nID09PSB2b2lkIDApIHsgaXNMb29waW5nID0gZmFsc2U7IH1cbiAgICB2YXIgbGVuZ3RoID0gaXNMb29waW5nID8gYnVmZmVyMi5sZW5ndGggOiBidWZmZXIxLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0ID0gQnVmZmVyLmFsbG9jKGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaiA9IGlzTG9vcGluZyA/IGkgJSBidWZmZXIxLmxlbmd0aCA6IGk7XG4gICAgICAgIHJlc3VsdFtpXSA9IGJ1ZmZlcjFbal0gfCBidWZmZXIyW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBub3RfMSA9IHJlcXVpcmUoXCIuLi9iaXRzL25vdFwiKTtcbnZhciByZWFkXzEgPSByZXF1aXJlKFwiLi9yZWFkXCIpO1xuLy8gMzItYml0IHBvd2VycyBvZiB0d28gd291bGRuJ3QgYmUgcG9zc2libGUgd2l0aCA8PFxudmFyIHAyID0gW107XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4gICAgcDJbaV0gPSBNYXRoLnBvdygyLCBpKTtcbi8qKlxuICogQ29udmVydHMgYSBzZWN0aW9uIG9mIGEgYnVmZmVyIHRvIGEgc2lnbmVkIGludGVnZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIGJ1ZmZlciAxMTExMDExMFxuICogcmVhZFVJbnQoYnVmZmVyLCAzLCA1KSA9PiAtMTBcbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyIHRoZSBidWZmZXIgdG8gZXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIHRoZSBsZW5ndGggb2YgdGhlIHNpZ25lZCBpbnRlZ2VyIChpbiBiaXRzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCB3aGVyZSB0byBzdGFydCAoaW4gYml0cylcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgaWYgKG9mZnNldCA9PT0gdm9pZCAwKSB7IG9mZnNldCA9IDA7IH1cbiAgICBpZiAobGVuZ3RoID09PSB2b2lkIDApIHsgbGVuZ3RoID0gODsgfVxuICAgIHZhciBiaXRzID0gcmVhZF8xLmRlZmF1bHQoYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCk7XG4gICAgaWYgKGJpdHNbMF0gPT09IDApIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBpZiAoYml0c1tpXSlcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gcDJbbGVuZ3RoIC0gaSAtIDFdO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IC0xO1xuICAgICAgICB2YXIgaW52ZXJ0ZWQgPSBub3RfMS5kZWZhdWx0KGJpdHMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgaWYgKGludmVydGVkW2ldKVxuICAgICAgICAgICAgICAgIHJlc3VsdCAtPSBwMltsZW5ndGggLSBpIC0gMV07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciByZWFkXzEgPSByZXF1aXJlKFwiLi9yZWFkXCIpO1xuLy8gMzItYml0IHBvd2VycyBvZiB0d28gd291bGRuJ3QgYmUgcG9zc2libGUgd2l0aCA8PFxudmFyIHAyID0gW107XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4gICAgcDJbaV0gPSBNYXRoLnBvdygyLCBpKTtcbi8qKlxuICogQ29udmVydHMgYSBzZWN0aW9uIG9mIGEgYnVmZmVyIHRvIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIGJ1ZmZlciAxMTExMDExMFxuICogcmVhZFVJbnQoYnVmZmVyLCAzLCA1KSA9PiAyMlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIgdGhlIGJ1ZmZlciB0byBleHRyYWN0IGluZm9ybWF0aW9uIGZyb21cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggdGhlIGxlbmd0aCBvZiB0aGUgdW5zaWduZWQgaW50ZWdlciAoaW4gYml0cylcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgd2hlcmUgdG8gc3RhcnQgKGluIGJpdHMpXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICBpZiAob2Zmc2V0ID09PSB2b2lkIDApIHsgb2Zmc2V0ID0gMDsgfVxuICAgIGlmIChsZW5ndGggPT09IHZvaWQgMCkgeyBsZW5ndGggPSA4OyB9XG4gICAgdmFyIGFyciA9IHJlYWRfMS5kZWZhdWx0KGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgpO1xuICAgIHZhciByZXN1bHQgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdCArPSBhcnJbaV0gKiBwMltsZW5ndGggLSBpIC0gMV07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgcmVhZF8xID0gcmVxdWlyZShcIi4uL2J5dGUvcmVhZFwiKTtcbi8qKlxuICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGJpdExlbmd0aCBiaXRzIHN0YXJ0aW5nIGF0IGJpdE9mZnNldC5cbiAqXG4gKiBAZXhhbXBsZVxuICogcmVhZEJ1ZmZlcihidWZmZXIsIDIsIDQpID0+IFswLDAsMSwwXVxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIgdGhlIGJ1ZmZlciB0byByZWFkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IHdoZXJlIHRvIHN0YXJ0IChpbiBiaXRzKVxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCBob3cgbWFueSBiaXRzIHRvIHJlYWRcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgaWYgKG9mZnNldCA9PT0gdm9pZCAwKSB7IG9mZnNldCA9IDA7IH1cbiAgICBpZiAoIWxlbmd0aClcbiAgICAgICAgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aCAqIDggLSBvZmZzZXQ7XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5mbG9vcihvZmZzZXQgLyA4KTtcbiAgICB2YXIgYnl0ZXNUb1JlYWQgPSBNYXRoLmZsb29yKGxlbmd0aCAvIDgpICsgMjtcbiAgICB2YXIgYXJyID0gW107XG4gICAgYXJyLmxlbmd0aCA9IGJ5dGVzVG9SZWFkICogODtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzVG9SZWFkOyBpKyspIHtcbiAgICAgICAgdmFyIHRvUmVhZCA9IGJ1ZmZlcltzdGFydCArIGldO1xuICAgICAgICBpZiAodG9SZWFkID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgdmFyIGJpdHMgPSByZWFkXzEuZGVmYXVsdChidWZmZXJbc3RhcnQgKyBpXSk7XG4gICAgICAgIGFycltpICogOF0gPSBiaXRzWzBdO1xuICAgICAgICBhcnJbaSAqIDggKyAxXSA9IGJpdHNbMV07XG4gICAgICAgIGFycltpICogOCArIDJdID0gYml0c1syXTtcbiAgICAgICAgYXJyW2kgKiA4ICsgM10gPSBiaXRzWzNdO1xuICAgICAgICBhcnJbaSAqIDggKyA0XSA9IGJpdHNbNF07XG4gICAgICAgIGFycltpICogOCArIDVdID0gYml0c1s1XTtcbiAgICAgICAgYXJyW2kgKiA4ICsgNl0gPSBiaXRzWzZdO1xuICAgICAgICBhcnJbaSAqIDggKyA3XSA9IGJpdHNbN107XG4gICAgfVxuICAgIHZhciBzdWJPZmZzZXQgPSBvZmZzZXQgJSA4O1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3ViT2Zmc2V0LCBzdWJPZmZzZXQgKyBsZW5ndGgpO1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogQXBwbGllcyBhIGJpdHdpc2UgWE5PUiB0byB0aGUgY29udGVudHMgb2YgdHdvIGJ1ZmZlcnMuIFJldHVybnMgYSBuZXcgYnVmZmVyLlxuICpcbiAqIEBleGFtcGxlXG4gKiBiaXR3aXNlLmJ1ZmZlci54bm9yKGJ1ZmZlcjEsIGJ1ZmZlcjIsIGZhbHNlKSA9PiBCdWZmZXIoYnVmZmVyMSBYTk9SIGJ1ZmZlcjIpXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlcjEgZmlyc3QgYnVmZmVyXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyMiBzZWNvbmQgYnVmZmVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzTG9vcGluZyBsb29wIHRocm91Z2ggZmlyc3QgYnVmZmVyXG4gKiBAcmV0dXJuIHtCdWZmZXJ9IGJ1ZmZlcjEgWE5PUiBidWZmZXIyXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYnVmZmVyMSwgYnVmZmVyMiwgaXNMb29waW5nKSB7XG4gICAgaWYgKGlzTG9vcGluZyA9PT0gdm9pZCAwKSB7IGlzTG9vcGluZyA9IGZhbHNlOyB9XG4gICAgdmFyIGxlbmd0aCA9IGlzTG9vcGluZyA/IGJ1ZmZlcjIubGVuZ3RoIDogYnVmZmVyMS5sZW5ndGg7XG4gICAgdmFyIHJlc3VsdCA9IEJ1ZmZlci5hbGxvYyhsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBpc0xvb3BpbmcgPyBpICUgYnVmZmVyMS5sZW5ndGggOiBpO1xuICAgICAgICByZXN1bHRbaV0gPSB+KGJ1ZmZlcjFbal0gXiBidWZmZXIyW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIEFwcGxpZXMgYSBiaXR3aXNlIFhPUiB0byB0aGUgY29udGVudHMgb2YgdHdvIGJ1ZmZlcnMuIFJldHVybnMgYSBuZXcgYnVmZmVyLlxuICpcbiAqIEBleGFtcGxlXG4gKiBiaXR3aXNlLmJ1ZmZlci54b3IoYnVmZmVyMSwgYnVmZmVyMiwgZmFsc2UpID0+IEJ1ZmZlcihidWZmZXIxIFhPUiBidWZmZXIyKVxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIxIGZpcnN0IGJ1ZmZlclxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlcjIgc2Vjb25kIGJ1ZmZlclxuICogQHBhcmFtIHtCb29sZWFufSBpc0xvb3BpbmcgbG9vcCB0aHJvdWdoIGZpcnN0IGJ1ZmZlclxuICogQHJldHVybiB7QnVmZmVyfSBidWZmZXIxIFhPUiBidWZmZXIyXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYnVmZmVyMSwgYnVmZmVyMiwgaXNMb29waW5nKSB7XG4gICAgaWYgKGlzTG9vcGluZyA9PT0gdm9pZCAwKSB7IGlzTG9vcGluZyA9IGZhbHNlOyB9XG4gICAgdmFyIGxlbmd0aCA9IGlzTG9vcGluZyA/IGJ1ZmZlcjIubGVuZ3RoIDogYnVmZmVyMS5sZW5ndGg7XG4gICAgdmFyIHJlc3VsdCA9IEJ1ZmZlci5hbGxvYyhsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGogPSBpc0xvb3BpbmcgPyBpICUgYnVmZmVyMS5sZW5ndGggOiBpO1xuICAgICAgICByZXN1bHRbaV0gPSBidWZmZXIxW2pdIF4gYnVmZmVyMltpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgcmVhZF8xID0gcmVxdWlyZShcIi4vcmVhZFwiKTtcbmV4cG9ydHMucmVhZCA9IHJlYWRfMS5kZWZhdWx0O1xudmFyIHdyaXRlXzEgPSByZXF1aXJlKFwiLi93cml0ZVwiKTtcbmV4cG9ydHMud3JpdGUgPSB3cml0ZV8xLmRlZmF1bHQ7XG5leHBvcnRzLmRlZmF1bHQgPSB7IHJlYWQ6IHJlYWRfMS5kZWZhdWx0LCB3cml0ZTogd3JpdGVfMS5kZWZhdWx0IH07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogUmV0dXJucyBhbiBBcnJheSBvZiBsZW5ndGggOCBjb250YWluaW5nIHRoZSByZWFkIGJpdHMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGJ5dGUucmVhZCg0MikgPT4gWzAsMCwxLDAsMSwwLDEsMF1cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYnl0ZSBvbmUgYnl0ZVxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoYnl0ZSkge1xuICAgIGlmIChieXRlID4gMjU1IHx8IGJ5dGUgPCAwIHx8IH5+Ynl0ZSAhPT0gYnl0ZSlcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2ludmFsaWQgYnl0ZScpO1xuICAgIHZhciByZXN1bHQgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspXG4gICAgICAgIHJlc3VsdFs3IC0gaV0gPSAoKGJ5dGUgPj4gaSkgJiAxKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogUmV0dXJucyBhIFVJbnQ4ICgwLTI1NSkgd2hpY2ggZXF1YWxzIHRoZSBnaXZlbiBiaXRzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBieXRlLndyaXRlKFswLDAsMSwwLDEsMCwxLDBdKSA9PiA0MlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGJpdHMgOC1iaXQgdW5zaWduZWQgaW50ZWdlclxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGJ5dGUpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYnl0ZSkgfHwgYnl0ZS5sZW5ndGggIT09IDgpXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdpbnZhbGlkIGFycmF5IGxlbmd0aCcpO1xuICAgIHZhciBkYXRhID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKylcbiAgICAgICAgaWYgKGJ5dGVbNyAtIGldKVxuICAgICAgICAgICAgZGF0YSB8PSAxIDw8IGk7XG4gICAgcmV0dXJuIGRhdGE7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGJpdHNfMSA9IHJlcXVpcmUoXCIuL2JpdHNcIik7XG5leHBvcnRzLmJpdHMgPSBiaXRzXzEuZGVmYXVsdDtcbnZhciBidWZmZXJfMSA9IHJlcXVpcmUoXCIuL2J1ZmZlclwiKTtcbmV4cG9ydHMuYnVmZmVyID0gYnVmZmVyXzEuZGVmYXVsdDtcbnZhciBieXRlXzEgPSByZXF1aXJlKFwiLi9ieXRlXCIpO1xuZXhwb3J0cy5ieXRlID0gYnl0ZV8xLmRlZmF1bHQ7XG52YXIgaW50ZWdlcl8xID0gcmVxdWlyZShcIi4vaW50ZWdlclwiKTtcbmV4cG9ydHMuaW50ZWdlciA9IGludGVnZXJfMS5kZWZhdWx0O1xudmFyIG5pYmJsZV8xID0gcmVxdWlyZShcIi4vbmliYmxlXCIpO1xuZXhwb3J0cy5uaWJibGUgPSBuaWJibGVfMS5kZWZhdWx0O1xudmFyIHN0cmluZ18xID0gcmVxdWlyZShcIi4vc3RyaW5nXCIpO1xuZXhwb3J0cy5zdHJpbmcgPSBzdHJpbmdfMS5kZWZhdWx0O1xuZXhwb3J0cy5kZWZhdWx0ID0geyBiaXRzOiBiaXRzXzEuZGVmYXVsdCwgYnVmZmVyOiBidWZmZXJfMS5kZWZhdWx0LCBieXRlOiBieXRlXzEuZGVmYXVsdCwgaW50ZWdlcjogaW50ZWdlcl8xLmRlZmF1bHQsIG5pYmJsZTogbmliYmxlXzEuZGVmYXVsdCwgc3RyaW5nOiBzdHJpbmdfMS5kZWZhdWx0IH07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpYyBiaXQuXG4gKiBAZXhhbXBsZSBiaXR3aXNlLmludGVnZXIuZ2V0Qml0KDEyOCwgNykgPT4gMVxuICogQHBhcmFtIHtJbnRlZ2VyfSBpbnQzMiBpbnB1dCBudW1iZXJcbiAqIEBwYXJhbSB7SW50ZWdlcn0gcG9zaXRpb24gYml0J3MgcG9zaXRpb25cbiAqIEByZXR1cm5zIHtJbnRlZ2VyfSBiaXQncyB2YWx1ZVxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGludDMyLCBwb3NpdGlvbikge1xuICAgIHJldHVybiAoKGludDMyID4+IHBvc2l0aW9uKSAmIDEpO1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBnZXRfYml0XzEgPSByZXF1aXJlKFwiLi9nZXQtYml0XCIpO1xuZXhwb3J0cy5nZXRCaXQgPSBnZXRfYml0XzEuZGVmYXVsdDtcbnZhciBzZXRfYml0XzEgPSByZXF1aXJlKFwiLi9zZXQtYml0XCIpO1xuZXhwb3J0cy5zZXRCaXQgPSBzZXRfYml0XzEuZGVmYXVsdDtcbnZhciB0b2dnbGVfYml0XzEgPSByZXF1aXJlKFwiLi90b2dnbGUtYml0XCIpO1xuZXhwb3J0cy50b2dnbGVCaXQgPSB0b2dnbGVfYml0XzEuZGVmYXVsdDtcbmV4cG9ydHMuZGVmYXVsdCA9IHsgZ2V0Qml0OiBnZXRfYml0XzEuZGVmYXVsdCwgc2V0Qml0OiBzZXRfYml0XzEuZGVmYXVsdCwgdG9nZ2xlQml0OiB0b2dnbGVfYml0XzEuZGVmYXVsdCB9O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIFNldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWMgYml0LlxuICogQGV4YW1wbGUgYml0d2lzZS5pbnRlZ2VyLnNldCgxMjgsIDcsIDApID0+IDBcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW50MzIgaW5wdXQgbnVtYmVyXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHBvc2l0aW9uIGJpdOKAmXMgcG9zaXRpb25cbiAqIEBwYXJhbSB7SW50ZWdlcn0gdmFsdWUgYml04oCZcyBuZXcgdmFsdWVcbiAqIEByZXR1cm5zIHtJbnRlZ2VyfSByZXN1bHRpbmcgbnVtYmVyXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IChmdW5jdGlvbiAoaW50MzIsIHBvc2l0aW9uLCB2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgPT09IDEgPyBpbnQzMiB8ICgxIDw8IHBvc2l0aW9uKSA6IGludDMyICYgfigxIDw8IHBvc2l0aW9uKSk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBUb2dnbGVzIGEgc3BlY2lmaWMgYml0LlxuICogQGV4YW1wbGUgYml0d2lzZS5pbnRlZ2VyLmdldEJpdCgxMjgsIDcpID0+IDBcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW50MzIgaW5wdXQgbnVtYmVyXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHBvc2l0aW9uIGJpdOKAmXMgcG9zaXRpb25cbiAqIEByZXR1cm5zIHtJbnRlZ2VyfSB1cGRhdGVkIG51bWJlclxuICovXG5leHBvcnRzLmRlZmF1bHQgPSAoZnVuY3Rpb24gKGludDMyLCBwb3NpdGlvbikgeyByZXR1cm4gaW50MzIgXiAoMSA8PCBwb3NpdGlvbik7IH0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIFJldHVybnMgYW4gQXJyYXkgb2YgbGVuZ3RoIDggY29udGFpbmluZyB0aGUgcmVhZCBiaXRzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBuaWJibGUucmVhZCgxNSkgPT4gWzEsMSwxLDFdXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5pYmJsZSBvbmUgbmliYmxlXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChuaWJibGUpIHtcbiAgICBpZiAobmliYmxlIDwgMTYgJiYgbmliYmxlID49IDAgJiYgTWF0aC5mbG9vcihuaWJibGUpID09PSBuaWJibGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspXG4gICAgICAgICAgICByZXN1bHRbMyAtIGldID0gKChuaWJibGUgPj4gaSkgJiAxKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW52YWxpZCBhcnJheSBsZW5ndGgnKTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIFJldHVybnMgYSBOaWJibGUgKDAtMTUpIHdoaWNoIGVxdWFscyB0aGUgZ2l2ZW4gYml0cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYnl0ZS53cml0ZShbMSwwLDEsMF0pID0+IDEwXG4gKlxuICogQHBhcmFtIHtBcnJheX0gbmliYmxlIDQtYml0IHVuc2lnbmVkIGludGVnZXJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChuaWJibGUpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobmliYmxlKSB8fCBuaWJibGUubGVuZ3RoICE9PSA0KVxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW52YWxpZCBhcnJheSBsZW5ndGgnKTtcbiAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKylcbiAgICAgICAgaWYgKG5pYmJsZVszIC0gaV0pXG4gICAgICAgICAgICByZXN1bHQgfD0gMSA8PCBpO1xuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHRvX2JpdHNfMSA9IHJlcXVpcmUoXCIuL3RvLWJpdHNcIik7XG5leHBvcnRzLnRvQml0cyA9IHRvX2JpdHNfMS5kZWZhdWx0O1xuZXhwb3J0cy5kZWZhdWx0ID0geyB0b0JpdHM6IHRvX2JpdHNfMS5kZWZhdWx0IH07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBiaXRzLiBJZ25vcmVzIGFsbCBjaGFyYWN0ZXJzIGV4Y2VwdCAxIGFuZCAwLlxuICpcbiAqIEBleGFtcGxlXG4gKiB0b0JpdHMoJzEwIDEwIDEyJCVfLjAnKSA9PiBbMSwwLDEsMCwxLDBdXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB0aGUgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIHtBcnJheX0gcmVzdWx0aW5nIGFycmF5IG9mIGJpdHNcbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gKGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHN0cmluZ1tpXSA9PT0gJzEnKVxuICAgICAgICAgICAgcmVzdWx0LnB1c2goMSk7XG4gICAgICAgIGVsc2UgaWYgKHN0cmluZ1tpXSA9PT0gJzAnKVxuICAgICAgICAgICAgcmVzdWx0LnB1c2goMCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHZhciBieXRlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjID49IDB4ZDgwMCAmJiBjIDw9IDB4ZGJmZiAmJiBpICsgMSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBjbiA9IHN0ci5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgICAgIGlmIChjbiA+PSAweGRjMDAgJiYgY24gPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgICAgdmFyIHB0ID0gKGMgLSAweGQ4MDApICogMHg0MDAgKyBjbiAtIDB4ZGMwMCArIDB4MTAwMDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgMHhmMCArIE1hdGguZmxvb3IocHQgLyA2NCAvIDY0IC8gNjQpLFxuICAgICAgICAgICAgICAgICAgICAweDgwICsgTWF0aC5mbG9vcihwdCAvIDY0IC8gNjQpICUgNjQsXG4gICAgICAgICAgICAgICAgICAgIDB4ODAgKyBNYXRoLmZsb29yKHB0IC8gNjQpICUgNjQsXG4gICAgICAgICAgICAgICAgICAgIDB4ODAgKyBwdCAlIDY0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPj0gMjA0OCkge1xuICAgICAgICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgICAgICAgICAweGUwICsgTWF0aC5mbG9vcihjIC8gNjQgLyA2NCksXG4gICAgICAgICAgICAgICAgMHg4MCArIE1hdGguZmxvb3IoYyAvIDY0KSAlIDY0LFxuICAgICAgICAgICAgICAgIDB4ODAgKyBjICUgNjRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYyA+PSAxMjgpIHtcbiAgICAgICAgICAgIGJ5dGVzLnB1c2goMHhjMCArIE1hdGguZmxvb3IoYyAvIDY0KSwgMHg4MCArIGMgJSA2NCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBieXRlcy5wdXNoKGMpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXM7XG59O1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRvb2xiYXIgPSBtZGMudG9vbGJhci5NRENUb29sYmFyLmF0dGFjaFRvKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZGMtdG9vbGJhcicpKTtcclxuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAkKCcjbWVzc2FnZXNfbGlzdCcpLmNzcygnYm90dG9tJywgJCgnI21lc3NhZ2VfYm9keScpLmhlaWdodCgpICsgMTYpO1xyXG4gICAgICAgICQoJyNtZXNzYWdlc19saXN0JykuY3NzKCd0b3AnLCAkKCcubWRjLXRvb2xiYXInKS5vdXRlckhlaWdodCgpICsgNCk7XHJcbiAgICAgICAgJCgnI3Jvb21zX2xpc3QnKS5jc3MoJ3RvcCcsICQoJy5tZGMtdG9vbGJhcicpLm91dGVySGVpZ2h0KCkgKyA0KTtcclxuICAgICAgICBjb25zb2xlLmxvZygkKCcubWRjLXRvb2xiYXInKS5vdXRlckhlaWdodCgpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICgkKGRvY3VtZW50LmJvZHkpLndpZHRoKCkgPiA1MDApIHtcclxuICAgICAgICAkKCcuYm9keV8nKS5jc3MoJ3dpZHRoJywgJChkb2N1bWVudC5ib2R5KS53aWR0aCgpICogMC43KTtcclxuICAgICAgICAkKCcuYm9keV8nKS5jc3MoJ2JvcmRlcicsICcxcHggZGFzaGVkIHJnYmEoMCwwLDAsLjU0KScpO1xyXG4gICAgICAgICQoJy5ib2R5XycpLmNzcygnYm9yZGVyLXJhZGl1cycsICcxMnB4Jyk7XHJcbiAgICAgICAgJCgnLmJvZHlfJykuY3NzKCdib3R0b20nLCAnMnB4Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2pvJylcclxuICAgIH1cclxuICAgICQoJyNtZXNzYWdlc19saXN0JykuY3NzKCdib3R0b20nLCAkKCcjbWVzc2FnZV9ib2R5JykuaGVpZ2h0KCkgKyAxNik7XHJcbiAgICAkKCcjbWVzc2FnZXNfbGlzdCcpLmNzcygndG9wJywgJCgnLm1kYy10b29sYmFyJykub3V0ZXJIZWlnaHQoKSArIDQpO1xyXG4gICAgJCgnI3Jvb21zX2xpc3QnKS5jc3MoJ3RvcCcsICQoJy5tZGMtdG9vbGJhcicpLm91dGVySGVpZ2h0KCkgKyA0KTtcclxuICAgIG1kYy50ZXh0RmllbGQuTURDVGV4dEZpZWxkLmF0dGFjaFRvKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZGMtdGV4dC1maWVsZCcpKTtcclxuICAgIFtdLmZvckVhY2guY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWRjLXRhYi1iYXInKSwgZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgbWRjLnRhYkJhci5NRENUYWJCYXIuYXR0YWNoVG8oZWwpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBzZWxlY3RvciA9ICcubWRjLWJ1dHRvbiwgLm1kYy1pY29uLWJ1dHRvbiwgLm1kYy1jYXJkX19wcmltYXJ5LWFjdGlvbic7XHJcbiAgICBbXS5tYXAuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgbWRjLnJpcHBsZS5NRENSaXBwbGUuYXR0YWNoVG8oZWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgW10uZm9yRWFjaC5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZGMtbGluZWFyLXByb2dyZXNzJyksIGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIG1kYy5saW5lYXJQcm9ncmVzcy5NRENMaW5lYXJQcm9ncmVzcy5hdHRhY2hUbyhlbCk7XHJcbiAgICB9KTtcclxuICAgIG1kYy50ZXh0RmllbGQuTURDVGV4dEZpZWxkLmF0dGFjaFRvKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZGMtdGV4dC1maWVsZCcpKTtcclxuXHJcbiAgICAkKFwiI2RlbW8wMVwiKS5hbmltYXRlZE1vZGFsKHtjb2xvcjogJyNmZmYnLCBhbmltYXRlZEluOiAnZmFkZUluJywgYW5pbWF0aW9uRHVyYXRpb246ICcuNnMnfSk7XHJcbiAgICAkKCcjZGVtbzAxJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJyNtZXNzYWdlc19jaGF0X3Jvb20nKS5hZGRDbGFzcygnbWVzc19jaGF0X3Jvb21fc2hvdycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdrdWt1JylcclxuICAgIH0pO1xyXG4gICAgJCgnLmNsb3NlLWFuaW1hdGVkTW9kYWwnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnI21lc3NhZ2VzX2NoYXRfcm9vbScpLnJlbW92ZUNsYXNzKCdtZXNzX2NoYXRfcm9vbV9zaG93Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINGB0LvRg9GI0LDRgtC10LvRj1xyXG4gICAgICovXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIHdpbmRvdy5hcHBfcG93ZXIgPSBmYWxzZTtcclxuICAgICQoJyNhcHBfcG93ZXInKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5hcHBfcG93ZXIpIHtcclxuICAgICAgICAgICAgd2luZG93LmFwcF9wb3dlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkKCcjYXBwX3Bvd2VyX2ljb24nKS5yZW1vdmVDbGFzcygnaWNvbi1hbmltYXRlZC1mb3JtJyk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5tb3JzZUxpc3RuZXIuc3RvcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hcHBfcG93ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAkKCcjYXBwX3Bvd2VyX2ljb24nKS5hZGRDbGFzcygnaWNvbi1hbmltYXRlZC1mb3JtJyk7XHJcbiAgICAgICAgICAgIHZhciB0eXBpbmdMaXN0bmVyID0gbnVsbDtcclxuICAgICAgICAgICAgd2luZG93LmFub3RoZXJfdXNlcl9tZXNzYWdlX3N0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZUNhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hbm90aGVyX3VzZXJfbWVzc2FnZV9zdHJpbmcgKz0gZGF0YS5tZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGluZ0xpc3RuZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwaW5nTGlzdG5lcik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy50eXBpbmctaW5kaWNhdG9yJykuY3NzKCdvcGFjaXR5JywxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHR5cGluZ0xpc3RuZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcudHlwaW5nLWluZGljYXRvcicpLmNzcygnb3BhY2l0eScsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI21lc3NhZ2VzX2xpc3QnKS5hcHBlbmQoYDxkaXYgY2xhc3M9XCJtZGMtY2FyZC1vYmplY3RcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWRjLWNhcmQgbGluZS1hbm90aGVyLXVzZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1kYy1jYXJkLWNvbnRlbnQgbWRjLXR5cG9ncmFwaHktLWJvZHkyXCI+JHt3aW5kb3cuYW5vdGhlcl91c2VyX21lc3NhZ2Vfc3RyaW5nfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZGMtY2FyZC1zcGFjZXJcIj48L2Rpdj5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmFub3RoZXJfdXNlcl9tZXNzYWdlX3N0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dvcmsnKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGVjb2RlZDoge1xcbiAgdGltaW5nczogXCIgKyBkYXRhLnRpbWluZ3MgKyBcIlxcbiAgbW9yc2U6IFwiICsgZGF0YS5tb3JzZSArIFwiXFxuICBtZXNzYWdlOiBcIiArIGRhdGEubWVzc2FnZSArIFwiXFxufVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZGVjb2RlciA9IG5ldyBNb3JzZURlY29kZXIoNDUsIDQwKTtcclxuICAgICAgICAgICAgZGVjb2Rlci5zcGVlZENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWUgdG8gdGVsbCBzcGVlZCcpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy/QvtGB0LvQtSDQv9C+0YHQu9C10LTQvdC10LPQviDQutC+0LvQsdC10LrQsCDRgdGH0LjRgtCw0LXQvCDRgdC+0L7QsdGJ0LXQvdC40LUg0LfQsNCy0LXRgNGI0LXQvdC90YvQvCDQtdGB0LvQuCDQvdC1INCx0YPQtNC10YIg0LrQsNC60L7Qs9C+LdGC0L4g0YHQv9Cw0LzQsCDRh9C10YDQtdC3IDUwMCDQvNC40LvQuNGB0LXQutGD0L3QtFxyXG4gICAgICAgICAgICBkZWNvZGVyLnNwZWVkQ2FsbGJhY2tSYXRlTGltaXRlciA9IDE7XHJcbiAgICAgICAgICAgIGRlY29kZXIubG9ja1NwZWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgZGVjb2Rlci5tZXNzYWdlQ2FsbGJhY2sgPSBtZXNzYWdlQ2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRlY29kZXIuZndwbSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5tb3JzZUxpc3RuZXIgPSBuZXcgTW9yc2VMaXN0ZW5lcigyNTYsLTYwLC0zMCw1MzAsNTgwLDIwMCk7XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cubW9yc2VMaXN0bmVyLmRlY29kZXIgPSBkZWNvZGVyO1xyXG4gICAgICAgICAgICB3aW5kb3cubW9yc2VMaXN0bmVyLm1pY1N1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgbWljJyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cubW9yc2VMaXN0bmVyLnN0YXJ0TGlzdGVuaW5nKCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5tb3JzZUxpc3RuZXIucHJvY2Vzc1NvdW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8v0YLRgNC4INGA0LXQttC40LzQsC4gMSAtINC+0LHRi9GH0L3Ri9C5INC90LDQuNCx0L7Qu9C10LUg0LzQtdC00LvQtdC90L3Ri9C5LCDQvdCw0LTQtdC20LTQvdGL0LkuICjQv9GA0L7RgdGC0L4g0L/QtdGA0LXQtNCw0YfQsCDRgtC10LrRgdGC0LAg0YfQtdGA0LXQtyDRgdGC0YDQvtC60YMpIDIgLSDRjdGC0L7RgiDQvNC10YLQvtC0INC/0LXRgNC10LTQsNGR0YIg0YHQu9C+0LLQsCwg0LrQsNC6INGG0LjRhNGA0YsuIDMgLSDRjdGC0L7RgiDQvNC10YLQvtC0INC40YHQvtC/0LvRjNC30YPQtdGCINCx0YPQutCy0YsgPyA0IC0g0YHQv9C10YYg0LzQtdGC0L7QtCDRiNC40LLRgNC+0LLQsNC90LjRjyA/Pz8g0YfQtdGA0LXQt9C3INGG0LjRi9GA0YQgNSAtINC80LXRgtC+0LQg0YfQtdGA0LXQtyDQvNGD0LfRi9C60YMgPyA2LiDQsNC60YbQtdC90YIg0L3QtSDQvdCwINCx0LjRgtGLINCwINC90LAg0YbQuNGE0YDRiyDQuCDQutCw0YfQtdGB0YLQstC+INGB0LjQs9C90LDQu9CwIDcu0KLRgNCw0L3RgdC70LjRgNC+0LLQsNGC0Ywg0L7RgNC40LPQuNC90LDQuy5cclxuXHJcbi8v0YLRgNCw0L3RgdC70Y/RhtC40Y8g0L7RgNC40LPQuNC90LDQu9CwINC4INC60L7QvNCw0L3QtCwg0LIg0YTQvtGA0LzQsNGC0LUg0YLQtdC60YHRgtCwLiDRgNGD0YHRgdC60LjQuSDQsdGD0LrQstGLIC0g0LTQtdC60L7QtNC40YDQvtCy0LDRgtGMINCyINCw0L3Qs9C70LjQudGB0LrQuNC1LlxyXG5cclxuICAgIC8v0YfQtdGA0LXQtyDRgdGC0LDQuiDQvNC10YvRi9GE0L/RgyDQuCDQv9GD0YHRgtCw0YLRgy5cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQv9GA0LXQvtCx0YDQsNC30L7QstCw0YLQtdC70Y9cclxuICAgICAqXHJcbiAgICAgKiAqL1xyXG5cclxuXHJcblxyXG4gICAgdmFyIGJpdHdpc2UgPSByZXF1aXJlKCdiaXR3aXNlJyk7XHJcbiAgICB2YXIgYnl0ZXMgPSByZXF1aXJlKCd1dGY4LWJ5dGVzJyk7XHJcblxyXG5cclxuICAgIHdpbmRvdy5tZXNzYWdlcyA9IDA7XHJcbiAgICAkKCcjbWVzc2FnZV9zZW5kJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlbmRNZXNzYWdlKCk7XHJcbiAgICB9KTtcclxuICAgIGZ1bmN0aW9uIHNlbmRNZXNzYWdlKCl7XHJcbiAgICAgICAgY29uc29sZS5sb2coJCgnI3RmLW91dGxpbmVkLW1lc3NhZ2UtaW5wdXQnKS52YWwoKSk7XHJcbiAgICAgICAgaWYgKCQoJyN0Zi1vdXRsaW5lZC1tZXNzYWdlLWlucHV0JykudmFsKCkpIHtcclxuICAgICAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICBvYmplY3QubSA9ICQoJyN0Zi1vdXRsaW5lZC1tZXNzYWdlLWlucHV0JykudmFsKCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhX2IgPSBieXRlcyhKU09OLnN0cmluZ2lmeShvYmplY3QpKTtcclxuICAgICAgICAgICAgdmFyIGRhdGFfcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhX2IubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhX3MgPSBkYXRhX3MuY29uY2F0KGJpdHdpc2UuYnl0ZS5yZWFkKGRhdGFfYltpXSkpO1xyXG4gICAgICAgICAgICAgICAgLy9kYXRhX3MucHVzaCgtMSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvYmplY3QpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShvYmplY3QpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YV9iKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YV9zKTtcclxuICAgICAgICAgICAgdmFyIGVuZF8gPSBvYmplY3QubTtcclxuXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkKCcjdGYtb3V0bGluZWQtbWVzc2FnZS1pbnB1dCcpLnZhbCgpKTtcclxuICAgICAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICBvYmplY3QubSA9ICQoJyN0Zi1vdXRsaW5lZC1tZXNzYWdlLWlucHV0JykudmFsKCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhX2IgPSBieXRlcyhKU09OLnN0cmluZ2lmeShvYmplY3QpKTtcclxuICAgICAgICAgICAgdmFyIGRhdGFfcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMCA7IGkgPCBkYXRhX2IubGVuZ3RoOyBpKyspe1xyXG5cclxuICAgICAgICAgICAgICAgIGRhdGFfcyA9IGRhdGFfcy5jb25jYXQoYml0d2lzZS5ieXRlLnJlYWQoZGF0YV9iW2ldKSk7XHJcbiAgICAgICAgICAgICAgICAvL2RhdGFfcy5wdXNoKC0xKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iamVjdCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhX2IpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhX3MpO1xyXG4gICAgICAgICAgICB2YXIgZW5kXyA9IGRhdGFfcy5qb2luKCcnKTtcclxuICAgICAgICAgICAgZW5kXyA9IGVuZF8ucmVwbGFjZSgvMC9nLCBcImVcIik7XHJcbiAgICAgICAgICAgIGVuZF8gPSBlbmRfLnJlcGxhY2UoLzEvZywgXCJ0XCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlbmRfKTtcclxuKi9cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoJyN0Zi1vdXRsaW5lZC1tZXNzYWdlLWlucHV0JykudmFsKCkpO1xyXG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0ge307XHJcbiAgICAgICAgICAgIG9iamVjdC5tID0gJCgnI3RmLW91dGxpbmVkLW1lc3NhZ2UtaW5wdXQnKS52YWwoKTtcclxuICAgICAgICAgICAgdmFyIGRhdGFfYiA9IGJ5dGVzKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YV9zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwIDsgaSA8IGRhdGFfYi5sZW5ndGg7IGkrKyl7XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YV9zID0gZGF0YV9zLmNvbmNhdChiaXR3aXNlLmJ5dGUucmVhZChkYXRhX2JbaV0pKTtcclxuICAgICAgICAgICAgICAgIC8vZGF0YV9zLnB1c2goLTEpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2cob2JqZWN0KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFfYik7XHJcbiAgICAgICAgICAgIHZhciBzcGVjbCA9IGRhdGFfcy5qb2luKCcnKTtcclxuICAgICAgICAgICAgc3BlY2wgPXNwZWNsLnJlcGxhY2UoLzAvZywgXCJlXCIpO1xyXG4gICAgICAgICAgICBzcGVjbCA9IHNwZWNsLnJlcGxhY2UoLzEvZywgXCJ0XCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcGVjbCk7XHJcbiAgICAgICAgICAgIHZhciBlbmRfID0gZGF0YV9iLmpvaW4oKTtcclxuICAgICAgICAgICAgLy/QvtC20L3QviDQv9C+0L/RgNC+0LHQvtCy0LDRgtGMINC30LDQvNC10L3QuNGC0Ywg0L3QsCDRg9GB0LrQvtGA0LXQvdGL0Lkg0YDQtdC20LjQvC5cclxuICAgICAgICAgICAgZW5kXyA9IGVuZF8ucmVwbGFjZSgvMC9nLCBcImVcIik7XHJcbiAgICAgICAgICAgIGVuZF8gPSBlbmRfLnJlcGxhY2UoLzgvZywgXCJ0XCIpO1xyXG4gICAgICAgICAgICBlbmRfID0gZW5kXy5yZXBsYWNlKC8zL2csIFwiblwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZW5kXyk7XHJcbiovXHJcblxyXG4gICAgICAgICAgICAvL3ZhciBNb3JzZUNXV2F2ZSA9cmVxdWlyZSggJy4vZGF0YS10cmFuc2ZlcmVyL21vcnNlLXByby1jdy13YXZlJykuZGVmYXVsdDtcclxuICAgICAgICAgICAgLy92YXIgTW9yc2VQbGF5ZXJXQUEgPSByZXF1aXJlKCAnLi9kYXRhLXRyYW5zZmVyZXIvbW9yc2UtcHJvLXBsYXllci13YWEnKS5kZWZhdWx0O1xyXG4gICAgICAgICAgICAvL3ZhciBNb3JzZUxpc3RlbmVyID0gcmVxdWlyZSAoJy4vZGF0YS10cmFuc2ZlcmVyL21vcnNlLXByby1saXN0ZW5lcicpLmRlZmF1bHQ7XHJcbiAgICAgICAgICAgIC8vdmFyIE1vcnNlRGVjb2RlciA9IHJlcXVpcmUoJy4vZGF0YS10cmFuc2ZlcmVyL21vcnNlLXByby1kZWNvZGVyJykuZGVmYXVsdDtcclxuXHJcbiAgICAgICAgICAgIC8vdmFyIE1vcnNlQ1cgPSByZXF1aXJlKCcuL2RhdGEtdHJhbnNmZXJlci9tb3JzZS1wcm8tY3cnKS5kZWZhdWx0O1xyXG5cclxuXHJcbiAgICAgICAgICAgICQoJyNtZXNzYWdlc19saXN0JykuYXBwZW5kKGA8ZGl2ICBjbGFzcz1cIm1kYy1jYXJkLW9iamVjdFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZGMtY2FyZC1zcGFjZXJcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWRjLWNhcmQgbGluZS1jdXJyZW50LXVzZXIgXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZGMtY2FyZC1jb250ZW50IG1kYy10eXBvZ3JhcGh5LS1ib2R5MlwiPiR7b2JqZWN0Lm19XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiJHtcInNwZWNNXCIgKyB3aW5kb3cubWVzc2FnZXN9XCIgcm9sZT1cInByb2dyZXNzYmFyXCIgY2xhc3M9XCIgbWRjLWxpbmVhci1wcm9ncmVzcy10cmFucyBtZGMtbGluZWFyLXByb2dyZXNzIG1kYy1saW5lYXItcHJvZ3Jlc3MtLWluZGV0ZXJtaW5hdGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZGMtbGluZWFyLXByb2dyZXNzX19idWZmZXJpbmctZG90c1wiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1kYy1saW5lYXItcHJvZ3Jlc3NfX2J1ZmZlclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1kYy1saW5lYXItcHJvZ3Jlc3NfX2JhciBtZGMtbGluZWFyLXByb2dyZXNzX19wcmltYXJ5LWJhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWRjLWxpbmVhci1wcm9ncmVzc19fYmFyLWlubmVyXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWRjLWxpbmVhci1wcm9ncmVzc19fYmFyIG1kYy1saW5lYXItcHJvZ3Jlc3NfX3NlY29uZGFyeS1iYXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1kYy1saW5lYXItcHJvZ3Jlc3NfX2Jhci1pbm5lclwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG5cclxuLy/QoSDQvdC+0LLRi9C8INCz0L7QtNC+0LwhXHJcblxyXG4gICAgICAgICAgICB2YXIgbW9yc2VDVyA9IG5ldyBNb3JzZUNXKHRydWUsIDQ1LCA1MCk7XHJcbiAgICAgICAgICAgIG1vcnNlQ1cudHJhbnNsYXRlKGVuZF8pO1xyXG4gICAgICAgICAgICB2YXIgdGltaW5ncyA9IG1vcnNlQ1cuZ2V0RHVyYXRpb24oKTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0aW1pbmdzKTtcclxuICAgICAgICAgICAgdmFyIG1vcnNlQ1dXYXZlID0gbmV3IE1vcnNlQ1dXYXZlKHRydWUsIDQ1LCA0MCk7XHJcblxyXG4gICAgICAgICAgICBtb3JzZUNXV2F2ZS50cmFuc2xhdGUoZW5kXyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1vcnNlQ1dXYXZlLnRpbWluZ3MpO1xyXG4gICAgICAgICAgICB2YXIgbW9yc2VQbGF5ZXJXQUEgPSBuZXcgTW9yc2VQbGF5ZXJXQUEoKTtcclxuICAgICAgICAgICAgLy9cclxuXHJcbiAgICAgICAgICAgIG1vcnNlUGxheWVyV0FBLmxvYWRDV1dhdmUobW9yc2VDV1dhdmUpO1xyXG4gICAgICAgICAgICBtb3JzZVBsYXllcldBQS5wbGF5RnJvbVN0YXJ0KCk7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3dvcmsnKTtcclxuICAgICAgICAgICAgJCgnI21lc3NhZ2VfYm9keScpLmFkZENsYXNzKCdtZGMtdGV4dC1maWVsZC0tZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgJCgnI3RmLW91dGxpbmVkLW1lc3NhZ2UtaW5wdXQnKS52YWwoJycpO1xyXG4gICAgICAgICAgICAkKCcjdGYtb3V0bGluZWQtbWVzc2FnZS1pbnB1dCcpLmJsdXIoKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnI3NwZWNNJyArIHdpbmRvdy5tZXNzYWdlcykuY3NzKCdoZWlnaHQnLCAnMHB4Jyk7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjc3BlY00nICsgd2luZG93Lm1lc3NhZ2VzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjbWVzc2FnZV9ib2R5JykucmVtb3ZlQ2xhc3MoJ21kYy10ZXh0LWZpZWxkLS1kaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY2xlYXJJbnRlcnZhbChlbmRMaXN0bmVyKTtcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH0sIHRpbWluZ3MgKyA1MDApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgJCgnI3RmLW91dGxpbmVkLW1lc3NhZ2UtaW5wdXQnKS5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0pO1xyXG5cclxufSk7Il19
