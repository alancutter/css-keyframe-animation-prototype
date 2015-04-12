(function() {
'use strict';

function DefaultAnimationType(property) {
  return {
    property: property,
    maybeConvertPair: function(startKeyframe, endKeyframe) {
      return null;
    },
    maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
      return null;
    },
    maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
      return {
        invalidator: null,
        interpolableValue: [],
        nonInterpolableValue: keyframe ? keyframe.value : null,
      };
    },
    interpolate: lerp,
    maybeConvertEnvironment: function(environment) {
      return null;
    },
    add: null,
    apply: function(interpolableValue, nonInterpolableValue, environment) {
      if (nonInterpolableValue) {
        environment.set(property, nonInterpolableValue);
      }
    },
  };
};

window.DefaultAnimationType = DefaultAnimationType;

})();
