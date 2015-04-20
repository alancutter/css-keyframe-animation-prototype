(function() {
'use strict';

var activeElements = new Set();
var now = performance.now();
var defaultEasing = function(t) {return (t == 0 || t == 1) ? t : (1 - Math.cos(t * Math.PI)) / 2;};

function Animation(effect, timing) {
  this.effect = effect;
  this.timing = timing;
  this.finished = false;
  this.onfinish = function() {};
}
Animation.prototype.getPropertyInterpolationsAt = function(time) {
  var fraction = (time - this.timing.startTime) / this.timing.duration;
  if (fraction >= 1 && !this.finished) {
    this.finished = true;
    setTimeout(this.onfinish.bind(this), 0);
  }
  var activeBefore = this.timing.fill == 'backwards' || this.timing.fill == 'both';
  var activeAfter = this.timing.fill == 'forwards' || this.timing.fill == 'both';
  if ((fraction < 0 && !activeBefore) || (fraction >= 1 && !activeAfter)) {
    return [];
  }
  fraction = Math.min(Math.max(fraction, 0), 1);
  return this.effect.getPropertyInterpolationsAt(this.timing.easing(fraction));
};

Element.prototype.animate = function(effectInput, timingInput) {
  if (!this.animations) {
    this.animations = [];
  }
  var animation = new Animation(new KeyframeEffect(effectInput), parseTiming(timingInput));
  this.animations.push(animation);
  activeElements.add(this);
  return animation;
};

function parseTiming(timingInput) {
  if (typeof timingInput == 'number') {
    timingInput = {duration: timingInput};
  }
  var timing = {};
  timing.duration = timingInput.duration || 0;
  timing.startTime = timingInput.startTime || now;
  timing.easing = timingInput.easing || defaultEasing;
  timing.fill = timingInput.fill || 'none';
  return timing;
}

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
