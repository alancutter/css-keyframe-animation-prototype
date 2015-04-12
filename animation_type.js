(function() {
'use strict';

var propertyAnimationTypes = {};

function getApplicableAnimationTypes(property) {
  if (!(property in propertyAnimationTypes)) {
    propertyAnimationTypes[property] = (function() {
      switch (property) {
      default:
        return [];
      }
    })();
    propertyAnimationTypes[property].push(new DefaultAnimationType(property));
  }
  return propertyAnimationTypes[property];
}

this.getApplicableAnimationTypes = getApplicableAnimationTypes;

})();
