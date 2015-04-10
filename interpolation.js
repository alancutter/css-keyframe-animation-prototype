(function() {
'use strict';

function Interpolation(immutableData) {
  this.immutable = immutableData;
  this.cache = null;
  for (var animationType of this.immutable.animationTypes) {
    var resultPair = animationType.maybeConvertPair(this.immutable.start, this.immutable.end);
    if (resultPair) {
      this.cachePair(resultPair);
      break;
    }
  }
  this.state = {
    fraction: 0,
    underlyingFraction: underlyingFractionForkeyframe(this.immutable.start),
    animationType: null,
    interpolableValue: null,
    nonInterpolableValue: null,
  };
}

Interpolation.prototype.cachePair = function(pair) {
  this.cache = {
    start: {
      invalidator: pair.start.invalidator,
      interpolationValue: pair.start.interpolationValue,
    },
    end: {
      invalidator: pair.end.invalidator,
      interpolationValue: pair.end.interpolationValue,
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
    this.state.animationType = null;
    this.state.interpolableValue = null;
    this.state.nonInterpolableValue = null;
    return;
  }
  var start = this.cache.start.interpolationValue;
  var end = this.cache.end.interpolationValue;
  if (start && end && start.animationType === end.animationType && start.nonInterpolableValue == end.nonInterpolableValue) {
    this.state.animationType = start.animationType;
    this.state.interpolableValue = start.animationType.interpolate(start.interpolableValue, end.interpolableValue, fraction);
    this.state.nonInterpolableValue = start.nonInterpolableValue;
  } else {
    var side = fraction < 0.5 ? start : end;
    this.state.animationType = side.animationType;
    this.state.interpolableValue = side.interpolableValue;
    this.state.nonInterpolableValue = side.nonInterpolableValue;
  }
};

Interpolation.prototype.getUnderlyingValue = function(environment) {
  for (var animationType of this.immutable.animationTypes) {
    var result = animationType.maybeConvertEnvironment(environment);
    if (result) {
      return result;
    }
  }
  return null;
};

Interpolation.prototype.asUnderlyingValue = function() {
  console.assert(this.isInterpolated());
  return {
    animationType: this.state.animationType,
    interpolableValue: this.state.interpolableValue,
    nonInterpolableValue: this.state.nonInterpolableValue,
  };
};

Interpolation.prototype.isInterpolated = function() {
  var isInterpolated = this.state.animationType !== null;
  console.assert(isInterpolated == (this.cache !== null));
  return isInterpolated;
};

Interpolation.prototype.ensureInterpolated = function(environment, underlyingValue) {
  var needsReconversion = !this.cache
    || (this.cache.start.invalidator && this.cache.start.invalidator(environment, underlyingValue))
    || (this.cache.end.invalidator && this.cache.end.invalidator(environment, underlyingValue));
  if (!needsReconversion && this.isInterpolated()) {
    return;
  }
  for (var animationType of this.immutable.animationTypes) {
    var resultPair = animationType.maybeConvertPairInEnvironment(this.immutable.start, this.immutable.end, environment, underlyingValue);
    if (resultPair) {
      this.cachePair(resultPair);
      break;
    }
  }
  if (!this.cache) {
    this.cache = {};
    for (var side of ['start', 'end']) {
      var keyframe = this.immutable[side];
      for (var animationType of this.immutable.animationTypes) {
        var result = animationType.maybeConvertSingleInEnvironment(keyframe, environment, underlyingValue);
        if (result) {
          this.cache[side] = {
            animationType: animationType,
            invalidator: result.invalidator,
            interpolableValue: result.interpolableValue,
            nonInterpolableValue: result.nonInterpolableValue,
          };
          break;
        }
      }
      console.assert(this.cache[side]);
    }
  }
  console.assert(this.cache);
  this.interpolate(this.state.fraction);
};

function applyInterpolations(environment, interpolations) {
  var first = interpolations[0];
  var startingIndex = 1;
  var underlyingValue;
  if (first.state.underlyingFraction == 0) {
    first.ensureInterpolated(environment, null);
    if (interpolations.length == 1) {
      first.state.animationType.apply(first.state.interpolableValue, first.state.nonInterpolableValue, environment);
      return;
    }
    underlyingValue = first.asUnderlyingValue();
  } else {
    startingIndex = 0;
    underlyingValue = first.getUnderlyingValue(environment);
  }
  for (var i = startingIndex; i < interpolations.length; i++) {
    var current = interpolations[i];
    current.ensureInterpolated(environment, underlyingValue);
    if (!underlyingValue || current.state.animationType != underlyingValue.animationType || !current.state.animationType.add) {
      underlyingValue = current.asUnderlyingValue();
    } else {
      result = current.state.animationType.add(
          underlyingValue.interpolableValue,
          underlyingValue.nonInterpolableValue,
          current.state.underlyingFraction,
          current.state.interpolableValue,
          current.state.nonInterpolableValue);
      underlyingValue.interpolableValue = result.interpolableValue;
      underlyingValue.nonInterpolableValue = result.nonInterpolableValue;
    }
  }
  underlyingValue.animationType.apply(underlyingValue.interpolableValue, underlyingValue.nonInterpolableValue, environment);
}

window.Interpolation = Interpolation;
window.applyInterpolations = applyInterpolations;

})();
