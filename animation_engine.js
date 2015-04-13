(function() {
'use strict';

var activeElements = [];
var now = performance.now();

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
  this.animations.push(new Animation(now, new KeyframeEffect(effectInput), duration));
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
    var environment = new StyleEnvironment(element);
    var propertyInterpolations = {};
    for (var interpolation of element.interpolations) {
      var property = interpolation.immutable.animationTypes[0].property;
      if (!(property in propertyInterpolations) || interpolation.state.underlyingFraction == 0) {
        propertyInterpolations[property] = [];
      }
      propertyInterpolations[property].push(interpolation);
    }
    for (var property in propertyInterpolations) {
      applyInterpolations(environment, propertyInterpolations[property])
    }
  }
}

requestAnimationFrame(function frame(time) {
  now = time;
  interpolate(time);
  apply();
  requestAnimationFrame(frame);
});

})();
