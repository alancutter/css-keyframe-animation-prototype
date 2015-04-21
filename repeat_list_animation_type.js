(function() {
'use strict';

function RepeatListAnimationType(property, subType) {
  this.property = property;
  this.subType = subType;
}

defineMethods(RepeatListAnimationType, {
  maybeConvertPair: function(startKeyframe, endKeyframe) {
    if (!startKeyframe || !endKeyframe) {
      return null;
    }
    var result = {};
    for (var side of ['start', 'end']) {
      result[side] = {
        isInvalid: [],
        interpolableValue: [],
        nonInterpolableValue: [],
      };
    }
    var startItems = startKeyframe.value.split(', ');
    var endItems = endKeyframe.value.split(', ');
    for (var i = 0; i < startItems.length || i < endItems.length; i++) {
      var startItem = startItems[i % startItems.length];
      var endItem = endItems[i % endItems.length];
      var subResult = this.subType.maybeConvertPair(
          {value: startItem, composite: startKeyframe.composite},
          {value: endItem, composite: endKeyframe.composite});
      if (!subResult) {
        return null;
      }
      for (var side of ['start', 'end']) {
        result[side].isInvalid.push(subResult[side].isInvalid);
        result[side].interpolableValue.push(subResult[side].interpolableValue);
        result[side].nonInterpolableValue.push(subResult[side].nonInterpolableValue);
      }
    }
    ['start', 'end'].forEach(function(side) {
      var isInvalidList = result[side].isInvalid.filter(identity);
      result[side].isInvalid = (isInvalidList.length == 0) ? null : function(environment, underlyingValue) {
        return isInvalidList.some(function(isInvalid) {
          return isInvalid(environment, underlyingValue);
        });
      };
    });
    return result;
  },
  maybeConvertPairInEnvironment: function(startKeyframe, endKeyframe, environment, underlyingValue) {
    return this.maybeConvertPair(startKeyframe, endKeyframe);
  },
  maybeConvertSingleInEnvironment: function(keyframe, environment, underlyingValue) {
    return null;
  },
  equalNonInterpolableValues: function(a, b) {
    if (a.length != b.length) {
      return false;
    }
    var subType = this.subType;
    return a.every(function(aItem, i) {
      return subType.equalNonInterpolableValues(aItem, b[i]);
    });
  },
  interpolate: lerp,
  add: add,
  maybeConvertEnvironment: function(environment) {
    return null;
  },
  apply: function(interpolableValue, nonInterpolableValue, environment) {
    environment.set(this.property, this.cssValue(interpolableValue, nonInterpolableValue));
  },
  cssValue: function(interpolableValue, nonInterpolableValue) {
    var subType = this.subType;
    return interpolableValue.map(function(subInterpolableValue, i) {
      return subType.cssValue(subInterpolableValue, nonInterpolableValue[i]);
    }).join(', ');
  },
  clamp: function(value) {
    return (this.clamping == 'non-negative' && value < 0) ? 0 : value;
  }
});


window.RepeatListAnimationType = RepeatListAnimationType;

})();
