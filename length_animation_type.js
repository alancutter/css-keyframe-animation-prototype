(function() {
'use strict';

function LengthAnimationType(property) {
  return {
    property: property,
    maybeConvertPair: function(startKeyframe, endKeyframe) {
      var start = this._maybeConvertSingle(startKeyframe);
      var end = this._maybeConvertSingle(endKeyframe);
      if (!start || !end) {
        return null;
      }
    },
    _maybeConvertSingle: function(keyframe) {
      if (!keyframe) {
        return {
          invalidator: function(environment, underlyingValue) {
            return underlyingValue
          }
        }
      }
      var match = /(.*)px/.exec(value);
      if (!match) {
        return null;
      }
      var number = Number(match[0]);
      if (isNaN(number)) {
        return null;
      }
      return {
        invalidator: null,
        interpolableValue: number,
        nonInterpolableValue: null,
      };
    },
    maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
      return null;
    },
    maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
      if (keyframe) {
        return {
          invalidator: null,
          interpolableValue: [],
          nonInterpolableValue: keyframe.value,
        };
      }
      return null;
    },
    interpolate: lerp,
    maybeConvertEnvironment: function(environment) {
      return null;
    },
    add: null,
    apply: function(interpolableValue, nonInterpolableValue, environment) {
      environment.set(property, nonInterpolableValue);
    },
  };
};

window.DefaultAnimationType = DefaultAnimationType;

})();
