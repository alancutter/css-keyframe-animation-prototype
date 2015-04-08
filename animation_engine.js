(function() {
'use strict';

var activeElements = [];

function Animation(startTime, effect, duration) {
  this.startTime = startTime;
  this.effect = effect;
  this.duration = duration;
}
Animation.prototype.getInterpolationsAt = function(time) {
  var fraction = (time - this.startTime) / this.duration;
  if (fraction < 0 || fraction >= 1) {
    return [];
  }
  return this.effect.getInterpolationsAt(fraction);
};

Element.prototype.animate = function(effectInput, duration) {
  if (!this.animations) {
    this.animations = [];
  }
  this.animations.push(new Animation(performance.now(), new KeyframeEffect(effectInput), duration));
  activeElements.push(this);
};

function interpolate(time) {
  for (var element of activeElements) {
    element.interpolations = [];
    for (var animation of element.animations) {
      [].push.apply(element.interpolations, animation.getInterpolationsAt(time));
    }
  }
};

function apply() {
  for (var element of activeElements) {
    var environment = new StyleResolverState(element);
    var propertyInterpolations = {};
    for (var interpolation of element.interpolations) {
      var property = interpolation.immutable.property;
      if (!(property in propertyInterpolations) || interpolation.mutable.underlyingFraction == 0) {
        propertyInterpolations[property] = [];
      }
      propertyInterpolations[propertyInterpolations].push(interpolation);
    }
    for (var property in propertyInterpolations) {
      applyInterpolations(environment, propertyInterpolations[property])
    }
  }
}

requestAnimationFrame(function frame(time) {
  interpolate(time);
  apply();
  requestAnimationFrame(frame);
});

})();
