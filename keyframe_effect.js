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
    var applicableAnimationTypes = getApplicableAnimationTypes(property);
    // Create Interpolations.
    for (var i = 0; i < keyframes.length - 1; i++) {
      this.interpolationRecords.push({
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
      this.interpolationRecords.push({
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
        this.interpolationRecords.push({
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
        this.interpolationRecords.push({
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

KeyframeEffect.prototype.getInterpolationsAt = function(fraction) {
  var interpolations = [];
  for (var interpolationRecord of this.interpolationRecords) {
    if (interpolationRecord.startOffset > fraction || interpolationRecord.endOffset <= fraction) {
      continue;
    }
    var subFraction = (fraction - interpolationRecord.startOffset) / interpolationRecord.duration;
    interpolationRecord.interpolation.interpolate(subFraction);
    interpolations.push(interpolationRecord.interpolation);
  }
  return interpolations;
}

window.KeyframeEffect = KeyframeEffect;

})();
