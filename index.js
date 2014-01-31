var createAudioParam = require('./audio-param')

module.exports = function(input, output, params){
  var audioContext = input.context || output.context

  var node = audioContext.createGain()
  node.connect(input)
  node._output = output
  node.connect = connect
  node.disconnect = disconnect
  addAudioParams(node, params)

  return node
}

module.exports = createAudioParam

function connect(destination, channel){
  this._output.connect(destination, channel)
}

function disconnect(param){
  this._output.disconnect(param)
}

function addAudioParams(node, params){
  if (params){
    var keys = Object.keys(params)
    for (var i=0,l=keys.length;i<l;i++){
      var key = keys[i]
      node[key] = createAudioParam(node.context, key, params[key])
    }
  }
}