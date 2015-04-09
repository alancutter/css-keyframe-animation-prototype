(function() {
'use strict';

function Interpolation(immutableData) {
  this.immutable = immutableData;
  this.cache = null;
  for (var animationType of this.immutable.animationTypes) {
    var result = animationType.maybeConvertPair(this.immutable.start, this.immutable.end);
    if (result) {
      this.cache = {
        start: {
          animationType: animationType,
          invalidator: result.start.invalidator,
          interpolableValue: result.start.interpolableValue,
          nonInterpolableValue: result.start.nonInterpolableValue,
        },
        end: {
          animationType: animationType,
          invalidator: result.end.invalidator,
          interpolableValue: result.end.interpolableValue,
          nonInterpolableValue: result.end.nonInterpolableValue,
        },
      };
      break;
    }
  }
  this.mutable = {
    fraction: 0,
    underlyingFraction: underlyingFractionForComposite(this.immutable.start.composite),
    animationType: null,
    interpolableValue: null,
    nonInterpolableValue: null,
  };
}

Interpolation.prototype.interpolate = function(fraction) {
  this.mutable.fraction = fraction;
  this.mutable.underlyingFraction = lerp(
      underlyingFractionForComposite(this.immutable.start.composite),
      underlyingFractionForComposite(this.immutable.end.composite),
      fraction);
  if (!this.cache) {
    return;
  }
  var start = this.cache.start;
  var end = this.cache.end;
  if (start.animationType === end.animationType && start.nonInterpolableValue == end.nonInterpolableValue) {
    this.mutable.animationType = start.animationType;
    this.mutable.interpolableValue = start.animationType.interpolate(start.interpolableValue, end.interpolableValue, fraction);
    this.mutable.nonInterpolableValue = start.nonInterpolableValue;
  }
}

Interpolation.prototype.getUnderlyingValue = function(environment) {
  for (var animationType of this.immutable.animationTypes) {
    var result = animationType.maybeConvertEnvironment(environment);
    if (result) {
      return result;
    }
  }
  return null;
};

Interpolation.prototype.isInterpolated = function() {
  var isInterpolated = this.mutable.animationType !== null;
  console.assert(isInterpolated == (this.mutable.interpolableValue !== null));
  console.assert(isInterpolated == (this.mutable.nonInterpolableValue !== null));
  return isInterpolated;
}

Interpolation.prototype.asUnderlyingValue = function() {
  console.assert(this.isInterpolated());
  return {
    animationType: this.mutable.animationType,
    interpolableValue: this.mutable.interpolableValue,
    nonInterpolableValue: this.mutable.nonInterpolableValue,
  };
}

Interpolation.prototype.ensureInterpolated = function(environment, underlyingValue) {
  if (this.isInterpolated()) {
    return;
  }
  for (var animationType of this.immutable.animationTypes)
}

function applyInterpolations(environment, interpolations) {
  var first = interpolations[0];
  var startingIndex = 1;
  var underlyingValue;
  if (first.mutable.underlyingFraction == 0) {
    first.ensureInterpolated(environment, null);
    if (interpolations.length == 1) {
      first.mutable.animationType.apply(environment, first.mutable.interpolableValue, first.mutable.nonInterpolableValue);
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
    if (current.mutable.animationType != underlyingValue.animationType || !current.mutable.animationType.add) {
      underlyingValue = current.asUnderlyingValue();
    } else {
      result = current.mutable.animationType.add(
          underlyingValue.interpolableValue,
          underlyingValue.nonInterpolableValue,
          current.mutable.underlyingFraction,
          current.mutable.interpolableValue,
          current.mutable.nonInterpolableValue);
      underlyingValue.interpolableValue = result.interpolableValue;
      underlyingValue.nonInterpolableValue = result.nonInterpolableValue;
    }
  }
  underlyingValue.animationType.apply(environment, underlyingValue.interpolableValue, underlyingValue.nonInterpolableValue);
}

window.Interpolation = Interpolation;
window.applyInterpolations = applyInterpolations;

})();
