(function(){
'use strict';

// testInterpolations({
//   property: 'line-height',
//   interpolations: [
//     [{value: '0'}, {value: '0'}],
//     [null, {value: '5px', composite: 'add'}],
//     [null, {value: '5', composite: 'add'}],
//   ],
//   expect: [
//     // getComputedStyle resolves numbers as pixels.
//     {at: -1, is: '-50px'},
//     {at: 0, is: '0px'},
//     {at: 0.25, is: '25px'},
//     {at: 0.5, is: '5px'},
//     {at: 0.75, is: '5px'},
//     {at: 1, is: '5px'},
//     {at: 2, is: '5px'},
//   ],
// });


function testAnimations(inputs) {
  assertAttributes('property animations expect', inputs);
  var keyframesList = getKeyframesList(inputs.property, inputs.animations);
  var container = createElement('div', null, document.body);
  for (var expectation of inputs.expect) {
    assertAttributes('at is', expectation);
    var target = createElement('div', 'target', container);
    applyKeyframesList(target, keyframesList, expectation.at);
    var actual = getComputedStyle(target)[inputs.property];
    var pass = actual == expectation.is;
    var testText = inputs.property + ' at ' + expectation.at + ' expected ' + expectation.is + ' was ' + actual;
    if (pass) {
      console.log('PASS:', testText);
    } else {
      console.assert(false, testText);
      applyKeyframesList(target, keyframesList, expectation.at);
    }
  }
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
window.testAnimations = testAnimations;

})();
