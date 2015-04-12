(function() {
'use strict';

function StyleEnvironment(element) {
  this.element = element;
  element.style.cssText = '';
}

StyleEnvironment.prototype.set = function(property, value) {
  this.element.style[property] = value;
};

this.StyleEnvironment = StyleEnvironment;

})();
