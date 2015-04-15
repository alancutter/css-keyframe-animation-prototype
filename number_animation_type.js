(function() {
'use strict';

function NumberAnimationType(property) {
  this.property = property;
}

defineMethods(NumberAnimationType, {
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
    return this._maybeConvertValue(keyframe.value);
  },
  _maybeConvertValue: function(value) {
    var number = Number(value);
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
  add: add,
  maybeConvertEnvironment: function(environment) {
    return this._maybeConvertValue(environment.get(this.property));
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(this.property, interpolableValue);
  },
});


window.NumberAnimationType = NumberAnimationType;

})();
