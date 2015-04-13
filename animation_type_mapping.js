(function() {
'use strict';

var propertyAnimationTypes = {};

function getApplicableAnimationTypes(property) {
  if (!(property in propertyAnimationTypes)) {
    propertyAnimationTypes[property] = (function() {
      switch (property) {
      case 'bottom':
      case 'left':
      case 'right':
      case 'top':
      case 'margin-bottom':
      case 'margin-left':
      case 'margin-right':
      case 'margin-top':
        return [LengthAnimationType(property)];
      default:
        return [];
      }
    })();
    propertyAnimationTypes[property].push(DefaultAnimationType(property));
  }
  return propertyAnimationTypes[property];
}

window.getApplicableAnimationTypes = getApplicableAnimationTypes;

})();
