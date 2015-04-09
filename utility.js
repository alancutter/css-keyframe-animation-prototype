(function() {
'use strict';

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

function underlyingFractionForComposite(composite) {
  return composite == 'replace' ? 0 : 1;
}

window.lerp = lerp;
window.underlyingFractionForComposite = underlyingFractionForComposite;

})();
