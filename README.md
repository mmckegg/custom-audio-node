custom-audio-node
===

Create your own AudioNodes with AudioParams for using with the Web Audio API. 

## Install

```bash
$ npm install custom-audio-node
```

## API

```js
var createAudioNode = require('custom-audio-node')
```

### createAudioNode(input, output, params)

Specify the **input** and **output** nodes to wrap into a single audio node. 

**params**: automatable AudioParams

```js
var audioContext = new webkitAudioContext()
var input = audioContext.createBiquadFilter()
var output = audioContext.createGain()

input.connect(output)

function mapValueToFreq(value){
  var min = Math.log(100)/Math.log(10)
  var max = Math.log(20000)/Math.log(10)
  var range = max-min
  return Math.pow(10, value * range + min)
}

var customNode = createAudioNode(input, output, {
  amount: {
    min: 0, max: 1, defaultValue: 0.5,
    targets: [
      { param: filter.frequency, value: mapValueToFreq }
    ]
  }
})

customNode.connect(audioContext.destination)
```

## TODO

- param.value should return the curve value at current time not the final value
- params currently cannot be connected to from another audioNode (modulate) e.g. `node.connect(otherNode.frequency)`