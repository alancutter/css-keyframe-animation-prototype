(function() {
'use strict';

function LengthAnimationType(property, clamping) {
  this.property = property;
  this.clamping = clamping;
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
    return this._maybeConvertValue(environment.get(this.property));
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(this.property, this.clamp(interpolableValue) + 'px');
  },
  clamp: function(value) {
    return (this.clamping == 'non-negative' && value < 0) ? 0 : value;
  }
});


window.LengthAnimationType = LengthAnimationType;

})();
