(function() {
'use strict';

var activeElements = new Set();
var now = performance.now();

function Animation(startTime, effect, duration) {
  this.startTime = startTime;
  this.effect = effect;
  this.duration = duration;
  this.fill = 'forwards';
  this.timingFunction = function(t) {return (t == 0 || t == 1) ? t : (1 - Math.cos(t * Math.PI)) / 2;};
  this.onfinish = function() {};
  this.finished = false;
}
Animation.prototype.getPropertyInterpolationsAt = function(time) {
  var fraction = (time - this.startTime) / this.duration;
  if (fraction < 0) {
    return [];
  } else if (fraction >= 1) {
    if (!this.finished) {
      this.onfinish(this);
    }
    return this.effect.getPropertyInterpolationsAt(1);
  }
  return this.effect.getPropertyInterpolationsAt(this.timingFunction(fraction));
};

Element.prototype.animate = function(effectInput, duration) {
  if (!this.animations) {
    this.animations = [];
  }
  var animation = new Animation(now, new KeyframeEffect(effectInput), duration);
  this.animations.push(animation);
  activeElements.add(this);
  return animation;
};

function interpolate(time) {
  for (var element of activeElements) {
    element.propertyInterpolations = {};
    for (var animation of element.animations) {
      var propertyInterpolations = animation.getPropertyInterpolationsAt(time);
      for (var property in propertyInterpolations) {
        var interpolations = propertyInterpolations[property];
        if (!(property in element.propertyInterpolations)) {
          element.propertyInterpolations[property] = [];
        }
        [].push.apply(element.propertyInterpolations[property], interpolations);
      }
    }
  }
};

function apply() {
  for (var element of activeElements) {
    var environment = new StyleEnvironment(element);
    for (var property in element.propertyInterpolations) {
      var interpolations = element.propertyInterpolations[property];
      var startingIndex = interpolations.length - 1;
      for (; startingIndex > 0 && interpolations[startingIndex].state.underlyingFraction != 0; startingIndex--);
      applyInterpolations(environment, interpolations.slice(startingIndex));
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
