(function() {
'use strict';

var propertyAnimationTypes = {};

function getApplicableAnimationTypes(property) {
  if (!(property in propertyAnimationTypes)) {
    propertyAnimationTypes[property] = (function() {
      switch (property) {
      case 'line-height':
        return [new LengthAnimationType(property, 'non-negative'), new NumberAnimationType(property, 'non-negative')];
      case 'bottom':
      case 'left':
      case 'right':
      case 'top':
      case 'margin-bottom':
      case 'margin-left':
      case 'margin-right':
      case 'margin-top':
        return [new LengthAnimationType(property)];
      default:
        return [];
      }
    })();
    propertyAnimationTypes[property].push(new DefaultAnimationType(property));
  }
  return propertyAnimationTypes[property];
}

window.getApplicableAnimationTypes = getApplicableAnimationTypes;

})();
