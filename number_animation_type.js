(function() {
'use strict';

function NumberAnimationType(property, clamping) {
  this.property = property;
  this.clamping = clamping;
}

defineMethods(NumberAnimationType, {
  maybeConvertPair: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    var start = this.maybeConvertSingle(startKeyframe, environment, underlyingValue);
    if (!start) {
      return null;
    }
    var end = this.maybeConvertSingle(endKeyframe, environment, underlyingValue);
    if (!end) {
      return null;
    }
    return {
      start: start,
      end: end,
    };
  },
  maybeConvertSingle: function(keyframe, environment, underlyingValue) {
    if (!keyframe) {
      return {
        isInvalid: function(environment, underlyingValue) {
          return underlyingValue && underlyingValue.animationType != this;
        }.bind(this),
        interpolableValue: 0,
        nonInterpolableValue: null,
      };
    }

    var resolvedValue = keyframe.value;
    var isInvalid = null;
    if (resolvedValue == 'inherit') {
      resolvedValue = environment.getParent(this.property);
      var property = this.property;
      isInvalid = function(environment, underlyingValue) {
        return environment.getParent(property) != resolvedValue;
      };
    }

    var number = Number(resolvedValue);
    if (isNaN(number)) {
      return null;
    }
    return {
      isInvalid: isInvalid,
      interpolableValue: number,
      nonInterpolableValue: null,
    };
  },
  interpolate: lerp,
  add: add,
  maybeConvertEnvironment: function(environment) {
    return this._maybeConvertValue(environment.get(this.property));
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(this.property, this.cssValue(interpolableValue, nonInterpolableValue));
  },
  cssValue: function(interpolableValue, nonInterpolableValue) {
    return this.clamp(interpolableValue);
  },
  clamp: function(value) {
    return (this.clamping == 'non-negative' && value < 0) ? 0 : value;
  }
});


window.NumberAnimationType = NumberAnimationType;

})();
