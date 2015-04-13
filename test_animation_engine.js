(function(){
'use strict';

function testResponsiveInterpolation(inputs) {
  assertAttributes('property start end expectBefore expectAfter', inputs);
  var keyframes = getKeyframes(inputs);
  var container = createElement('div', null, document.body);
  for (var expectation of inputs.expectBefore) {
    assertAttributes('at is', expectation);
    var target = createElement('div', 'target', container);
    applyInterpolations(new StyleEnvironment(target), new KeyframeEffect(keyframes).getInterpolationsAt(expectation.at));
    var actual = getComputedStyle(target)[inputs.property];
    console.assert(actual == expectation.is, inputs.property, 'at', expectation.at, 'before change expected', expectation.is, 'was', actual);
  }
  for (var expectation of inputs.expectAfter) {
    assertAttributes('at is', expectation);
    var target = createElement('div', 'target', container);
    var interpolations = new KeyframeEffect(keyframes).getInterpolationsAt(expectation.at);
    applyInterpolations(new StyleEnvironment(target), interpolations);
    target.classList.add('change');
    applyInterpolations(new StyleEnvironment(target), interpolations);
    var actual = getComputedStyle(target)[inputs.property];
    console.assert(actual == expectation.is, inputs.property, 'at', expectation.at, 'after change expected', expectation.is, 'was', actual);
  }
}

function assertAttributes(attributes, inputs) {
  attributes.split(' ').forEach(function(attribute) {
    console.assert(attribute in inputs, attribute + ' missing');
  });
}

function getKeyframes(inputs) {
  var keyframes = [];
  for (var side of ['start', 'end']) {
    if (!inputs[side]) {
      continue;
    }
    var keyframe = {};
    keyframe[inputs.property] = inputs[side].value;
    keyframe.composite = inputs[side].composite;
    keyframes.push(keyframe);
  }
  return keyframes;
}

function createElement(tagName, className, parent) {
  var element = document.createElement(tagName);
  if (className) {
    element.classList.add(className);
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}

window.testResponsiveInterpolation = testResponsiveInterpolation;

})();
