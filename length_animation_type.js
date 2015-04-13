(function() {
'use strict';

function LengthAnimationType(property) {
  return {
    name: 'length',
    property: property,
    _maybeConvertSingle: function(keyframe) {
      if (!keyframe) {
        return {
          invalidator: function(environment, underlyingValue) {
            return underlyingValue.animationType != this;
          },
          interpolableValue: 0,
          nonInterpolableValue: null,
        };
      }
      var match = /(.*)px/.exec(keyframe.value);
      if (!match) {
        return null;
      }
      var number = Number(match[1]);
      if (isNaN(number)) {
        return null;
      }
      return {
        invalidator: null,
        interpolableValue: number,
        nonInterpolableValue: null,
      };
    },
    maybeConvertPair: function(startKeyframe, endKeyframe) {
      var start = this._maybeConvertSingle(startKeyframe);
      var end = this._maybeConvertSingle(endKeyframe);
      if (!start || !end) {
        return null;
      }
      return {
        start: start,
        end: end,
      };
    },
    maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
      return null;
    },
    maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
      return this._maybeConvertSingle(keyframe);
    },
    interpolate: lerp,
    maybeConvertEnvironment: function(environment) {
      return null;
    },
    add: function(underlyingInterpolableValue, underlyingNonInterpolableValue, underlyingFraction, interpolableValue, nonInterpolableValue) {
      return {
        interpolableValue: underlyingInterpolableValue * underlyingFraction + interpolableValue,
        nonInterpolableValue: nonInterpolableValue,
      };
    },
    apply: function(interpolableValue, nonInterpolableValue, environment) {
      environment.set(property, interpolableValue + 'px');
    },
  };
};

window.LengthAnimationType = LengthAnimationType;

})();
