(function() {
'use strict';

function add(underlyingInterpolableValue, underlyingNonInterpolableValue, underlyingFraction, interpolableValue, nonInterpolableValue) {
  return {
    interpolableValue: underlyingInterpolableValue * underlyingFraction + interpolableValue,
    nonInterpolableValue: nonInterpolableValue,
  };
}

function defineMethods(func, methods) {
  var properties = {};
  for (var i in methods) {
    properties[i] = {value: methods[i]};
  }
  Object.defineProperties(func.prototype, properties);
}

function isNeutralKeyframe(keyframe) {
  return keyframe == null;
}

function lastElement(array) {
  return array[array.length - 1];
}

function lerp(a, b, fraction) {
  console.assert(a instanceof Array === b instanceof Array);
  if (fraction === 0) {
    return a;
  }
  if (fraction === 1) {
    return b;
  }
  if (a instanceof Array) {
    return a.map(function(x, i) {
      return lerp(x, b[i]);
    });
  }
  return a * (1 - fraction) + b * fraction;
}

function underlyingFractionForkeyframe(keyframe) {
  return !keyframe ? 1 : (keyframe.composite == 'replace' ? 0 : 1);
}

window.add = add;
window.defineMethods = defineMethods;
window.isNeutralKeyframe = isNeutralKeyframe;
window.lastElement = lastElement;
window.lerp = lerp;
window.underlyingFractionForkeyframe = underlyingFractionForkeyframe;

})();
