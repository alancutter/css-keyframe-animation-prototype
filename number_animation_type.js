(function() {
'use strict';

function NumberAnimationType(property) {
  return {
    name: 'number',
    property: property,
    _maybeConvertSingle: function(keyframe) {
      if (!keyframe) {
        return {
          isInvalid: function(environment, underlyingValue) {
            return underlyingValue && underlyingValue.animationType != this;
          }.bind(this),
          interpolableValue: 0,
          nonInterpolableValue: null,
        };
      }
      var number = Number(keyframe.value);
      if (isNaN(number)) {
        return null;
      }
      return {
        isInvalid: null,
        interpolableValue: number,
        nonInterpolableValue: null,
      };
    },
    maybeConvertPair: function(startKeyframe, endKeyframe) {
      var start = this._maybeConvertSingle(startKeyframe);
      if (!start) {
        return null;
      }
      var end = this._maybeConvertSingle(endKeyframe);
      if (!end) {
        return null;
      }
      return {
        start: start,
        end: end,
      };
    },
    maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
      return this.maybeConvertPair(startKeyframe, endKeyframe);
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
      environment.set(property, interpolableValue);
    },
  };
};

window.NumberAnimationType = NumberAnimationType;

})();
