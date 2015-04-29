(function() {
'use strict';

function StyleEnvironment(element) {
  this.element = element;
  element.style.cssText = '';
}

StyleEnvironment.prototype.getParent = function(property) {
  console.assert(!this.element.parentElement.style[property], 'Base style mocking not yet implemented');
  return getComputedStyle(this.element.parentElement)[property];
};

StyleEnvironment.prototype.get = function(property) {
  console.assert(!this.element.style[property], 'Base style mocking not yet implemented');
  return getComputedStyle(this.element)[property];
};

StyleEnvironment.prototype.set = function(property, value) {
  this.element.style[property] = value;
};

window.StyleEnvironment = StyleEnvironment;

})();
