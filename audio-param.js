module.exports = function(audioContext, name, options){
  // options: provider, target(s)

  var targets = options.targets

  var param = Object.create(AudioParam.prototype, {
    value: {
      get: function(){
        return param._lastValue
      },
      set: function(value){
        value = param.fence(value)
        param._lastValue = value
        for (var i=0,l=targets.length;i<l;i++){
          var target = targets[i]
          target.param.value = target.value(value)
        }
      }
    },
    defaultValue: {
      get: function(){
        return options.defaultValue
      }
    },
    name: {
      value: name,
      writable: false
    },
    min: {
      value: options.min,
      writable: false
    },
    max: {
      value: options.max,
      writable: false
    }
  })



  param._targets = targets
  param._lastValue = options.defaultValue

  // override proto-methods
  param.setValueAtTime = setValueAtTime
  param.linearRampToValueAtTime = linearRampToValueAtTime
  param.exponentialRampToValueAtTime = exponentialRampToValueAtTime
  param.setTargetAtTime = setTargetAtTime
  param.setValueCurveAtTime = setValueCurveAtTime
  param.cancelScheduledValues = cancelScheduledValues
  param.context = audioContext

  // get value between min and max
  param.fence = fence
  
  // set initial value
  if (options.defaultValue != null){
    param.value = options.defaultValue
  }

  return param
}

function fence(value){
  if (this.min != null){
    value = Math.max(this.min, value)
  }

  if (this.max != null){
    value = Math.min(this.max, value)

  }
  return value
}

function setValueAtTime(value, startTime){
  var targets = this._targets
  value = this.fence(value)
  for (var i=0,l=targets.length;i<l;i++){
    var target = targets[i]
    target.param.setValueAtTime(target.value(value), startTime)
  }
}

function setTargetAtTime(value, startTime, timeConstant){
  // this needs to be rewritten to use custom curve
  var targets = this._targets
  value = this.fence(value)
  for (var i=0,l=targets.length;i<l;i++){
    var target = targets[i]
    target.param.exponentialRampToValueAtTime(target.value(value), startTime, timeConstant)
  }
}

function linearRampToValueAtTime(value, endTime){
  ramp(this, value, endTime, 'linear')
}

function exponentialRampToValueAtTime(value, endTime){
  ramp(this, value, endTime, 'exp')
}

function setValueCurveAtTime(curve, startTime, duration){

  var curveLength = curve.length
  var targets = this._targets

  for (var i=0,l=targets.length;i<l;i++){

    var res = new Float32Array(curveLength)
    for (var x=0;x<curveLength;x++){
      res[x] = target.value(curve[x])
    }

    var target = targets[i]
    target.param.setValueCurveAtTime(res, startTime, duration)
  }
}

function cancelScheduledValues(startTime){
  var targets = this._targets
  for (var i=0,l=targets.length;i<l;i++){
    var target = targets[i]
    target.param.cancelScheduledValues(startTime)
  }
}

function ramp(param, value, endTime, curveType){
  var targets = param._targets
  value = param.fence(value)

  var startTime = param.context.currentTime
  var duration = Math.max(0, endTime - startTime)
  var curveLength = duration * param.context.sampleRate

  var from = param.value
  var to = param.fence(value)
  var range = to - from

  var curve = curves[curveType] || curves['linear']

  //TODO: param.value should return the curve as it progresses
  param._lastValue = to

  for (var i=0,l=targets.length;i<l;i++){
    var target = targets[i]
    var curveValues = new Float32Array(curveLength)
    var step = 1 / curveLength
    for (var x=0;x<curveLength;x++){
      var offset = curve(step * x) * range
      var pos = from + offset
      curveValues[x] = target.value(pos)
    }
    target.param.setValueCurveAtTime(curveValues, startTime, duration)
  }
}

var curves = {
  exp: function(value){
    return value * value
  },
  linear: function(value){
    return value
  }
}
