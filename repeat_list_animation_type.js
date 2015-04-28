(function() {
'use strict';

function RepeatListAnimationType(property, subType) {
  this.property = property;
  this.subType = subType;
}

defineMethods(RepeatListAnimationType, {
  maybeConvertPair: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    var keyframes = {
      start: startKeyframe,
      end: endKeyframe,
    };
    var resolvedKeyframes = {
      start: {},
      end: {},
    };
    for (var side in keyframes) {
      var keyframe = keyframes[side];
      if (!keyframe) {
        return null;
      } else if (keyframe.value == 'inherit') {
        if (!environment) {
          return null;
        }
        resolvedKeyframes[side].value = environment.getParent(this.property).split(', ');
      } else {
        resolvedKeyframes[side].value = keyframe.value.split(', ');
      }
      resolvedKeyframes[side].composite = keyframes[side].composite;
    }

    var result = {};
    for (var side of ['start', 'end']) {
      result[side] = {
        isInvalid: null,
        interpolableValue: [],
        nonInterpolableValue: [],
      };
    }
    var startItems = resolvedKeyframes.start.value;
    var endItems = resolvedKeyframes.end.value;
    for (var i = 0; i < startItems.length || i < endItems.length; i++) {
      var startItem = startItems[i % startItems.length];
      var endItem = endItems[i % endItems.length];
      var subResult = this.subType.maybeConvertPair(
          {value: startItem, composite: resolvedKeyframes.start.composite},
          {value: endItem, composite: resolvedKeyframes.end.composite});
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
