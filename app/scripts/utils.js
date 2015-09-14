'use strict';

var Utils = function () {
	this.milliseconds = 1000;
	this.seconds = 60 * this.milliseconds;
	this.minutes = 60 * this.seconds;
	this.hours = 24 * this.minutes;
}

Utils.prototype.addMinutes = function (date, minutes) {
	return new Date(date.getTime() + minutes * this.seconds /*milliseconds in minute*/);
}
Utils.prototype.addHours = function (date, hours) {
	return new Date(date.getTime() + hours * this.minutes /*milliseconds in minute*/);
}
Utils.prototype.addDays = function (date, days) {
	return new Date(date.getTime() + days * this.hours /*milliseconds in minute*/);
}

Utils.prototype.daysInMonth = function (month, year) {
	return new Date(year, month, 0).getDate();
}

Utils.prototype.setTime = function (date, hours, minutes, seconds, milliseconds) {
	var result = new Date(date);
	result.setHours(hours || 0);
	result.setMinutes(minutes || 0);
	result.setSeconds(seconds || 0);
	result.setMilliseconds(milliseconds || 0);
	return result;
}

Utils.prototype.parseTime = function(time){
	var separatorIndex = time.indexOf(':');
	var hours = parseInt(time.substr(0, separatorIndex));
	var minutes = parseInt(time.substr(separatorIndex + 1, time.length));
	var date = new Date();
	return this.setTime(date, hours, minutes, 0, 0);
}

Utils.prototype.formatTime = function (date) {
	var minutes = date.getMinutes();
	return date.getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes);
}

Utils.prototype.round = function(source, roundTo) {
	var remnant = source % roundTo;
	return remnant >= roundTo / 2 ? source + roundTo - remnant : source - remnant;
}

Utils.prototype.roundMinutes = function(date, roundTo, initialDate) {
	if (60 % roundTo !== 0) {
		if (initialDate === undefined) throw new Error('Undefined initial date for rounding date');
		return this.addMinutes(initialDate, this.round(this.minutesDifference(initialDate, date), roundTo));
	}
	else {
		var result = date, roundedMinutes = this.round(date.getMinutes(), roundTo);
		if (roundedMinutes === 60) {
			result = this.addHours(result, 1);
			result.setMinutes(0);
		} else {
			result.setMinutes(roundedMinutes);
		}
		return result;
	}
}

Utils.prototype.floor = function (source, roundTo) {
	return source - source % roundTo;
}

Utils.prototype.ceil = function (source, roundTo) {
	return source + roundTo - source % roundTo;
}

Utils.prototype.minutesDifference = function (lowerDate, greaterDate) {
	var diffMs = (greaterDate - lowerDate);
	return Math.round(diffMs / 60000);
}

Utils.prototype.hasClass = function(element, cls) {
	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

Utils.prototype.pageOffset = function (element) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
};

Utils.prototype.createTwoDimensionalArray = function(size) {
	var result = new Array(size);
	for (var i = 0; i < size; i++) {
		result[i] = [];
	}
	return result;
}

Utils.prototype.isKeyValuePair = function (obj) {
	return obj.hasOwnProperty("key") && obj.hasOwnProperty("value");
}

Utils.prototype.keyValueCollectionToObject = function(collection) {
	var rv = {};
	for (var i = 0; i < collection.length; ++i) {
		if (collection[i] !== undefined && this.isKeyValuePair(collection[i])) rv[collection[i].key] = collection[i].value;
	}
	return rv;
}

var utils = new Utils();

module.exports = utils;