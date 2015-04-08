(function() {
'use strict';

function KeyframeEffect(effectInput) {
  var propertyKeyframes = {};
  effectInput.forEach(function(keyframe, i) {
    // Offset distribution.
    var offset;
    if (effectInput.length > 1) {
      offset = i / (effectInput.length - 1);
    } else {
      offset = 1;
    }
    var composite = keyframe.composite || 'replace';
    // Property grouping.
    for (var property in keyframe) {
      console.assert(property !== 'offset', 'explicit offsets not supported');
      if (property == 'composite') {
        continue;
      }
      if (!(property in propertyKeyframes)) {
        propertyKeyframes[property] = [];
      }
      propertyKeyframes[property].push({
        offset: offset,
        composite: composite,
        value: keyframe[property],
      });
    }
  });
  this.interpolationRecords = [];
  for (var property in propertyKeyframes) {
    var keyframes = propertyKeyframes[property];
    // Adding neutral keyframes.
    if (keyframes[0].offset != 0) {
      keyframes.splice(0, 0, {
        offset: 0,
        composite: 'add',
        value: null,
      });
    }
    if (keyframes[keyframes.length - 1].offset != 1) {
      keyframes.splice(keyframes.length, 0, {
        offset: 1,
        composite: 'add',
        value: null,
      });
    }
    // Create Interpolations.
    for (var i = 0; i < keyframes.length - 1; i++) {
      this.interpolationRecords.push({
        start: keyframes[i].offset,
        end: keyframes[i + 1].offset,
        duration: keyframes[i + 1].offset - keyframes[i].offset,
        interpolation: new Interpolation({
          property: property,
          applicableAnimationTypes: getApplicableAnimationTypes(property),
          start: {
            value: keyframes[i].value,
            composite: keyframes[i].composite,
          },
          end: {
            value: keyframes[i + 1].value,
            composite: keyframes[i + 1].composite,
          },
        }),
      });
    }
  }
}
KeyframeEffect.prototype.getInterpolationsAt = function(fraction) {
  var interpolations = [];
  for (var interpolationRecord in this.interpolationRecords) {
    if (interpolationRecord.start > fraction || interpolationRecord.end <= fraction) {
      continue;
    }
    var subFraction = (fraction - interpolationRecord.start) / interpolationRecord.duration;
    interpolationRecord.interpolation.interpolate(subFraction);
    interpolations.push(interpolationRecord.interpolation);
  }
  return interpolations;
}

function Interpolation(immutableData) {
  this.immutable = immutableData;
  this.cache = null;
  for (var animationType of this.immutable.applicableAnimationTypes) {
    this.cache = animationType.maybeConvertStatic(this.immutable.start, this.immutable.end);
    if (this.cache) {
      break;
    }
  }
  this.mutable = null;
}

function applyInterpolations(environment, interpolations) {
  var first = interpolations[0];
  var startingIndex = 1;
  var underlyingValue;
  if (first.mutable.underlyingFraction == 0) {
    first.finalise(environment, null);
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
    current.finalise(environment, underlyingValue);
    if (current.mutable.animationType != underlyingValue.animationType) {
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

window.KeyframeEffect = KeyframeEffect;
window.applyInterpolations = applyInterpolations;

})();
