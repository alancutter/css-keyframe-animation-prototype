(function() {
'use strict';

defineMethods(function TransformAnimationType(property) {
  this.property = property;
}, {
  maybeConvertPair: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    return null;
  },
  _maybeResolveSubKeyframes: function(keyframe, environment, underlyingValue) {
    return null;
  },
  maybeConvertSingle: function(keyframe, environment, underlyingValue) {
    return null;
  },
  maybeConvertEnvironment: function(environment) {
    return null;
  },
  interpolate: lerp,
  add: function(underlyingInterpolableValue, underlyingNonInterpolableValue, underlyingFraction, interpolableValue, nonInterpolableValue) {
    return null;
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    return null;
  },
  cssValue: function(interpolableValue, nonInterpolableValue) {
    return null;
  },
});

window.TransformAnimationType = TransformAnimationType;
