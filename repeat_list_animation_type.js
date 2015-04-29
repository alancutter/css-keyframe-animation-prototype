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
    var sideSubKeyframes = {};
    var result = {};
    for (var side of ['start', 'end']) {
      sideSubKeyframes[side] = this._maybeResolveSubKeyframes(keyframes[side], environment, underlyingValue);
      if (!sideSubKeyframes[side]) {
        return null;
      }
      result[side] = {
        isInvalid: null,
        interpolableValue: [],
        nonInterpolableValue: [],
      };
    }

    var length = lowestCommonMultiple(sideSubKeyframes.start.length, sideSubKeyframes.end.length);
    for (var i = 0; i < length; i++) {
      var subResult = this.subType.maybeConvertPair(
          modIndex(sideSubKeyframes.start, i),
          modIndex(sideSubKeyframes.end, i),
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
  _maybeResolveSubKeyframes: function(keyframe, environment, underlyingValue) {
    var subKeyframes = [];
    if (!keyframe) {
      if (!underlyingValue || underlyingValue.animationType != this) {
        return null;
      }
      for (var i of underlyingValue.interpolableValue) {
        subKeyframes.push(null);
      }
    } else {
      var items;
      if (keyframe.value == 'inherit') {
        if (!environment) {
          return null;
        }
        items = environment.getParent(this.property).split(', ');
      } else {
        items = keyframe.value.split(', ');
      }
      subKeyframes = items.map(function(item) {
        return {value: item, composite: keyframe.composite};
      });
    }
    return subKeyframes;
  },
  maybeConvertSingle: function(keyframe, environment, underlyingValue) {
    var subKeyframes = this._maybeResolveSubKeyframes(keyframe, environment, underlyingValue);
    if (!subKeyframes) {
      return null;
    }
    var result = {
      isInvalid: null,
      interpolableValue: [],
      nonInterpolableValue: [],
    };
    for (var subKeyframe of subKeyframes) {
      var subResult = this.subType.maybeConvertSingle(subKeyframe, environment, underlyingValue);
      result.isInvalid = chain(result.isInvalid, subResult.isInvalid);
      result.interpolableValue.push(subResult.interpolableValue);
      result.nonInterpolableValue.push(subResult.nonInterpolableValue);
    }
    return result;
  },
  maybeConvertEnvironment: function(environment) {
    return this.maybeConvertSingle({value: environment.get(this.property), composite: 'replace'}, environment, null);
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
