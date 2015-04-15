(function() {
'use strict';

function LengthAnimationType(property) {
  this.property = property;
}

defineMethods(LengthAnimationType, {
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
    var match = /(.*)px/.exec(value);
    if (!match) {
      return null;
    }
    var number = Number(match[1]);
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
    var start = this.maybeConvertSingleInEnvironment(startKeyframe, environment, underlyingValue);
    if (!start) {
      return null;
    }
    var end = this.maybeConvertSingleInEnvironment(endKeyframe, environment, underlyingValue);
    if (!end) {
      return null;
    }
    return {
      start: start,
      end: end,
    };
  },
  maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
    return this._maybeConvertSingle(keyframe);
  },
  interpolate: lerp,
  add: add,
  maybeConvertEnvironment: function(environment) {
    return this._maybeConvertValue(environment.get(property));
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(property, interpolableValue + 'px');
  },
});


window.LengthAnimationType = LengthAnimationType;

})();
