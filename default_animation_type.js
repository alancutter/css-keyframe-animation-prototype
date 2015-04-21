(function() {
'use strict';

function DefaultAnimationType(property) {
  this.property = property;
}

defineMethods(DefaultAnimationType, {
  maybeConvertPair: function(startKeyframe, endKeyframe) {
    return null;
  },
  maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    return null;
  },
  maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
    if (keyframe) {
      return {
        isInvalid: null,
        interpolableValue: [],
        nonInterpolableValue: keyframe.value,
      };
    }
    return null;
  },
  equalNonInterpolableValues: function(a, b) {
    return true;
  },
  interpolate: lerp,
  maybeConvertEnvironment: function(environment) {
    return null;
  },
  add: null,
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(this.property, nonInterpolableValue);
  },
});


window.DefaultAnimationType = DefaultAnimationType;

})();
