(function() {
'use strict';

function RepeatListAnimationType(property, subType) {
  this.property = property;
  this.subType = subType;
}

defineMethods(RepeatListAnimationType, {
  _resolveKeyframeItems: function(keyframe, environment, underlyingValue) {
    if (!keyframe) {
      if (!underlyingValue || underlyingValue.animationType != this) {
        return null;
      }
      console.assert(false);
    }
    if (keyframe.value == 'inherit') {
      if (!environment) {
        return null;
      }
      return environment.getParent(this.property).split(', ');
    }
    return keyframe.value.split(', ');
  },
  maybeConvertPair: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    var keyframes = {
      start: startKeyframe,
      end: endKeyframe,
    };
    var resolvedItems = {};
    for (var side in keyframes) {
      resolvedItems[side] = this._resolveKeyframeItems(keyframes[side], environment, underlyingValue);
      if (!resolvedItems[side]) {
        return null;
      }
    }

    var result = {};
    for (var side of ['start', 'end']) {
      result[side] = {
        isInvalid: null,
        interpolableValue: [],
        nonInterpolableValue: [],
      };
    }
    var length = lowestCommonMultiple(resolvedItems.start.length, resolvedItems.end.length);
    for (var i = 0; i < length; i++) {
      var startItem = modIndex(resolvedItems.start, i);
      var endItem = modIndex(resolvedItems.end, i);
      var subResult = this.subType.maybeConvertPair(
          {value: startItem, composite: resolvedItems.start.composite},
          {value: endItem, composite: resolvedItems.end.composite},
          environment,
          null);
      if (!subResult) {
        return null;
      }
      for (var side of ['start', 'end']) {
        result[side].isInvalid = chain(result[side].isInvalid, subResult[side].isInvalid);
        result[side].interpolableValue.push(subResult[side].interpolableValue);
        result[side].nonInterpolableValue.push(subResult[side].nonInterpolableValue);
      }
    }
    return result;
  },
  maybeConvertSingle: function(keyframe, environment, underlyingValue) {
    return null;
  },
  maybeConvertEnvironment: function(environment) {
    return null;
  },
  interpolate: lerp,
  add: function(underlyingInterpolableValue, underlyingNonInterpolableValue, underlyingFraction, interpolableValue, nonInterpolableValue) {
    var result = {
      interpolableValue: [],
      nonInterpolableValue: [],
    }
    var i = 0;
    for (; i < underlyingInterpolableValue.length && i < interpolableValue.length; i++) {
      var subResult = this.subType.add(
          underlyingInterpolableValue[i],
          underlyingNonInterpolableValue[i],
          underlyingFraction,
          interpolableValue[i],
          nonInterpolableValue[i]);
      result.interpolableValue.push(subResult.interpolableValue);
      result.nonInterpolableValue.push(subResult.nonInterpolableValue);
    }
    for (; i < underlyingInterpolableValue.length; i++) {
      result.interpolableValue.push(underlyingInterpolableValue[i]);
      result.nonInterpolableValue.push(underlyingNonInterpolableValue[i]);
    }
    for (; i < interpolableValue.length; i++) {
      result.interpolableValue.push(interpolableValue[i]);
      result.nonInterpolableValue.push(nonInterpolableValue[i]);
    }
    return result;
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
