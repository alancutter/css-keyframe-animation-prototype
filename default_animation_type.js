(function() {
'use strict';

function DefaultAnimationType(property) {
  return {
    property: property,
    maybeConvertPair: function(startKeyframe, endKeyframe) {
      return null;
    },
    maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment) {
      return null;
    },
    maybeConvertSingleInEnvironment: function(keyframe, environment) {
      return {
        invalidator: null,
        interpolableValue: [],
        nonInterpolableValue: keyframe.value,
      };
    },
    interpolate: lerp,
    maybeConvertEnvironment: function(environment) {
      return null;
    },
    add: null,
  };
};

window.DefaultAnimationType = DefaultAnimationType;

})();
