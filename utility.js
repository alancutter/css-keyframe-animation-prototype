(function() {
'use strict';

function add(underlyingInterpolableValue, underlyingNonInterpolableValue, underlyingFraction, interpolableValue, nonInterpolableValue) {
  return {
    interpolableValue: underlyingInterpolableValue * underlyingFraction + interpolableValue,
    nonInterpolableValue: nonInterpolableValue,
  };
}

function chain(isInvaildA, isInvalidB) {
  if (!isInvaildA) {
    return isInvalidB;
  }
  if (!isInvalidB) {
    return isInvaildA;
  }
  return function(environment, underlyingValue) {
    return isInvaildA(environment, underlyingValue) || isInvalidB(environment, underlyingValue);
  }
}

function defineMethods(func, methods) {
  var properties = {};
  for (var i in methods) {
    properties[i] = {value: methods[i]};
  }
  Object.defineProperties(func.prototype, properties);
}

function greatestCommonDivisor(a, b) {
  return b ? greatestCommonDivisor(b, a % b) : a;
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
    return a.map(function(aItem, i) {
      return lerp(aItem, b[i], fraction);
    });
  }
  return a * (1 - fraction) + b * fraction;
}

function lowestCommonMultiple(a, b) {
  return a && b ? a / greatestCommonDivisor(a, b) * b : 0;
}

function modIndex(array, i) {
  return array[i % array.length];
}

function underlyingFractionForkeyframe(keyframe) {
  return !keyframe ? 1 : (keyframe.composite == 'replace' ? 0 : 1);
}

window.add = add;
window.chain = chain;
window.defineMethods = defineMethods;
window.isNeutralKeyframe = isNeutralKeyframe;
window.lastElement = lastElement;
window.lerp = lerp;
window.lowestCommonMultiple = lowestCommonMultiple;
window.modIndex = modIndex;
window.underlyingFractionForkeyframe = underlyingFractionForkeyframe;

})();
