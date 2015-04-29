(function() {
'use strict';

function Interpolation(immutableData) {
  this.immutable = immutableData;
  this.cache = null;
  for (var animationType of this.immutable.animationTypes) {
    var resultPair = animationType.maybeConvertPair(this.immutable.start, this.immutable.end, null, null);
    if (resultPair) {
      this.cacheResultPair(animationType, resultPair);
      break;
    }
  }
  this.state = {
    fraction: 0,
    underlyingFraction: underlyingFractionForkeyframe(this.immutable.start),
    animationValue: null,
  };
}

Interpolation.prototype.cacheResultPair = function(animationType, resultPair) {
  this.cache = {
    isPair: true,
    start: {
      isInvalid: resultPair.start.isInvalid,
      animationValue: {
        animationType: animationType,
        interpolableValue: resultPair.start.interpolableValue,
        nonInterpolableValue: resultPair.start.nonInterpolableValue,
      },
    },
    end: {
      isInvalid: resultPair.end.isInvalid,
      animationValue: {
        animationType: animationType,
        interpolableValue: resultPair.end.interpolableValue,
        nonInterpolableValue: resultPair.end.nonInterpolableValue,
      },
    },
  };
};

Interpolation.prototype.interpolate = function(fraction) {
  this.state.fraction = fraction;
  this.state.underlyingFraction = lerp(
      underlyingFractionForkeyframe(this.immutable.start),
      underlyingFractionForkeyframe(this.immutable.end),
      fraction);
  if (!this.cache) {
    this.state.animationValue = null;
    return;
  }
  var startValue = this.cache.start.animationValue;
  var endValue = this.cache.end.animationValue;
  if (this.cache.isPair) {
    this.state.animationValue = {
      animationType: startValue.animationType,
      interpolableValue: startValue.animationType.interpolate(startValue.interpolableValue, endValue.interpolableValue, fraction),
      nonInterpolableValue: startValue.nonInterpolableValue,
    };
  } else {
    this.state.animationValue = fraction < 0.5 ? startValue : endValue;
  }
};

Interpolation.prototype.getUnderlyingValue = function(environment) {
  for (var animationType of this.immutable.animationTypes) {
    var result = animationType.maybeConvertEnvironment(environment);
    if (result) {
      return {
        animationType: animationType,
        interpolableValue: result.interpolableValue,
        nonInterpolableValue: result.nonInterpolableValue,
      };
    }
  }
  return null;
};

Interpolation.prototype.isInterpolated = function() {
  var isInterpolated = this.state.animationValue != null;
  console.assert(isInterpolated == (this.cache != null));
  return isInterpolated;
};

Interpolation.prototype.validateCache = function(environment, underlyingValue) {
  if (this.cache != null) {
    if (this.state.fraction == 0 || this.state.fraction == 1) {
      return;
    }
    if (!this.cache.start.isInvalid || !this.cache.start.isInvalid(environment, underlyingValue)) {
      if (!this.cache.end.isInvalid || !this.cache.end.isInvalid(environment, underlyingValue)) {
        return;
      }
    }
  }
  this.cache = null;
  var hasNeutral = isNeutralKeyframe(this.immutable.start) || isNeutralKeyframe(this.immutable.end);
  for (var animationType of this.immutable.animationTypes) {
    if (hasNeutral && underlyingValue && underlyingValue.animationType != animationType) {
      continue;
    }
    var resultPair = animationType.maybeConvertPair(this.immutable.start, this.immutable.end, environment, underlyingValue);
    if (resultPair) {
      this.cacheResultPair(animationType, resultPair);
      break;
    }
  }
  if (!this.cache) {
    this.cache = {
      isPair: false,
    };
    for (var side of ['start', 'end']) {
      var keyframe = this.immutable[side];
      var result = null;
      if (!isNeutralKeyframe(keyframe)) {
        for (var animationType of this.immutable.animationTypes) {
          result = animationType.maybeConvertSingle(keyframe, environment, underlyingValue);
          if (result) {
            break;
          }
        }
      }
      if (result) {
        this.cache[side] = {
          isInvalid: result.isInvalid,
          animationValue: {
            animationType: animationType,
            interpolableValue: result.interpolableValue,
            nonInterpolableValue: result.nonInterpolableValue,
          },
        };
      } else {
        this.cache[side] = {
          isInvalid: isNeutralKeyframe(keyframe) ? function() {return true;} : null,
          animationValue: null,
        };
      }
    }
  }
  console.assert(this.cache && this.cache.start && this.cache.end);
  this.interpolate(this.state.fraction);
};

function applyInterpolations(environment, interpolations) {
  var startingIndex = interpolations.length - 1;
  for (; startingIndex > 0 && interpolations[startingIndex].state.underlyingFraction != 0; startingIndex--);
  var underlyingValue = null;
  var first = interpolations[startingIndex];
  if (first.state.underlyingFraction == 0) {
    first.validateCache(environment, null);
    if (interpolations.length == 1) {
      var firstValue = first.state.animationValue;
      if (firstValue) {
        firstValue.animationType.apply(firstValue.interpolableValue, firstValue.nonInterpolableValue, environment);
      }
      return;
    }
    underlyingValue = first.state.animationValue;
    startingIndex++;
  }
  for (var i = startingIndex; i < interpolations.length; i++) {
    var current = interpolations[i];
    if (!underlyingValue) {
      underlyingValue = current.getUnderlyingValue(environment);
    }
    current.validateCache(environment, underlyingValue);
    var currentValue = current.state.animationValue;
    if (!currentValue) {
      continue;
    }
    if (underlyingValue && currentValue.animationType == underlyingValue.animationType && currentValue.animationType.add) {
      var result = currentValue.animationType.add(
          underlyingValue.interpolableValue,
          underlyingValue.nonInterpolableValue,
          current.state.underlyingFraction,
          currentValue.interpolableValue,
          currentValue.nonInterpolableValue);
      underlyingValue = {
        animationType: currentValue.animationType,
        interpolableValue: result.interpolableValue,
        nonInterpolableValue: result.nonInterpolableValue,
      };
    } else {
      underlyingValue = currentValue;
    }
  }
  if (underlyingValue) {
    underlyingValue.animationType.apply(underlyingValue.interpolableValue, underlyingValue.nonInterpolableValue, environment);
  }
}

window.Interpolation = Interpolation;
window.applyInterpolations = applyInterpolations;

})();
