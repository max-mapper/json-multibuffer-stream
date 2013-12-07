# json-multibuffer-stream

Transform stream that encodes streams of JSON data as [multibuffers](http://npmjs.org/multibuffer).

## usage

```js
var jsonBuffStream = require('json-multibuffer-stream')
var jsonEncoder = jsonBuffStream()
fs.createReadStream('newline-delimited.json').pipe(jsonEncoder).pipe(httpPostToSomeServer)
```

optional arguments: `jsonBuffStream(headers, onRow)`

```js
var encoder = jsonBuffStream(onRow)

function onRow(json) {
  // gets called on every row with the json data right before it gets encoded
}
```

you can also pass in a custom headers array to control how the resulting multibuffer is encoded

```js
var headers = ['z', 'x', 'y']
var encoder = jsonBuffStream(headers)
encoder.write({x: 1, y: 2, z: 3})
// multibuffer will be something like [3,2,1]
```

you can write either JSON strings or JavaScript objects to the stream. JSON strings will get JSON.parse()'d

use a [multibuffer-stream](https://npmjs.org/package/multibuffer-stream) `.unpackStream()` to decode the data on the other end
