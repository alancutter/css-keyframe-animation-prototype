TODAY

Youedited an item
09:06
Javascript
test.js
YESTERDAY

Youuploaded an item
Tue 20:21
Javascript
test.js
No recorded activity before 7 April 2015
20 MB used (0%)
Buy more storage
test.jsOpen
(function() {
'use strict';
var activeElements = [];

Element.prototype.animate = function(effectInput, duration) {
  if (!this.activeAnimations) {
    this.activeAnimations = [];
  }
  this.activeAnimations.push(new Animation(convertEffectInput(effectInput), duration));
};

function interpolate(time) {
  for (var element of activeElements) {
    for (var animation of element.activeAnimations) {
      animation.update(time);
    }
    element.activeAnimations = element.activeAnimations.filter(function(animation) {
      return animation.isActive();
    });
  }
  activeElements = activeElements.filter(function(element) {
    return element.activeAnimations.length;
  });
};

function apply() {
  for (var element of activeElements) {
    var environment = new StyleResolverState(element);
    var propertyInterpolations = {};
    for (var animation of element.activeAnimations) {
      var interpolation = animation.effect.activeInterpolation();
      var property = interpolation.immutable.property;
      if (!(property in propertyInterpolations) || interpolation.mutable.underlyingFraction == 0) {
        propertyInterpolations[property] = [];
      }
      propertyInterpolations[propertyInterpolations].push(interpolation);
    }
    for (var property in propertyInterpolations) {
      var interpolations = propertyInterpolations[property];
      var first = interpolations[0];
      var startingIndex = 1;
      var underlyingValue;
      if (first.mutable.underlyingFraction == 0) {
        first.finalise(environment, null);
        if (interpolations.length == 1) {
          first.mutable.animationType.apply(environment, first.mutable.interpolableValue, first.mutable.nonInterpolableValue);
          continue;
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
  }
}

requestAnimationFrame(function frame(time) {
  interpolate(time);
  apply();
  requestAnimationFrame(frame);
});
})();
