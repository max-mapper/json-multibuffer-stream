var path = require('path')
var through = require('through2')
var multibuffer = require('multibuffer')

var empty = new Buffer("")

module.exports = function(headers, onRow, extra) {
  if (typeof headers === 'function') {
    onRow = headers
    headers = undefined
  }
  
  var stream = through({objectMode: true}, write)
  stream.headers = headers
  stream.extra = extra
  
  return stream
  
  function write(obj, enc, next) {
    if (obj.length) obj = JSON.parse(obj)
    var updated
    if (onRow) updated = onRow(obj)
    if (updated) obj = updated
    if (!stream.headers) stream.headers = Object.keys(obj).sort()
    var buf = encode(obj, stream.headers, stream.extra)
    this.push(buf)
    next()
  }
}

module.exports.encode = encode
module.exports.decode = decode

function encode(obj, headers, extra) {
  var keys = headers || Object.keys(obj)
  var vals = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var val = obj[key]
    if (!val) {
      vals.push(empty)
      continue
    }
    if (typeof val === 'object' || val instanceof Array) val = JSON.stringify(val)
    vals.push(new Buffer(isFinite(val) ? val + "" : val))
  }
  return multibuffer.pack(vals, extra)
}

function decode(headers, vals) {
  var buffs = multibuffer.unpack(vals)
  var obj = {}
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i]
    var buff = buffs[i]
    if (!buff) continue
    if (buff[0] === 91 || buff[0] === 123) { // [, {
      try {
        buff = JSON.parse(buff)
      } catch(e) {}
    }
    buff = Buffer.isBuffer(buff) ? buff.toString() : buff
    if (buff.length === 0) continue
    obj[header] = buff
  }
  return obj
}

