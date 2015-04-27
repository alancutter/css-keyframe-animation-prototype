(function() {
'use strict';

function RepeatListAnimationType(property, subType) {
  this.property = property;
  this.subType = subType;
}

defineMethods(RepeatListAnimationType, {
  maybeConvertPair: function(startKeyframe, endKeyframe) {
    return this.maybeConvertPairInEnvironment(startKeyframe, endKeyframe, null, null);
  },
  _maybeConvertItemListPair: function(inputs) {
    var result = {};
    for (var side of ['start', 'end']) {
      result[side] = {
        isInvalid: inputs[side].isInvalid,
        interpolableValue: [],
        nonInterpolableValue: {
          composite: inputs.composite,
          subValues: [],
        },
      };
    }
    var startItems = inputs.start.items;
    var endItems = inputs.end.items;
    for (var i = 0; i < startItems.length || i < endItems.length; i++) {
      var startItem = startItems[i % startItems.length];
      var endItem = endItems[i % endItems.length];
      var subResult = this.subType.maybeConvertPair(
          {value: startItem, composite: composite},
          {value: endItem, composite: composite});
      if (!subResult) {
        return null;
      }
      for (var side of ['start', 'end']) {
        result[side].isInvalid = chain(result[side].isInvalid, subResult[side].isInvalid);
        result[side].interpolableValue.push(subResult[side].interpolableValue);
        result[side].nonInterpolableValue.subValues.push(subResult[side].nonInterpolableValue);
      }
    }
    return result;
  },
  maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    var keyframes = {
      start: startKeyframe,
      end: endKeyframe,
    };
    var values = {};
    for (var side in keyframes) {
      var value = this._resolveKeyframe(keyframes[side]);
      var keyframe = keyframes[side];
      if (!keyframe) {
        return null;
      } else if (keyframe.value == 'inherit') {
        if (!environment) {
          return null;
        }
        values[side].value = environment.getParent(this.property).split(', ');
      } else {
        values[side] = keyframe.value.split(', ');
      }
    }

    return this._maybeConvertItemListPair(values);
  },
  maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
    return null;
  },
  equalNonInterpolableValues: function(a, b) {
    if (a.subValues.length != b.subValues.length) {
      return false;
    }
    var subType = this.subType;
    return a.subValues.every(function(aItem, i) {
      return subType.equalNonInterpolableValues(aItem, b.subValues[i]);
    });
  },
  interpolate: lerp,
  add: function(underlyingInterpolableValue, underlyingNonInterpolableValue, underlyingFraction, interpolableValue, nonInterpolableValue) {
    if (nonInterpolableValue.composite == 'replace') {
      return {
        interpolableValue: interpolableValue,
        nonInterpolableValue: nonInterpolableValue,
      };
    }
    var result = {
      interpolableValue: [],
      nonInterpolableValue: {
        composite: nonInterpolableValue.composite,
        subValues: [],
      },
    }
    var i = 0;
    for (; i < underlyingInterpolableValue.length && i < interpolableValue.length; i++) {
      var subResult = this.subType.add(
          underlyingInterpolableValue[i],
          underlyingNonInterpolableValue.subValues[i],
          underlyingFraction,
          interpolableValue[i],
          nonInterpolableValue.subValues[i]);
      result.interpolableValue.push(subResult.interpolableValue);
      result.nonInterpolableValue.subValues.push(subResult.nonInterpolableValue);
    }
    for (; i < underlyingInterpolableValue.length; i++) {
      result.interpolableValue.push(underlyingInterpolableValue[i]);
      result.nonInterpolableValue.subValues.push(underlyingNonInterpolableValue.subValues[i]);
    }
    for (; i < interpolableValue.length; i++) {
      result.interpolableValue.push(interpolableValue[i]);
      result.nonInterpolableValue.subValues.push(nonInterpolableValue.subValues[i]);
    }
    return result;
  },
  maybeConvertEnvironment: function(environment) {
    return null;
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(this.property, this.cssValue(interpolableValue, nonInterpolableValue));
  },
  cssValue: function(interpolableValue, nonInterpolableValue) {
    var subType = this.subType;
    return interpolableValue.map(function(subInterpolableValue, i) {
      return subType.cssValue(subInterpolableValue, nonInterpolableValue[i]);
    }).join(', ');
  },
  clamp: function(value) {
    return (this.clamping == 'non-negative' && value < 0) ? 0 : value;
  }
});


window.RepeatListAnimationType = RepeatListAnimationType;

})();
