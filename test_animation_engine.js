(function(){
'use strict';

var tests = [];

function testAnimations(inputs) {
  tests.push(inputs);
}

function runTests() {
  var output = createElement('pre', 'output', document.body);
  var expectationDump = createElement('div', null, document.body);
  for (var inputs of tests) {
    assertAttributes('property animations expect', inputs);
    var keyframesList = getKeyframesList(inputs.property, inputs.animations);
    var container = createElement('div', 'container', document.body);
    for (var expectation of inputs.expect) {
      assertAttributes('at is', expectation);
      var target = createTarget(container);
      applyKeyframesList(target, keyframesList, expectation.at);
      var expectationTarget = createTarget(container);
      expectationTarget.style[inputs.property] = expectation.is;
      var actual = getComputedStyle(target)[inputs.property];
      var expected = getComputedStyle(expectationTarget)[inputs.property];
      expectationTarget.remove();
      var pass = actual == expected;
      var testText = (pass ? 'PASS' : 'FAIL') + ': ' + inputs.property + ' at ' + expectation.at + ' expected ' + expectation.is + ' was ' + actual + '\n';
      if (pass) {
        console.log(testText);
      } else {
        console.assert(false, testText);
      }
      output.textContent += testText;
    }
    output.textContent += '\n';
  }
  expectationDump.remove();
}

function assertAttributes(attributes, inputs) {
  attributes.split(' ').forEach(function(attribute) {
    console.assert(attribute in inputs, attribute + ' missing');
  });
}

function getKeyframesList(property, keyframesListInput) {
  return keyframesListInput.map(function(keyframes) {
    return keyframes.filter(function(keyframe, i) {
      if (keyframe == null) {
        console.assert(i == 0);
        return false;
      }
      return true;
    }).map(function(keyframe) {
      var newKeyframe = {};
      newKeyframe[property] = keyframe.value;
      newKeyframe.composite = keyframe.composite || 'replace';
      return newKeyframe;
    });
  })
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

function createTarget(container) {
  var template = document.querySelector("#target-template");
  if (!template) {
    return createElement('div', 'target', container);
  }
  var outer = template.content.firstElementChild.cloneNode(true);
  container.appendChild(outer);
  return outer.querySelector('.target') || outer;
}

function applyKeyframesList(target, keyframesList, at) {
  var propertyInterpolations = {};
  for (var keyframes of keyframesList) {
    new KeyframeEffect(keyframes).addPropertyInterpolationsAt(at, propertyInterpolations);
  };
  var environment = new StyleEnvironment(target);
  for (var property in propertyInterpolations) {
    applyInterpolations(environment, propertyInterpolations[property]);
  }
}

requestAnimationFrame(runTests);

window.testAnimations = testAnimations;

})();
