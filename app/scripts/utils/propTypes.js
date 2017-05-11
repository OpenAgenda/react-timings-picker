'use strict';

var React = require("react");
var PropTypes = require( 'prop-types' );

var timePattern = /^\d{1,2}:\d{2}$/;
var localePattern = /^[A-z]{2}-[A-z]{2}$/;

var fullShortArraysPair = PropTypes.shape({
  "full": PropTypes.array,
  "short": PropTypes.array
});

var locale = createChainableTypeChecker(function(value) { return localePattern.test(value) });
var alli18n = PropTypes.shape({
  months: fullShortArraysPair,
  weekdays: fullShortArraysPair,
  defineReccuringEvent: PropTypes.string,
  duplicateTimingsAbove: PropTypes.string,
  from: PropTypes.string,
  to: PropTypes.string
});
var additionalLanguages = PropTypes.shape({
  key: locale.isRequired,
  value: alli18n.isRequired
});

function createChainableTypeChecker(validationFunction) {
  var validate = function (props, propName, componentName, location) {
    componentName = componentName || 'ANONYMOUS';

    if (props[propName]) {
      if (!validationFunction(props[propName])) {
        return new Error(propName + ' in ' + componentName + " does not match locale pattern.");
      }
    }

    // assume all ok
    return null;
  }

  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || 'ANONYMOUS';
    if (props[propName] == null) {
      if (isRequired) {
        return new Error("Required " + location + " `" + propName + "` was not specified in " + ("`" + componentName + "`."));
      }
      return null;
    } else {
      return validate(props, propName, componentName, location);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

var _PropTypes = function() {

  this.timePattern = timePattern;
  this.localePattern = localePattern;

}

_PropTypes.prototype.monthNames = fullShortArraysPair;

_PropTypes.prototype.weekdayNames = PropTypes.shape({
  "full": PropTypes.string,
  "short": PropTypes.string
});

_PropTypes.prototype.alli18n = alli18n;

_PropTypes.prototype.timingsModifications = PropTypes.shape({
  addTiming: PropTypes.func,
  removeTiming: PropTypes.func,
  changeTiming: PropTypes.func
});

_PropTypes.prototype.timingsInteractions = PropTypes.shape({
  onEventMouseDown: PropTypes.func,
  onResizerMouseDown: PropTypes.func,
  onDayMouseDown: PropTypes.func
});

_PropTypes.prototype.timingsTimeProperties = PropTypes.shape({
  startMinutesDifference: PropTypes.number,
  endMinutesDifference: PropTypes.number,
  allMinutes: PropTypes.number
});

_PropTypes.prototype.additionalLanguages = PropTypes.oneOfType([
  PropTypes.arrayOf(additionalLanguages),
  additionalLanguages
]);

_PropTypes.prototype.date = createChainableTypeChecker(function (value) { return Object.prototype.toString.call(value) === '[object Date]' });

_PropTypes.prototype.locale = locale;

_PropTypes.prototype.time = createChainableTypeChecker(function(value) { return timePattern.test(value); });

module.exports = new _PropTypes();