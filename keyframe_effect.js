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
      // FIXME: Support offsets.
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
  this.propertyInterpolationRecords = {};
  for (var property in propertyKeyframes) {
    var interpolationRecords = [];
    this.propertyInterpolationRecords[property] = interpolationRecords;
    var keyframes = propertyKeyframes[property];
    var applicableAnimationTypes = getApplicableAnimationTypes(property);
    // Create Interpolations.
    for (var i = 0; i < keyframes.length - 1; i++) {
      interpolationRecords.push({
        startOffset: keyframes[i].offset,
        endOffset: keyframes[i + 1].offset,
        duration: keyframes[i + 1].offset - keyframes[i].offset,
        interpolation: new Interpolation({
          animationTypes: applicableAnimationTypes,
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
    // Adding neutral keyframes.
    if (keyframes.length == 1) {
      interpolationRecords.push({
        startOffset: 0,
        endOffset: 1,
        duration: 1,
        interpolation: new Interpolation({
          animationTypes: applicableAnimationTypes,
          start: null,
          end: {
            value: keyframes[0].value,
            composite: keyframes[0].composite,
          },
        }),
      });
    } else {
      if (keyframes[0].offset !== 0) {
        interpolationRecords.push({
          startOffset: 0,
          endOffset: keyframes[0].offset,
          duration: keyframes[0].offset,
          interpolation: new Interpolation({
            animationTypes: applicableAnimationTypes,
            start: null,
            end: {
              value: keyframes[0].value,
              composite: keyframes[0].composite,
            },
          }),
        });
      }
      if (lastElement(keyframes).offset != 1) {
        interpolationRecords.push({
          startOffset: lastElement(keyframes).offset,
          endOffset: 1,
          duration: 1 - lastElement(keyframes).offset,
          interpolation: new Interpolation({
            animationTypes: applicableAnimationTypes,
            start: {
              value: lastElement(keyframes).value,
              composite: lastElement(keyframes).composite,
            },
            end: null,
          }),
        });
      }
    }
  }
}

KeyframeEffect.prototype.getPropertyInterpolationsAt = function(fraction) {
  var propertyInterpolations = {};
  for (var property in this.propertyInterpolationRecords) {
    propertyInterpolations[property] = [];
    var interpolationRecords = this.propertyInterpolationRecords[property];
    if (fraction <= 0) {
      interpolationRecords[0].interpolation.interpolate(0);
      propertyInterpolations[property].push(interpolationRecords[0].interpolation);
    } else if (fraction >= 1) {
      lastElement(interpolationRecords).interpolation.interpolate(1);
      propertyInterpolations[property].push(lastElement(interpolationRecords).interpolation);
    } else {
      for (var interpolationRecord of interpolationRecords) {
        if (interpolationRecord.startOffset > fraction || interpolationRecord.endOffset <= fraction) {
          continue;
        }
        var subFraction = (fraction - interpolationRecord.startOffset) / interpolationRecord.duration;
        interpolationRecord.interpolation.interpolate(subFraction);
        propertyInterpolations[property].push(interpolationRecord.interpolation);
      }
    }
  }
  return propertyInterpolations;
}

window.KeyframeEffect = KeyframeEffect;

})();
