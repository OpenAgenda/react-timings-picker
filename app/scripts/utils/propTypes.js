'use strict';

var React = require("react");

var timePattern = /^\d{1,2}:\d{2}$/;
var localePattern = /^[A-z]{2}-[A-z]{2}$/;

var fullShortArraysPair = React.PropTypes.shape({
	"full": React.PropTypes.array,
	"short": React.PropTypes.array
});

var locale = createChainableTypeChecker(function(value) { return localePattern.test(value) });
var alli18n = React.PropTypes.shape({
	months: fullShortArraysPair,
	weekdays: fullShortArraysPair,
	defineReccuringEvent: React.PropTypes.string,
	duplicateTimingsAbove: React.PropTypes.string,
	from: React.PropTypes.string,
	to: React.PropTypes.string
});
var additionalLanguages = React.PropTypes.shape({
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

var PropTypes = function() { }

PropTypes.prototype.monthNames = fullShortArraysPair;

PropTypes.prototype.weekdayNames = React.PropTypes.shape({
	"full": React.PropTypes.string,
	"short": React.PropTypes.string
});

PropTypes.prototype.alli18n = alli18n;

PropTypes.prototype.timingsModifications = React.PropTypes.shape({
	addTiming: React.PropTypes.func,
	removeTiming: React.PropTypes.func,
	changeTiming: React.PropTypes.func
});

PropTypes.prototype.timingsInteractions = React.PropTypes.shape({
	onEventMouseDown: React.PropTypes.func,
	onResizerMouseDown: React.PropTypes.func,
	onDayMouseDown: React.PropTypes.func
});

PropTypes.prototype.timingsTimeProperties = React.PropTypes.shape({
	startMinutesDifference: React.PropTypes.number,
	endMinutesDifference: React.PropTypes.number,
	allMinutes: React.PropTypes.number
});

PropTypes.prototype.additionalLanguages = React.PropTypes.oneOfType([
	React.PropTypes.arrayOf(additionalLanguages),
	additionalLanguages
]);

PropTypes.prototype.date = createChainableTypeChecker(function (value) { return Object.prototype.toString.call(value) === '[object Date]' });

PropTypes.prototype.locale = locale;

PropTypes.prototype.time = createChainableTypeChecker(function(value) { return timePattern.test(value); });

module.exports = new PropTypes();